# Design Dog — Templates Reference

> Full template catalog, multi-page collateral architecture, module types, and checklists.
> Read this before adding, modifying, or debugging any template.

---

## Existing Templates (as of Feb 2026)

### Email
- `email-dark-gradient` — EmailDarkGradient
- `email-grid` — EmailGrid
- `email-image` — EmailImage (has image upload + grayscale)
- `email-speakers` — EmailSpeakers (up to 3 speaker avatars)
- `email-product-release` — EmailProductRelease

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
- `website-floating-banner-mobile` — WebsiteFloatingBannerMobile (390×100px, mobile version)

### Newsletter
- `newsletter-dark-gradient` — NewsletterDarkGradient (has image + grayscale)
- `newsletter-blue-gradient` — NewsletterBlueGradient (has image + grayscale)
- `newsletter-light` — NewsletterLight (has image + grayscale)
- `newsletter-top-banner` — NewsletterTopBanner

### Collateral (Multi-Page PDFs)
- `solution-overview-pdf` — SolutionOverviewPdf (3-page Letter PDF, 612×792px per page)
- `faq-pdf` — FaqPdf (dynamic page count, Q&A format with tables support)
- `stacker-pdf` — StackerPdf (modular document builder with drag-and-drop)

---

## Multi-Page Collateral Templates

Multi-page collateral assets differ from single-page banner templates in architecture and workflow.

### Architecture Differences

| Aspect | Single-Page Templates | Multi-Page Collateral |
|--------|----------------------|----------------------|
| Component | Single `TemplateComponent.tsx` | Multiple page components in subfolder |
| Dimensions | Various (640×300, 1200×628, etc.) | Standard paper (Letter: 612×792) |
| Export | PNG via Puppeteer screenshot | Multi-page PDF export |
| Content source | AI copy generation from PDF | Verbatim extraction from Word doc |
| Editor | Standard EditorScreen | Custom export screen |

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
└── StackerPreviewEditor.tsx    # Preview with drop zones

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
- **Show/hide toggles** for optional elements (3rd stat, 3rd card, etc.)
- **Preview/Review & Export toolbar** matching FAQ/SO pattern
- **Zoom controls** (75%-200%)
- **Fullscreen preview** modal

---

## Checklist: Adding a New Template

1. [ ] Create template component in `components/templates/`
2. [ ] Apply Figma override rules (border not outline, SVG logo, remove unsupported CSS) — see BRAND.md
3. [ ] Only expose text fields that exist in the design
4. [ ] Add render-content and page in `app/render/{slug}/`
5. [ ] Register in `config/template-config.ts`
6. [ ] Add to `types/index.ts` TemplateType union
7. [ ] Add editor controls in `EditorScreen.tsx`
8. [ ] Add export params in `handleExport`
9. [ ] Add to homepage grid in `AssetSelectionScreen.tsx` / `TemplateTile.tsx`
10. [ ] Add template-specific state to store if needed (variants, etc.)
11. [ ] **If template has variants:** Add variant fields to `ManualAssetSettings` in `types/index.ts` AND update `goToAsset` in `store/index.ts` to save/restore them (see Variant Persistence in ARCHITECTURE.md)
12. [ ] Add to image upload condition if template has images
13. [ ] Pass grayscale prop if template has images
14. [ ] Test export works end-to-end
15. [ ] Test variant persistence: switch to another asset and back — variant should be preserved
16. [ ] Build check: `npm run build`
