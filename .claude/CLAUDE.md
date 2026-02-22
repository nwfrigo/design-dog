# Design Dog — Project Conventions & Standards

> This file is the source of truth for how code should be written in this project.
> When Figma dev mode code is pasted in, **always apply these conventions** over raw Figma output.
> These rules were established through debugging and QA — they take priority over design tool exports.

---

## Project Overview

Design Dog is an AI-powered design asset generator for Cority (B2B EHS software company). It lets non-designers create brand-compliant marketing assets. Built with Next.js, deployed on Vercel.

**Stack:** Next.js (App Router), React, TypeScript, Zustand (state), Tailwind CSS, Vercel (hosting + blob storage)

**Project root:** `~/claude-projects/design-dog/web/` — this is the ONLY git repo. All work happens here.

---

## Critical Figma Override Rules

When raw Figma dev mode code is pasted in for new templates, **always apply these fixes:**

### 1. `border` NOT `outline` for solution/category pills

Figma exports solution pills with `outline` and `outlineOffset`. We use `border` instead.

```tsx
// ❌ WRONG — Figma exports this
outline: '0.79px #0080FF solid', outlineOffset: '-0.79px'

// ✅ CORRECT — What we use
border: '0.79px solid #0080FF'
```

This applies to ALL solution/category pill elements across all templates.

### 2. Logo: Use SVG component, NOT Figma div blocks

Figma exports the Cority logo as a cluster of absolutely-positioned `<div>` elements. **Never use these.** Use our SVG logo component instead.

```tsx
// ❌ WRONG — Figma logo as divs
<div data-color="White" style={{width: 87.99, height: 28.73, position: 'relative'}}>
  <div style={{width: 8.73, height: 23.28, left: 57.63, ...}} />
  <div style={{width: 18.38, height: 17.80, left: 16.58, ...}} />
  // ... more positioned divs
</div>

// ✅ CORRECT — Use SVG logo component with appropriate color prop
// Logo color is determined by the template — check the design spec
```

### 3. CTA Arrow: Use consistent SVG arrow

Figma exports the CTA arrow as a div with outline. We use a consistent SVG arrow component.

```tsx
// ❌ WRONG — Figma CTA arrow
<div style={{width: 17.19, height: 13.67, outline: '1.17px white solid', outlineOffset: '-0.59px'}} />

// ✅ CORRECT — Use SVG arrow matching existing template implementations
```

### 4. Line-height adjustments

Figma sometimes exports `lineHeight` values that are too tight for the font size (e.g., 48.19px line-height for 54px font). Adjust as needed — user has confirmed overriding Figma values when they cause display issues.

### 5. Font: Fakt Pro via @font-face

All templates use `Fakt Pro` loaded via `@font-face`. The font family string in templates should be:
```tsx
fontFamily: `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
```
Where typography comes from brand config. In inline styles, use `'Fakt Pro'`.

### 6. Unsupported CSS properties

Remove Figma-only CSS that browsers don't support:
```tsx
// ❌ REMOVE these — not widely supported
textBoxTrim: 'trim-both'
textBoxEdge: 'cap alphabetic'
```

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
| `headline` | All templates (15/15) |
| `eyebrow` | Most templates (14/15) |
| `cta` / `ctaText` | Most templates (11/15) |
| `subhead` | Most templates (11/15) |
| `body` | Many templates (10/15) |
| `metadata` | Social templates only (2/15) |

### Variant Naming

Templates with image/no-image variants use: `'image' | 'none'`

Examples: `WebsiteThumbnail`, `WebsiteReport`, `WebsiteWebinar`

When variant is `'none'`:
- Text content area expands to fill space
- Headline font size typically increases
- Image-related controls hide in editor

---

## Image Handling

### Image Editor Features

Templates with images support:
- **Zoom:** Slider control, stored as `imageZoom` (default 1)
- **Pan:** Drag to reposition, stored as `imagePosition: { x: number, y: number }`
- **Grayscale:** Toggle switch, stored as `grayscale: boolean` (default false)

### Grayscale Implementation

- Per-asset setting (all images within one asset share the same grayscale toggle)
- Each asset in a collection/queue has its own independent grayscale setting
- Default is OFF (natural colors)
- Templates use canvas-based grayscale processing for export compatibility
- CSS `filter: grayscale(100%)` as fallback
- Speaker avatar components have their own grayscale prop
- **Must be passed through to export params** in `handleExport`

### Image Display Pattern

```tsx
// In templates, images use background-image for zoom/pan support:
style={{
  backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
  backgroundSize: `${imageZoom * 100}%`,
  backgroundPosition: `${50 + imagePosition.x}% ${50 + imagePosition.y}%`,
  filter: grayscale ? 'grayscale(100%)' : undefined
}}
```

### ZoomableImage Component

Import from `components/ZoomableImage`. Use for all image upload areas in the editor.

### Image Settings: Editor ↔ Queue ↔ Export Consistency

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

## Solution Pill Implementation

The solution pill shows which Cority solution the asset is for (Safety, Industrial Hygiene, etc.).

```tsx
// Standard solution pill styling:
<div style={{
  paddingLeft: 19,
  paddingRight: 19,
  paddingTop: 15,
  paddingBottom: 15,
  background: '#060621',           // Dark background
  borderRadius: 6.25,
  border: '0.79px solid #0080FF',  // ← BORDER not outline
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12.02,
  display: 'flex'
}}>
  {/* Color dot */}
  <div style={{
    width: 11.15,
    height: 11.15,
    background: solutionColor,     // Dynamic based on solution
    borderRadius: 1.92
  }} />
  {/* Label */}
  <div style={{
    color: 'white',
    fontSize: 10.80,
    fontFamily: 'Fakt Pro',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.19
  }}>
    {solution}
  </div>
</div>
```

The `showSolutionSet` toggle controls visibility. Solution text and color dot are dynamic based on the `solution` prop.

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

---

## Export System

### How Export Works

1. User clicks Export → `handleExport` in `EditorScreen.tsx` builds `exportParams`
2. API call to `/api/export/route.ts` with all params as query string
3. Export route navigates headless browser to `/render/{template-slug}?params...`
4. Puppeteer screenshots the rendered page
5. Returns PNG

### Critical: Export Params

**Every visible prop must be included in `exportParams`.** Missing params = broken exports.

When adding a new template, ensure `handleExport` includes ALL params:
- Text content (headline, eyebrow, subhead, body, cta)
- Visibility toggles (showEyebrow, showSubhead, etc.)
- Variant
- Image URL, position, zoom
- Grayscale
- Solution
- Logo color
- Any template-specific params

### Render Page Pattern

Each render page at `app/render/{slug}/page.tsx` must:
- Parse all URL search params
- Pass them to the render-content component
- Match the template component's props exactly

---

## Editor Screen (EditorScreen.tsx)

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

### No Required Fields

Headline is NOT required. No red asterisks. All buttons (export, queue, save) work even with empty fields. Templates show fallback text when fields are empty.

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

### Key Files

| File | Purpose |
|------|---------|
| `/api/upload-pdf` | Token endpoint for Vercel Blob client uploads |
| `/api/parse-pdf` | Fetches PDF from Blob, sends base64 to Claude |
| `@vercel/blob/client` | Client-side upload library |

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

### Local Development

**Required:** `BLOB_READ_WRITE_TOKEN` in `.env.local`

Get token from: Vercel Dashboard → Project → Storage → Blob Store → Tokens

```bash
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

**Common error:** `Vercel Blob: Failed to retrieve the client token`
- Cause: Token missing or commented out (check for `#` prefix)
- Fix: Add/uncomment token, restart dev server

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

## Auto-Create (formerly Quick Start) Flow

### Screens
1. **Kit Selection** — choose campaign type (webinar, ebook, etc.)
2. **Content Source** — upload PDF or enter text manually
3. **Asset Selection** — pick which assets to generate (checkboxes)
4. **Generating** — progress screen
5. **Editor** — edit generated assets with sidebar navigation

### Key UX Decisions
- No breadcrumbs on auto-create screens
- Full clickable cards for asset selection (not just image area)
- "Deselect All" button next to selection count
- Generate button disabled when 0 assets selected
- Generate button is blue
- About blurb at bottom of sidebar in monospace style

---

## Homepage

### Layout
- Main area: Visual grid of templates by channel (Digital > Email, Social, Website, Newsletter)
- Right sidebar: Auto-Create entry point (formerly "Quick Start" placeholder)
- Expand-in-place interaction for channel categories
- Only one channel expanded at a time

### Template Tiles
- Miniature preview, name, dimensions
- Hover effects (subtle elevation/glow)
- "Request new template" card with feature request form (Resend API)

---

## Git & Development

### Workflow
```bash
cd ~/claude-projects/design-dog/web
claude  # Start Claude Code from here

# Separate terminal for dev server:
cd ~/claude-projects/design-dog/web
npm run dev
```

### Commit Pattern
- Build check before commit: `npm run build`
- Commit with descriptive message
- Push to main

### Environment Variables
- `ANTHROPIC_API_KEY` — for AI copy generation
- `BLOB_READ_WRITE_TOKEN` — for PDF uploads (Vercel Blob)
- `RESEND_API_KEY` — for feature request emails
- Restart dev server after adding env vars
- Vercel requires redeploy after adding environment variables

---

## Brand Config

### Colors
- Primary dark background: `#060015`
- Solution pill background: `#060621`
- Solution pill border: `#0080FF`
- Brand orange (primary): `#D35F0B`

### Editor Dark Mode Colors (Tailwind Classes)

**IMPORTANT:** All editor screens must use standard Tailwind gray classes for dark mode, NOT custom purple-tinted colors. This ensures consistent dark mode appearance across all templates.

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Sidebar/Panel background | `bg-gray-100` | `dark:bg-gray-800/50` |
| Module item/card background | `bg-white` | `dark:bg-gray-800` |
| Input field background | `bg-gray-100` | `dark:bg-gray-900` |
| Section background | `bg-gray-50` | `dark:bg-gray-800/50` |
| Hover state | `hover:bg-gray-100` or `hover:bg-gray-200` | `dark:hover:bg-gray-700` |
| Border | `border-gray-200` or `border-gray-300` | `dark:border-gray-700` |

**❌ NEVER use these custom colors in editor UIs:**
- `#0d0d1a` (purple-black)
- `#1a1a2e` (dark purple-blue)
- `#252540` (purple-gray)

These create an inconsistent purple-tinted theme that doesn't match other editor screens.

### Solution Category Colors
- Environmental: `#49763E`
- Health: `#00767F`
- Safety: `#C3B01E`
- Quality: `#006FA3`
- Sustainability: `#A61F67`
- Converged: Uses brand orange `#D35F0B`

### Typography
- Primary font: Fakt Pro
- Loaded via @font-face
- Weight variations: 350 (light), 500 (medium)
- Eyebrow: 12px, uppercase, letter-spacing 1.32px
- CTA: 18.75px, weight 500

### Template Dimensions
- Website templates: 800×450px
- Email templates: 640×300px (varies by type)
- Social templates: 1200×628px (varies by type)
- Newsletter templates: 600×338px (varies by type)
- Collateral PDFs: 612×792px (Letter size, 8.5"×11")
- All have 32px internal padding (except multi-page PDFs which follow print standards)

---

## Existing Templates (as of Feb 2026)

### Email
- `email-dark-gradient` — EmailDarkGradient
- `email-grid` — EmailGrid
- `email-image` — EmailImage (has image upload + grayscale)
- `email-speakers` — EmailSpeakers (up to 3 speaker avatars)

### Social
- `social-dark-gradient` — SocialDarkGradient
- `social-blue-gradient` — SocialBlueGradient
- `social-image` — SocialImage (has image upload + grayscale)
- `social-grid-detail` — SocialGridDetail

### Website
- `website-thumbnail` — WebsiteThumbnail (ebook featured image, variants: image/none)
- `website-press-release` — WebsitePressRelease (has image upload + grayscale)
- `website-webinar` — WebsiteWebinar (variants: image/none, up to 3 speakers)
- `website-event-listing` — WebsiteEventListing (variants via toggle)
- `website-report` — WebsiteReport (variants: image/none, image on LEFT)
- `website-floating-banner` — WebsiteFloatingBanner (2256×100px, 7 style variants)

### Newsletter
- `newsletter-dark-gradient` — NewsletterDarkGradient (has image + grayscale)
- `newsletter-blue-gradient` — NewsletterBlueGradient (has image + grayscale)
- `newsletter-light` — NewsletterLight (has image + grayscale)

### Collateral (Multi-Page PDFs)
- `solution-overview-pdf` — SolutionOverviewPdf (3-page Letter PDF, 612×792px per page)

---

## Multi-Page Collateral Templates

Multi-page collateral assets (like Solution Overview PDFs) differ from single-page banner templates in architecture and workflow.

### Architecture Differences

| Aspect | Single-Page Templates | Multi-Page Collateral |
|--------|----------------------|----------------------|
| Component | Single `TemplateComponent.tsx` | Multiple page components in subfolder |
| Dimensions | Various (640×300, 1200×628, etc.) | Standard paper (Letter: 612×792) |
| Export | PNG via Puppeteer screenshot | Multi-page PDF export |
| Content source | AI copy generation from PDF | Verbatim extraction from Word doc |
| Editor | Standard EditorScreen | Custom export screen |

### File Structure: Solution Overview PDF

```
components/templates/SolutionOverviewPdf/
├── Page1Cover.tsx          # Cover page with solution name, tagline
├── Page2Body.tsx           # Key solutions, customer quote
├── Page3BenefitsFeatures.tsx  # Benefits grid, features list
└── index.tsx               # Composite export (all pages)

components/
├── SolutionOverviewSetupScreen.tsx   # Setup flow (category, doc upload)
├── SolutionOverviewExportScreen.tsx  # Editor with page navigation

app/api/
├── upload-doc/route.ts     # Blob upload for Word docs (.doc, .docx)
└── parse-solution-overview/route.ts  # Claude extraction to template fields
```

### Word Document Upload (Different from PDF!)

**Critical:** Word doc uploads use a different pattern from PDF uploads. Content is extracted verbatim — NO AI rewriting.

| Endpoint | File Types | Purpose |
|----------|------------|---------|
| `/api/upload-pdf` | `.pdf` only | PDF blob upload token |
| `/api/upload-doc` | `.doc`, `.docx` | Word doc blob upload token |
| `/api/parse-pdf` | PDFs | AI extraction + summarization |
| `/api/parse-solution-overview` | Word docs | Verbatim field mapping |

```tsx
// Word doc upload flow (SolutionOverviewSetupScreen.tsx)
import { upload } from '@vercel/blob/client'

// Step 1: Upload to Vercel Blob (different endpoint!)
const blob = await upload(`docs/${Date.now()}-${file.name}`, file, {
  access: 'public',
  handleUploadUrl: '/api/upload-doc',  // NOT upload-pdf!
})

// Step 2: Parse with mammoth + Claude (no rewriting)
const response = await fetch('/api/parse-solution-overview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ docUrl: blob.url }),
})
```

### Content Extraction vs AI Generation

**Solution Overview (verbatim extraction):**
- User uploads Word doc following a template
- Claude extracts exact text to specific fields
- NO rewriting, summarizing, or AI generation
- Fields: solutionName, tagline, keySolutions[1-7], benefits[5], features[5-6], quote, etc.

**Standard templates (AI generation):**
- User uploads PDF source material
- Claude summarizes key points
- AI generates marketing copy based on template type
- Eyebrows, headlines, CTAs are AI-generated

### Setup Screen Pattern

Multi-page collateral uses a dedicated setup screen before the editor:

1. **Category Selection** — Vertical stack of solution categories
2. **Solution Name** — Large input matching header styling
3. **Document Upload** — Drag-drop or click to upload Word doc
4. **Parse & Navigate** — On success, auto-navigate to editor

**Theme-aware styling for setup screens:**
```tsx
// Detect dark mode
const [isDark, setIsDark] = useState(false)

useEffect(() => {
  const checkTheme = () => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }
  checkTheme()

  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}, [])

// Theme-aware colors
const unselectedColor = isDark ? '#37393D' : '#dddddd'
```

### Lucide Icon Picker

Multi-page templates may include icon selection (e.g., Benefits section icons).

**Key files:**
- `components/IconPickerModal.tsx` — Reusable modal with 1500+ Lucide icons
- `getIconByName(name)` — Convert kebab-case name to Lucide component

```tsx
import { getIconByName } from '@/components/IconPickerModal'

// In template component
const IconComponent = getIconByName(iconId)  // 'clipboard-check' → ClipboardCheck
if (IconComponent) {
  return <IconComponent size={17} strokeWidth={1.5} color="#37393D" />
}
```

**Default benefit icons:** `'zap'`, `'clipboard-check'`, `'eye'`, `'shield-check'`, `'clock'`

### Page Navigation in Editor

Multi-page editors show page tabs instead of template tabs:

```tsx
// soCurrentPage state in store (1, 2, or 3)
const pages = [
  { page: 1, label: 'Cover' },
  { page: 2, label: 'Key Solutions' },
  { page: 3, label: 'Benefits & Features' },
]
```

### Export Differences

Single-page templates export as PNG. Multi-page collateral exports as PDF:

```tsx
// In export route for solution-overview-pdf
// Render all 3 pages and combine into single PDF
```

---

## Checklist: Adding a New Template

1. [ ] Create template component in `components/templates/`
2. [ ] Apply Figma override rules (border not outline, SVG logo, remove unsupported CSS)
3. [ ] Only expose text fields that exist in the design
4. [ ] Add render-content and page in `app/render/{slug}/`
5. [ ] Register in `config/template-config.ts`
6. [ ] Add to `types/index.ts` TemplateType union
7. [ ] Add editor controls in `EditorScreen.tsx`
8. [ ] Add export params in `handleExport`
9. [ ] Add to homepage grid in `AssetSelectionScreen.tsx` / `TemplateTile.tsx`
10. [ ] Add template-specific state to store if needed (variants, etc.)
11. [ ] **If template has variants:** Add variant fields to `ManualAssetSettings` in `types/index.ts` AND update `goToAsset` in `store/index.ts` to save/restore them (see Variant Persistence below)
12. [ ] Add to image upload condition if template has images
13. [ ] Pass grayscale prop if template has images
14. [ ] Test export works end-to-end
15. [ ] Test variant persistence: switch to another asset and back — variant should be preserved
16. [ ] Build check: `npm run build`

---

## Known Issues & Gotchas

- **Figma outline → border:** Always convert. This is the #1 regression source.
- **Figma logo divs:** Always replace with SVG component.
- **Export params missing:** Every prop visible in the template MUST appear in exportParams.
- **Grayscale in export:** Must be passed in exportParams AND handled in render page.
- **Vercel body limit:** PDFs must go through Blob storage, not direct upload.
- **Two state systems:** Auto-create uses `generatedAssets` + `templateType`; manual mode uses `selectedAssets` + `currentAssetIndex`. Don't mix them.
- **Modal state persistence:** Use React `key` prop or `useEffect` cleanup to reset modal state on mount.
- **Local PDF uploads:** Require `BLOB_READ_WRITE_TOKEN` in `.env.local`.

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
