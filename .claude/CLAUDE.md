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

- Large PDFs upload via **Vercel Blob storage** (bypasses 4.5MB serverless limit)
- Client-side upload using `@vercel/blob/client`
- Token endpoint: `/api/upload-pdf`
- Parse endpoint: `/api/parse-pdf` accepts blob URL
- Claude Vision API reads PDFs visually (handles scanned/designed PDFs)
- Local dev requires `BLOB_READ_WRITE_TOKEN` in `.env.local` (or use manual text input)

### Content Source Flow

1. PDF uploaded → stored in Vercel Blob
2. PDF URL sent to parse-pdf API
3. Claude extracts: title, main message, key points, CTA, raw summary
4. User reviews/edits extracted content
5. Edited content feeds into AI copy generation

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
- Brand purple: `#8A38F5`
- Solution dot colors vary by solution type

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
- All have 32px internal padding

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
11. [ ] Add to image upload condition if template has images
12. [ ] Pass grayscale prop if template has images
13. [ ] Test export works end-to-end
14. [ ] Build check: `npm run build`

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
