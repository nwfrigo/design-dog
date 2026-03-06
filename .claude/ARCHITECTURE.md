# Design Dog — Architecture Reference

> System design, state management, export pipeline, API endpoints, and editor patterns.
> Read this before working on app structure, state, APIs, or export logic.

---

## Template Architecture

### File Structure for Each Template

Every template requires these files:

1. **Template component:** `components/templates/{TemplateName}.tsx`
   - Pure presentational React component
   - Receives all content via props
   - Uses brand config for colors/typography

2. **Render content:** `app/render/{template-slug}/render-content.tsx`
   - Server-side render component for PNG export
   - Accepts URL search params
   - Must mirror template component exactly

3. **Render page:** `app/render/{template-slug}/page.tsx`
   - Next.js page that wraps render-content
   - Handles param parsing

4. **Registration:** Update these files:
   - `config/template-config.ts` — add template type and metadata
   - `types/index.ts` — add to `TemplateType` union
   - `components/EditorScreen.tsx` — add editor controls and preview
   - `components/AssetSelectionScreen.tsx` / `TemplateTile.tsx` — add to homepage grid
   - `store/index.ts` — add any template-specific state
   - `app/api/export/route.ts` — add export handler

### Template Props Pattern

All templates follow this prop pattern:

```tsx
interface TemplateNameProps {
  // Text content
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string

  // Visibility toggles (show/hide fields)
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean

  // Solution pill (if applicable)
  solution: string
  showSolutionSet: boolean

  // Image (if applicable)
  imageUrl?: string
  imagePosition: { x: number; y: number }
  imageZoom: number
  grayscale?: boolean  // Default false

  // Variant (if template has variants)
  variant: 'image' | 'none'  // or other variant names

  // Logo
  logoColor: 'white' | 'black' | 'orange'

  // Brand config
  colors: ColorsConfig
  typography: TypographyConfig
}
```

**Only expose text fields that exist in the actual design.** Don't add fields that aren't visible in the template. Each template is different.

### Common Text Fields Across Templates

| Field | Usage |
|-------|-------|
| `headline` | All single-page templates |
| `eyebrow` | Most templates |
| `cta` / `ctaText` | Most templates |
| `subhead` | Most templates |
| `body` | Many templates |
| `metadata` | Social templates only |

### Variant Naming

Templates with image/no-image variants use: `'image' | 'none'`

Examples: `WebsiteThumbnail`, `WebsiteReport`, `WebsiteWebinar`

When variant is `'none'`:
- Text content area expands to fill space
- Headline font size typically increases
- Image-related controls hide in editor

---

## State Management (Zustand)

### Store Location
`store/index.ts` — single Zustand store with `subscribeWithSelector` middleware.

### Key State Patterns

- **Auto-Create mode** detection: Check for presence of `generatedAssets`
- **Two state systems** exist (legacy): `selectedAssets + currentAssetIndex` AND `generatedAssets + templateType`. In auto-create mode, use `templateType` directly.
- **Queue editing:** `editingQueueItemId` tracks which queue item is being edited. Asset stays in queue during edit (not removed).
- **Draft persistence:** `localStorage` key `design-dog-active-draft` — single active project, auto-save on every state change.

### Adding New Template State

When adding a new template with variants:
1. Add variant state to `store/index.ts` (e.g., `reportVariant: 'image' as 'image' | 'none'`)
2. Add setter action (e.g., `setReportVariant`)
3. Add to `types/index.ts` AppState interface
4. Add to draft-storage save/load
5. Add to `EditorScreen.tsx` store destructure

### Variant Persistence (Critical for New Templates)

**Problem:** When users switch between assets in the editor (clicking tabs), variant settings (like background style) must persist. Without proper setup, variants revert to defaults when navigating away and back.

**How it works:** The `goToAsset` function in `store/index.ts` saves the current asset's settings before loading the next asset. Settings are stored in `manualAssetSettings` (keyed by asset index).

**When adding a template with variants, you MUST:**

1. Add variant fields to `ManualAssetSettings` interface in `types/index.ts`:
   ```typescript
   myTemplateVariant: 'option1' | 'option2' | 'option3'
   ```

2. Update `goToAsset` in `store/index.ts` in THREE places:
   - **Extract** the variant from state (add to destructure at top of function)
   - **Save** the variant to `currentSettings` object
   - **Restore** the variant in the `set()` call at the end

3. Add default value to `getDefaultAssetSettings()` function in `store/index.ts`

**Reference:** The queue system (`addToQueue`, `editQueuedAsset`) already handles all variants correctly — follow that pattern.

### AssetSnapshot Pattern (Field Serialization)

Five store functions serialize/deserialize editor state: `addToQueue`, `editQueuedAsset`, `saveQueuedAssetEdit`, `loadGeneratedAssetIntoEditor`, `addAllGeneratedToQueue`. They all use the shared `SNAPSHOT_FIELDS` array in `lib/asset-snapshot.ts` as the single source of truth for which fields to copy.

**Adding a new editor field:** Add it to `SNAPSHOT_FIELDS` in `lib/asset-snapshot.ts` (plus the relevant type interfaces). All 5 store functions will pick it up automatically.

**Never enumerate fields manually** in store serialization functions. If you find yourself listing field names in a store function, use the snapshot helpers instead: `captureEditorSnapshot()`, `restoreEditorSnapshot()`, `snapshotToQueuedAsset()`.

### Local State vs Store State (Critical for Draft Persistence)

**Problem:** Editor screens that use local React state (`useState`) for editing will NOT auto-save unless they sync to the Zustand store. The auto-save in `EditorLayout.tsx` watches the **store**, not local component state. If a component edits locally and only syncs to the store on "Export" or "Save", draft persistence breaks — users will lose work when navigating away.

**Symptoms:**
- User edits content in editor
- User clicks logo to go home, sees "Resume" banner
- User clicks "Resume" → content is empty/default instead of their edits
- `localStorage` shows empty arrays for the template's content fields

**The Pattern That Breaks:**
```tsx
// ❌ BAD - Local state never reaches store during editing
const [modules, setModules] = useState([])

const handleExport = () => {
  setStoreModules(modules)  // Only syncs on export!
  navigate('/export')
}
```

**The Fix — Add a Sync useEffect:**
```tsx
// ✅ GOOD - Sync local state to store for draft persistence
const [modules, setModules] = useState([])

// Sync to store whenever local state changes
useEffect(() => {
  setStoreModules(modules)
}, [modules, setStoreModules])
```

**Checklist for editor screens with local state:**
1. Does the component use `useState` for editable content?
2. Does it have store setters (e.g., `setStackerContentModules`)?
3. Is there a `useEffect` that syncs local state → store on every change?
4. Are those store fields in `EditorLayout.tsx` auto-save dependencies?
5. Are those fields in `draft-storage.ts` save/load functions?

**Reference:** `StackerEditorScreen.tsx` lines 1859-1867 shows the correct sync pattern.

---

## Code Organization

### Shared Locations

| Type | Location | Examples |
|------|----------|----------|
| SVG icons, UI primitives | `components/shared/` | CorityLogo, ArrowIcon, ToggleSwitch, DeleteConfirmModal |
| Template-specific editors | `components/editors/` | SolutionOverviewEditor, SpeakerEditor |
| Custom hooks | `hooks/` | useGrayscaleImage, useThemeDetection |
| Utilities & constants | `lib/` | asset-snapshot, render-params, export-params |

### Extract-on-Second-Use

When you copy-paste a component, hook, or utility into a second file, extract it into the appropriate shared location immediately. This applies to SVG icons, toggle switches, modals, labeled inputs, `useEffect` patterns (canvas processing, MutationObserver, ResizeObserver), and style constants.

### Registry Over Switch

When a function dispatches to template-specific logic (export params, form sections, modals), use a registry (`Record<TemplateType, Handler>`) instead of a switch statement. Adding a new template should mean adding one registry entry, not inserting a case into a growing switch. Reference: `lib/export-params.ts`.

### File Size Limits

No component file should exceed 500 lines. When approaching that limit, extract template-specific form sections, export logic, or modal groups into sub-files (e.g., `components/editors/SolutionOverviewEditor.tsx`). The store file is an exception — it's a single cohesive state machine — but any function that enumerates fields must use the `asset-snapshot.ts` helpers.

### Naming & Type Conventions

Before naming a new field, grep `types/index.ts` for existing names that represent the same concept. Field names must be identical across all interfaces that touch the same data. Use `T | null` consistently for "no value" — never empty string `''`. When a better pattern supersedes an old one, migrate all remaining usages in the same session. Don't leave deprecated patterns around. Don't commit stub functions with TODO comments.

### Nullable Props

Use `T | null` (not fixed defaults) for props where different templates have wildly different native values (e.g., `headlineFontSize`). Templates apply per-template defaults with `prop ?? TEMPLATE_NATIVE_SIZE`, so both `null` and `undefined` trigger the template's own default.

---

## Export System

### How Export Works

1. User clicks Export → `handleExport` in `EditorScreen.tsx` builds `exportParams`
2. API call to `/api/export/route.ts` with all params as query string
3. Export route navigates headless browser to `/render/{template-slug}?params...`
4. Puppeteer screenshots the rendered page
5. Returns PNG

### Adding a New Prop (Full Pipeline Checklist)

Every new editable prop must appear in all of these locations:

1. `types/index.ts` — Add to `ManualAssetSettings`, `QueuedAsset`, `GeneratedAsset`
2. `lib/asset-snapshot.ts` — Add field name to `SNAPSHOT_FIELDS` (handles all 5 store serialization functions)
3. `store/index.ts` — Add state field + setter to `AppState`
4. `lib/draft-storage.ts` — Add to save/load if needed for draft persistence
5. `lib/export-params.ts` — Add to the template's param builder function
6. `app/render/{slug}/page.tsx` — Parse using `lib/render-params.ts` helpers
7. `components/ExportQueueScreen.tsx` — Add to `handleExportSingle` body (~line 98)

The export API route (`app/api/export/route.ts`) uses a generic forwarding loop — it auto-forwards all params from the request body to the render URL. No changes needed there when adding new props. The remaining manual forwarding layer is `ExportQueueScreen.handleExportSingle`, which builds its own request body with an explicit field list.

### Export Gotchas

**Sub-pixel rendering in PDF exports:** Puppeteer renders sub-pixel CSS values inconsistently — borders appear thicker, rectangles distort, page breaks land wrong. Use `getBoundingClientRect().height` with `Math.ceil()` instead of `offsetHeight` (which rounds down). Reset `body { min-height: 0 }` before measuring page height (the root layout applies `min-h-screen`).

**URLSearchParams auto-encoding:** `URLSearchParams.set()` auto-encodes values. Never pre-encode with `encodeURIComponent()` — it causes double-encoding (`%255B` instead of `%5B`). Pass raw strings.

**Editor vs queue exports use different code paths:** Exporting from the editor calls `buildExportParams()` in `lib/export-params.ts`. Exporting from the queue calls `handleExportSingle` in `ExportQueueScreen.tsx`, which builds its own request body. Always test exports from both paths — a prop can work in one and silently fail in the other.

### Render Page Pattern

Each render page at `app/render/{slug}/page.tsx` parses URL params and passes them to the template component. All param parsing must use the shared helpers in `lib/render-params.ts`:

- `parseBoolTrue(params, key)` — for booleans that default ON (showHeadline, showCta, showBody, showEyebrow on most templates)
- `parseBoolFalse(params, key)` — for booleans that default OFF (grayscale, darkMode)
- `parseString(params, key, fallback)` — string with fallback
- `parseNumberOrUndefined(params, key)` — for nullable numbers like headlineFontSize

Never write inline `=== 'true'` or `!== 'false'` in render pages. The default for each boolean must be explicit in the parser call, not implicit in the comparison operator.

**Null handling in export API:** Use `!= null` (not `!== undefined`) when checking params before adding to the URL. A `null` value passes `!== undefined` and gets serialized as the string `'null'`, which `parseFloat` converts to `NaN`.

---

## Image Settings: Editor ↔ Queue ↔ Export Consistency

**The Core Rule:** Image settings (position, zoom, grayscale) must flow through **four locations** to ensure editor preview, queue preview, and exported PNG all match:

1. **`addToQueue`** (store/index.ts) — captures settings when asset is queued
2. **`handleExportSingle`** (ExportQueueScreen.tsx) — sends settings to export API
3. **Queue thumbnail** (ExportQueueScreen.tsx) — displays preview in queue list
4. **Queue preview modal** (ExportQueueScreen.tsx) — displays full-size preview

If any location is missing props, you'll see discrepancies between what the user sees and what exports.

**Common Gotchas:**

1. **Newsletter params can override main image params** — The export API has a newsletter-specific section that sets `imagePositionX/Y` and `imageZoom`. Without a template type check, these override the main image values:
   ```tsx
   const isNewsletterTemplate = template.startsWith('newsletter-')
   if (isNewsletterTemplate && body.newsletterImagePositionX !== undefined) {
     params.set('imagePositionX', ...)
   }
   ```

2. **Show toggles need content checks** — Render pages have default placeholder text. To prevent it from appearing when a field is empty:
   ```tsx
   // ✅ Only show when toggle is on AND content exists
   showBody: asset.showBody && !!asset.body,
   ```

3. **Per-template image settings use template key, not `templateType`** — In manual mode, `templateType` may not match the current asset. Always use:
   ```tsx
   const currentTemplate = selectedAssets[currentAssetIndex]
   const imageSettings = thumbnailImageSettings[currentTemplate]
   ```

**Checklist for adding/modifying image support:**
- [ ] `addToQueue` captures the image settings
- [ ] `handleExportSingle` passes them to the export API
- [ ] Queue thumbnail component receives `imagePosition`, `imageZoom`, `grayscale`
- [ ] Queue preview modal receives the same props

Test by: uploading an image → adjusting zoom/pan/grayscale → adding to queue → verify thumbnail matches → export from queue → verify PNG matches.

---

## PDF Upload & Parsing

### Architecture (Critical)

PDF uploads use a **three-step flow** to handle large files reliably:

1. **Client uploads PDF to Vercel Blob** via `@vercel/blob/client` (bypasses 4.5MB function body limit)
2. **Server fetches PDF from Blob URL** and converts to base64
3. **Server sends base64 to Claude** for analysis

**Why base64 instead of URL?** Claude's API can accept PDFs via URL (`source.type: 'url'`), but this is unreliable — Anthropic's servers sometimes fail to fetch from Vercel Blob URLs, returning "Could not process PDF" errors. Sending the actual PDF content as base64 (`source.type: 'base64'`) is how Claude's native apps work and is much more reliable.

**Why Blob first?** Vercel serverless functions have a 4.5MB incoming request body limit. By uploading to Blob first (client-side), then having the server fetch from Blob (outgoing request, no limit), we support large PDFs while staying within Vercel's constraints.

This architecture is used in BOTH:
- **Auto-create flow** (`AutoCreateContentScreen.tsx`)
- **Single-asset editor** (`EditorScreen.tsx`)

Both flows MUST use the same pattern.

### API Endpoint Reference

| Endpoint | File Types | Purpose |
|----------|------------|---------|
| `/api/upload-pdf` | `.pdf` only | PDF blob upload token |
| `/api/upload-doc` | `.doc`, `.docx` | Word doc blob upload token |
| `/api/parse-pdf` | PDFs | AI extraction + summarization |
| `/api/parse-solution-overview` | Word docs | Verbatim field mapping |
| `/api/parse-faq` | Word docs | FAQ content extraction |
| `/api/generate-stacker` | N/A | AI module generation for Stacker |
| `/api/report-bug` | N/A | Bug report submission (Resend email) |

### Upload Flow (Both Modes)

```tsx
// Step 1: Upload to Vercel Blob (client-side, bypasses body limit)
import { upload } from '@vercel/blob/client'

const blob = await upload(`pdfs/${Date.now()}-${file.name}`, file, {
  access: 'public',
  handleUploadUrl: '/api/upload-pdf',
})

// Step 2: Send blob URL to server for analysis
const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pdfUrl: blob.url, fileSize: file.size }),
})

// Server-side (in /api/parse-pdf):
// 1. Fetches PDF from blob.url
// 2. Converts to base64
// 3. Sends base64 to Claude API
```

### Content Source Flow

1. PDF uploaded → stored in Vercel Blob (public URL)
2. Blob URL sent to `/api/parse-pdf`
3. Server fetches PDF from Blob, converts to base64, sends to Claude
4. Claude extracts: title, main message, key points, CTA, raw summary
5. User reviews/edits extracted content
6. Edited content feeds into AI copy generation

### PDF Analysis Errors

Claude may fail to process certain PDFs with "Could not process PDF" error:

**Common causes:**
- Scanned PDFs with no OCR text
- Password-protected PDFs
- Corrupted PDF files
- Very large PDFs (>25MB)

**User-facing behavior:** Error message suggests using text input instead. Upload still "succeeds" in that user can proceed with manual text entry.

### Gotchas

1. **Don't use `/api/upload` for PDFs** — hits 4.5MB limit. Always use Blob flow.
2. **Both editor modes must stay aligned** — if changing PDF upload logic, update BOTH `EditorScreen.tsx` AND `AutoCreateContentScreen.tsx`
3. **Blob URLs are public** — PDFs are publicly accessible (needed for Claude to fetch them)
4. **Token must not be commented** — `# BLOB_READ_WRITE_TOKEN` won't work
5. **Restart dev server** after adding env vars
6. **Word docs use different endpoint** — `/api/upload-doc` for .docx files, NOT `/api/upload-pdf` (which validates for PDF only)

---

## Editor Screen Patterns (EditorScreen.tsx)

This is the largest file. Key patterns:

### Adding Controls for New Templates

1. Add template-specific state variables to store destructure
2. Add conditional section in the left column for template controls
3. Add template component in the preview area (right column)
4. Add export params in `handleExport`
5. Add to the image upload condition if template has images:

```tsx
// Templates that show image upload controls:
{((currentTemplate === 'website-thumbnail' && ebookVariant === 'image') ||
  currentTemplate === 'email-image' ||
  currentTemplate === 'social-image' ||
  // ... add new template here
) && (
  // Image upload UI
)}
```

### Drag-to-Adjust Spacing Controls

For templates that need user-adjustable spacing (e.g., pushing text up when CTA is hidden), use a padding-based approach rather than inserting/removing flex children. Adding a spacer div to a `justify-content: space-between` layout causes a visual "snap" — the layout redistributes abruptly when the child count changes.

**Pattern:** Modify the container's padding dynamically based on the spacing value. Reference implementation: `BottomSpacingHandle` in `EditorScreen.tsx` and `effectiveBottomPadding` in `EmailDarkGradient.tsx`.

**UI:** Pink pill drag handle with dashed guide lines and px readout, matching the Stacker module spacing handle style. Drag direction is inverted (drag up = increase spacing = push content up).

### Editor Toolbar Pattern (Multi-Page Collateral)

All multi-page collateral editors (FAQ, Stacker, Solution Overview) use a consistent toolbar layout:

```tsx
// Left side (actions)
<button>Preview</button>           // Eye icon, opens all-pages modal
<button>Review & Export</button>   // Blue button, navigates to export screen

// Center (if applicable)
<PageSelector />                   // Page 1, 2, 3 buttons (not for Stacker)

// Right side (zoom)
<button>-</button>                 // Decrease zoom (min 75%)
<select>150%</select>              // Zoom dropdown (75-200%)
<button>+</button>                 // Increase zoom (max 200%)
<button>⛶</button>                 // Fullscreen preview (ESC to exit)
```

**Zoom range:** 75% to 200% in 25% increments.

### Delete Confirmation Pattern

All destructive actions (deleting modules, pages, blocks) **must** show a confirmation modal. Never delete content immediately on click.

```tsx
// Standard delete confirmation modal
function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  itemType,    // "Module", "Page", "Block"
  itemLabel,   // Optional: specific item name
}: { ... })
```

**Implementation pattern:**
1. Store pending delete in state: `const [deleteConfirm, setDeleteConfirm] = useState<{id: string, type: string} | null>(null)`
2. On delete click: `setDeleteConfirm({ id, type })`
3. On confirm: Execute delete, then `setDeleteConfirm(null)`
4. On cancel: `setDeleteConfirm(null)`

### Image Upload & Crop Pattern

All image fields in editors use this two-state pattern:

**No image uploaded:** Two side-by-side dashed-border boxes — "Upload" (drag-and-drop + file input) and "Choose from library" (opens ImageLibraryModal).

**Image uploaded:** A thumbnail preview using the shared `ImagePreviewWithCrop` component (`components/shared/ImagePreviewWithCrop.tsx`). It shows:
- The image with current zoom/position/grayscale applied
- "Adjust" button (bottom-left) → opens `ImageCropModal` for zoom/pan
- "×" remove button (top-right) → clears the image

`ZoomableImage` (inline drag-to-pan) is deprecated. Do not use it for new templates.

### Sortable Item Controls

For any sortable/reorderable content (Stacker modules, carousel slides, FAQ pages): action buttons (drag handle, duplicate, delete) appear ABOVE the element on hover, not overlaid on content. Drag handles go in the left gutter or top-left — never centered over content where they block interaction.

### Scaling Large Templates in Preview (CSS Transform Gotcha)

**Problem:** When a template is much wider than the editor viewport (e.g., 2256px floating banner), using `transform: scale()` to visually shrink it doesn't change the element's layout box size. The inner div still pushes containers and backgrounds off-screen, even with `overflow: hidden`.

**Solution:** Use `position: absolute` on the inner scaled content to take it out of the document flow:

```tsx
// Outer container - fills available width naturally
<div
  ref={containerRef}
  className="w-full"
  style={{
    position: 'relative',
    height: containerWidth > 0 ? Math.round(containerWidth * (100 / 2256)) : 50,
    overflow: 'hidden',
  }}
>
  {/* Inner content - absolutely positioned so it doesn't affect layout */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2256,
    height: 100,
    transform: `scale(${containerWidth / 2256})`,
    transformOrigin: 'top left',
  }}>
    <TemplateComponent ... />
  </div>
</div>
```

**Key insight:** `transform: scale()` only visually scales — the element still occupies its original dimensions in layout. Absolute positioning removes it from flow so the parent container sizes correctly.

**Measuring container width:** Use `useLayoutEffect` + `ResizeObserver` to measure the container's `clientWidth` synchronously, then calculate scale dynamically.
