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
A second composition mode: the user uploads (or picks from the image / graphics library) a **full-bleed background image** that scales elegantly with the canvas (`object-fit: cover` + a **focal point** so the subject survives every ratio), with text **overlaid** and kept legible (auto scrim / gradient, contrast-aware text color). The engine still owns layout — where the text sits and how it scales per ratio — but the arrangement is *overlay* rather than *zone* (a new resolver `kind`). Same scale-invariant rules. (Subject-aware smart crop and generative extend stay out of scope — see §8.)

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
- Background-image mode: focal-point UX, and how aggressive the legibility scrim should be.

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
