# Custom Size — Reference

> Truth-source for how the **custom-size** feature works today. Custom-size lets a
> non-designer create one brand-correct asset at an **arbitrary canvas size**: set
> any dimensions (preset, typed, or by dragging the canvas edges) and an in-app
> **layout engine art-directs the content** into a brand-safe layout for that shape.
>
> **Defining idea:** direct manipulation of layout *variables*, never pixels. Every
> gesture steers a variable the engine understands (dimensions, image side, block
> order) — so the user shapes the asset by hand but can't produce something off-brand.
>
> Built **on** Stage & Bench (see `STAGE-AND-BENCH.md`), not as a separate editor.
> For the original product rationale this doc consolidated, see git history of the
> retired `CUSTOM-SIZE-PRD.md`.

---

## 1. The shape of it

```
CustomSizeDocument (+ reused global content)
        │  customSizeToProps()              lib/custom-size/document.ts
        ▼
resolveLayout(content, w, h, overrides)     lib/custom-size/resolve.ts   ← PURE engine
        │  → ResolvedLayout (band, kind, blocks, sizes, triage)
        ▼
CustomSizeCanvas                            components/custom-size/CustomSizeCanvas.tsx
        │  renders via shared primitives only (ContentStack + brand-chrome)
        ├─ editor:  CustomSizeStageBench adapter → CustomSizeStage (bespoke rawStage)
        └─ export:  app/render/custom-size/page.tsx (Puppeteer) — SAME component
```

The resolver is **pure** and the renderer is **shared**, so editor preview and
exported PNG are pixel-identical by construction.

---

## 2. Data model

`custom-size` persists as a **thin blob + reused globals** — it does NOT duplicate
state. (Same precedent as `carouselSlides` / `stackerContentModules`.)

- **Reused** existing per-asset globals (already in the store / `SNAPSHOT_FIELDS` /
  draft): `verbatimCopy.headline/subhead/body`, `ctaText`, `eyebrow`, `solution`,
  `showSolutionSet`, `theme`, `grayscale`, `ctaStyle`, thumbnail image settings
  (`imagePosition` −50..+50, `imageZoom` 1–3, `filters`).
- **Net-new:** a single nested `customSizeDocument` field — `CustomSizeDocument`
  (`lib/custom-size/document.ts`): `width`, `height`, per-block `order` / `hidden` /
  `fontScale` / `gapScale` (relative factors, default 1), `imageMode`
  (`none | zone | background`), `imageUrl`, `imageSide`, and the `overlay`
  (`color` / `opacity` / `coverage` / `noise`) for image-led mode.

`customSizeToProps(doc, reused)` is the **boundary mapper** — assembles the doc +
reused content into the `CustomContent` the resolver/renderer consume (maps canonical
`imagePosition` → renderer focal, `imageMode` → zone vs full-bleed). One mapper, used
by both editor and export.

**Relative overrides only** (`fontScale`/`gapScale` are factors × the engine's computed
value) so the design stays scale-invariant across resizes.

---

## 3. The layout engine (`lib/custom-size/resolve.ts`)

`resolveLayout(content, width, height, overrides) → ResolvedLayout`. Pure; no React.

- **Bands** (`classifyBand`): the input taxonomy by ratio + absolute size —
  `strip` / `landscape` / `square` / `portrait` / `tower`. Ratio alone is not enough:
  `strip` and `tower` are **gated on the constrained axis** (`STRIP_MIN_H`,
  `TOWER_MIN_W`) so a roomy wide/tall canvas falls through to landscape/portrait
  instead of the content-stripping strip/tower. Same ratio at different absolute sizes
  can resolve to different layouts (a responsive breakpoint).
- **Arrangement `kind`:** the bands map to ~3 arrangements + overlay —
  `single`-family (stack, optionally with a zone image as `row` / `hero-top`),
  `strip` (logo · headline · CTA in one row), `tower` (vertical, CTA pinned bottom),
  and `overlay` (full-bleed background image + text). A full-bleed `backgroundImage`
  forces `kind = 'overlay'` regardless of band. **Don't add a 6th band expecting a 6th
  branch.**
- **Scale-invariant:** same ratio at any size → identical design, scaled uniformly.
  Type grows sub-linearly (`TYPE_POWER`); padding/gap/logo are linear (true zoom).
  Logo + chip ride a shared own-logo curve on content bands + strip
  (`OWN_LOGO_BANDS`); tower stays bespoke.
- **Triage** (the design judgment, surfaced to the UI): present-filter (show flags or
  empty text) → legibility floor (`LEGIBILITY_FLOOR`, never drops headline/cta) →
  vertical-fit (drops `SPACE_DROP_ORDER` lowest-priority blocks that won't fit). Dropped
  blocks carry a reason (`no-space` / `too-small` / `hidden` / `band-excluded`) that the
  bench renders as a non-draggable "no room at this size" chip.
- Renders **only via shared primitives** — `ContentStack` + thin flex frames +
  **brand-chrome** (`lib/brand-chrome.tsx`: CorityLogo / SolutionPill / theme tokens /
  per-block chrome). No bespoke layout language.

`BAND_REF` and `TYPE_RATIO` are seams for a future "template = pinned dims + a BandRef +
a TYPE_RATIO" without touching the resolver body.

---

## 4. The renderer (`CustomSizeCanvas.tsx`)

Takes `CustomContent` + dims (+ overrides), asks the resolver how to lay out, and renders.
`interactive` tags blocks/image with `data-cs-*` for the editor's drag hit-testing; when
false (export / grid preview) output is pure and identical.

- **Bands → branches:** `single` (ContentStack), `row` / `hero-top` (text + zone image),
  `strip`, `tower`, `overlay`.
- **Overlay scrim:** `lib/custom-size/overlay.ts` (`overlayBackground`, `NOISE_BG`) is the
  single source painted by BOTH the canvas and the modal crop preview, so they can't drift.
  Text color is contrast-aware against the overlay.
- **CTA styling (`ctaStyle`: `link | button`):** the CTA chrome lives in
  `brandChrome`'s `cta` case — `link` (text + arrow, secondary) or `button` (filled pill,
  primary, no arrow). Custom derives the pill colors as **inverse theme tokens**
  (fill = `textPrimary` / text = `backgroundPrimary`; on-image contrast in overlay mode).
  The `BUTTON ⟷ LINK` toggle is the standard `EditbarCta` (any `kind:'cta'` slot shows it).
  Both render sites (the band stacks + the strip) route through `brandChrome`, so the
  switch is consistent everywhere. See `STAGE-AND-BENCH.md` for the editbar; the toggle is
  only meaningful where a template actually branches on `ctaStyle` (see `SUBSTRATE-DEBT.md`).
- **Ratio presets:** `lib/custom-size/ratioPresets.ts` (`RATIO_PRESETS`) is the single
  source for BOTH the dimension-row chips and the magnetic snap detents.

---

## 5. The editor (built on Stage & Bench)

- **Adapter:** `CustomSizeStageBench.tsx` — a `defineStageBenchAdapter` factory adapter
  with **computed slots** (`slots: array | resolver`): the engine decides which blocks the
  current size supports, and the bench reflects triage. `useStoreBindings` reads the store
  (incl. `ctaStyle`) and assembles `extras`; `renderTemplate` reads `extras` and renders
  `CustomSizeStage` → `CustomSizeCanvas`.
- **Registration:** `CustomSizeRegistration.ts` — server-safe metadata + the
  **`exportBuilder`** (emits `customSizeConfig` + reused fields incl. `ctaStyle`).
- **Bespoke stage:** `CustomSizeStage.tsx` mounts via `StageBenchShell`'s `rawStage` (it
  center-anchors the canvas, freezes fit-scale during a drag for direct manipulation, and
  owns the bench drop / FLIP node). Its canvas edge uses the shared `STAGE_EDGE_SHADOW`
  (`lib/canvas-stage-style.ts`) — the same hairline `ScaledStage` gives every standard
  template.
- **Dimension control strip:** `CustomSizeRow.tsx` mounts via the factory `belowStage`
  slot — W×H fields (commit a clamped int → live re-resolve), an aspect-lock toggle, a
  "snap to presets" toggle, and the ratio preset chips (shown when snapping is on).
- **Direct manipulation:** `CustomSizeResizeHandles.tsx` (drag edges/corners → live
  re-resolve, magnetic snap to preset ratios); flip-image L/R by dragging the zone image
  across the centerline (`CustomSizeStage`, row-only, via `data-cs-image`); text-block
  reorder by drag.
- **Image-led (full-bleed) mode:** `BackgroundImageModal.tsx` (a separate image-led variant
  — the 28 templates keep `ImageEditorModal`) + `CustomSizeBackgroundLayer.tsx` (canvas
  "Change background" entry). The stage-bar BACKGROUND control (`color | image`) drives
  `imageMode`; THEME hides in image-led mode (the overlay owns color).

---

## 6. Homepage entry (the "Custom" card)

`AssetSelectionScreen.tsx` renders the Custom card by reusing **`TemplateTileV2`** (the
real tile component — same chrome/footer/tokens as every other tile, so it can't drift) via
two optional props:
- `previewOverride` — a full-bleed preview that replaces the scaled-template render. Here it's
  `CustomCanvasThumbnail` (`components/custom-size/CustomCanvasThumbnail.tsx`), an inline SVG
  montage of outlined rounded rectangles drawn with `stroke="currentColor"` under a
  `text-line-subtle` parent, so it **flips on theme** for free (one asset, no JS).
- `launchOnly` — a single `+` button that opens the editor (no select toggle, no Preview).

Clicking either launches `handleNavigateToEditor('custom-size')`.

---

## 7. Export pipeline (editor == export)

1. Editor `exportBuilder` (`CustomSizeRegistration.ts`) emits the body: `customSizeConfig`
   (the whole `CustomSizeDocument`, JSON) + reused flat fields incl. `ctaStyle`.
2. `app/api/export/route.ts` — `customSizeConfig` is in `COMPLEX_KEYS` (JSON-encoded into the
   render URL); simple fields (incl. `ctaStyle`) are forwarded by the generic loop; canvas
   dims are read dynamically from the doc when `template === 'custom-size'`.
3. `app/render/custom-size/page.tsx` — the bare Puppeteer render route (no app shell): parses
   `customSizeConfig` + reused params (incl. `ctaStyle`), runs `customSizeToProps` +
   `resolveLayout`, and renders `CustomSizeCanvas` at `scale: 1`.

Because the **same** `CustomSizeCanvas` + pure resolver run in both places, the exported PNG
matches the editor. Any new visible custom prop MUST be added in BOTH the `exportBuilder` and
the render route (the editor==export rule).

---

## 8. Key files

| Area | File |
|---|---|
| Document + boundary mapper | `lib/custom-size/document.ts` |
| Layout engine (pure) | `lib/custom-size/resolve.ts` |
| Overlay scrim (shared) | `lib/custom-size/overlay.ts` |
| Ratio presets (shared) | `lib/custom-size/ratioPresets.ts` |
| Brand chrome (shared; custom's only consumer) | `lib/brand-chrome.tsx` |
| Renderer | `components/custom-size/CustomSizeCanvas.tsx` |
| Editor adapter / registration | `components/canvas-editor/template-adapters/CustomSizeStageBench.tsx`, `…/CustomSizeRegistration.ts` |
| Bespoke stage / dimension row / resize / bg | `components/custom-size/CustomSizeStage.tsx`, `CustomSizeRow.tsx`, `CustomSizeResizeHandles.tsx`, `BackgroundImageModal.tsx`, `CustomSizeBackgroundLayer.tsx` |
| Homepage tile montage | `components/custom-size/CustomCanvasThumbnail.tsx` |
| Export render route | `app/render/custom-size/page.tsx` |
| Spikes / labs (not production) | `components/custom-size/ResizableCanvasStage.tsx`, `app/custom-size-lab/*` |

---

## 9. Design decisions (frozen)

| Area | Decision |
|---|---|
| Graphics/images | Backgrounds & fills only — no placeable graphic objects (no element tree). |
| Image count | One at a time — zone image XOR full-bleed background, never both. |
| Always-on blocks | Logo + headline locked on (`benchable: false`); everything else hideable to bench. |
| CTA role | Freely reorderable (not pinned). |
| CTA style | `link` (secondary) ⟷ `button` (primary pill), via the shared `ctaStyle`. |
| Overflow | Auto-shrink to legibility floor, then triage the lowest-priority block with a visible reason. |
| Font-size / spacing | Relative factors (`fontScale` / `gapScale`) so they survive resize. |
| Persistence | Persist inputs, re-resolve at render — drafts benefit from engine tuning; exported PNGs already frozen. |

**Out of scope (v1):** print/PDF, bleed, CMYK (screen/PNG only); campaigns / batch / AI copy-fit; subject-aware smart crop & generative extend; free pixel placement, rotation, grouping; channel-named presets.

---

## 10. Gotchas

- **Editor == export:** every visible custom prop must be in BOTH `CustomSizeRegistration`'s
  `exportBuilder` AND `app/render/custom-size/page.tsx`. `ctaStyle` is the most recent example.
- **`customSizeExportBody` (`document.ts`) is unused** — the live export body is built by the
  registration's `exportBuilder`. Don't add params to the dead one.
- **Don't fork the substrate:** the adapter is `defineStageBenchAdapter` with computed slots;
  brand-chrome is shared; the stage edge is the shared `STAGE_EDGE_SHADOW`. Extend, don't copy.
- **Relative overrides only** — absolute px breaks scale-invariance.
