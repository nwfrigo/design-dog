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

2. **Render schema** in `lib/template-registry.tsx` — declares fields, parsers, defaults, and dimensions. The dynamic route at `app/render/[slug]/page.tsx` auto-generates the render page from this schema. No separate render page or render-content file needed for most templates.

   For templates with custom render logic (multi-page PDFs, carousel), keep individual `app/render/{slug}/page.tsx` and `render-content.tsx` files.

4. **Registration:** Update these files:
   - `lib/template-config.ts` — add template type and metadata
   - `types/index.ts` — add to `TemplateType` union
   - `lib/template-registry.tsx` — add entry (component, renderProps, queueTextFields) for queue/preview rendering
   - `components/EditorScreen.tsx` — add editor controls and preview
   - `components/AssetSelectionScreen.tsx` / `TemplateTile.tsx` — add to homepage grid
   - `store/index.ts` — add any template-specific state
   - `app/api/export/route.ts` — add template dimensions

5. **Event-scoped templates:** If the template belongs to a specific event (e.g. EHS+ Accelerate, Cority Connect), add it to the `EVENTS` array in `components/AssetSelectionScreen.tsx` instead of the standard channel grid. Each entry is `{ id: 'event:slug', label: 'Event Name', templates: ['template-slug'] }`. The Events chip appears in the filter bar and shows a dropdown of event names; selecting one filters to only that event's templates. The `FilterType` union in `types/index.ts` must include the new `'event:slug'` string.

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

  // Logo (ignored on themed templates — theme drives logo color)
  logoColor: 'white' | 'black' | 'orange'

  // Theme (if template supports theming — see lib/template-themes.ts)
  theme?: 'light' | 'dark'

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

**Theme support** uses a shared `theme` field (already in the store/types/snapshot pipeline) rather than per-template variant fields. For a new themed template: no new store fields needed — wire the `theme` prop through the template component, registry, export-params, and EditorScreen preview. Use `TEMPLATE_THEMES[theme]` from `lib/template-themes.ts` for all theme-keyed colors; never hard-code hex values for theme-sensitive surfaces.

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
| SVG icons, UI primitives | `components/shared/` | CorityLogo, ArrowIcon, ToggleSwitch, EyeIcon, DeleteConfirmModal, TemplateRenderer |
| Template-specific editors | `components/editors/` | SolutionOverviewEditor, SpeakerEditor |
| Custom hooks | `hooks/` | useGrayscaleImage, useThemeDetection |
| Utilities, constants, registries | `lib/` | asset-snapshot, render-params, export-params, template-registry, template-config |

### Extract-on-Second-Use

When you copy-paste a component, hook, or utility into a second file, extract it into the appropriate shared location immediately. This applies to SVG icons, toggle switches, modals, labeled inputs, `useEffect` patterns (canvas processing, MutationObserver, ResizeObserver), and style constants.

### Registry Over Switch

When a function dispatches to template-specific logic (export params, form sections, modals), use a registry (`Record<TemplateType, Handler>`) instead of a switch statement. Adding a new template should mean adding one registry entry, not inserting a case into a growing switch. References: `lib/export-params.ts` (export param builders), `lib/template-registry.tsx` (component + props + queue text fields).

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
6. `lib/template-registry.tsx` — Add to the template's `renderSchema.fields` (the dynamic render route at `app/render/[slug]/page.tsx` parses fields automatically from the schema — no separate render page needed)

The export API route (`app/api/export/route.ts`) uses a generic forwarding loop — it auto-forwards all params from the request body to the render URL. No changes needed there when adding new props. Queue exports use `buildExportParamsFromAsset()` in `lib/export-params.ts`, which delegates to the same `buildExportParams()` builders — no separate field list to maintain.

### Export Gotchas

**Sub-pixel rendering in PDF exports:** Puppeteer renders sub-pixel CSS values inconsistently — borders appear thicker, rectangles distort, page breaks land wrong. Use `getBoundingClientRect().height` with `Math.ceil()` instead of `offsetHeight` (which rounds down). Reset `body { min-height: 0 }` before measuring page height (the root layout applies `min-h-screen`).

**URLSearchParams auto-encoding:** `URLSearchParams.set()` auto-encodes values. Never pre-encode with `encodeURIComponent()` — it causes double-encoding (`%255B` instead of `%5B`). Pass raw strings.

**Editor and queue exports now share the same builders:** Both paths use `buildExportParams()` in `lib/export-params.ts`. The editor calls it directly; the queue calls `buildExportParamsFromAsset()` which converts a `QueuedAsset` into `ExportParamState` and delegates to the same function. Adding a field to a builder function covers both paths automatically.

### Render Page Pattern

Most templates use a **dynamic render route** at `app/render/[slug]/page.tsx`. This route reads the `renderSchema` from `lib/template-registry.tsx` and auto-parses URL params based on the field definitions. Adding a new render page means adding a `renderSchema` to the registry entry — no separate page file needed.

**Custom render pages** are kept for templates with complex logic beyond standard param parsing: `solution-overview-pdf`, `faq-pdf`, `stacker-pdf`, `social-carousel`, `website-floating-banner-mobile`.

All param parsing (both dynamic and custom pages) must use the shared helpers in `lib/render-params.ts`:

- `parseBoolTrue(params, key)` — for booleans that default ON (showHeadline, showCta, showBody, showEyebrow on most templates)
- `parseBoolFalse(params, key)` — for booleans that default OFF (grayscale, darkMode)
- `parseString(params, key, fallback)` — string with fallback
- `parseNumberOrUndefined(params, key)` — for nullable numbers like headlineFontSize

Never write inline `=== 'true'` or `!== 'false'` in render pages. The default for each boolean must be explicit in the parser call, not implicit in the comparison operator.

**Null handling in export API:** Use `!= null` (not `!== undefined`) when checking params before adding to the URL. A `null` value passes `!== undefined` and gets serialized as the string `'null'`, which `parseFloat` converts to `NaN`.

---

## Image Settings: Editor ↔ Queue ↔ Export Consistency

**The Core Rule:** Image settings (position, zoom, grayscale) must flow through **three locations** to ensure editor preview, queue preview, and exported PNG all match:

1. **`addToQueue`** (store/index.ts) — captures settings when asset is queued
2. **`lib/export-params.ts`** — the template's builder function sends settings to the export API (used by both editor and queue exports)
3. **`lib/template-registry.tsx`** — the template's `renderProps` function passes settings for queue thumbnail and preview modal rendering (via `TemplateRenderer`)

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
- [ ] Template builder in `lib/export-params.ts` includes image params (used by both editor and queue exports)
- [ ] Template `renderProps` in `lib/template-registry.tsx` passes image settings for queue thumbnail and preview

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
| `/api/team-members` | N/A | GET: list team members; POST: add new name |
| `/api/admin/auth` | N/A | Admin login — checks `ADMIN_PASSWORD`, sets `dd-admin` cookie |
| `/api/admin/exports` | N/A | Paginated export log with filters (admin only) |
| `/api/admin/stats` | N/A | Aggregate export stats (admin only) |
| `/api/admin/seed` | N/A | Creates DB tables + adds `thumbnail_url` column; safe to re-run |

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

## Export Monitoring

### Overview

Every export is logged to a Neon Postgres database with metadata: who exported it, which template, headline/solution text, format, scale, and a thumbnail URL. The data is visible at `/admin`.

### Database (`lib/db.ts`)

Two tables live in Neon Postgres (provisioned via Vercel Marketplace, env var `POSTGRES_URL`):

- **`export_logs`** — one row per export. Fields: `id`, `template_type`, `exported_by`, `headline`, `solution`, `format`, `scale`, `thumbnail_url`, `created_at`
- **`team_members`** — the roster of known users. Fields: `id`, `name`, `created_at`

Key functions:
- `logExport(params)` — inserts one row; called fire-and-forget from the export API (never `await`ed in the main path)
- `getExportStats()` — returns `{ total, today, thisWeek, byTemplate, byPerson, dailyCounts }`
- `getExportLogs(filters)` — paginated query with optional filters
- `getTeamMembers()` / `addTeamMember(name)` — team member CRUD

**Schema changes:** Add new columns via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in `app/api/admin/seed/route.ts`. The seed endpoint is idempotent — safe to re-run in production to apply migrations.

### Export Attribution (`exportedBy`)

`exportedBy: string | null` lives in the Zustand store and all 6 export-screen components spread it into the fetch body. The export API route (`app/api/export/route.ts`) reads it from the request body, uploads a thumbnail/PDF blob to Vercel Blob, then calls `logExport()`.

- **Awaited — not fire-and-forget:** Both the blob upload and `logExport()` are fully `await`ed before the HTTP response is returned. This is required because Vercel serverless functions terminate immediately after the response is sent, killing any unresolved `.then()` chains. Using fire-and-forget here causes silent data loss.
- **PNG exports:** Upload a screenshot thumbnail to Vercel Blob; `thumbnail_url` stores the blob URL. Admin shows the thumbnail in a lightbox.
- **PDF exports:** Upload the actual PDF buffer to Vercel Blob; `thumbnail_url` stores the PDF blob URL. Admin shows a native `<embed>` lightbox for multi-page viewing.
- **`exportedBy` is in `ROUTE_ONLY_KEYS`** — it's consumed by the API route and NOT forwarded as a render param

All 4 export paths in the route must call `logExport`:
1. Stacker PDF
2. Stacker PNG
3. FAQ/SO PDF
4. Default PNG (all other templates)

### Identity System (Name Picker)

- **`components/NamePickerModal.tsx`** — full-screen gate on first load; no skip option
- **localStorage key:** `design-dog-user` — persists across sessions; picker only shown when key is absent
- **`UserBadge`** component — shown in the header after sign-in; click to re-open picker
- **`components/NamePickerModal.tsx` also exports:** `getStoredUser()`, `clearStoredUser()`
- **"+ add" flow:** POST to `/api/team-members` → name saved to DB → available to all users on next load

Identity is restored from localStorage in `app/editor/page.tsx` on mount via `setExportedBy`.

### Admin Dashboard (`/admin`)

- **Route:** `app/admin/page.tsx`
- **Auth:** `middleware.ts` checks for `dd-admin` httpOnly cookie (24hr). No cookie → redirects to `?login=1`. Password checked against `ADMIN_PASSWORD` env var.
- **Stats cards:** Total exports (dropdown: today/this week/all time), Most Active user
- **Chart:** Horizontal bar chart of exports by template name
- **Table:** Paginated export log with thumbnail lightbox, name/template/format filters
- **Thumbnails:** PNG exports show a Vercel Blob thumbnail in a click-to-open lightbox; PDF exports show a clickable "PDF" button that opens the actual PDF in a native `<embed>` lightbox (multi-page, browser-native navigation)

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | Neon Postgres connection string (pooled) — auto-set by Vercel Marketplace |
| `ADMIN_PASSWORD` | Password for `/admin` login — set manually in Vercel dashboard |

### First-Time Setup

1. Add Neon Postgres via Vercel Marketplace → `POSTGRES_URL` is auto-provisioned
2. Set `ADMIN_PASSWORD` in Vercel env vars
3. Hit `/api/admin/seed` once (POST with password) to create tables
4. Re-run seed after schema changes (it uses `ADD COLUMN IF NOT EXISTS`)

---

## Editor Screen Patterns (EditorScreen.tsx)

This is the largest file. Key patterns:

### Editor Layout

The editor has a two-column layout:

**Left sidebar (340px):** Generate button → text fields (headline, body, CTA, etc.) → divider → template options (theme, category, layout, image upload, variant pickers). Text fields come first so users see content editing immediately.

**Right column:** Template preview (centered) → toolbar below preview → queue save/cancel (if editing from queue).

**Toolbar (below preview):** A contained pill bar centered under the preview with: Preview (opens lightbox) | Add to Queue | Scale selector (1x/2x/3x) | Export. This toolbar is only for single-page templates — multi-page collateral (SO, FAQ, Stacker) uses a separate toolbar pattern above the preview (see Editor Toolbar Pattern below).

**Preview lightbox:** The Preview button opens the current template at native 1x size in a fullscreen dark overlay. Uses `TEMPLATE_REGISTRY[currentTemplate].renderProps()` with the full store state (`useStore.getState()`) to render the live template. ESC key or click-outside to close.

**Generate button:** An inline button above the text fields (blue border + sparkle icon + "Generate" text). Clicking it switches `contentMode` to `'generate'`, showing the AI generation panel (describe prompt + PDF upload). After generation completes, it auto-switches back to `'verbatim'` with generated text. The generate panel has a "back to editing" link to return without generating.

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

### Editor Styling Conventions

- **Field labels:** `text-xs font-light font-mono` (monospace, lowercase, 12px) with `text-gray-500 dark:text-content-secondary`
- **Input fields:** `rounded` (4px border radius), `border-gray-300 dark:border-[#494a4c]`
- **Toggle buttons (theme, layout, variant):** Container uses `bg-gray-200 dark:bg-surface-tertiary rounded-lg`. Selected state adds `dark:border dark:border-[#494a4c]` on top of the standard active styling.
- **Logo picker:** Hidden for themed templates (theme drives logo color). Add template to the exclusion list when adding theme support.

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

### Image Upload: Vercel Blob Required (Critical)

**All user-uploaded images must go through Vercel Blob**, not `FileReader.readAsDataURL`. Data URLs are multi-megabyte base64 strings that exceed the API body size limit when sent through the export pipeline, causing silent export failures or missing images.

**The pattern:**
```tsx
import { upload } from '@vercel/blob/client'

// Upload to Blob, store the public URL
const blob = await upload(filename, file, {
  access: 'public',
  handleUploadUrl: '/api/upload-image',
})
setImageUrl(blob.url)  // Store public URL, not data URL
```

**Fallback for local dev:** If `BLOB_READ_WRITE_TOKEN` is missing, fall back to `FileReader.readAsDataURL`. This works for preview but images may fail in export.

**Where this applies:**
- `EditorScreen.tsx` — main image upload (`handleImageUpload`), newsletter image upload (`handleNewsletterImageUpload`), QR code upload
- `ImageLibraryModal.tsx` — user upload tab
- `FaqCoverImageLibraryModal.tsx` — user upload tab
- `SolutionOverviewImageLibraryModal.tsx` — user upload tab

**Why library images work without Blob:** Library images are pre-existing public URLs (`/assets/image-library/images/...`) — they're short strings that fit in the API body and get forwarded as URL params to the render page. Only user-uploaded images need Blob because they'd otherwise be data URLs.

**Never use `readAsDataURL` directly for image uploads** in new code. Always use the Blob-first pattern with data URL fallback.

### Sortable Item Controls

For any sortable/reorderable content (Stacker modules, carousel slides, FAQ pages): action buttons (drag handle, duplicate, delete) appear ABOVE the element on hover, not overlaid on content. Drag handles go in the left gutter or top-left — never centered over content where they block interaction.

### Show/Hide Toggle Pattern (EyeIcon)

All optional fields in editors use the `EyeIcon` component (`components/shared/EyeIcon.tsx`) for show/hide toggles. This pattern is used across Email templates and Stacker modules.

**Editor behavior:** The field stays visible but dims with `opacity-50` when toggled off. Fields are never hidden in the editor — users can always see and edit all content.

**Render behavior:** Template render components conditionally hide the element with `{showField && <Element />}`. The toggle controls output visibility, not editor visibility.

**Layout pattern:**
```tsx
<div className={!module.showBody ? 'opacity-50' : ''}>
  <div className="flex items-center justify-between mb-1">
    <label className="text-xs text-gray-500 dark:text-content-secondary">Body</label>
    <EyeIcon visible={module.showBody} onClick={() => onUpdate({ showBody: !module.showBody })} />
  </div>
  <RichTextEditor content={module.body} onChange={(html) => onUpdate({ body: html })} />
</div>
```

**Multi-card modules:** For module-level toggles that affect all cards (e.g., `showTitles`, `showDescriptions`), the eye icon appears only on the first card's field label (`index === 0`).

**When NOT to use EyeIcon:** Use `ToggleSwitch` for non-visibility settings like Grayscale. EyeIcon is specifically for "show/hide in rendered output."

### Rich Text for Body Fields

All body/description text fields in editors MUST use `RichTextEditor` (`components/RichTextEditor.tsx`) — never plain `<textarea>`. This provides bold, italic, underline, bullet/ordered lists, indent/outdent, and links.

**Two editor components exist:**
- `RichTextEditor` — Full toolbar (B, I, U, lists, indent, link). Use for all body/description fields.
- `SimpleRichTextEditor` — Bold + italic only. Use only for very short inline text (e.g., social carousel slide text).

**Which fields get rich text:** Any field where a user might want formatting — body, description, subheader, answer. Short single-value fields (titles, eyebrows, CTAs, stat values, labels) stay as plain `<input>` or `<textarea>`.

**Render side:** Template components receiving rich text must render with `dangerouslySetInnerHTML={{ __html: value }}` and include scoped CSS for lists, links, and paragraph spacing. Use the `stacker-rich-text` class pattern (see `StackerPdf/index.tsx`) or per-block scoped styles (see FAQ `ContentPage.tsx`).

**Scoped CSS required:**
- `p { margin: 0; }` — prevent double paragraph spacing
- `ul { list-style-type: disc; padding-left: 16px; }` — bullet lists
- `ol { list-style-type: decimal; padding-left: 16px; }` — numbered lists
- `a { color: #D35F0B; text-decoration: none; }` — brand orange links

**Backward compatible:** Plain text strings render correctly in `dangerouslySetInnerHTML`, so no migration is needed when upgrading a field from textarea to rich text. Type definitions stay as `string` (HTML strings are valid strings).

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
