# Design Dog — Templates Reference

> Full template catalog, multi-page collateral architecture, module types, and checklists.
> Read this before adding, modifying, or debugging any template.

---

## Existing Templates

**Legend.** ✅ = on the Stage & Bench editor (29 templates; `executive-overview` is the first multi-page one). 📜 = on the legacy sidebar-form editor (3 PDFs). 🙈 = `hidden: true` in `lib/template-config.ts` — registered but not surfaced in the homepage tile grid / asset picker / template dropdowns (existing drafts still resolve).

> **`custom-size` is not a fixed template** — it's an arbitrary-dimension asset whose layout is resolved live by an engine. Its homepage entry is a bespoke first tile in `AssetSelectionScreen`, rendered through `TemplateTileV2` via its `previewOverride` (a themeable vector montage) + `launchOnly` props rather than a scaled template preview. Full details in `CUSTOM-SIZE.md`.

### Email
- ✅ `email-dark-gradient` — EmailDarkGradient (rich text headline/body)
- ✅ `email-grid` — EmailGrid (**themed**: light/dark)
- ✅ `email-image` — EmailImage (image upload + grayscale, **themed**: light/dark)
- ✅ `email-speakers` — EmailSpeakers (3 speakers; per-speaker name/role/avatar editable via nested slots, **themed**: light/dark)
- ✅ `email-product-release` — EmailProductRelease

### Events (event-scoped, grouped under Events filter in AssetSelectionScreen)
- ✅ `email-cority-connect-2026` — EmailCorityConnect2026 (640×370px; Cority Connect event)
- ✅ `email-ehs-accelerate-banner` — EmailEhsAccelerateBanner (600×373px; EHS+ Accelerate event)
- ✅ 🙈 `email-ehs-accelerate-invitation` — EmailEhsAccelerateInvitation (420×595px; EHS+ Accelerate event; HTML body with bold/italic toolbar). Hidden from selection surfaces.
- ✅ `email-ehs-accelerate-signature` — EmailEhsAccelerateSignature (400×100px; EHS+ Accelerate event; email signature banner)
- ✅ `social-ehs-accelerate` — SocialEhsAccelerate (1200×628px; EHS+ Accelerate event; light bg with `<EhsAccelerateLogo>`, headline/subhead/CTA only)
- ✅ `website-ehs-accelerate-listing` — WebsiteEhsAccelerateListing (800×450px; EHS+ Accelerate event; full-canvas bg image with opaque white right grid panel; mirrors `website-event-listing` minus colorway variants)
- ✅ `email-cority-customer-exchange-signature` — EmailCorityCustomerExchangeSignature (400×100px; Cority Customer Exchange event; bg image + coded `rgba(6,0,21,0.70)` right panel; date/location/time/CTA each with independent EyeIcon)
- ✅ `email-cority-customer-exchange-banner` — EmailCorityCustomerExchangeBanner (640×300px; Cority Customer Exchange event; left dark panel with `<CorityCustomerExchangeStackedLogo>`, right content uses `justify-content: flex-end` so CTA pins bottom; uses 4-color enum selector via `ccBackgroundVariant`)

### Social
- ✅ `social-dark-gradient` — SocialDarkGradient
- ✅ `social-blue-gradient` — SocialBlueGradient
- ✅ `social-image` — SocialImage (image upload + grayscale, **themed**: light/dark)
- ✅ `social-image-meddbase` — SocialImageMeddbase (Meddbase logo + brand-primary arrow; twin of social-image)
- ✅ `social-grid-detail` — SocialGridDetail (**themed**: light/dark)
- 🙈 `social-carousel` — SocialCarousel (1080×1080px multi-slide). Hidden — multi-slide paradigm doesn't fit single-stage editing; code retained for existing drafts.

### Website
- ✅ `website-thumbnail` — WebsiteThumbnail (ebook featured image, variants: image/none, **themed**: light/dark)
- ✅ `website-press-release` — WebsitePressRelease (image upload + grayscale, **themed**: light/dark)
- ✅ `website-webinar` — WebsiteWebinar (variants: image/none, 3 speakers with per-speaker name/role/avatar, **themed**: light/dark)
- ✅ `website-event-listing` — WebsiteEventListing (3 colorway variants: orange/light/dark)
- ✅ `website-report` — WebsiteReport (variants: image/none, image on LEFT, **themed**: light/dark)
- ✅ `website-floating-banner` — WebsiteFloatingBanner (2256×100px, 7 style variants)
- ✅ `website-floating-banner-mobile` — WebsiteFloatingBannerMobile (390×100px, mobile, 7 variants + arrow-type toggle)

### Newsletter
- ✅ `newsletter-dark-gradient` — NewsletterDarkGradient (image + grayscale, rich text headline/body)
- ✅ `newsletter-blue-gradient` — NewsletterBlueGradient (image + grayscale, rich text headline/body)
- ✅ `newsletter-light` — NewsletterLight (image + grayscale, rich text headline/body, **themed**: light/dark)
- ✅ `newsletter-top-banner` — NewsletterTopBanner (600×240px header banner; theme toggle)

### Collateral
- 📜 `solution-overview-pdf` — SolutionOverviewPdf (3-page Letter PDF, 612×792px per page)
- 📜 `faq-pdf` — FaqPdf (dynamic page count, Q&A format with tables support)
- 📜 `stacker-pdf` — StackerPdf (modular document builder with drag-and-drop)
- ✅ `customer-library` — CustomerLibrary (590×330px, 3 colorway variants: orange/dark/light, QR code upload, rich text headline/body)
- ✅ `executive-overview` — ExecutiveOverview (**first multi-page Stage & Bench template**; fixed 2-page Letter PDF, 612×792px per page; prospect-facing partnership summary — intro + hero on page 1, value cards + stats + contact on page 2; light-mode only). Uses the page-selector substrate primitive (STAGE-AND-BENCH.md §10) + the `executiveOverviewDocument` blob + the legacy multi-page PDF export path. Page components: `components/templates/ExecutiveOverview/{Page1,Page2}.tsx`; render route `app/render/executive-overview/`.

---

## Multi-Page Collateral Templates

Multi-page collateral assets differ from single-page banner templates in architecture and workflow.

**Two paths exist:**
1. **Legacy sidebar-form PDFs** — `solution-overview-pdf`, `faq-pdf`, `stacker-pdf`. Word/PDF upload → parse → a bespoke setup + editor + export screen. Documented in the sections below.
2. **Stage & Bench multi-page** — `executive-overview` (the first). Direct on-canvas editing via the page-selector substrate primitive; content in one document blob; reuses the legacy PDF export pipeline. **This is the path for any NEW multi-page collateral** — see "Executive Overview" (reference implementation) and "Checklist: Adding a Multi-Page Stage & Bench Collateral Template" below.

### Architecture Differences

| Aspect | Single-Page S&B | Multi-Page S&B (executive-overview) | Legacy Multi-Page PDF (SO/FAQ/Stacker) |
|--------|-----------------|--------------------------------------|-----------------------------------------|
| Component | Single `TemplateComponent.tsx` | One component per page in a subfolder | Multiple page components in subfolder |
| Dimensions | Various | Letter (612×792) | Letter (612×792) |
| Editor | StageBenchEditor | StageBenchEditor + page selector | Legacy sidebar-form + custom screens |
| Content | Store fields / blob | One document blob | ~50 flat `solutionOverview*` store fields |
| Export | PNG via Puppeteer | Multi-page PDF (reuses legacy path) | Multi-page PDF |
| Content source | AI copy / direct edit | Direct on-canvas edit | Verbatim Word extraction / AI |

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

### Word Document Upload (Different from PDF!)

**Critical:** Word doc uploads use a different pattern from PDF uploads. Content is extracted verbatim — NO AI rewriting.

| Endpoint | File Types | Purpose |
|----------|------------|---------|
| `/api/upload-pdf` | `.pdf` only | PDF blob upload token |
| `/api/upload-doc` | `.doc`, `.docx` | Word doc blob upload token |
| `/api/parse-pdf` | PDFs | AI extraction + summarization |
| `/api/parse-solution-overview` | Word docs | Verbatim field mapping |
| `/api/parse-faq` | Word docs | FAQ content extraction |

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

## Solution Overview PDF

### File Structure

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

---

## FAQ PDF (Multi-Page Q&A Documents)

### File Structure

```
components/templates/FaqPdf/
├── CoverPage.tsx           # Title + solution category
├── ContentPage.tsx         # Q&A blocks, headings, tables
└── index.tsx               # Composite export

components/
├── FaqSetupScreen.tsx      # Category selection, title, doc upload
├── FaqEditorScreen.tsx     # Block editing, page management
└── FaqExportScreen.tsx     # Review and export

app/api/
└── parse-faq/route.ts      # Claude extraction from Word docs
```

### Key Differences from Solution Overview

| Aspect | Solution Overview | FAQ PDF |
|--------|------------------|---------|
| Page count | Fixed 3 pages | Dynamic (auto-pagination) |
| Content blocks | Fixed sections | Q&A, headings, tables |
| Editing | Field-by-field | Block-based with rich text |
| Overflow handling | N/A | Auto-creates new pages |

### Block Types

- `heading` — Section headers
- `qa` — Question + Answer (rich text answer with TipTap)
- `table` — Data tables with configurable rows/columns

### Auto-Pagination

FAQ pages have a fixed height (792px). When content exceeds this:
1. System measures block heights
2. Automatically distributes blocks across pages
3. Shows overflow warning if redistribution fails

---

## Stacker PDF (Modular Document Builder)

Stacker is a drag-and-drop modular PDF builder that lets users compose documents from pre-built content modules.

### Architecture

Unlike fixed-layout templates, Stacker uses a **module-based architecture**:

| Aspect | Standard Templates | Stacker |
|--------|-------------------|---------|
| Layout | Fixed structure | User-composed from modules |
| Content | AI generates copy for fixed fields | AI generates full module structure |
| Editing | Field-by-field inputs | Module-level editing with drag-and-drop |
| Preview | Single template preview | Live preview with reorderable modules |

### File Structure

```
components/templates/StackerPdf/
├── modules/
│   ├── LogoChipModule.tsx      # Locked: Logo + solution category chips
│   ├── HeaderModule.tsx        # Locked: Document title (Large/Medium/Small)
│   ├── ParagraphModule.tsx     # Body text with optional heading
│   ├── BulletListModule.tsx    # 3-column bullet list
│   ├── ImageModule.tsx         # Image - 1:1 (180×180) with caption
│   ├── Image16x9Module.tsx     # Image - 16:9 (180×100)
│   ├── ImageCardsModule.tsx    # 2-3 image cards with titles
│   ├── CardsModule.tsx         # Simple Cards (3 icon cards)
│   ├── QuoteModule.tsx         # Customer testimonial
│   ├── ThreeStatsModule.tsx    # 2-3 stat highlights
│   ├── OneStatModule.tsx       # Single stat with description
│   ├── DividerModule.tsx       # Visual separator
│   └── FooterModule.tsx        # Locked: Cority boilerplate
└── index.tsx                   # Main StackerPdf component

components/
├── StackerSetupScreen.tsx      # PDF/text input → AI generation
├── StackerEditorScreen.tsx     # Module editing + drag-and-drop
├── StackerPreviewEditor.tsx    # Preview with drop zones + add module modal
├── StackerSpacingHandle.tsx    # Drag-to-adjust spacing + inline add module button
└── StackerExportScreen.tsx     # Review and export

lib/
└── stacker-modules.ts          # Module registry for AI prompts

app/api/
└── generate-stacker/route.ts   # AI endpoint for module generation
```

### Module Types

**Locked Modules** (always present, not draggable):
- `logo-chip` — Logo + solution category chips (top)
- `header` — Document title with size options (top)
- `footer` — Cority boilerplate (bottom)

**Content Modules** (draggable, deletable):
- `paragraph` — Body text, optional heading
- `bullet-three` — 3-column bullet list
- `image` — 1:1 aspect ratio image with text
- `image-16x9` — 16:9 aspect ratio image
- `image-cards` — 2-3 image cards with eyebrow/title/body
- `three-card` — Simple Cards with icons
- `quote` — Testimonial quote
- `three-stats` — 2-3 statistics (toggle 3rd)
- `one-stat` — Single stat with description
- `divider` — Horizontal line separator

### AI Content Generation Constraints

**AI must never generate content that looks like verified data.** Quote modules and Stats modules must only use verbatim source content — never AI-generated text. AI fabricates authoritative-looking statistics and attributed quotes that are entirely made up. When building AI prompts for module generation, explicitly exclude these module types from the candidate list.

### AI Content Generation

Stacker uses AI to generate the initial document structure:

1. User uploads PDF or pastes text in StackerSetupScreen
2. `/api/generate-stacker` calls Claude with module registry
3. Claude returns structured JSON with module array
4. Modules are loaded into StackerEditorScreen for editing

**Module Registry** (`lib/stacker-modules.ts`):
- Single source of truth for all module definitions
- `generateModulePromptSection()` — Creates prompt text for Claude
- `createModuleFromAI()` — Converts AI response to typed modules

### Editor Features

- **Drag-and-drop reordering** in preview area (dnd-kit)
- **Delete confirmation modal** for all modules
- **Icon picker** for Simple Cards (Lucide icons)
- **EyeIcon show/hide toggles** on most fields across all content modules (fields dim in editor, hide in render output — see pattern in ARCHITECTURE.md)
- **Preview/Review & Export toolbar** matching FAQ/SO pattern
- **Zoom controls** (75%-200%)
- **Fullscreen preview** modal
- **Insert module between** existing modules via inline Add Module button in spacing handle (opens same modal, splices at position)
- **Rich text editing** for all body/description fields (TipTap-based `RichTextEditor` with bold, italic, underline, lists, links)

---

## Executive Overview (first multi-page Stage & Bench collateral)

`executive-overview` is a fixed 2-page, Letter-portrait, prospect-facing partnership summary — and the **first multi-page template on the Stage & Bench editor** (direct on-canvas editing, not the legacy sidebar-form PDF path). It's the reference implementation for the multi-page playbook below.

### What it demonstrates
- The **page-selector substrate primitive** ([STAGE-AND-BENCH.md §10](STAGE-AND-BENCH.md)): a `pages` descriptor + ephemeral `currentStagePage` + per-page computed slots. One page is on stage at a time, so single-canvas assumptions (one bench, single selection) hold.
- The **document-blob state model** (the custom-size precedent): all content in one `executiveOverviewDocument` field — not ~50 flat store fields.
- **Reuse of the legacy multi-page PDF export pipeline** — `page:'all'` → one Letter PDF, no new export engine.
- The **`chip` editbar kind** — icon + editable label, via `IconRegistry` + `EditbarChip`.

### File structure
```
components/templates/ExecutiveOverview/
├── Page1.tsx                    # Cover: co-brand logos, headline, intro body, quote, hero rail
├── Page2.tsx                    # Details: 2×2 value cards (chips), stats, contact
├── ExecutiveOverviewPrint.tsx   # both pages stacked w/ page breaks (export render composite)
├── constants.ts                 # block-id union, content model, tokens, placeholders, default hero
└── index.tsx                    # barrel

lib/executive-overview/document.ts   # ExecutiveOverviewDocument + factory + immutable update helpers + doc→props mappers
components/canvas-editor/template-adapters/
├── ExecutiveOverviewStageBench.tsx   # adapter (pages, per-page slot resolver, chip/image bindings)
└── ExecutiveOverviewRegistration.tsx # Template, renderProps, renderPreview, exportBuilder (.tsx: has preview JSX)
app/render/executive-overview/page.tsx  # bare Puppeteer render route (decodes the doc, page breaks)
```

### Document model
`executiveOverviewDocument` (`lib/executive-overview/document.ts`) is a **self-contained blob**: partner logo/name, intro headline/body, quote + attribution, hero image (url/position/zoom/**filters**/grayscale), tagline, `cards[4]{title, body, chips[]{label, icon, show}}`, section header/subhead, `stats[5]{label, show}`, footer CTA, contact `{name, role, email, avatar}`. Persisted through `SNAPSHOT_FIELDS` + draft as one field. The `doc→page1Props`/`doc→page2Props` mappers are shared by the editor adapter and the export render route, so editor == export.

### Slots & interactions
- **Text** (headline, body, quote, tagline, card titles/bodies, stats, contact) — inline-editable, with per-slot line caps via `SlotContentSpec.maxLines` (headline 4, card title 1, card body 4).
- **Chips** — `kind:'chip'`: `EditbarChip` `[hide | replace-icon]`, `IconRegistry` for the icon, inline label editing preserved.
- **Images** (partner logo, hero, avatar) — always-on with empty-state placeholders. Hero supports crop + color filters/presets (`heroImageFilters`, applied via `filtersToCss`). Ships with a default hero. The partner-logo placeholder renders only in the editor (`interactive` prop) so it doesn't print when unset.
- Light-mode only (matches the design).

### Export
Reuses the legacy multi-page PDF path: `exportBuilder` emits `page:'all'` + `executiveOverviewConfig` (the whole doc, a `COMPLEX_KEY`); `app/api/export/route.ts` detects `isExecutiveOverview` (`numPages=2`); the bare `/render/executive-overview` route decodes the doc and renders both pages split by `pageBreakAfter:'always'` inside `GenericRenderContent` (the `#render-ready` fonts signal). The editor's **Export** names the download from the response's Content-Disposition (`.pdf`, not `.png`); **Preview** shows both pages via the registration's `renderPreview`.

---

## Checklist: Adding a New (single-page) Stage & Bench Template

This section covers adding a **single-page Stage & Bench** template. For a **multi-page** collateral asset, follow "Checklist: Adding a Multi-Page Stage & Bench Collateral Template" (below) — it builds on this one. The legacy sidebar-form editor is now reserved only for the 3 existing multi-page PDFs (`solution-overview-pdf` / `faq-pdf` / `stacker-pdf`); don't add new templates there.

**Component file requirements (non-negotiable):**
- [ ] First line is `'use client'` — required for the dynamic render route at `app/render/[slug]/page.tsx` to pass the component across the Server→Client boundary. Missing this crashes the export on Vercel.
- [ ] Use plain `<img>` — never `import Image from 'next/image'`. `next/image` routes through Vercel's optimization service, which Puppeteer's `networkidle2` waits on and times out.
- [ ] Set `fontFamily` from `typography`: `const fontFamily = \`"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}\`` and apply it to the outer container. Never use `var(--font-fakt)` or any CSS variable — these are Next.js runtime-only and unavailable in Puppeteer, causing wrong/default fonts in exports.
- [ ] No padding on outer container — padding inflates height in Puppeteer. Use an inner wrapper for spacing.
- [ ] Apply Figma override rules (border not outline, SVG logo, remove unsupported CSS). See BRAND.md.
- [ ] **Canonical placeholders come from `lib/slot-placeholders.ts`.** Use `value || SLOT_PLACEHOLDERS.foo` for the `defaultInner` fallback (and `placeholder: SLOT_PLACEHOLDERS.foo` in the adapter slot descriptor's `content` field). Don't inline `'Headline'`, `'Body copy goes here.'`, etc. — every surface (editor preview / thumbnail / export) reads the same string from this map. Flavored event-specific defaults stay inline.
- [ ] **`format: 'html'` slots must render via `<RichText>`.** If the adapter declares a slot with `content: { format: 'html' }`, the template render must produce `<RichText html={value || SLOT_PLACEHOLDERS.foo} />` (from `@/components/shared/RichText`) — not `<div>{value}</div>` and not a hand-rolled `dangerouslySetInnerHTML` with its own `<style>` block. Otherwise bold/italic and Enter-inserted line breaks render as literal `<b>…</b>` / `<div>…</div>` text in both editor and export. **`npm run validate:registrations` now fails on this**, so it can't ship silently the way it did for 11 templates. Substrate §4.7.
- [ ] **Multi-line `format: 'plain'` slots must render via `<PlainText>`.** If a plain slot allows Enter (no `singleLine: true`, and not a `kind: 'cta'`), the user's line break reaches the store as a literal `\n` — which HTML collapses to a space, so the break shows while editing and disappears on commit. Render it as `<PlainText text={value || SLOT_PLACEHOLDERS.foo} />` (from `@/components/shared/PlainText`). If the field should be one line instead, set `singleLine: true` so Enter is suppressed at the source rather than silently swallowed downstream. Also gated by `npm run validate:registrations`. Substrate §4.7.
- [ ] **Render visibility from `show*` alone — never `show* && !!content`.** Substrate §8.4: a slot renders whenever its `show*` flag is true, regardless of whether the user has typed anything. The `defaultInner: value || SLOT_PLACEHOLDERS.foo` fallback handles empty content; gating on content presence drops slots out of the export when the editor shows them. Apply this in **both** the template render *and* the registration (`renderProps` + `exportBuilder`).

### Steps

1. **Create the template** at `components/templates/<Name>.tsx`. Export a `<Name>BlockId` union for every editable block. Define a Props interface accepting `renderBlock?`, `renderInlineEditor?`, and `renderOverlay?` render-props (the S&B factory passes these through). Inside the JSX, wrap each editable block with `wrapBlock('blockId', (...))` and (for text blocks) wrap the inner text with `wrapInline('blockId', value || SLOT_PLACEHOLDERS.foo)` (importing from `@/lib/slot-placeholders`). Default `wrapBlock` and `wrapInline` to identity functions so export / preview contexts work without an adapter. If the template uses `ContentStack`, prefer putting every editable block (including the CTA) inside `blocks[]` so it gets inline editing, stackAlign distribution, and spacer drags uniformly — avoid rendering blocks as siblings of `<ContentStack>` unless the layout truly requires it.

2. **Add to `types/index.ts`** — append the slug to the `TemplateType` union, plus any new store fields the template needs (variant enums, per-template show flags, etc.).

3. **Add to `lib/template-config.ts`** — slot the template into the right `SUBCHANNELS` entry (e.g. `EMAIL_BANNER_TEMPLATES`, `SOCIAL_TEMPLATES`). Set `width`, `height`, `dimensions`, and optionally `hidden: true` (launches dark) or `channelLabel: 'Override'` (overrides the subchannel label in the editor tab + tile copy). The `TEMPLATE_SUBCHANNEL_LABEL` map is derived from this placement, so the editor tab prefix (`"EMAIL BANNER / GRID DETAILS"`) lights up automatically — no separate registration needed.

4. **Add to the store** (`store/index.ts`) — any new variant/show fields + their setters. Add to `lib/asset-snapshot.ts`'s `SNAPSHOT_FIELDS` array so the field persists in queue/draft/export.

5. **Build the adapter** at `components/canvas-editor/template-adapters/<Name>StageBench.tsx` using `defineStageBenchAdapter` from the factory. The adapter declares `slots[]` (each with `blockId`, `label`, `iconKey`, `kind`, optional `parent`/`benchable`/`content`/`size`), `stageBar[]` items, optional `image`/`childImages`/`category`/`contentStack` configs, plus `useStoreBindings` (reads from `useStore`, returns slot state + bindings) and `renderTemplate` (renders your `<Name>` component with `ctx.renderBlock`/`ctx.renderInlineEditor`/etc.). Reference existing factory adapters that look structurally similar.
   - **Always-on slots:** any slot whose design contract is "always shown" (mandatory headlines on banner templates, brand-locked logo lockups, baked-in decorative chrome) must declare `benchable: false`. Without it, drag-from-stage fires `slot.hide()` but the slot has no `show*` flag to flip, so the slot reappears on the next render — the "drag-and-flash-back" bug. Substrate §8.3.
   - **Placeholder values** in `content: { placeholder: ... }` should reference `SLOT_PLACEHOLDERS.foo` from `@/lib/slot-placeholders` for canonical slots. Flavored event-specific labels (`'Date'`, `'Workshop Name'`) can stay inline.
   - **Bench chip kind:** `iconKey` + `chipKind` should map to a registered `BenchChipKind` (see `components/canvas-editor/bench/BenchChip.tsx`). For date/time/location lines, use the dedicated `'date'` / `'time'` kinds rather than `'small-caption'`.

6. **Build the registration** at `components/canvas-editor/template-adapters/<Name>Registration.ts` exporting a `StageBenchRegistrationData` object:
   - `templateId`, `Template`, `Adapter`
   - `renderProps(asset, colors, typography)` — maps a `QueuedAsset` to the component's props for queue thumbnails + Puppeteer rendering. **Every toggleable visibility flag must appear here, and must pass through verbatim — never `asset.showFoo && !!asset.foo`. The template's `defaultInner: value || SLOT_PLACEHOLDERS.foo` is the placeholder source; the registration must not second-guess it.** If the template supports `stackAlign`, include it here.
   - `queueTextFields` — usually `[]`; add only template-unique text fields for the queue UI.
   - `renderSchema` — declarative URL-param schema for the dynamic render route. `fields[]` lists each param with a parser type and default. Optional `assembleProps(parsed, raw)` post-processes flat params into nested objects (e.g. `imagePosition: { x, y }`). If the template supports `stackAlign`, declare `{ param: 'stackAlign', parser: 'enum', default: 'top' }` here too — missing it means the export defaults the editor's user-selected alignment back to 'top'.
   - `exportBuilder(state)` — produces the URL params for export. **Same rule as renderProps: pass `s.showFoo` verbatim, never `s.showFoo && !isHtmlEmpty(...)`. Include `stackAlign` if the template uses ContentStack.**

7. **Register** — import the Registration in `lib/stage-bench-registry.ts` and append to the `REGISTRATIONS` array. That single line wires the template into the central registry, the dynamic render route, the export params builder, and the adapter dispatch.

8. **Validate** — run `npm run validate:registrations`. The static check ensures every toggleable `setVisible: setShowFoo` wired in your adapter is referenced in both `renderProps` and `exportBuilder` (either as a LHS key or via `s.<flag>` / `asset.<flag>` on the RHS for a renamed key). If it fails, fix before merging.

9. **Typecheck + test:** `npx tsc --noEmit`, then in dev:
   - Drag a benchable block to bench, drag it back — it animates cleanly without flashing.
   - Drag a non-benchable block (e.g. a headline declared `benchable: false`) — it should not engage drag at all.
   - Double-click each text slot to enter inline edit. On `html` slots: Bold/Italic produce real styling (Fakt Medium 500, not browser-default 700) and Enter produces a real line break — not literal `<b>…</b>` / `<div>…</div>` text. On `plain` slots: Bold/Italic are greyed out and ⌘B does nothing; if the slot is multi-line, Enter's break must survive clicking away. `validate:registrations` catches the format↔render-site mismatches statically; this pass catches the weight/spacing regressions it can't see.
   - Toggle stack align in the stage bar; export the asset and confirm the export matches the editor (catches stackAlign-not-in-export-pipeline bugs).
   - **Empty-field export:** create a fresh asset, change no fields, export. Every `show*=true` slot should render its canonical placeholder. If a slot is missing on export but visible in the editor, you've gated visibility on content presence somewhere in the registration.
   - Queue the asset, then export from the queue. Same output as direct export.

### Parser types for `renderSchema.fields`

Match the helpers in `lib/render-params.ts`:

| Parser | Use for | Default behavior |
|---|---|---|
| `'string'` | Text fields | `default` or `''` if absent |
| `'boolTrue'` | Toggles that default ON (showHeadline, showCta) | `true` if absent |
| `'boolFalse'` | Toggles that default OFF (grayscale, showSubhead on some templates) | `false` if absent |
| `'number'` | Numeric with fallback (imagePositionX, imageZoom) | Uses `default` value |
| `'numberOrUndefined'` | Nullable numbers (headlineFontSize) | `undefined` if absent |
| `'enum'` | Constrained strings (variant, colorStyle) | Uses `default` value |
| `'stringOrNull'` | Optional URLs (imageUrl that may be null) | `null` if absent |
| `'int'` | Integer values (speakerCount) | Uses `default` value |

### Reference templates (closest fit by shape)

| If your template is like… | Copy from |
|---|---|
| Single-stack, image, theme toggle | `WebsiteThumbnailRegistration.ts` + adapter |
| Track 1 grid-detail rows | `EmailGridRegistration.ts` / `SocialGridDetailRegistration.ts` |
| Track 2 absolute-positioned | `EmailEhsAccelerateBannerRegistration.ts` |
| Per-card group (speakers / cards) | `WebsiteWebinarStageBench.tsx` + `EmailSpeakersStageBench.tsx` (uses `parent: 'speakerN'` + `childImages`) |
| QR / image-as-anchor | `CustomerLibraryRegistration.ts` |

---

## Checklist: Adding a Multi-Page Stage & Bench Collateral Template

For a **fixed multi-page** asset (e.g. a 2–3 page brief) that should use direct on-canvas editing rather than the legacy sidebar-form PDF path. **`executive-overview` is the reference implementation** — copy from it. This builds on the single-page checklist above; the deltas are the page selector, the document blob, and the multi-page PDF export. Substrate details in [STAGE-AND-BENCH.md §10](STAGE-AND-BENCH.md).

**Prereqs / decisions:**
- **Fixed page count.** The page-selector primitive is fixed-count. Dynamic/auto-pagination (FAQ-style) is a different paradigm and out of scope — see `SUBSTRATE-DEBT.md`.
- **Self-contained document blob** (the custom-size / carousel pattern) rather than flat store fields. Collateral content is bespoke, so a blob collapses the SO-style ~50-field, four-place-per-field sync down to one JSON param.

### Steps

1. **Page components** — `components/templates/<Name>/Page1.tsx`, `Page2.tsx`, … one per page. Each follows the standard S&B render-prop contract (`renderBlock`/`renderInlineEditor`/`renderOverlay`, identity defaults) and the same non-negotiables as single-page (`'use client'`, plain `<img>`, font from `typography`, Figma override rules). Add a shared `constants.ts` (block-id union, content model, tokens, placeholders) — keep it dependency-free so it doesn't import the barrel (avoid a page↔barrel cycle).

2. **Document model** — `lib/<name>/document.ts`: a `<Name>Document` interface (all per-asset content), a `default<Name>Document()` factory, immutable update helpers (`patch`, `updateCard`, …), and `doc→pageNProps` mappers **shared by the editor adapter and the export render route** (this is what guarantees editor == export). Wire the blob field everywhere a blob field goes — grep an existing one (`customSizeDocument`) to find every site: `types/index.ts` (AppState/QueuedAsset/GeneratedAsset + setter type), `store/index.ts` (initial + defaultState + setter + the big destructure/spread + target-defaults + draft save/rehydrate), `lib/asset-snapshot.ts` (`SNAPSHOT_FIELDS`), `lib/draft-storage.ts` (`DraftState` + save), `lib/export-params.ts` (`ExportParamState` + its builder).

3. **Adapter** — `defineStageBenchAdapter` with `pages: { count, labels }`. Make `slots` a resolver: `(bindings, page) => page === 1 ? PAGE1_SLOTS : PAGE2_SLOTS`. `useStoreBindings` reads the doc and returns `slotState` for **all** blockIds across **all** pages (the factory only consumes the current page's, but the render context resolves whichever page is mounted). Setters patch the doc — **read the freshest doc via `useStore.getState()`**, not the render-time closure (the image modal fires `setUrl` then `setSettings` synchronously; a stale closure clobbers the URL). `renderTemplate(ctx)` branches on `ctx.currentPage`. Use `childImages` for image slots and `kind:'chip'` + `slotState.icon/setIcon` for icon-replaceable chips.

4. **Registration** — `<Name>Registration.tsx` (`.tsx` when it carries a `renderPreview`, which needs JSX): `Template` (a page component for the queue thumbnail) + `renderProps`; **`renderPreview(asset, colors, typography)`** returning all pages stacked (the editor Preview lightbox uses it); `exportBuilder` emitting **`page:'all'`** + `<name>Config` (the whole doc). Register in `lib/stage-bench-registry.ts` (auto-joins `STAGE_BENCH_TEMPLATES`).

5. **Multi-page PDF export** (`app/api/export/route.ts`): add to `TEMPLATE_DIMENSIONS`; add `<name>Config` to `COMPLEX_KEYS` + a dedicated encode block (`params.set('<name>Config', encodeURIComponent(JSON.stringify(body.<name>Config)))`); add an `is<Name> = template === '<name>' && body.page === 'all'` branch, fold it into `isPdfExport`, set `numPages`, add the filename. Build `app/render/<name>/page.tsx` that decodes the config and renders a print composite stacking pages split by `pageBreakAfter:'always'`, wrapped in `GenericRenderContent` (supplies the `#render-ready` fonts signal). Copy `/render/custom-size` + `ExecutiveOverviewPrint.tsx` verbatim as the shape.

6. **Homepage + config** — add to `COLLATERAL_TEMPLATES` in `lib/template-config.ts`. **Do NOT exclude it from `ALL_TEMPLATES`** like the legacy PDFs — it's a real S&B template and must resolve in `TEMPLATE_INFO`/`TEMPLATE_DIMENSIONS`/`TEMPLATE_LABELS`. Add a homepage-tile case in `components/TemplateTile.tsx` (hardcoded per-template switch; `default: return null` = blank tile). Add the slug to `TemplateType` in `types/index.ts` — `tsc` then flags every exhaustive `Record<TemplateType>` that needs an entry (`lib/copy-constraints.ts`, `app/api/export`'s dims, …).

7. **Validate** — `npm run validate:registrations` (scans `.ts` **and** `.tsx` registrations), `npx tsc --noEmit`, `npm run build`. Browser-verify: page switch swaps stage + bench, inline edit writes to the doc, images pick/apply, Preview shows all pages, Export downloads a multi-page PDF (check `%PDF` magic + `/Count N`).

### Multi-page gotchas (beyond the single-page list)
- **`page:'all'` in the exportBuilder is the PDF trigger** — the export route decides PDF-ness from `body.page === 'all'`, not `format`.
- **`slotState` must include every blockId** (`Record<TBlockId>`), even off the current page.
- **Freshest-doc reads on mutation** (`useStore.getState()`) — see step 3.
- **Registration is `.tsx`** if it has `renderPreview`. The validator scans both extensions.
- **Editor download naming**: `handleExport` reads the response Content-Disposition/Content-Type so a PDF response downloads as `.pdf` (not the hardcoded `.png`).
