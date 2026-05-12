# Stage & Bench — Architecture & Substrate Reference

> **Status (2026-05-11, branch `feature-drag-editor`).** Substrate complete. Three templates migrated: `email-dark-gradient` (pilot), `email-speakers`, `website-press-release`. Foundation owns selection bounds, toolbar anchoring, drag preview promotion, registry plumbing. Active work: rolling out to remaining single-page templates.
>
> **Companion docs.**
> - `STAGE-BENCH-MIGRATION.md` — playbook for migrating a template onto this substrate. Read after this one.
> - `ARCHITECTURE.md` — global app architecture (state, export pipeline, two state systems).
> - `BRAND.md` / `TEMPLATES.md` — orthogonal concerns.

This doc describes **what the substrate is, what's in it, and how the pieces fit**. It is the architectural truth-source. It does **not** describe how to migrate a template — that's `STAGE-BENCH-MIGRATION.md`.

---

## 1. Vocabulary

- **Stage** — the design itself, rendered at 1× inside `data-canvas-stage`. The editable surface.
- **Bench** — vertical chip rail to the left of the Stage. Parked (hidden) slots live here as chips.
- **Slot** — a template-declared editable region. Identified by a dotted path: `<templateId>.<slotKey>` (e.g. `email-dark-gradient.headline`). Identity is declarative and stable; the underlying store keys are separate.
- **Toolbar / Editbar** — the contextual editor that floats next to the selection (`EditbarText`, `EditbarCta`, `EditbarImage`, `EditbarCategory`, `EditbarColor`). Anchored by `selection.bounds`.
- **Stage Bar** — fixed right-column rail of canvas-wide controls (theme, color style, content-stack alignment, etc.). Adapter-assembled from `SelectorRow` + `SelectorPrimitive`.
- **Registry** — slot-keyed `React.Context` exposing per-slot state to toolbars (`VisibilityRegistry`, `SizeRegistry`, `ContentRegistry`, `LineHeightRegistry`, `ImageRegistry`, `CategoryRegistry`). One concept per registry.
- **Adapter** — per-template component that subscribes to the store, wires registries, and renders the template through render-props (`template-adapters/<Name>StageBench.tsx`).
- **Config** — per-template *pure* module that exposes functions returning registry-shaped arrays (`template-configs/<id>.ts`). No JSX, no React.

---

## 2. Principles (load-bearing)

1. **Direct manipulation, rigid layout.** Users edit content *within* declared slots; they never move slots around. No free composition, no snap-to-grid, no AI layout generation.
2. **Substrate first, templates second.** Anything that could be shared *is* shared. Per-template code does template-specific things (which fields, which stage-bar controls, which modal flows); it does **not** re-implement substrate primitives (bounds measurement, drag promotion, toolbar anchoring, registry shape).
3. **Coexists with sidebars.** Templates not yet migrated keep their legacy sidebar editor. Both UIs write to the same Zustand store. EditorScreen dispatches via `isStageBenchTemplate(currentTemplate)`.
4. **Export must remain pure.** The same template component renders for both the live editor and the Puppeteer export route. Render-props default to identity; the export render page never mounts `CanvasEditorProvider` (or mounts it with `mode="export"`). Byte-identical PDF/PNG output is the bar.
5. **No state goes round-trip through the substrate.** Selection / hover / editing path live in `useCanvasEditorStore`. Content (text, image URLs, settings) lives in the main `useStore`. Substrate primitives read both but write only via the adapter-provided setters.
6. **Single-element selection.** Multi-select is not in v1.

---

## 3. Region map (current editor screen)

```
┌───────────────────────────────────────────────────────────────────────────┐
│  StageBenchHeader — asset tabs · "+ Add" · "Delete"                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─ Bench rail ─┐    ┌─ Stage (1× design) ─────────────┐    ┌ StageBar ┐│
│   │ ▢ Eyebrow    │    │   ╭─ ContextualToolbar (portal) │    │  theme   ││
│   │ ▢ Subhead    │    │   │ B  I  A↑ A↓  ↕  👁           │    │  color   ││
│   │   …          │    │   ╰─────────────────────────────│    │  stack   ││
│   │ ◌ preview    │    │                                  │    │  align   ││
│   │   ghost      │    │   cority   [Category]            │    │   …      ││
│   └──────────────┘    │   Eyebrow                        │    └──────────┘│
│                       │   Headline                       │                │
│                       │   Body                           │                │
│                       │   CTA →                          │                │
│                       └──────────────────────────────────┘                │
│                                                                           │
│                       [↗ Preview] [☰ Queue] [↓ Export]   ← ActionRow      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ SelectionRing (portal, follows selection.bounds)
                                ▼
```

Shell: `StageBenchShell` (header strip + 3-column body + ActionRow). Pure layout. Bench is `<aside ref={benchRef}>` so DnD can register it as a drop target without the shell knowing about DnD.

---

## 4. Substrate inventory

All paths relative to `web/`. The full migration-time file-by-file table lives in `STAGE-BENCH-MIGRATION.md §2`; this section is the conceptual breakdown.

### 4.1 Stores

| Store | What lives in it |
|---|---|
| `store/index.ts` (`useStore`) | All template content + per-template settings. The single source of truth that the legacy sidebar editor *and* the Stage & Bench adapter both read & write. |
| `store/canvas-editor.ts` (`useCanvasEditorStore`) | Pure editor UI state: `selection`, `hover`, `editingPath`. No template content here. |

The split is deliberate: editor-UI state is ephemeral and doesn't belong in the 2,300-line main store with its `subscribeWithSelector` middleware. Adapters subscribe field-by-field via `useStore((s) => s.field)` to keep re-render scope tight.

### 4.2 Provider stack (what every adapter mounts)

```tsx
<CanvasEditorProvider mode="edit">          // sets editor mode + click-outside / Esc handlers
  <VisibilityRegistryProvider slots={...}>
    <SizeRegistryProvider sizes={...}>
      <ContentRegistryProvider contents={...}>
        <LineHeightRegistryProvider lineHeights={...}>     ← optional
          <CategoryRegistryProvider categories={...}>      ← optional
            <ImageRegistryProvider images={...}>           ← optional
              <StageBenchShell>...</StageBenchShell>
              <ContextualToolbar />                        ← portal: toolbar
              <SelectionRing />                            ← portal: selection ring
```

Order is conventional, not load-bearing. Wire only the registries you need.

### 4.3 The `<Editable>` primitive

`components/canvas-editor/Editable.tsx`. **Foundation. Do not re-implement.**

- **Wrapper styling.** Default `display: contents` (zero layout box). When the adapter passes `previewActive={true}` (because this slot is being previewed during a bench→stage drag), foundation promotes to `display: block; position: relative; zIndex: 2` so the drag preview paints above the stage scrim. **Adapters do NOT add their own wrapper `<div>` for z-index.**
- **Bounds measurement.** Reads `getBoundingClientRect()` on the wrapper. If the wrapper is `display: contents` (zero rect), descends through children to find the first dimensioned descendant — handles in-flow content, abs-positioned children, multi-layer wrappers uniformly.
- **Deep-click semantics.** Walks up `data-editable-path` ancestors. First click → outermost ancestor selected; second click while ancestor is selected → drills into child. Enables nested patterns (group → field) like email-speakers.
- **Drag.** Optional `drag={{ data, preview }}` enables pointer-event DnD via `useDraggable`. On drag start, selection clears so the ring doesn't trail the cursor.
- **Edit-mode gate.** When `useCanvasMode() === 'export'`, returns `<>{children}</>` — zero DOM impact, zero CSS impact.

### 4.4 Capabilities

`components/canvas-editor/capabilities.ts`. `DEFAULTS_BY_KIND` maps every `EditableKind` to its default capability set:

```
text:    { canEditText: true, canRecolor: true }
cta:     { canEditText: true, canRecolor: true }   // constrained text variant
image:   { canSwapImage: true, canCropImage: true }
spacer:  { canDragSpacing: true }
color:   { canRecolor: true }
pill:    { canTogglePill: true, canRecolor: true }
group:   { }                                        // selectable container only
```

`<Editable>` can override per-instance via the `capabilities` prop. The toolbar reads `selection.capabilities` only for documentation; in practice, toolbar buttons drive their enablement off the registries (presence of a `SlotSize` entry = font size buttons live, etc.).

### 4.5 Registries

Each registry has the same shape: `Provider` + `useSlot<Name>(path)` hook. **Do not invent new shapes**; if you need a new slot-keyed concept, follow the existing pattern.

| Registry | Drives | Toolbar consumer |
|---|---|---|
| `VisibilityRegistry` | `path`, `label`, `iconKey`, `isHidden`, `hide()`, `show()` | EyeOff button across all kinds; bench rail rendering. |
| `SizeRegistry` | `value`, `min`, `max`, `step`, `set()` | EditbarText `A↑ / A↓`. |
| `ContentRegistry` | `value`, `format: 'html' \| 'plain'`, `set()` | EditbarText Bold/Italic block toggle. Must match the InlineTextEdit `format`. |
| `LineHeightRegistry` | `value`, `min`, `max`, `step`, `set()` | EditbarText line-spacing slider. |
| `ImageRegistry` | `onChange?`, `onEdit?`, `onGenerate?` | EditbarImage three-button row. Missing handler → button ghosted. |
| `CategoryRegistry` | `options: { value, label, color? }[]`, `value`, `set()` | EditbarCategory dropdown. |

Adapter pattern: subscribe to store fields → call `getXSlots({...})` / `getXSizes({...})` / etc. from the template config → spread into the corresponding provider.

### 4.6 Selection ring & contextual toolbar

`SelectionRing.tsx` and `ContextualToolbar.tsx` are both portals to `document.body`, driven by `selection.bounds`.

- **Ring color** is `#3B82F6` (blue) **uniformly across every kind**. Earlier iterations colored by kind (purple/green/etc.) — that turned the canvas into a candy palette and worked against the ring's job as a single "this is the active edit" signal. `RING_COLOR_BY_KIND` still exists as the lookup table; every entry just maps to the same blue. 4px padding around the visible rect.
- **Toolbar anchor** is keyed by `EditableKind` (`ANCHOR_BY_KIND`):
  - `text` / `cta` / `pill` / `spacer` / `color` / `group` → **above** (12px gap + 48px toolbar height).
  - `image` → no toolbar (the image editor lightbox replaces it; selection-of-image opens the modal directly via `useImageSelectionEffect`).
- **Z-index ordering** (portaled overlays): SelectionRing `999`, ContextualToolbar `1000`, Lightbox `1100`. Any future portaled overlay claims its layer relative to these.
- Adding a new kind = one entry in each table. Do not work around anchor placement in the adapter.

### 4.7 Inline text editing

`InlineTextEdit.tsx`. Uncontrolled in-place editor. Initialized once on mount (`innerHTML` for HTML format, `innerText` for plain), then never re-touched by React — outflow via `onInput`. This is the key trick: React reconciliation cannot clobber edits in progress.

Activation: adapter's `renderInlineEditor` swaps the static inner for `<InlineTextEdit>` only when `editingPath === slotPath`. `Editable`'s double-click on `kind: 'text' | 'cta'` sets `editingPath`. `Esc` clears it. Click outside a slot also clears it (via `CanvasEditorProvider`).

Rich text Bold/Italic operates at two levels (see EditbarText):
- While editing: `document.execCommand` on the current text-range selection (character-level).
- While block-selected only: the registry setter wraps/unwraps the whole content in `<strong>` / `<em>` via `ContentRegistry.set()` (block-level). Plain-text slots disable B/I in block mode.

### 4.8 DnD primitive

`lib/dnd/`. Pointer-event-based (not HTML5). `DndProvider` mounts at `StageBenchEditor`. `useDraggable({ id, data, preview })` and `useDroppable({ id, accept, onDrop })` are the two hooks; `useActiveDrag()` reads the live drag state.

The Stage & Bench specifics live in `components/canvas-editor/stage-bench/useStageBenchDroppables.ts`:

- Stage drop target accepts `data.region === 'bench'` → calls `slot.show()` from `VisibilityRegistry`.
- Bench drop target accepts `data.region === 'stage'` → calls `slot.hide()`.
- Both return `settleTo` (a destination DOM node) so the cursor-follower animates to its final position.

Adapters call `useStageBenchDroppables(slots)` once and spread the returned refs onto the stage `<div>` and `StageBenchShell`'s `benchRef`. **No per-template drop-side handlers needed.**

### 4.9 Bench rail

`stage-bench/StageBenchBench.tsx`. Reads `useVisibilitySlots()`, renders one chip per hidden slot, plus a translucent preview chip when a stage block is being dragged toward the bench. Maps `slot.iconKey` → `BenchChipKind` via `ICON_KIND_TO_CHIP_KIND` (extendable via prop or by extending the default table).

`bench/BenchChip.tsx` is pure presentation: ghosting (`isGhosting`), preview (`isPreview`), floating (`isFloating`) state affordances. Kind icons live in `KIND_ICON`.

### 4.10 Stage scrim

`stage-bench/StageScrim.tsx`. Translucent overlay rendered *inside* the template via the adapter's `renderOverlay` render-prop. Stays inside the template's stacking context so its z-index can layer: existing blocks under (no z-index → covered by scrim), the previewed block over (foundation promotes to z-index:2 via `previewActive` → pokes through bright).

Directional transition: fades in over 150ms; snaps out instantly on commit. Without the asymmetry, the block's z-index drops while the scrim is still fading, momentarily covering the block ("the wink").

### 4.11 FLIP motion

`lib/motion/useFlipReflow.ts`. Generic FLIP animator. Adapters wire it on the stage container: `useFlipReflow(stageRef)`. Default selector is `[data-editable-path]` — every `<Editable>` gets this attribute automatically, so visible reflows when slots show/hide animate without per-template work.

Handles `display: contents` wrappers — measures the `firstElementChild` if the wrapper has no rect.

### 4.12 Stage bar primitives

`stage-bar/`. Two pieces:

- `SelectorRow` — labeled row wrapper.
- `SelectorPrimitive` — typed selector. Supported `kind` values: `'theme'`, `'color-4'` (with `options`), `'stack'`, `'alignment'`. New canvas-wide controls extend this primitive — never roll a custom selector in the adapter.

Adapters assemble the stage bar inline:
```tsx
const stageBar = (
  <>
    <SelectorRow label="theme"><SelectorPrimitive kind="theme" value={theme} onChange={setTheme} /></SelectorRow>
    <SelectorRow label="color"><SelectorPrimitive kind="color-4" value={colorStyle} onChange={setColorStyle} options={COLOR_STYLE_OPTIONS}/></SelectorRow>
    …
  </>
)
```

### 4.13 Action row

`action-row/ActionRow.tsx` + `action-row/ActionButton.tsx`. The shared "Preview / Add to Queue / Export" row. `StageBenchActionRow` is the bench-screen wrapper that hides "Add to Queue" when editing from the queue.

### 4.14 Editbar (per-kind contextual toolbars)

`components/canvas-editor/editbar/`. All built out. New kinds add a new file here AND an entry in `ContextualToolbar.tsx`'s `EDITBAR_BY_KIND` table.

| File | Kind | Composition |
|---|---|---|
| `EditbarText.tsx` | `text` | EyeOff · Bold · Italic · A↑ · A↓ · LineHeight popout |
| `EditbarCta.tsx` | `cta` | EyeOff · Style toggle (link/button) · A↑ · A↓ · Arrow color |
| `EditbarImage.tsx` | `image` | Change · Generate (ghosted until API) · Edit |
| `EditbarCategory.tsx` | `pill` | EyeOff · Category dropdown |
| `EditbarColor.tsx` | `color` | (template-specific color affordances) |
| `EditbarSlider.tsx`, `Dropdown.tsx`, `Toggle.tsx`, `shell.tsx` | — | Editbar internals (primitives + chrome) |

Each editbar reads from the registries via `useSlot<Name>(selection?.path)` — no prop drilling from the adapter.

### 4.15 Render-prop contract (templates expose)

Every Stage & Bench template adds these props (with identity defaults):

```ts
renderBlock?: (blockId: BlockId, content: ReactNode) => ReactNode
renderInlineEditor?: (blockId: BlockId, defaultInner: ReactNode) => ReactNode
renderSpacerBetween?: (gapKey: string, value: number, prevId: BlockId, nextId: BlockId) => ReactNode
renderOverlay?: () => ReactNode
// Nested groups (speakers, grid cells, etc.) add sibling render-props:
renderSpeakerField?: (speakerId, field, defaultInner) => ReactNode
renderSpeakerFieldInline?: (speakerId, field, defaultInner) => ReactNode
```

Defaults are identity (`(_id, content) => content`). The export render page never passes them — by construction, export output equals legacy editor output for the same store state.

---

## 5. The adapter pattern

`StageBenchEditor.tsx` dispatches to one of:

```ts
TEMPLATE_ADAPTERS = {
  'email-dark-gradient':    EmailDarkGradientStageBench,
  'email-speakers':         EmailSpeakersStageBench,
  'website-press-release':  WebsitePressReleaseStageBench,
}
```

Each adapter is a self-contained React component that:

1. Subscribes to its template's store fields one-by-one.
2. Calls `getXSlots({...})`, `getXSizes({...})`, `getXContents({...})`, etc. from `template-configs/<id>.ts`.
3. Computes `previewKey` from `useActiveDrag()` (the slot being previewed) and derives `showXEff` / `xEff` "effective" values for the template render.
4. Wires `useFlipReflow(stageRef)` + `useStageBenchDroppables(slots)`.
5. Assembles the stage bar (`SelectorRow` × N).
6. Renders the provider stack → `StageBenchShell` → template render with render-props wired.
7. Owns modal state for image flows (`useState` for `showImageLibrary` / `showCropModal`); binds handlers into `ImageRegistry` slot entries.

Reference implementation: **`EmailDarkGradientStageBench.tsx`** — the cleanest pattern, the one to copy from when migrating.

Adapter is a *full React component* because the render contract is non-trivial (rich text formatting, spacer slots, gap config, nested groups). A future declarative descriptor for trivially simple templates is on the roadmap; not built yet.

---

## 6. Routing & gating

| File | Role |
|---|---|
| `components/canvas-editor/migrated-templates.ts` | `STAGE_BENCH_TEMPLATES` set + `isStageBenchTemplate()` helper. The on/off switch per template. |
| `components/canvas-editor/StageBenchEditor.tsx` | Adapter dispatcher. Mounts `DndProvider` once. |
| `components/EditorScreen.tsx` | Top-level: `isStageBenchTemplate(currentTemplate) ? <StageBenchEditor> : <legacy sidebar>`. Several legacy code paths are gated on `!isStageBenchTemplate(currentTemplate)` to avoid double-render. |

When `STAGE_BENCH_TEMPLATES` covers every single-page template, the legacy `EditorScreen` form code becomes unreachable and gets deleted in one cleanup pass. Until then, both paths coexist.

---

## 7. Export pipeline contract

Hard rule: the render route (`app/render/[slug]/page.tsx`) and the editor both render the same `components/templates/<Name>.tsx`. The contract:

- Render route does **not** mount `CanvasEditorProvider`. Default mode is `'export'`.
- `<Editable>` in export mode returns `<>{children}</>` — zero wrapper.
- Render-props are not passed. Templates' identity defaults pass through.
- Net result: byte-identical DOM, byte-identical PDF/PNG.

Verification: post-migration, export an asset, compare with a pre-migration export of the same store state. Identical or not shippable.

---

## 8. Resolved design decisions

These are settled. Reopening requires a fresh round of justification.

| # | Question | Decision |
|---|---|---|
| 1 | Sidebar fate on migrated templates | **Collapse entirely** in manual mode. The 340px reclaims as Stage area. Auto-create keeps its asset-navigation sidebar. |
| 2 | Visibility toggle location | **Bench, not sidebar.** Every kind's editbar has an EyeOff button → `VisibilityRegistry.hide()`. |
| 3 | CTA is its own kind | **Yes.** `EditbarCta` is separate from `EditbarText`. No Bold/Italic — CTA styling is template-controlled. |
| 4 | Stack alignment scope | **Canvas-wide (Stage Bar).** One value per asset. Group selection isn't a v1 primitive. |
| 5 | Inline text editor implementation | **Custom uncontrolled contentEditable** (`InlineTextEdit.tsx`), not Tiptap. The uncontrolled approach sidesteps React reconciliation conflicts; Tiptap's bundle weight isn't justified for slot-scoped editing. |
| 6 | Rich-text vs plain-text format | **Per-slot.** `ContentRegistry.format` declares; `InlineTextEdit.format` matches; B/I disabled on plain. |
| 7 | Selection identity | **Path-based** (`<templateId>.<slotKey>`), not UUIDs. Templates are rigid; paths are stable. |
| 8 | Slot identity vs store keys | **Decoupled.** Slot path is for toolbar scoping; the storeKey is the actual write target. Same content surfaces across templates that share store keys (headline, ctaText, etc.) — this is intentional. |
| 9 | Drop-target plumbing | **Foundation-owned via `useStageBenchDroppables(slots)`.** Adapters do not write `onDropToStage` / `onDropToBench` handlers. |
| 10 | Toolbar anchor per kind | **Foundation-owned via `ANCHOR_BY_KIND`.** Image inset; everything else above. Adapters do not position toolbars. |
| 11 | DnD library | **Custom pointer-events** (`lib/dnd/`), not react-dnd / dnd-kit. We needed full control of cursor-follower preview + settleTo animation. |
| 12 | History (undo/redo) | **Not built.** `commands.ts` exists as a stub for future use; no commands registered. Direct setter calls today. Re-evaluate after broader rollout. |
| 13 | Multi-select | **Out of scope for v1.** Foundation assumes single selection. |
| 14 | Image lightbox modal | **In progress.** Current adapters route `slot.onEdit` → `ImageCropModal`. New lightbox is being designed; will swap in at marked `// SWAP-IN POINT` sites. `SlotImage.onEdit` contract stays. |

### 8.1 Adapter factory

New adapters use `defineStageBenchAdapter` (`components/canvas-editor/factory/defineStageBenchAdapter.tsx`). The factory absorbs registry wiring, droppables, FLIP, drag preview-key, render dispatchers, image-editor modal, and stage-bar selectors. Per-template work is a declarative descriptor (slots, stage-bar items, optional image / category / contentStack configs) plus two small functions: `useStoreBindings()` for store reads and `renderTemplate(ctx)` for the template's JSX. See the playbook in `STAGE-BENCH-MIGRATION.md` and the 3 pilot adapters (`SocialEhsAccelerateStageBench`, `SocialImageStageBench`, `EmailCorityConnect2026StageBench`) for the canonical shape.

### 8.2 Visibility-flag naming

**Use generic flags when the store field is template-agnostic.** If a slot's visibility is controlled by a flag that any template could reuse (`showEyebrow`, `showHeadline`, `showSubhead`, `showBody`, `showCta`, `showSolutionSet`), use the generic name. These flags are global in the store and shared across templates.

**Prefix template-specific flags with a short template key.** If a slot's store field is shared across N templates but visibility decisions are per-template, prefix the flag with the template's short name: `showCceEventDate` (Cority Connect 2026 event date), `showSignatureWorkshopName` (signature workshop name), etc. The prefix prevents cross-template visibility coupling.

Don't rename existing flags that already follow this rule. Audit only when you add a new flag, and pick the right form based on whether the underlying field is shared.

### 8.3 Slot bench-toggle-ability

**Rule:** if a slot appears in the bench (the chip list), it has a `show<Field>` visibility flag. If a slot is always-on (logo, brand-locked anchor, mandatory headline, baked-in decorative chrome), it has no flag and no bench chip — declare `benchable: false` in the slot descriptor.

This is the rule the migration mostly followed. Don't add `show*` flags to slots whose design contract is "always on" — that's design drift dressed up as user control.

Decorative chrome (dividers, borders, baked-in shapes) stays visible always. It is not editable and not bench-able. Wrap it in `<Editable>` only if you need a selection ring for navigation feedback — never as a toggleable slot.

---

## 9. Active risks & open items

1. **Two state systems in the store.** Auto-create (`generatedAssets`, `templateType`) vs. manual (`selectedAssets`, `currentAssetIndex`). Adapters must read from the right one. The `solution` field was globally coupled before the press-release migration — moved into `ManualAssetSettings` to fix. Audit every field's scope when migrating.
2. **Legacy `Bench.tsx`** (`components/canvas-editor/Bench.tsx`) and `SLOT_DRAG_MIME` constant still compile but are dead code for migrated templates. Delete after full migration.
3. **No automated export diff.** Post-migration §7 is eyeball-verified per template. Treat byte-identical export as the highest bar a migration must clear.
4. **Numeric defaults scattered** across `template-configs/*.ts` (font min/max/step, line-height bounds). Acceptable for now; consolidate to `lib/typography-bounds.ts` only if a typography system change forces it.
5. **Lightbox swap-in pending.** Three adapters have `// SWAP-IN POINT` comments; comes due in one pass when the new modal lands.
6. **Render-prop signatures duplicate** per template (each defines its own `BlockId` union + render-prop types). Extract a shared `TemplateRenderProps<BlockId>` only after ~5 templates have migrated and the shape has stabilized.
7. **`StageBenchHeader` uses inline SVG** for plus/trash icons; inconsistent with Lucide elsewhere. Low-priority cleanup.
8. **History/undo deferred.** When we ship multi-step edit flows (resequencing, batch operations), we'll need it. Until then, direct setter calls are simpler than a command bus.

---

## 10. Roadmap

| Item | Status |
|---|---|
| Substrate complete (Editable, registries, editbars, DnD, FLIP, scrim, shell, header, action row, stage bar primitives) | **Done.** |
| Pilot: `email-dark-gradient` | **Done.** |
| Second template: `email-speakers` (nested groups) | **Done.** |
| Third template: `website-press-release` (abs-positioned image) | **Done.** |
| Image bounds + toolbar anchor foundation work | **Done** (2026-05-11). |
| Image editor lightbox (`ImageEditorModal` + embedded library view) | **Done** (2026-05-11). Universal modal contract via `ImageSlotSettings`; replaces both `ImageCropModal` and the stacked `ImageLibraryModal` for migrated templates. |
| Per-image filters (exposure / contrast / saturation) — CSS-filter rendering | **Done** end-to-end for press-release (live preview, draft, asset-switching, export). EmailSpeakers bridged (sliders move locally, per-speaker filter store fields TODO). |
| Selection ring unified to single blue across all kinds | **Done** (2026-05-11). |
| Design-system `borderRadius` Tailwind override (`rounded-sm` → 4px) | **Done** (2026-05-11). All radius utility names now align with design tokens. |
| Tier-1 templates (mirror EmailDarkGradient) — Newsletter\*, Social\*, EmailImage, EmailProductRelease, etc. | **Next.** ~1 day each per `STAGE-BENCH-MIGRATION.md §10`. |
| Tier-2 templates (press-release-shaped) — WebsiteWebinar, WebsiteReport, Email\*Banner | Queued. |
| Tier-3 templates (nested groups) — EmailGrid, SocialGridDetail, listing pages | Queued. |
| EmailSpeakers per-speaker filter store fields | Pending — mirrors press-release pattern, 3× per-speaker plumbing. |
| Sparkle / AI generate image API ("Create Image") | Future. Lightbox tile already in place, renders disabled until handler wires up. |
| Declarative template descriptor (Layer-1 simpler adapter form) | Considered, not built. Per-template adapter remains the only entry point. |
| Multi-page collateral (Stacker, FAQ, Solution Overview, Carousel) | **Out of scope** for Stage & Bench v1. These need a different shell (page selector inside the stage column). |
| Delete legacy `EditorScreen` form paths | **After every single-page template migrates.** One cleanup pass. |
| Export queue retirement | Deferred. Keeping queue infrastructure in place against possible batch-export use case; new per-asset fields continue to flow through queue plumbing. |

---

## 11. Appendix — historical phases (compressed)

The substrate was built in phases on the `feature-drag-editor` branch. Each phase shipped cleanly and the substrate that emerged is what §4 describes. The phase log is preserved here only for archaeology; current work follows `STAGE-BENCH-MIGRATION.md`, not these phases.

- **Phase 0 — Audit.** Slot inventory for EmailDarkGradient. Discovered that store keys (`headline`, `body`, `ctaText`) are shared scalars used by multiple templates — drove the slot-identity-vs-storeKey decoupling.
- **Phase 1 — Substrate scaffold.** `Editable`, `CanvasEditorProvider`, `commands.ts` stub, `useCanvasEditorStore` (separate from `useStore`), `<ContextualToolbar>` shell. `/canvas-editor-test` validated 5 dummy slots.
- **Phase 2 — Spacing handle consolidation.** `StackerSpacingHandle` + EmailDarkGradient's local `BottomSpacingHandle` → unified `SpacingHandle`. Three call sites (Stacker, FAQ, EmailDarkGradient) standardized. `BottomSpacingHandle` and `StackerSpacingHandle` deleted.
- **Phase 2.5a — Layout refactor.** EmailDarkGradient's `bottomSpacing: number` → `stackAlign: 'top' | 'center' | 'bottom'`. 9 files touched (types, snapshot, draft storage, template-registry, export-params, store, template, EditorScreen, test page).
- **Phase 2.5b — Per-gap drag handles.** Sparse `Record<string, number>` keyed `gap-{prev}-to-{next}`, with visibility-aware key collapse and `stackAlign`-aware drag direction. Drag-handle uses `renderSpacerBetween` render-prop on the template.
- **Phase 3 — Substrate adoption (pilot).** EmailDarkGradient wrapped in `<Editable>`. Toolbars wired (Editbar*). InlineTextEdit shipped (uncontrolled contentEditable; Tiptap eval'd and rejected — bundle/complexity vs. value). VisibilityRegistry + SizeRegistry + ContentRegistry + LineHeightRegistry land.
- **Phase 3.1 — Editor shell.** `StageBenchShell`, `StageBenchHeader`, `StageBenchActionRow`, `StageBenchBench`, `StageScrim`, `useStageBenchDroppables`. `lib/dnd/` (pointer-event DnD primitive) built. FLIP motion (`lib/motion/`).
- **Phase 3.2 — Expansion.** `email-speakers` (nested groups + per-field render-props + 3 speakers worth of image slots), `website-press-release` (abs-positioned full-bleed image, plain-text throughout, bench-able category, non-bench-able image). `CategoryRegistry` + `ImageRegistry` siblings added. `EditbarCategory` + `EditbarImage` shipped. Deep-click semantics in `Editable` for nested groups.
- **Phase 3.3 — Foundation hardening (2026-05-11).** Image-slot bounds were collapsing to 0×0 because each adapter wrapped `Editable`'s child in an extra `<div>` (originally for drag-preview z-index), which silently collapses when its content is `position: absolute`. Promoted that responsibility into `Editable` via `previewActive`; added a defensive descendant-walking bounds measure; kind-aware toolbar anchoring (`ANCHOR_BY_KIND`) so image toolbars hug the top-left edge of the image rather than floating above off-canvas. All three adapters simplified.

---

## 12. References

- `STAGE-BENCH-MIGRATION.md` — migration playbook (use this when adding a new template).
- `components/canvas-editor/` — substrate code.
- `components/canvas-editor/template-adapters/EmailDarkGradientStageBench.tsx` — canonical adapter shape.
- `components/canvas-editor/template-adapters/EmailSpeakersStageBench.tsx` — nested groups pattern.
- `components/canvas-editor/template-adapters/WebsitePressReleaseStageBench.tsx` — absolute-positioned image, non-bench-able slot.
- `app/stage-bench-atoms/page.tsx` — visual lab for substrate primitives (Editbar variants, BenchChip kinds, etc.).
- `ARCHITECTURE.md`, `BRAND.md`, `TEMPLATES.md` — orthogonal references.
