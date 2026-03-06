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

## 2026-03-06 — Refactor Principles

### File & Component Size
- [pattern] No component file should exceed 500 lines. When approaching that limit, extract template-specific form sections, export logic, or modal groups into named sub-files in the same directory (e.g., `components/editors/SolutionOverviewEditor.tsx`).
- [pattern] A store file is allowed to be large if it's a single cohesive state machine — but any function that enumerates all fields (serialize, deserialize, copy) must call a shared helper, not inline the field list.

### Extract-on-Second-Use Rule
- [pattern] When you copy-paste a component, hook, or utility into a second file, stop and extract it into a shared location (`components/shared/`, `hooks/`, `lib/`) immediately. Don't wait for a third copy. This applies to: SVG icons, toggle switches, confirmation modals, image upload boxes, labeled inputs, and any UI primitive used in editor panels.
- [pattern] When the same `useEffect` pattern (canvas processing, MutationObserver, ResizeObserver, matchMedia) appears in 2+ components, extract it as a custom hook immediately. Inline effects that subscribe to browser APIs are never "too small" to extract.

### Single Source of Truth for Field Lists
- [state] When multiple functions serialize or deserialize the same data shape (e.g., store↔queue, store↔draft, store↔export), define a single canonical field list and write one pair of snapshot/restore functions. Never enumerate the same fields in more than one place — silent data loss happens when one list falls out of sync.
- [state] When adding a new editor prop, add the field name to the shared snapshot field list. If you find yourself copy-pasting a field name into 3+ functions, the architecture is wrong.

### Consistent Parsing & Serialization
- [export] Every URL parameter parsed in a render page must go through a shared typed parser (`parseBoolTrue`, `parseBoolFalse`, `parseString`, `parseNumber`) with an explicit default. Never write inline `=== 'true'` or `!== 'false'` — the default must be declared, not implicit in the comparison operator.
- [export] Boolean parameters must have a documented canonical default per field name. `showHeadline` always defaults true. `grayscale` always defaults false. The export API and render page must agree — if they don't, the editor preview and the export will silently diverge.

### Naming Consistency
- [pattern] Before naming a new field, grep the types file for existing names that represent the same concept. Field names must be identical across all interfaces that touch the same data (e.g., don't use `cta` in one interface and `ctaText` in another for the same value).
- [pattern] Nullable values should use `T | null` consistently, not sometimes empty string `''` and sometimes `null`. Pick one empty sentinel per type and use it everywhere. Prefer `null` for "no value" — it's unambiguous and works with `?? defaultValue`.

### Style & Constant Deduplication
- [pattern] Style constants (CSS strings for rich text, color maps, spacing presets) used by 2+ templates belong in a shared `lib/` file. Templates import the constant, not redefine it.
- [template] When a better UI pattern supersedes an old one (e.g., ImageCropModal replacing ZoomableImage), migrate all remaining usages in the same session. Don't leave the deprecated pattern around — it becomes the default for copy-paste.

### Preventing Monoliths
- [pattern] Export param building should use a registry pattern (`Record<TemplateType, ParamBuilder>`), not a switch statement. Adding a new template means adding one entry to the registry, not inserting a case into a 300-line switch.
- [pattern] When a component dispatches to template-specific logic (forms, export params, modals), use a lookup/registry instead of growing a switch. Switch statements that grow with every new template are a monolith signal.
- [pattern] Confirmation dialogs, empty states, and loading spinners should be shared components from first use. They are always reused — building them inline guarantees duplication.

### Dead Code Discipline
- [pattern] Don't commit stub functions with TODO comments. Either implement the feature or don't add the skeleton. Dead stubs mislead future developers into thinking functionality exists.
