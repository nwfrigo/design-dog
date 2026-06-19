# Custom Size — PRD

> **Status:** Draft. Concept validated via spike (`lib/custom-size/`, `app/custom-size-lab/`).
> **Branch:** `feature-custom-size`
> **Owner:** Nick
> **Last updated:** 2026-06

---

## 1. Summary

A self-service editor for creating a **single, brand-correct asset at an arbitrary canvas size**. The user sets any dimensions — by preset, by typing, or by **dragging the canvas edges** — and an in-app **layout engine art-directs the content** into a brand-safe layout for that shape. The user can make a few constrained, tactile adjustments (reorder text, flip image side). Screen / PNG output.

The defining idea: **direct manipulation of layout _variables_, never pixels.** Every gesture steers a variable the engine understands (dimensions, image side, block order), so a non-designer can shape the asset by hand and still never produce something off-brand.

## 2. Problem & why now

Design Dog's templates are fixed sizes. Users routinely need an on-brand asset at a size we don't offer and have **no path today** — so they go off-platform and make off-brand work. We want them to self-serve a specific size, without a designer, and without the ability to wreck the brand.

## 3. Who & the job-to-be-done

- **Who:** non-designer marketers at Cority.
- **Job:** *"I need one specific branded asset at a specific size, right now."*
- **Not** the job: campaigns, multi-surface sets, creative exploration, art direction, a "thought partner." (Prior Design Dog AI-gen/batch features saw poor adoption — we are not repeating that.)

## 4. Principles

1. **Judgment-first, not freedom-first.** The system has brand taste; the user can't make garbage. (Canva gives freedom; we give judgment — that's the wedge.)
2. **Direct manipulation of layout variables, never pixels.** A deliberate, narrow relaxation of Stage & Bench's "users never move slots" rule: reorder/swap only, never free placement.
3. **Simple & self-service.** One asset, fast. No feature sprawl.

## 5. Scope — v1

### 5.1 Setting the size (three coexisting inputs, one state)
- **Preset chips** — dummy ratio stops **1:1, 4:3, 16:9** (no channel naming yet; concrete default sizes behind each; more stops later).
- **Numeric W×H fields.**
- **Drag the canvas** — edges resize one axis, corners resize both.
- **Live re-resolve while dragging** — content reflows and triage updates in real time (this is the hero moment; it's the lab "sweep" turned into the product).
- **Dimensions readout** floats at the cursor while dragging.
- **Magnetic snapping** to the preset ratio stops while dragging, with a **"snap to presets" toggle** in the editor to disable it.

### 5.2 Composing (constrained, tactile)
- **Reorder text blocks** by drag — eyebrow / headline / subhead / body reorder among themselves. Logo stays brand-anchored. (CTA reorderability TBD — see open questions.)
- **Flip image L/R** by dragging it across the centerline; text mirrors to follow.
- The **engine owns everything else**: which responsive layout to use, and **content triage** — dropping the lowest-priority content that won't fit, with a *visible reason*.
- **Undo / redo** for all manipulations.

### 5.3 Editing content
- Standard Stage & Bench: double-click to edit text, contextual editbars, hide-to-bench.

### 5.4 Background-image variant (image-led mode)
A second composition mode: the user uploads (or picks from the image / graphics library) a **full-bleed background image** that scales elegantly with the canvas (`object-fit: cover` + a **focal point** so the subject survives every ratio), with text **overlaid**. The engine still owns layout — where the text sits and how it scales per ratio — but the arrangement is *overlay* rather than *zone* (a new resolver `kind`). Same scale-invariant rules. (Subject-aware smart crop and generative extend stay out of scope — see §8.)

**Image editing:** the background supports the **same edits as the main image editor** (zoom / pan / grayscale — via `ImageCropModal` in the real editor; focal + zoom + grayscale in the lab).

**Editable overlay layer** (not a fixed scrim): the user controls **coverage** (full / fade-up / fade-down), **color** (brand-preset palette), **opacity** (adjustable within a sensible range), and **noise**. Text color is **contrast-aware** against the overlay; `fade-down` anchors text to the top. This is the legibility tool *and* a brand styling tool in one.

## 6. The layout engine (validated by the spike)

- **Pure resolver:** `(content, width, height) → resolved layout`. Five ratio **bands** (strip / landscape / square / portrait / tower), each a hand-tuned strategy. The per-band rules **are** the design judgment.
- **Scale-invariant:** same ratio at any size → identical design, scaled uniformly (a 5000×3500 is a 1.43 landscape at 5×). No absolute caps.
- **Triage:** drops lowest-priority content that won't fit; legibility floors; reasons surfaced to the UI.
- **Renders only via shared primitives** — `ContentStack` + thin flex frames + brand chrome (CorityLogo / ArrowIcon / SolutionPill / theme tokens). No bespoke layout language.

## 7. Technical approach (high level)

- **Extension of Stage & Bench, not a new editor.** Reuses drag (`useDraggable`/`useDroppable`), FLIP reflow, editbars, bench, ContentStack.
- **Saved doc** = `{ width, height, theme, content (field-based), arrangement overrides (imageSide, block order), shownElements }` — **not** an arbitrary element tree. Reuses the store, `SNAPSHOT_FIELDS`, draft/queue.
- **Factory:** generalize `slots` from `array` to `array | resolver` (computed slots). **Do not fork** the 749-line `defineStageBenchAdapter`.
- **Export:** dynamic render route + `width`/`height`/`strategy` params; the resolver runs inside the shared `CustomSizeCanvas` component, so editor and Puppeteer output are identical by construction.
- **Image crop modal:** `ImageCropModal` / `ImagePreviewWithCrop` already accept the container's aspect ratio (done for S/M/L variants today). Custom-size makes that range **continuous and extreme**, and the image-zone aspect changes **live during a resize drag** — so the wiring must feed the modal the live resolved zone aspect and re-sync on resize. Known extension, not new infra.
- **Five DRY disciplines** (from the CTO review): don't fork the factory; no new layout language; **collapse the 3 duplicate dimension sources into one** (feature pays down debt); don't fork EditorScreen / render page; no parallel hidden-state (triage writes existing `show*` flags).
- **Undo** finally makes `commands.ts` real (currently a stub).

## 8. Out of scope (kept deliberately narrow)

- Campaigns / multi-surface sets, batch / variant generation, AI copy-fit, intent wizard.
- Print / PDF, inches / mm, bleed, CMYK. **Screen / PNG only.**
- Channel-named presets (dummy ratios for now).
- **Retrofitting the 28 templates.** (Text-reordering *might* later be added to templates — separate, later decision; nothing else here leaks over.)
- Free pixel placement, rotation, grouping, broad multi-select.
- Subject-aware **smart crop** and **generative background-extend**. *(The basic background-image variant in §5.4 IS in scope; the AI-assisted crop/extend layered on top of it is the future frontier — not v1.)*

## 9. Open questions

- Concrete default dimensions behind each preset ratio (1:1, 4:3, 16:9).
- Is the **CTA** part of the free reorder set, or pinned to trail?
- Placement of the **"snap to presets" toggle** (stage bar vs. near the size controls).
- Minimum canvas size / how aggressively to triage at extreme ratios (tuning).
- How the crop frame stays synced as the image-zone aspect changes live during a resize drag.
- Background-image mode: focal-point UX (draggable dot vs sliders); per-preset overlay opacity *ranges*; whether to warn when a user's overlay choice makes text illegible.

## 10. Build sequence

1. ✅ Engine spike + ratio lab.
2. **Drag-to-resize canvas with live re-resolve** (next).
3. Magnetic preset snapping + "snap to presets" toggle.
4. Flip-image-L/R gesture.
5. Reorder-text-blocks gesture + undo/redo.
6. Wire into store / draft / queue / export (computed-slot adapter, render route, dimension-source unification).
7. Homepage entry point + size-setting UI (chips + fields + drag).

## 11. Success criteria

- A non-designer produces an on-brand asset at an unlisted size in **under a minute**.
- **Zero broken layouts** at any ratio — the engine always lands something brand-correct.
- Editor preview and exported PNG are **pixel-identical**.
- **Net code stays simple** — the five DRY disciplines hold, and the dimension-source redundancy is reduced, not increased.

---

## 12. Pre-wiring decisions (FROZEN) + document schema

Settled with Nick before wiring, so the data model + export contract are built once.

### 12.1 Decisions

| Area | Decision |
|---|---|
| Graphics/images | **Backgrounds & fills only** — no placeable graphic objects (no element tree). |
| Image count | **One at a time** — zone image XOR full-bleed background, never both, never an array. |
| Arrangement picker | **Reserve the field, no UI in v1.** Engine picks structure; users adjust via drag + bg toggle. |
| Font-size nudge | **Yes**, on the same fields templates allow it. Stored as a **relative factor** so it survives resize (stays proportional). |
| Spacing drags | **Yes** — per-gap relative overrides (ContentStack spacers). |
| Line-height | **No** UI in v1 (field reserved). |
| Rich text (bold/italic) | **Headline, subhead, body** (stored HTML). Eyebrow + CTA stay plain. |
| Always-on blocks | **Logo + headline** locked on (`benchable: false`). Eyebrow / subhead / body / CTA / solution pill / image are optional (hideable to bench). |
| CTA role | **Freely reorderable** (not pinned). |
| Overflow | **Auto-shrink to legibility floor, then triage** the lowest-priority block (with visible reason). |
| Starting point | **Blank only** for v1. Start-from-template reserved as fast-follow. |
| Undo/redo | **Full undo + redo**, via a command layer wired from day one (`commands.ts`). |
| Draft behavior | **Re-flow to improved engine rules** (we persist inputs + re-resolve; exported PNGs already frozen). |

### 12.2 Engineering contract (decided — revised after CTO/codebase audit)

- **Thin blob + reuse globals (do NOT duplicate state).** Store only custom-specific state in a single nested `customSizeDocument` field — precedent: `carouselSlides`, `stackerContentModules`. REUSE the existing per-asset global fields (`verbatimCopy.headline/subhead/body`, `ctaText`, `eyebrow`, `solution`, `showSolutionSet`, `theme`, `grayscale`, `thumbnailImageSettings`); they already persist via `manualAssetSettings`/`goToAsset`. (The earlier §12.3 flat schema duplicated ~9 of these — corrected below.)
- **Persist inputs, re-resolve at render.** The pure resolver runs in the shared component for both editor and Puppeteer → identical output, tiny doc, drafts benefit from engine tuning.
- **Image model = canonical, not reinvented.** Reuse `imagePosition{x,y}` (−50..+50 offset), `imageZoom` (1–3), `grayscale`, and `filters` (exposure/contrast/saturation) + `ImageCropModal` (already takes dynamic `frameWidth/frameHeight`; pass canvas dims for full-bleed). Distinguish full-bleed vs zone via the doc's `imageMode`. Drop the lab's `bgFocalX/Y`/`bgZoom`. Bonus: the exposure/contrast/saturation sliders come for free (= "same functions as the main image editor").
- **Export rides the existing pipeline — no new infra.** Add `customSizeConfig` to `COMPLEX_KEYS` in `app/api/export/route.ts`; the generic loop JSON-encodes it; the render page parses it (mirror Stacker/FAQ/Carousel). Strip data-URLs + inject post-load if an uploaded image is involved. (~32KB URL limit is a non-issue for this small doc.)
- **Collapse the dimension sources.** Delete the export route's hardcoded `TEMPLATE_DIMENSIONS` (~lines 86–121); import the canonical derived map from `lib/template-config.ts`. Zero behavior change; do it as part of wiring.
- **All mutations through the command layer** (undo/redo).
- **Relative overrides only** (`fontScale`, `gapScale` factors, default 1) so scale-invariance holds.
- **Future-proof seams (near-zero cost):** make `BAND_REF` and `TYPE_RATIO` injectable params on `resolveLayout` (via the existing `LayoutOverrides` pattern), so "a template = pinned dims + a BandRef + a TYPE_RATIO" stays possible later without touching the resolver body.
- **Framing correction:** the resolver is really ~3 arrangements (`single`-family, `strip`, `tower`) + `overlay`, not 5 strategies — the 5 *bands* are the input taxonomy that maps to `kind`. Don't add a 6th band expecting a 6th branch.

### 12.3 Document schema (REVISED — the single contract everything wires to)

Two parts: **(a) reused** existing per-asset fields, and **(b) a new `customSizeDocument` blob** holding only custom-specific state.

```ts
// (a) REUSED — already in store / ManualAssetSettings / SNAPSHOT_FIELDS; do NOT redeclare:
//   headline · subhead · body (verbatimCopy) · ctaText · eyebrow · solution ·
//   showSolutionSet · theme · grayscale · thumbnailImageSettings (imagePosition / imageZoom / filters)

// (b) NEW — the only net-new persisted state, stored as one nested field:
interface CustomSizeDocument {
  width: number
  height: number
  arrangement: string | null            // RESERVED — engine chooses when null

  // per-block state (logo + headline are always-on; never in `hidden`)
  order: BlockId[] | null               // user reorder; null = engine order
  hidden: BlockId[]                     // bench-hidden
  fontScale: Record<BlockId, number>    // relative nudge, default 1
  gapScale: Record<string, number>      // relative spacing, default 1 (key = gap-a-to-b)
  lineHeight: Record<BlockId, number>   // RESERVED, unused in v1

  // image — one at a time. position / zoom / grayscale / filters come from the
  // REUSED thumbnailImageSettings + global grayscale, NOT redeclared here.
  imageMode: 'none' | 'zone' | 'background'   // 'background' ⇒ full-bleed
  imageUrl: string | null
  imageSide: 'left' | 'right' | null    // zone mode; null = engine

  // overlay (background mode only) — genuinely net-new
  overlay: { color: string; opacity: number; coverage: 'full' | 'fade-up' | 'fade-down'; noise: boolean }
}
```

The lab's `CustomContent` is a prototype subset; reconciled during wiring (`bgFocalX/Y`→`imagePosition`; `backgroundImage`/`hasImage`→`imageMode`; drop `showLogo`).

---

## 13. Wiring status (overnight session)

### Done — additive, tsc-clean, Puppeteer-verified, committed on `feature-custom-size`
- **Schema encoded:** `lib/custom-size/document.ts` — `CustomSizeDocument`, `ReusedContent`, `customSizeToProps` (boundary mapper; canonical `imagePosition` −50..50 → renderer focal), `customSizeExportBody`, `defaultCustomSizeDocument`.
- **Renderer:** `CustomSizeCanvas` now shows a real **zone image** when a URL is present (additive; placeholder fallback keeps labs unchanged).
- **Bare render route:** `app/render/custom-size/page.tsx` (no app shell — mirrors stacker/faq/carousel). **Puppeteer-verified through the real route**: background-overlay (1080×1080) and zone-image (1200×628) both render production-quality, no InfoModal.
- **Export pipeline (additive):** `customSizeConfig` in `COMPLEX_KEYS` + JSON-encoded; dimensions read dynamically from the doc when `template==='custom-size'`. All guarded → existing 28 templates untouched (`validate:registrations` green, 30 checked).
- **Brand-chrome:** `lib/brand-chrome.tsx` (engine consumes it; templates migrate later per SUBSTRATE-DEBT.md).

**Net: custom-size renders + exports through the REAL pipeline today**, using `'custom-size'` as a plain template string — no store/editor needed to prove it.

### Deliberately DEFERRED to the attended session (Phase B) — stopped at the unattended-risk boundary, not forgotten
1. **TemplateType registration** — add `'custom-size'` to the `TemplateType` union + `template-config` + `template-registry`. *Why deferred:* the union addition forces exhaustiveness across many `Record<TemplateType,…>` maps + switches (TemplateRenderer, export-params registry, etc.) — a cascading change best done with tsc + a human, not blind overnight.
2. **Store persistence** — single nullable `customSizeDocument` field through types / store (setter + `getDefaultAssetSettings` + `goToAsset` save/restore) / `SNAPSHOT_FIELDS` / `draft-storage`. *Why deferred:* touches core editing logic (`goToAsset`/draft) used by all 28 templates; only exercisable via the editor → needs interactive QA. Additive but high blast radius.
3. **Editor adapter + factory generalization** (`slots: array | resolver`), EditorScreen routing, homepage entry. *Why deferred:* interactive — needs dev server + clicking to confirm the existing editor isn't regressed.
4. **Band / breakpoint taste-QA** — needs Nick's eye; decoupled from plumbing.

**First step next session:** add `'custom-size'` to `TemplateType`, fix the tsc cascade (a custom-size case per switch/Record), then store persistence, then the factory/editor.

**Note:** the full export-**API** round-trip (vs the render route) needs `BLOB_READ_WRITE_TOKEN` + `POSTGRES_URL` locally (blob upload + `logExport`). The render **output** is already verified; only the upload/log wrapper is unverified locally.
