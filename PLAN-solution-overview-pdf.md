# Solution Overview PDF Template - Implementation Plan

## Overview

Building a 3-page letter-size (612×792px) PDF template for Solution Overview documents. This is Design Dog's first multi-page template and will require new patterns for page navigation, accordion-based editing, and PDF export (vs PNG).

---

## Clarifications from User

1. **Hero image (Page 2):** Single placeholder for now. Will build library of 20-30 images for users to pick from (no custom uploads). One placeholder is sufficient.

2. **Product screenshot (Page 3):** Users upload their own with pan/zoom like existing PNG templates. Will use the existing ZoomableImage pattern.

3. **Quote highlighting:** Skip for MVP. Add back later.

4. **Paragraph text fields:** These need special treatment vs single-line marketing fields:
   - Taller textarea (multi-line visible)
   - Resizable with drag corner
   - **Line breaks preserved** - user adds line breaks in editor, they render in preview/export (WYSIWYG-style like HubSpot CMS)

5. **Solution picker:** Dropdown in editor for MVP. May move to pre-editor step later.

6. **Benefits count:** Minimum 3, maximum 7.

7. **Homepage placement:** Collateral category already exists (currently empty). Use that.

8. **Stats bar:** Confirmed static/locked.

---

## Phase 1: Foundation & Page 1 (Cover)

### 1.1 Asset Setup
Create placeholder assets needed before building components:

**Files to create:**
- `public/assets/solution-overview/` directory
- `config/solution-overview-assets.ts` - central config for all picklist assets

**Asset config structure:**
```typescript
// Solution backgrounds (one per solution category)
export const solutionBackgrounds = {
  health: '/assets/solution-overview/bg-health.png',
  safety: '/assets/solution-overview/bg-safety.png',
  environmental: '/assets/solution-overview/bg-environmental.png',
  quality: '/assets/solution-overview/bg-quality.png',
  sustainability: '/assets/solution-overview/bg-sustainability.png',
}

// Hero images for Page 2 (picklist - single placeholder for now)
export const heroImages = [
  { id: 'placeholder', label: 'Placeholder image', src: '/assets/solution-overview/hero-placeholder.jpg' },
  // Will expand to 20-30 images later
]

// CTA options for Page 3
export const ctaOptions = [
  { id: 'demo', label: 'Request a demo' },
  { id: 'learn', label: 'Learn more' },
  { id: 'start', label: 'Get started' },
  { id: 'contact', label: 'Contact us' },
]

// Placeholder icons for benefits (swap for real icon library later)
export const benefitIcons = [
  { id: 'pricing', label: 'Pricing', component: PricingIcon },
  { id: 'workflow', label: 'Workflow', component: WorkflowIcon },
  { id: 'admin', label: 'Admin', component: AdminIcon },
  { id: 'compliance', label: 'Compliance', component: ComplianceIcon },
  { id: 'reporting', label: 'Reporting', component: ReportingIcon },
  // ~20-30 total for MVP
]
```

### 1.2 Type Definitions
Update `types/index.ts`:

```typescript
// Add to TemplateType union
export type TemplateType = '...' | 'solution-overview-pdf'

// New interface for solution overview state
export interface SolutionOverviewBenefit {
  icon: string  // icon ID from config
  title: string
  description: string
}

export interface SolutionOverviewFeature {
  title: string
  description: string
}

export interface SolutionOverviewState {
  // Page 1: Cover
  solution: 'health' | 'safety' | 'environmental' | 'quality' | 'sustainability'
  solutionName: string
  tagline: string

  // Page 2: Body
  heroImageId: string
  sectionHeader: string
  introParagraph: string  // supports line breaks
  keySolutions: string[]  // flexible, default 4, add/remove in editor
  quoteText: string       // supports line breaks
  quoteName: string
  quoteTitle: string
  quoteCompany: string

  // Page 3: Benefits & Features
  benefits: SolutionOverviewBenefit[]  // min 3, max 7
  features: SolutionOverviewFeature[]  // default 5, flexible

  // Product screenshot (user uploads)
  screenshotUrl: string | null
  screenshotPosition: { x: number; y: number }
  screenshotZoom: number

  ctaOption: 'demo' | 'learn' | 'start' | 'contact'
}
```

### 1.3 Template Component - Page 1
Create `components/templates/SolutionOverviewPdf/Page1Cover.tsx`:

- Dark background (#060015) with solution-specific background image overlay
- Cority logo (white, top-left)
- Solution category pills (left side, vertical stack)
  - Active pill: blue border (#0080FF), blue tint background, white text, colored dot
  - Inactive pills: gray border (#37393D), gray text, gray dot
- Solution name (large, white, bottom-left)
- Tagline (smaller, white, below solution name)

**Key implementation notes:**
- Background image is full-bleed, positioned via CSS background-image
- Use inline SVG for Cority logo (not Figma div blocks)
- Solution pills use `border` not `outline` (per CLAUDE.md)
- Remove `textBoxTrim`/`textBoxEdge` from Figma code

### 1.4 Store Setup
Update `store/index.ts`:

- Add all SolutionOverviewState fields to store
- Add setters for each field
- Add `solutionOverviewCurrentPage: 1 | 2 | 3` for preview navigation
- Add to `goToAsset` for variant persistence
- Add to `getDefaultAssetSettings()`

### 1.5 Basic Editor Shell
Create initial editor section in `EditorScreen.tsx`:

- Add conditional for `currentTemplate === 'solution-overview-pdf'`
- Page navigator component: `← [1] [2] [3] →`
- Single accordion section for Page 1 (expand by default)
- Preview area showing Page1Cover component at scale

### 1.6 Render Route - Page 1
Create `app/render/solution-overview-pdf/`:
- `render-content.tsx` - wrapper with font loading
- `page.tsx` - param parsing, pass to render-content

For MVP, render route outputs single page. Multi-page comes in Phase 4.

### 1.7 Export Route Update
Update `app/api/export/route.ts`:
- Add dimensions: `{ width: 612, height: 792 }`
- For now, export as PNG (single page)
- PDF export logic added in Phase 4

**Deliverable:** Working Page 1 with editor controls, preview, and PNG export.

---

## Phase 2: Page 2 (Body)

### 2.1 Template Component - Page 2
Create `components/templates/SolutionOverviewPdf/Page2Body.tsx`:

**Layout (top to bottom):**
1. **Header band** (180px height)
   - Left: Section title rotated 180° ("Employee Health Solutions")
   - Right: Hero image (from picklist)
   - Border bottom: 0.5px #89888B

2. **Main content area** (split layout)
   - Left column (331px):
     - Section header (18px, Fakt Pro)
     - Intro paragraph (12px, 16px line-height) - **preserves line breaks**
   - Right column (230px, border-left):
     - "KEY SOLUTIONS" label (uppercase, 8px)
     - 6 solution items with teal dots (#00767F)

3. **Quote section**
   - Italic quote text - **preserves line breaks** (no highlighting for MVP)
   - Attribution: name (uppercase), title, company

4. **Stats bar** (162px height, border-top)
   - Cority logo (black)
   - 5 stats: 20+ Awards, 350+ Experts, 100% Deployment, 2M+ End Users, 1.2K+ Clients
   - **Locked/static** - render from constants, no editor fields

**Implementation notes:**
- Stats bar is locked/static - render from constants
- Hero image uses object-fit: cover
- Line breaks in intro paragraph and quote render as `<br />` or CSS `white-space: pre-wrap`

### 2.2 Hero Image Picker Component
Create `components/SolutionOverviewHeroPicker.tsx`:
- Dropdown or grid modal showing available hero images
- Displays current selection with thumbnail
- Single placeholder for now; will expand to 20-30 images later
- On select, updates store

### 2.3 Resizable Textarea Component
Create `components/ResizableTextarea.tsx`:

New component for longer text fields with WYSIWYG-style line break support:

```typescript
interface ResizableTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minRows?: number  // default 3-4 for paragraph fields
}
```

**Features:**
- Taller than single-line inputs (min ~80-100px height)
- Resize handle (drag corner) via CSS `resize: vertical`
- Line breaks preserved (no stripping)
- Character count display: "142 / 400"
- Orange/red when over limit

### 2.4 Editor Controls - Page 2
Add accordion section "Page 2: Body":
- Hero image picker
- Section header (text input, 80 char limit)
- **Intro paragraph** (ResizableTextarea, 400 char limit, line breaks preserved)
- Key Solutions (flexible list with add/remove, 40 char each)
- **Quote text** (ResizableTextarea, 250 char limit, line breaks preserved)
- Quote name (text input, 40 char)
- Quote title (text input, 60 char)
- Quote company (text input, 40 char)

### 2.5 Accordion Behavior
- Clicking accordion header expands section AND sets preview to that page
- Only one section expanded at a time
- Collapsed sections show summary (e.g., "Section header: Streamline Employee...")

### 2.6 Page Navigation
Update page navigator to sync with accordion:
- Clicking page number expands corresponding accordion
- Prev/Next arrows navigate pages and expand accordion
- Preview updates to show current page

**Deliverable:** Working Page 2 with all editor fields, resizable textareas, and preview.

---

## Phase 3: Page 3 (Benefits & Features)

### 3.1 Template Component - Page 3
Create `components/templates/SolutionOverviewPdf/Page3BenefitsFeatures.tsx`:

**Layout:**
1. **Left column** (331px):
   - Eyebrow: "EMPLOYEE HEALTH ESSENTIALS" (teal, uppercase)
   - "Key Benefits" heading
   - Benefits list (min 3, max 7)
     - Each: icon (17×17), title (bold), description

2. **Right column** (230px, border-left):
   - **Product screenshot** (top, user-uploaded with pan/zoom)
   - "Powerful Features" heading
   - Features list (default 5)
     - Each: title (teal, bold), description

3. **Footer** (146px, border-top):
   - Left half: Contact info (phone, email, web) - locked
   - Right half: CTA button (orange, rounded), Cority logo (black)

### 3.2 Icon Picker Component
Create `components/IconPicker.tsx`:
- Small button showing current icon
- Click opens modal with icon grid
- ~20-30 placeholder icons for MVP
- Structure allows easy swap to real icon library later

**Icon component pattern:**
```typescript
// Each icon is an inline SVG component
const PricingIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 17 17">
    {/* SVG path */}
  </svg>
)
```

### 3.3 Product Screenshot Upload
Use existing ZoomableImage pattern from PNG templates:
- Upload area (drag/drop or click)
- Pan/zoom controls once image uploaded
- Store: `screenshotUrl`, `screenshotPosition`, `screenshotZoom`
- Same pattern as `imageUrl`, `imagePosition`, `imageZoom` in other templates

### 3.4 Benefits Editor
Dynamic list with add/remove:
- **Minimum 3 items, maximum 7 items**
- Each item: icon picker, title input (40 char), description textarea (120 char)
- "Add benefit" button (if < 7)
- Remove button on each item (if > 3)
- Reordering not in MVP scope

### 3.5 Features Editor
Similar to benefits but simpler:
- Default 5 items, flexible count
- Each item: title input (40 char), description textarea (100 char)
- Add/remove buttons

### 3.6 CTA Picker
Simple dropdown with 4 options: "Request a demo", "Learn more", "Get started", "Contact us"

**Deliverable:** Working Page 3 with all editor fields, image upload, and preview.

---

## Phase 4: Multi-Page PDF Export

### 4.1 Update Render Route for All Pages
Modify `app/render/solution-overview-pdf/page.tsx`:
- Accept `page` query param (1, 2, 3, or 'all')
- When `page=all`, render all 3 pages sequentially with CSS page breaks

```tsx
// For PDF export, render all pages
{page === 'all' && (
  <div>
    <div style={{ pageBreakAfter: 'always' }}><Page1Cover {...props} /></div>
    <div style={{ pageBreakAfter: 'always' }}><Page2Body {...props} /></div>
    <div><Page3BenefitsFeatures {...props} /></div>
  </div>
)}
```

### 4.2 Update Export Route for PDF
Modify `app/api/export/route.ts`:

```typescript
if (templateType === 'solution-overview-pdf') {
  // Navigate to render page with page=all
  await page.goto(`${baseUrl}/render/solution-overview-pdf?${params}&page=all`)

  // Wait for render-ready signal
  await page.waitForSelector('#render-ready')

  // Generate PDF instead of PNG
  const pdf = await page.pdf({
    width: '8.5in',
    height: '11in',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="solution-overview.pdf"'
    }
  })
}
```

### 4.3 Export Button Update
Update EditorScreen export handling:
- For solution-overview-pdf, expect PDF response (not PNG)
- Update download filename to .pdf
- Update MIME type handling

### 4.4 Queue System Integration
Ensure queue system handles PDF template:
- Queue thumbnail shows Page 1 preview
- Export from queue generates full PDF
- Filename includes solution name

**Deliverable:** Full 3-page PDF export working end-to-end.

---

## Phase 5: Polish & Registration

### 5.1 Template Registration
Update all registration points:
- `config/template-config.ts` - add to Collateral section
- `types/index.ts` - TemplateType union (done in Phase 1)
- `components/AssetSelectionScreen.tsx` - add to Collateral channel (already exists, currently empty)
- Store persistence - ensure draft save/load works

### 5.2 Homepage Integration
Add to existing **Collateral** category on homepage:
- Create tile with miniature Page 1 preview
- Label: "Solution Overview PDF"
- Dimensions: "Letter (8.5" × 11") • 3 pages"

### 5.3 Validation & Limits
Implement soft validation:
- Character counters on all limited fields
- Orange/red color when over limit
- Don't block - let user see overflow in preview

**Line breaks ARE preserved** for paragraph fields (intro, quote, benefit/feature descriptions).

### 5.4 Testing Checklist
- [ ] Page 1 renders correctly for all 5 solutions
- [ ] Page 2 renders with all field combinations
- [ ] Page 2 line breaks render correctly in preview
- [ ] Page 3 renders with variable benefit counts (3-7)
- [ ] Page 3 screenshot upload/pan/zoom works
- [ ] Accordion navigation syncs with page preview
- [ ] Page navigation syncs with accordion
- [ ] Character limits display correctly
- [ ] Resizable textareas work
- [ ] PDF export includes all 3 pages
- [ ] PDF renders at correct dimensions
- [ ] Queue preview shows Page 1
- [ ] Export from queue works
- [ ] Draft persistence works (save/reload)
- [ ] Build passes: `npm run build`

---

## File Structure Summary

```
components/
  templates/
    SolutionOverviewPdf/
      index.tsx           # Main wrapper component
      Page1Cover.tsx
      Page2Body.tsx
      Page3BenefitsFeatures.tsx
      StatsBar.tsx        # Static stats component (Page 2)
      SolutionPills.tsx   # Cover page pills
  IconPicker.tsx          # Benefit icon selector
  ResizableTextarea.tsx   # WYSIWYG-style textarea with line breaks
  SolutionOverviewHeroPicker.tsx

config/
  solution-overview-assets.ts  # All picklist assets + icons

app/
  render/
    solution-overview-pdf/
      page.tsx
      render-content.tsx

public/
  assets/
    solution-overview/
      bg-health.png       # Background per solution
      bg-safety.png
      bg-environmental.png
      bg-quality.png
      bg-sustainability.png
      hero-placeholder.jpg  # Single placeholder for now
```

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| PDF export doesn't match preview | Use same component for both; test early |
| Fonts don't load in PDF | Use font-loading signal pattern from existing templates |
| Page breaks don't work | Test Puppeteer PDF early; use explicit CSS page-break |
| Line breaks don't render | Use `white-space: pre-wrap` or split on `\n` and insert `<br />` |
| Accordion complexity | Start simple, iterate |
| Icon library integration later | Structure icon picker for easy swap |

---

## Summary of Key Decisions

| Item | Decision |
|------|----------|
| Hero images (Page 2) | Picklist from library, single placeholder for now |
| Product screenshot (Page 3) | User uploads with pan/zoom (like PNG templates) |
| Quote highlighting | Skip for MVP |
| Paragraph fields | Taller, resizable, **line breaks preserved** |
| Solution picker | Dropdown in editor for MVP |
| Benefits count | Min 3, max 7 |
| Features count | Flexible (default 5) |
| Stats bar | Static/locked |
| Homepage | Collateral category (exists, currently empty) |

---

## Estimated Effort Breakdown

| Phase | Scope |
|-------|-------|
| Phase 1 | Asset setup, types, Page 1, basic editor, render route |
| Phase 2 | Page 2 component, ResizableTextarea, editor controls, accordion |
| Phase 3 | Page 3 component, icon picker, screenshot upload, dynamic lists |
| Phase 4 | Multi-page PDF export |
| Phase 5 | Registration, homepage, polish, testing |

---

Ready to begin implementation upon approval.
