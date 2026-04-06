# Theme Rollout Instructions

> Instructions for adding light/dark theme support to additional Design Dog templates.
> This was validated on `email-image` — follow this exact process for each new template.

---

## Prerequisites

- Read `.claude/BRAND.md` and `.claude/ARCHITECTURE.md` before starting.
- The shared theme config already exists at `lib/template-themes.ts` with `light` and `dark` themes.
- The `theme` field already exists in: `types/index.ts` (all interfaces), `store/index.ts` (state + setter + goToAsset), `lib/asset-snapshot.ts` (SNAPSHOT_FIELDS), `lib/draft-storage.ts` (DraftState + restore), `lib/export-params.ts` (ExportParamState + buildExportParamsFromAsset), and `EditorScreen.tsx` (destructured from store).
- You do NOT need to add `theme` to any of those shared pipeline files again — it's already there.

The following templates have been themed (as of Apr 2026):
email-image, email-grid, email-speakers, social-image, social-grid-detail, website-thumbnail, website-press-release, website-webinar, website-report, newsletter-light.

To add theming to additional templates, follow the per-template checklist below.

---

## Per-Template Checklist

For each template being themed, do ALL of the following:

### 1. Update the Template Component

File: `components/templates/{TemplateName}.tsx`

- [ ] Import the theme config:
  ```tsx
  import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
  ```
- [ ] Add `theme?: TemplateTheme` to the component's props interface.
- [ ] Add `theme = 'light'` (or `'dark'` if the template's current default is dark-themed) to the destructured props. **The default MUST match the template's current visual appearance** to preserve backward compatibility.
- [ ] Resolve theme colors at the top of the component:
  ```tsx
  const themeColors = TEMPLATE_THEMES[theme]
  ```
- [ ] Replace hardcoded color values with theme lookups. The mapping is:

  | What | Old pattern | New pattern |
  |------|-----------|------------|
  | Background | `colors.ui.surface` or hardcoded `#060015` | `themeColors.backgroundPrimary` |
  | Text color | `colors.ui.textPrimary` or hardcoded `#000000`/`white` | `themeColors.textPrimary` |
  | Logo fill | `logoColor === 'orange' ? ... : colors.brand.black` | `themeColors.logoFill` |
  | CTA text + arrow | Hardcoded `#060015` or `white` | `themeColors.buttonSecondaryText` |
  | Solution pill background | `colors.ui.surface` or `#060621` | `themeColors.bgCategoryChip` |
  | Solution pill border | `colors.ui.border` or `#0080FF` | `themeColors.borderFocus` |
  | Solution pill text | Same as text primary | `themeColors.textPrimary` |

- [ ] **Do NOT change**: solution dot colors (green/teal/yellow/blue/pink) — these are static across all themes.
- [ ] **Do NOT change**: font sizes, spacing, layout, or anything structural.
- [ ] Apply standard BRAND.md Figma override rules if incorporating any new Figma reference code (border not outline, SVG logo component, remove textBoxTrim/textBoxEdge, etc.).

### 2. If the Template Has Gradient Overlays

Some templates (e.g., social-image) have gradient rectangles that fade into the background. The gradient stop colors must change with the theme:
- Light theme: stops use `#FFFFFF` (white)
- Dark theme: stops use `#060015` (midnight)

The gradient stop opacity values stay the same — only the RGB color changes.

### 3. Update the Template Registry

File: `lib/template-registry.tsx`

- [ ] In `renderProps`: add `theme: asset.theme || '{default}'` (use the correct default for this template).
- [ ] In `renderSchema.fields`: add `{ param: 'theme', parser: 'enum', default: '{default}' }`.
- [ ] The `assembleProps` function does NOT need changes for theme.

### 4. Update Export Params Builder

File: `lib/export-params.ts`

- [ ] In the template's builder function (e.g., `'email-grid': (s) => ({...})`), add `theme: s.theme`.

### 5. Update the Editor Screen Preview

File: `components/EditorScreen.tsx`

This is where we hit the most gotchas. There are THREE places to wire theme for each template:

#### 5a. Theme Picker UI

The theme picker is already in the Logo/Category flex row (search for `Theme Picker - for themed templates`). Add the template to the condition:

```tsx
// Change this:
{currentTemplate === 'email-image' && (

// To this (add your template):
{(currentTemplate === 'email-image' || currentTemplate === 'your-template') && (
```

#### 5b. Template Preview Component

Find where the template component is rendered in the preview area (search for `<TemplateName` in EditorScreen). **Add `theme={theme}` to the props.** This is the most commonly missed step — without it, the toggle works but the preview doesn't update.

#### 5c. Export paramState (handleExport)

`theme` is already in the `paramState` object (we added it globally). No per-template change needed here.

### 6. Hide Logo Picker

File: `components/EditorScreen.tsx`

The logo color is now driven by the theme. Add the template to the logo picker exclusion list. Search for the comment:
```
Logo Color - Orange/White for Social Dark
```

Add `currentTemplate !== 'your-template'` to the condition chain.

### 7. Determine the Correct Default

**This is critical for backward compatibility:**

- If the template currently renders with a **white/light background** → default is `'light'`
- If the template currently renders with a **dark background** (`#060015`) → default is `'dark'`

The default must produce pixel-identical output to the current template. Set it in:
- The component's prop default: `theme = 'light'`
- The registry's renderProps: `asset.theme || 'light'`
- The registry's renderSchema field: `default: 'light'`

---

## Gotchas We Discovered

1. **Preview doesn't update when toggling theme:** You forgot to pass `theme={theme}` to the `<TemplateName>` component in the EditorScreen preview section. The toggle sets store state but the preview component wasn't receiving the prop.

2. **Export fails (both editor and queue):** The `theme` field must be in THREE export-related locations:
   - `handleExport`'s `paramState` object in EditorScreen (already done globally)
   - `buildExportParamsFromAsset` in export-params.ts (already done globally)
   - The per-template builder in export-params.ts (must add `theme: s.theme` for each template)

3. **Build fails with "Property 'theme' does not exist on type 'ExportParamState'":** Already fixed — `theme` is optional on `ExportParamState`.

4. **Build fails with "No value exists in scope for shorthand property 'theme'":** The goToAsset destructuring already includes `theme`. No per-template fix needed.

5. **Logo color stuck on black/white:** The template component must use `themeColors.logoFill` directly, NOT the old `logoColor` prop logic. Remove any `logoColor === 'orange' ? ... : ...` ternary and just use `themeColors.logoFill`.

6. **Dev server shows stale content after build:** Running `npm run build` while dev server is running overwrites `.next/`. Always restart the dev server after a build.

7. **SolutionPill doesn't flip in dark mode (website templates):** The `SolutionPill` component's variant presets (`website-dark`, `website-light`, `website-press-release`) have hardcoded background/border colors. The resolution order was changed to `prop ?? variant ?? fallback` so explicit props override hardcodes. But you MUST pass `background={themeColors.bgCategoryChip}` and `border={...themeColors.borderFocus}` to the pill — without these props, the variant's hardcoded colors win even in the wrong theme.

8. **Grid line colors don't change in dark mode:** Grid templates use a `borderColor` variable. Make sure it's derived from `themeColors.borderFocus`, not from `colors.ui.borderHighContrast` or a hardcoded value. This was missed on `SocialGridDetail` during the initial rollout.

---

## Verification

After each template:

1. `npm run build` passes with zero errors.
2. Toggle theme in editor — preview updates immediately.
3. Export from editor (both light and dark) — PNG downloads correctly.
4. Add to queue, export from queue — works for both themes.
5. Theme persists when switching between assets (variant persistence).
6. Logo picker is NOT shown for the template.
7. Default theme renders identically to the pre-change template.

---

## Template Defaults Quick Reference

| Template | Current appearance | Default theme | Status |
|----------|-------------------|---------------|--------|
| email-image | White background, black text | `'light'` | Done |
| email-grid | White background, black text | `'light'` | Done |
| email-speakers | White background, black text | `'light'` | Done |
| social-image | White background, black text | `'light'` | Done |
| social-grid-detail | White background, black text | `'light'` | Done |
| website-thumbnail | White background, black text | `'light'` | Done |
| website-press-release | Light background (#F9F9F9) | `'light'` | Done |
| website-webinar | Dark background, white text | `'dark'` | Done |
| website-report | Dark background, white text | `'dark'` | Done |
| newsletter-light | White background, black text | `'light'` | Done |

> When adding theming to new templates, add a row here. Check the actual component if unsure about the default.
