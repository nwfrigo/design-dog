# Design Dog — Brand & Visual Reference

> Brand colors, typography, Figma override rules, image handling, and template dimensions.
> Read this before working on any visual/styling changes or adding new templates.

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

Figma exports the Cority logo as a cluster of absolutely-positioned `<div>` elements. **Never use these.** Always use the shared `CorityLogo` component from `components/shared/CorityLogo.tsx`. It accepts `fill` (default `'#000000'`) and `height` (default `23`) props.

```tsx
// ❌ WRONG — Figma logo as divs
<div data-color="White" style={{width: 87.99, height: 28.73, position: 'relative'}}>
  <div style={{width: 8.73, height: 23.28, left: 57.63, ...}} />
  <div style={{width: 18.38, height: 17.80, left: 16.58, ...}} />
  // ... more positioned divs
</div>

// ✅ CORRECT — Import and use shared CorityLogo
import { CorityLogo } from '@/components/shared/CorityLogo'
<CorityLogo fill="#FFFFFF" height={36} />
```

The component includes `flexShrink: 0` with explicit `width`/`height` on both the `<svg>` and its `style` prop. This prevents the logo from scaling down in flex containers. Logo size and position are always fixed — never allow flex layout to resize the logo.

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

### 7. Border-radius inside overflow:hidden

Don't add `borderRadius` to child elements inside an `overflow: hidden` container. The parent already clips to its own radius. Adding inner radius creates visible gaps at the corners.

### 8. Equal-height cards in flex rows

Cards displayed side-by-side must stretch to match the tallest: `alignItems: 'stretch'` on the container + `flex: 1` on the content div. Without this, shorter cards leave background color gaps.

---

## Brand Colors

- Primary dark background: `#060015`
- Solution pill background: `#060621`
- Solution pill border: `#0080FF`
- Brand orange (primary): `#D35F0B`

### Solution Category Colors
- Environmental: `#49763E`
- Health: `#00767F`
- Safety: `#C3B01E`
- Quality: `#006FA3`
- Sustainability: `#A61F67`
- Converged: Uses brand orange `#D35F0B`

### Dark Mode — Semantic Color Tokens (Required)

**The app has a semantic color token system defined in `globals.css` and mapped in `tailwind.config.ts`.** All dark mode styling MUST use these tokens. Never hardcode hex values or use raw Tailwind gray classes for dark mode.

**How it works:** Every element uses a light-mode class paired with a `dark:` semantic token. The tokens resolve to neutral grays in dark mode via CSS variables.

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page/modal background | `bg-white` | `dark:bg-surface-primary` |
| Card/panel background | `bg-gray-50` or `bg-gray-100` | `dark:bg-surface-secondary` |
| Input field background | `bg-gray-100` | `dark:bg-surface-primary` or `dark:bg-surface-secondary` |
| Sidebar background | `bg-gray-100` | `dark:bg-gray-800/50` |
| Primary text | `text-gray-900` | `dark:text-content-primary` |
| Secondary/muted text | `text-gray-500` or `text-gray-600` | `dark:text-content-secondary` |
| Border | `border-gray-200` or `border-gray-300` | `dark:border-line-subtle` |
| Hover background | `hover:bg-gray-100` or `hover:bg-gray-200` | `dark:hover:bg-interactive-hover` |
| Cancel/secondary button | `bg-gray-100 text-gray-600` | `dark:bg-surface-secondary dark:text-content-secondary` |

**Token reference** (values in dark mode):
- `surface-primary` = `#161719` — darkest background (modals, pages)
- `surface-secondary` = `#242527` — cards, inputs, secondary panels
- `surface-tertiary` = `#1C1D1F` — subtle backgrounds
- `content-primary` = `#F2F2F3` — headings, main text
- `content-secondary` = `#7C7D80` — helper text, labels
- `line-subtle` = `#494A4C` — borders, dividers
- `interactive-hover` = `#202123` — hover backgrounds

**Dark mode applies to ALL sub-components.** When adding dark mode, check footers, headers, locked modules, and any element rendered separately from the main content. These are easy to miss because they're in separate components.

**❌ NEVER do this:**
- Hardcode dark hex values: `bg-gray-900`, `bg-gray-800`, `text-white`, `border-gray-700` — these bypass the design system and break if tokens change
- Use custom purple-tinted colors: `#0d0d1a`, `#1a1a2e`, `#252540`
- Style dark-mode-only (e.g., `bg-gray-900` without a light-mode counterpart) — always pair light + dark

---

## Typography

- Primary font: Fakt Pro
- Loaded via @font-face
- Weight variations: 350 (light), 500 (medium)
- Eyebrow: 12px, uppercase, letter-spacing 1.32px
- CTA: 18.75px, weight 500

---

## Template Dimensions

- Website templates: 800×450px
- Website floating banner: 2256×100px (desktop), 390×100px (mobile)
- Email templates: 640×300px (varies by type)
- Social templates: 1200×628px (varies by type)
- Newsletter templates: 600×338px (varies by type)
- Collateral PDFs: 612×792px (Letter size, 8.5"×11")
- Stacker PDFs: 612px width, variable height (modular content)
- All have 32px internal padding (except multi-page PDFs which follow print standards)

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

## Interaction Patterns

### Selected State Ring

All selectable elements in editor UIs (Stacker modules, carousel slides, FAQ pages, queued assets) use the same Tailwind ring pattern:

- **Selected:** `border-2 border-blue-500 ring-2 ring-blue-500/20`
- **Unselected:** `border border-gray-200 dark:border-transparent`

Do NOT use `ring-offset-2` — it gets clipped by parent containers with `overflow: hidden`.

Reference: `components/shared/ToggleSwitch.tsx`, `StackerEditorScreen.tsx` SortableModuleItem.

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

### Image Crop Modal

Use `ImageCropModal` for all image zoom/pan editing. The modal's crop frame dimensions must match the actual image container aspect ratio in the template. When container sizes change dynamically (e.g., S/M/L variants), pass updated dimensions to the modal.

The shared `ImagePreviewWithCrop` component (`components/shared/ImagePreviewWithCrop.tsx`) wraps the standard thumbnail + Adjust/Remove pattern. Use it instead of building inline previews.

`ZoomableImage` is deprecated. Do not use it for new templates.

### Empty Image Placeholders

Image containers in templates must show a visible placeholder when no image is uploaded — not an empty void. Standard placeholder: `rgba(255,255,255,0.08)` background with a centered landscape icon at `rgba(255,255,255,0.25)`. This applies to any template with optional image areas.

### Image Library System

Three image library modals exist, each serving different use cases:

| Modal | File | Used By | Categories |
|-------|------|---------|------------|
| `ImageLibraryModal` | `components/ImageLibraryModal.tsx` | EditorScreen (banners, speakers, newsletters), StackerEditorScreen (all image modules) | Scenes, People, Product (from `library.json`) |
| `FaqCoverImageLibraryModal` | `components/FaqCoverImageLibraryModal.tsx` | FaqEditorScreen (cover image) | 5 solution categories, 3 images each |
| `SolutionOverviewImageLibraryModal` | `components/SolutionOverviewImageLibraryModal.tsx` | EditorScreen (SO hero image on Page 2) | 5 solution categories, 9 images each |

**Global library** (`ImageLibraryModal`):
- Reads manifest from `/public/assets/image-library/library.json`
- Supports explicit `categories` array in JSON (shown even if empty, e.g., "Product")
- Categories merge explicit list with those derived from image entries
- Images stored in `/public/assets/image-library/images/{category}/`
- Also supports direct file upload (drag-and-drop or click)

**In EditorScreen**, the global library uses flags to route selections to the correct setter: `activeSpeakerForImage`, `selectingNewsletterImage`, `selectingSOScreenshot`. Always reset all flags in both `onSelect` and `onClose`.

**Specialized modals** (FAQ, SO) have curated images per solution category with configs in `/config/faq-cover-images.ts` and `/config/solution-overview-hero-images.ts`.
