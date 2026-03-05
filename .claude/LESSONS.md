# Design Dog — Lessons Log

> This is a running log of feedback, error patterns, and design decisions captured during QA and development.
> Items here should be applied silently during future work. Validated patterns get proposed for graduation
> into reference docs (BRAND.md, ARCHITECTURE.md, TEMPLATES.md) via GRADUATED_PENDING.md.

---

<!--
FORMAT: Add new entries under a date heading. Use tags to help with future categorization.
Tags: [ui], [pattern], [bug], [export], [dark-mode], [template], [state], [perf], [ux], [a11y]
-->

## 2026-03-03
- [state] Source content (PDF text, pasted text) must be persisted to Zustand store — not just local state — if any downstream feature needs it (e.g., per-module AI regeneration)
- [template] AI-generated modules must NOT include Quote or Stats modules. AI hallucinates authoritative-looking fabricated data. These module types should only use verbatim source content.
- [dark-mode] Dark mode modals must use semantic color tokens (`bg-white dark:bg-surface-primary`, etc.), never hardcoded `gray-900`. Tokens defined in `globals.css`, mapped in `tailwind.config.ts`.
- [export] Sub-pixel rendering causes Puppeteer PDF page-break bugs. `offsetHeight` rounds DOWN → page too short by 0.5px. Fix: use `getBoundingClientRect().height` with `Math.ceil()`. Also reset body `min-height` to 0 before measurement (root layout applies `min-h-screen`).
- [template] Redundant border-radius inside `overflow: hidden` containers causes visible gaps. Remove inner border-radius — the parent clips correctly.
- [template] Cards in a row must stretch to match tallest card: `alignItems: 'stretch'` on container + `flex: 1` on content div so background color extends fully.

## 2026-03-04
- [ui] ImageCropModal frame dimensions must match the actual image container aspect ratio, not a hardcoded default. When sizes change (e.g., S/M/L), crop frame must update dynamically.
- [pattern] Per-module spacing is stored as `Record<string, number>` keyed by module ID — not a property on each module type. Missing entries default to 32px. Reorder-safe because keyed by ID.
- [ui] Spacing handle with 0px height needs a minimum interactive area for hover/click events.
- [ux] Drag reorder handles belong in the left gutter (or above content), not centered over content — prevents interference with content interaction.
- [template] Stacker footer logo should be black, not orange.
- [ux] Remove redundant fullscreen buttons when a Preview All modal already exists. Don't duplicate functionality in the toolbar.
- [dark-mode] Use a shared theme constants file for dark mode (`lib/stacker-theme.ts` pattern). Each module calls `getStackerTheme(darkMode)` instead of spreading hex values across files.
- [ux] Dark mode toggle: sun/moon rounded pill toggle switch (not text buttons). Same `h-7` height as zoom buttons. Active side gets subtle colored background (amber for light, indigo for dark).
- [dark-mode] Footer must also flip in dark mode — white text, white logo, dark-themed divider. Easy to forget because it's a separate locked module.

## 2026-03-04 — 2026-03-05
- [export] New props must be threaded through the ENTIRE pipeline: AppState + setter → QueuedAsset/GeneratedAsset types → addToQueue → saveQueuedAssetEdit → editQueuedAsset → loadGeneratedAssetIntoEditor → addAllGeneratedToQueue → ExportQueueScreen preview instances → exportParams → export API route → render page. The export API route (`app/api/export/route.ts`) is the #1 silent failure point — editor preview looks correct but Puppeteer loads a render URL and the param won't be in the query string.
- [state] Per-asset settings must include ManualAssetSettings to prevent cross-tab bleed. The `goToAsset()` function saves/restores per-asset settings — any editable property independent per asset must be in that interface.
- [pattern] Nullable props (`number | null`) are better than fixed defaults when different templates have wildly different native sizes. Templates use `prop ?? TEMPLATE_DEFAULT` so both null and undefined trigger per-template defaults.
- [export] Export API null handling: use `!= null` not `!== undefined`. When a value is `null`, `!== undefined` still passes `'null'` as a string param, which `parseFloat` converts to `NaN`.
- [ux] S/M/L heading size picker is redundant once per-pixel A^/Av font size control exists. Remove the coarse picker.

## 2026-03-05
- [pattern] Active/selected state ring: `border-2 border-blue-500 ring-2 ring-blue-500/20`. Global pattern for selected elements (Stacker modules, carousel slides). Do NOT use `ring-offset-2` — it gets clipped by `overflow: hidden` containers.
- [template] Logo SVG needs `flexShrink: 0` with explicit width/height to prevent scaling down in flex containers. Logo size and position are permanently fixed.
- [bug] `URLSearchParams.set` auto-encodes values. Don't pre-encode with `encodeURIComponent` — causes double-encoding (`%255B`). Pass raw strings and let URLSearchParams handle it.
- [perf] `npm run build` while dev server runs overwrites `.next/` → dev server serves stale chunk hashes → JS 404s → `#render-ready` never added → Puppeteer times out. Fix: restart dev server after any build.
- [pattern] Image editor should use ImageCropModal pattern app-wide: image preview with "Adjust" button (bottom-left) that opens ImageCropModal, X remove button (top-right). Upload state shows two side-by-side dashed boxes ("Upload" + "Choose from library"). Not ZoomableImage.
- [ux] Slide/module tools (drag handle, duplicate, delete) go ABOVE the element, not overlaid on it. They appear on hover.
- [ui] Layout type switching shouldn't cause preview jump. Use `items-start` (not `items-center`) and add ResizeObserver jitter threshold (2px) to prevent micro-jitter.
- [ux] Don't expose options that should be fixed design decisions (e.g., logo color picker when logo is always white).
- [template] Image slide types need placeholder divs when no image is uploaded — `rgba(255,255,255,0.08)` background with centered landscape SVG icon at `rgba(255,255,255,0.25)`.
- [ux] Multi-slide preview should show all slides horizontally in a scrollable carousel, not one-at-a-time with a separate thumbnail strip. Selected slide gets blue ring. `scrollIntoView({ behavior: 'smooth', inline: 'center' })` on selection change.
- [ux] Export buttons go in the toolbar (matching other template editors), not in the sidebar. Use a dropdown for multiple export options.
- [ui] Layout type picker: compact pill-style chips (`flex flex-wrap gap-1.5`, `rounded-full text-[11px]`) with short labels.
- [ux] Grayscale toggle should be a switch, not a checkbox. Use toggle switches consistently for boolean options.
