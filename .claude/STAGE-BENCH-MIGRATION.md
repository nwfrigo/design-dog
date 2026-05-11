# Stage & Bench — Template Migration Playbook

> **Audience.** A Claude session (or human) migrating an existing single-page template from the legacy sidebar-form editor onto the Stage & Bench substrate. Read `STAGE-AND-BENCH.md` first — it's the architectural reference. This doc is the operational playbook.
>
> **Mandate.** Migrate cleanly. Do not leave bespoke per-template wrappers, drift the substrate to fit a template, or copy patterns out of an existing adapter "because they were there." Anything that looks like it should be foundation-shared, *is* — that's the contract for keeping this stack technical-debt-free as we onboard 30+ templates.
>
> **Status as of 2026-05-11 (`feature-drag-editor`).** Three templates migrated: `email-dark-gradient` (pilot), `email-speakers` (multi-speaker groups + image fields), `website-press-release` (absolute-positioned full-bleed image, plain-text format). Foundation now also owns image-slot bounds & toolbar anchoring (today's work).

---

## 1. What "migrated" means

A template is migrated when:

1. It is listed in `components/canvas-editor/migrated-templates.ts` → `STAGE_BENCH_TEMPLATES`.
2. It has a `template-configs/<id>.ts` declaring its slots / sizes / contents / line-heights / categories / images registry entries.
3. It has a `template-adapters/<TemplateName>StageBench.tsx` that subscribes to the store, hangs all registry providers, and renders the template through render-props.
4. The template component itself accepts and forwards `renderBlock`, `renderInlineEditor`, `renderSpacerBetween`, `renderOverlay` (and, where applicable, `renderSpeakerField` / nested-group equivalents).
5. The adapter is registered in `components/canvas-editor/StageBenchEditor.tsx` → `TEMPLATE_ADAPTERS`.
6. `EditorScreen.tsx`'s legacy sidebar-only logic is gated by `!isStageBenchTemplate(currentTemplate)` so the two editors don't render simultaneously for the same template.
7. Build + type-check pass, draft persistence still round-trips through `useEffect`-syncs, and the export pipeline produces a byte-identical asset (the render page is shared; export must remain pure).

When **every** single-page template hits this bar, the legacy editor branches in `EditorScreen.tsx` become unreachable and we delete them in one cleanup pass.

---

## 2. Substrate map — what lives where

All paths relative to `web/`.

### Routing & shell
| File | Responsibility |
|---|---|
| `components/canvas-editor/migrated-templates.ts` | The `STAGE_BENCH_TEMPLATES` set. Add new ids here. |
| `components/canvas-editor/StageBenchEditor.tsx` | Adapter dispatcher. Wraps everything in `<DndProvider>`. |
| `components/canvas-editor/StageBenchShell.tsx` | Pure layout: header strip + 3-column body (bench / stage+actionrow / stage-bar). |
| `components/EditorScreen.tsx` | Top-level router: `isStageBenchTemplate(currentTemplate) ? <StageBenchEditor> : <legacy form sidebar>`. |

### Per-template (you write these)
| File | Responsibility |
|---|---|
| `components/canvas-editor/template-configs/<id>.ts` | Pure functions that compute slot / size / content / line-height / image / category arrays from store values. No JSX. |
| `components/canvas-editor/template-adapters/<Name>StageBench.tsx` | The component. Store subscriptions, registry providers, modal state, stage-bar selectors, template render. |
| `components/templates/<Name>.tsx` | Existing template. Add render-props; preserve export-time fallthrough. |

### Selection / editing primitives
| File | Responsibility |
|---|---|
| `components/canvas-editor/CanvasEditorProvider.tsx` | Provides `mode: 'edit' \| 'export'`. Templates skip render-props when `mode === 'export'`. |
| `components/canvas-editor/Editable.tsx` | The selection + drag wrapper. `display: contents` by default; promotes to `display: block; position: relative; zIndex: 2` when `previewActive` (foundation, do not re-implement). |
| `components/canvas-editor/SelectionRing.tsx` | Portal-rendered ring outline driven by `selection.bounds`. |
| `components/canvas-editor/ContextualToolbar.tsx` | Portal-rendered toolbar. Anchors **above** for text/cta/pill/spacer/color/group; **inset top-left inside** for `image`. |
| `components/canvas-editor/InlineTextEdit.tsx` | Plain / HTML inline text editor; rendered via `renderInlineEditor` when `editingPath === slotPath`. |
| `components/canvas-editor/capabilities.ts` | `DEFAULTS_BY_KIND` + `resolveCapabilities()`. Defines what each `EditableKind` can do. |
| `components/canvas-editor/types.ts` | `EditableKind`, `Selection`, `CapabilitySet`. Source of truth for kinds. |

### Registries (slot-keyed context providers — read in toolbars, written by adapters)
| File | Drives | Toolbar consumer |
|---|---|---|
| `VisibilityRegistry.tsx` | Slot show/hide, label, `iconKey` for bench chip. | Eye-off button across all kinds; bench rail. |
| `SizeRegistry.tsx` | Per-slot font size + bounds. | EditbarText `A↑ / A↓`. |
| `ContentRegistry.tsx` | Slot text value + `format: 'html' \| 'plain'`. | EditbarText Bold/Italic block toggle. |
| `LineHeightRegistry.tsx` | Per-slot line height + bounds. | EditbarText line-spacing slider. |
| `ImageRegistry.tsx` | Slot `onChange` / `onEdit` / `onGenerate` handlers. | EditbarImage three-button row. |
| `CategoryRegistry.tsx` | Category options, current value, setter. | EditbarCategory dropdown (solution pill). |

Each registry has an identical shape: a `<NameRegistryProvider items={...}>` and a `useSlotName(path)` hook. **Do not invent new registry shapes**; if you need a new slot-keyed concept, follow the exact same pattern.

### Bench rail
| File | Responsibility |
|---|---|
| `components/canvas-editor/stage-bench/StageBenchBench.tsx` | Reads `useVisibilitySlots()`, renders chips for hidden slots, draws the drop-preview "ghost chip" during stage→bench drags. |
| `components/canvas-editor/stage-bench/useStageBenchDroppables.ts` | Registers the stage + bench drop targets with `lib/dnd`. Stage drop calls `slot.show()`; bench drop calls `slot.hide()`. |
| `components/canvas-editor/stage-bench/StageScrim.tsx` | Translucent overlay rendered *inside* the template via `renderOverlay` (so its z-index can layer between blocks). |
| `components/canvas-editor/bench/BenchChip.tsx` | Pure presentation. `BenchChipKind` union (extend here when a new slot type needs a new icon). |

### Editbar (contextual toolbars)
All in `components/canvas-editor/editbar/`. Already complete for every existing slot kind — **do not** subclass or fork.

| File | Slot kind |
|---|---|
| `EditbarText.tsx` | `text` (eye-off, B / I, size up/down, line-height slider) |
| `EditbarCta.tsx` | `cta` (eye-off, style: Link/Button, arrow color) |
| `EditbarImage.tsx` | `image` (Change / Generate / Edit — Generate ghosted until API lands) |
| `EditbarCategory.tsx` | `pill` (eye-off + category dropdown) |
| `EditbarColor.tsx` | `color` |
| `EditbarSlider.tsx`, `Dropdown.tsx`, `Toggle.tsx`, `shell.tsx` | Editbar internals — primitives only. |

### Stage Bar (canvas-wide controls, right column)
`components/canvas-editor/stage-bar/`. Adapter assembles per-template:
- `SelectorRow` — labeled wrapper.
- `SelectorPrimitive` — typed selector. `kind: 'theme' | 'color-4' | 'stack' | 'alignment'` etc.

Adapters wire which canvas-wide selectors exist; the substrate provides every primitive currently in use.

### DnD + motion
| File | Responsibility |
|---|---|
| `lib/dnd/DndProvider.tsx`, `useDraggable.ts`, `useDroppable.ts` | Pointer-event DnD primitive. NOT HTML5 native drag. |
| `lib/motion/useFlipReflow.ts` | FLIP animation hook for layout reflows when slots show/hide. Wired via `useFlipReflow(stageRef)`. |
| `lib/motion/tokens.ts` | `MOTION.duration.*`, `MOTION.easing.*` — use these, never hand-rolled durations. |

### Bench/Stage drop ids (constants, don't redefine)
```ts
STAGE_DROPPABLE_ID = 'canvas-stage'
BENCH_DROPPABLE_ID = 'canvas-bench'
```

---

## 3. Mental model — what the user actually does

- **Stage** = the design itself, scaled at 1× inside `data-canvas-stage`. Clicking any `<Editable>` selects it.
- **Bench** = the rail to the left (and the `<aside>`'s ref is the drop target). Slots park here when hidden.
- **Toolbar** = `<ContextualToolbar>`, a portal that floats relative to `selection.bounds`.
- **Slot** = a single editable region. Identified by a dotted path: `<templateId>.<slotKey>`. Every slot lives in `VisibilityRegistry`; specialized capabilities (font size, content text, image actions, category options) live in additional registries keyed by the same path.
- **Drag** is pointer-events (not HTML5). A bench chip dropped over the stage triggers `slot.show()` from `VisibilityRegistry`; a stage block dragged onto the bench triggers `slot.hide()`. The substrate handles both — the adapter just provides the `slots` array to `useStageBenchDroppables()`.

---

## 4. Pre-flight checklist (do this before touching any code)

For each template you intend to migrate, fill this out in writing (in your plan/notes) before starting. If you can't answer a question without guessing, read the legacy editor + the template `.tsx` first.

### 4.1 Slot inventory
- [ ] List every editable region the legacy sidebar exposes. Group into kinds: `text`, `cta`, `image`, `pill`, `color`, `spacer`, `group`.
- [ ] For each text slot, note: plain or HTML? Has its own font size? Has its own line height? Has a default placeholder?
- [ ] For each image slot, note: store fields (`url`, `position`, `zoom`), whether it's bench-able (most full-bleed images are not — see press-release), what frame dimensions the crop modal needs.
- [ ] For each `pill`/category: which option set drives it, what store field holds the current value.
- [ ] For each spacer: is the stack vertical with adjustable gaps? Top- or bottom-anchored? What's the gaps record key format?

### 4.2 Store contract
- [ ] Identify the store fields each slot reads / writes (this becomes `storeKey` in the `Selection`).
- [ ] Note any per-template settings (image position+zoom records, gap records, line-heights record). These will appear in your `template-configs/` file.
- [ ] **Critical:** check whether any slot's state is currently stored *globally* (shared with other templates) but should be *per-asset*. The press-release `solution` field was globally coupled before migration; we moved its per-asset persistence into `ManualAssetSettings`. Don't replicate that bug.

### 4.3 Stage Bar inventory
- [ ] Which canvas-wide controls does the legacy sidebar expose at the *template* level (not the slot level)? Theme, color style, content-stack alignment, text alignment, etc. These become `SelectorRow`s in your stage bar.

### 4.4 Drag behavior decisions
- [ ] Which slots are bench-able? (Most are.) Which are *always on stage* (e.g. press-release featured image)?
- [ ] For non-bench-able slots, you still want `<Editable>` for selection/toolbar, but skip the `drag` config in `renderBlock`.

### 4.5 Risk scan
- [ ] Does the template use `position: absolute` for any visible region? → That region's `<Editable>` must NOT be wrapped in an extra `<div>` (see Gotcha §6.1).
- [ ] Does the template render *nested* editables (a group containing per-field editables, like email-speakers)? → You need `renderBlock` for the group AND a sibling render-prop for child fields (`renderSpeakerField` pattern). The substrate's deep-click semantics handle the click drilling automatically.
- [ ] Does the template use HTML rich text or plain text per slot? → Drives `ContentRegistry.format` and `InlineTextEdit.format`.
- [ ] Does any slot need a per-slot setting that doesn't yet have a registry (e.g. a slot-level color)? → Add a new registry following the existing pattern, **not** an ad-hoc prop.

### 4.6 Export pipeline check
- [ ] Confirm the template's render page (`app/render/...`) reads the same props as the live preview, and that none of your new render-props leak to export. Render-props default to identity functions (`(_id, content) => content`); when `CanvasEditorProvider` is absent (export side), every render-prop's *default fallthrough* must produce a byte-identical render.

---

## 5. Migration sequence

Follow this order. Each step's output is verifiable before moving on; do not interleave.

### Step 1 — Template prep (`components/templates/<Name>.tsx`)

1. **Add render-prop hooks.** The contract:
   ```ts
   renderBlock?: (blockId: BlockId, content: ReactNode) => ReactNode
   renderInlineEditor?: (blockId: BlockId, defaultInner: ReactNode) => ReactNode
   renderSpacerBetween?: (gapKey: string, value: number, prevId: BlockId, nextId: BlockId) => ReactNode
   renderOverlay?: () => ReactNode
   ```
   For nested groups (speakers, grids, carousels), add a sibling pair:
   ```ts
   renderSpeakerField?: (speakerId, field, defaultInner) => ReactNode
   renderSpeakerFieldInline?: (speakerId, field, defaultInner) => ReactNode
   ```
2. **Default to identity.** Inside the component:
   ```ts
   const wrapBlock = renderBlock ?? ((_id, content) => content)
   ```
   This keeps non-migrated callers (and the export render page) producing identical output.
3. **Wire the render-props at every editable site.** Wrap each editable region in `wrapBlock(blockId, <region>)`. Wrap the inner text in `wrapInline(blockId, value)`. For spacers, replace the static `<div style={{height: gap}}>` with the render-prop call.
4. **Add `BlockId` export.** Adapters import this from the template:
   ```ts
   export type WebsitePressReleaseBlockId = 'image' | 'eyebrow' | 'headline' | ...
   ```
5. **Type-check.** No adapter exists yet — the template alone must compile.

### Step 2 — Template config (`components/canvas-editor/template-configs/<id>.ts`)

Pure module, no JSX. One function per registry that reads store values as a struct and returns an array. Pattern (copy from `email-dark-gradient.ts` first; it's the cleanest):

```ts
export function getXSlots(p: SlotsParams): SlotVisibility[] { ... }
export function getXSizes(p: SizesParams): SlotSize[] { ... }
export function getXContents(p: ContentsParams): SlotContent[] { ... }
export function getXLineHeights(p: LineHeightsParams): SlotLineHeight[] { ... }
// Only when applicable:
export function getXImages(p: ImagesParams): SlotImage[] { ... }
export function getXCategories(p: CategoriesParams): SlotCategory[] { ... }
```

Keep all min/max/step constants and placeholder dictionaries inside this file. **Do not** put numeric defaults in the adapter component — the config is the source of truth so future declarative descriptors can read it.

### Step 3 — Adapter (`components/canvas-editor/template-adapters/<Name>StageBench.tsx`)

Use `EmailDarkGradientStageBench.tsx` as your reference implementation. It's the cleanest pattern and the one to copy. Skeleton:

1. Subscribe to every store field the template reads / writes via `useStore((s) => ...)`. One subscription per field — splitting subscriptions keeps re-render scope tight.
2. Compute `slots = getXSlots({...})` from the subscribed values.
3. Compute `activeDrag = useActiveDrag<SlotDragData>()` and `previewKey` (the slot path being previewed over the stage). Wire `showStageScrim`.
4. Compute the "effective" content/visibility for preview: `previewKey === 'headline' ? headlineFromStore || PREVIEW_PLACEHOLDERS.headline : headlineFromStore`, `showHeadlineEff = showHeadline || previewKey === 'headline'`.
5. Wire `stageRef` + `useFlipReflow(stageRef)` for layout reflows.
6. Wire `useStageBenchDroppables(slots)` to get `setStageNodeRef` + `setBenchNodeRef`. Compose `setStageNodeRef` with the FLIP ref.
7. Build the `stageBar` content (one `SelectorRow` per canvas-wide control).
8. Render the provider stack (order doesn't matter functionally, but stick to the established order for diff hygiene):
   ```
   <CanvasEditorProvider mode="edit">
     <VisibilityRegistryProvider slots={slots}>
       <SizeRegistryProvider sizes={...}>
         <ContentRegistryProvider contents={...}>
           <LineHeightRegistryProvider lineHeights={...}>   ← optional
             <CategoryRegistryProvider categories={...}>    ← optional
               <ImageRegistryProvider images={...}>        ← optional
                 <StageBenchShell ...>
                   <div ref={setStageNodeRef} data-canvas-stage data-canvas-preview-pad style={{ position: 'relative' }}>
                     <Template ... renderBlock={...} renderInlineEditor={...} renderSpacerBetween={...} renderOverlay={() => <StageScrim visible={showStageScrim} />}/>
                   </div>
                 </StageBenchShell>
                 <ContextualToolbar />
                 <SelectionRing />
   ```
9. `renderBlock` wraps each slot in `<Editable>`. **Pass content directly as the child** — no extra wrapping `<div>`. Pass `previewActive={previewKey === blockId}` so the foundation can promote the wrapper's display when needed. (See Gotcha §6.1.)
10. `renderInlineEditor` swaps in `<InlineTextEdit>` only when `editingPath === slotPath`; otherwise return `defaultInner`. Wire `format: 'plain' | 'html'` and `singleLine` based on the slot.
11. `renderSpacerBetween` returns an `<Editable kind="spacer">` wrapping `<SpacingHandle>`. Direction depends on `stackAlign`.
12. Modal state for image flows lives **in the adapter** (`useState`). Bind handlers into `slotImages` (`onChange`, `onEdit`, `onGenerate`). The image library / crop modal is rendered as a sibling to `<StageBenchShell>` inside the provider stack.

### Step 4 — Register

1. Add the template id to `STAGE_BENCH_TEMPLATES` in `migrated-templates.ts`.
2. Add the adapter to `TEMPLATE_ADAPTERS` in `StageBenchEditor.tsx`.

### Step 5 — Cleanup legacy paths

In `EditorScreen.tsx`, every block of legacy editor UI that hard-coded behavior for *this* template (custom sidebar field, custom export wiring, ad-hoc state) must be either:
- Gated behind `!isStageBenchTemplate(currentTemplate)` if it's a sidebar-only affordance, OR
- Removed entirely if it's been replicated in the adapter.

**Do not** leave both code paths active for the same template — both will fire and the cheaper-to-render path wins visually, masking bugs in the other.

### Step 6 — Verify (see §7)

---

## 6. Gotchas & footguns

Each of these has bitten us at least once. Read them before writing any adapter code.

### 6.1 Never wrap `Editable`'s child in an extra `<div>`

**Symptom.** The selection ring appears as a tiny 4×4 circle in the canvas corner; the contextual toolbar floats at canvas (0,0).

**Cause.** `Editable` uses `display: contents` so it has no box of its own. It measures its host element via `getBoundingClientRect()` (with a defensive descendant walk for 0-sized roots). If you insert a wrapper `<div>` whose only child is `position: absolute`, the wrapper collapses to 0×0 because its child is taken out of flow. Bounds → 0×0 → ring + toolbar break.

**Rule.** In `renderBlock`, pass `content` directly to `<Editable>`. Never:

```tsx
// WRONG — this used to be the pattern; foundation has absorbed the responsibility
<Editable ...>
  <div style={isPreviewSlot ? { position: 'relative', zIndex: 2 } : undefined}>
    {content}
  </div>
</Editable>
```

```tsx
// RIGHT — foundation owns the z-index promotion
<Editable ... previewActive={isPreviewSlot}>
  {content}
</Editable>
```

### 6.2 Image toolbar anchoring is foundation-owned

The toolbar position is *kind-aware* (`ContextualToolbar.tsx` → `ANCHOR_BY_KIND`). Images anchor **inside** the top-left; everything else anchors **above**. If a new template needs a different anchor, add the rule to `ANCHOR_BY_KIND` — do not work around it in the adapter.

### 6.3 Drag handles via slots, not setShowX callbacks

The `useStageBenchDroppables(slots)` hook routes drop targets via `slot.show()` / `slot.hide()` directly off the `VisibilityRegistry`. **Do not** add per-template `onDropToStage` / `onDropToBench` handlers to the adapter. If you find yourself wiring drop-side state by hand, the slot registry is wrong — fix the registry.

### 6.4 Preview state is a render-time concern only

`previewKey` and the `showEyebrowEff = showEyebrow || previewKey === 'eyebrow'` pattern live entirely in the adapter. Do not write `previewKey` back to the store. The block becomes "really visible" only when the drop commits and `slot.show()` runs.

### 6.5 Local state must `useEffect`-sync to the store

This is the universal rule from `CLAUDE.md`. Within Stage & Bench, it most often bites image modal state and ephemeral inline-editing state. Modal *open/close* state is fine to keep local. Anything that should persist across sessions (image position, zoom, crop) must update store immediately on commit, never on modal close alone.

### 6.6 Export pipeline must stay pure

The render page (`app/render/[...]/page.tsx`) renders the same template component as the editor. It must NOT see render-props. The template's defaults (`wrapBlock = renderBlock ?? identity`) handle this — verify by rendering the template with no render-props passed and confirming the DOM is identical to the legacy editor's preview.

Specifically: if you add a new render-prop, its fallthrough must produce literal-equivalent output. **Don't** make a render-prop do double duty as "and also add styling X" — that styling belongs in the template's own CSS.

### 6.7 `display: contents` + nested editables = deep-click semantics

`Editable.tsx` already implements: first click selects the outermost ancestor; second click drills into the child. This is wired by walking `data-editable-path` up the DOM. Do not break the DOM ancestry by inserting React fragments or portals between nested editables.

If your template has nested groups (speakers, grid cells), use the same render-prop fanout as `email-speakers`: a top-level `renderBlock` for the group + a sibling `renderSpeakerField` for inner fields. Both wrap with `<Editable>`. The outer kind is typically `group`; inner kinds are `text` / `image` / etc.

### 6.8 `iconKey` is template vocabulary; chip kind is UI vocabulary

`SlotVisibility.iconKey` is open-ended (e.g. `'speaker'`, `'category'`, `'grid-detail'`). The bench rail maps it to a `BenchChipKind` via `StageBenchBench`'s default `ICON_KIND_TO_CHIP_KIND` (or a per-adapter override). If your template needs a chip icon that doesn't exist:
1. Add the new `BenchChipKind` to the union in `bench/BenchChip.tsx` with its `KIND_ICON` entry.
2. Add a mapping in `StageBenchBench`'s default table.

Do not pass arbitrary icon components through props — keep the icon vocabulary closed and discoverable.

### 6.9 The bench column must have height for hit-testing

`StageBenchShell` applies `self-stretch` to the bench `<aside>` so it matches the stage's height even when empty. If your migration accidentally removes `self-stretch` (e.g. by re-styling the shell from the adapter — don't), stage→bench drops will silently fail because `elementFromPoint` won't hit the empty rail.

### 6.10 FLIP only animates `[data-editable-path]` by default

`useFlipReflow(stageRef)` measures elements with `[data-editable-path]` between renders. Every `<Editable>` applies this attribute automatically. If you need a non-editable element to animate (e.g. a decorative divider that shifts when slots show/hide), pass a custom selector to `useFlipReflow`.

### 6.11 Theme + render contract is the template's concern, not the adapter's

Theme tokens (`TEMPLATE_THEMES`, `themeColors.*`) live in the template. The adapter just passes `theme={theme}` from the store. Don't fan out theme decisions into the adapter — that defeats the point of templates being rigid layouts.

### 6.12 Plain text vs HTML format mismatch breaks Bold/Italic

`ContentRegistry.format` MUST match the inline editor's `format`. If you declare `format: 'html'` in the registry but pass `format="plain"` to `InlineTextEdit`, the block-level Bold/Italic toggle and the inline `execCommand` will disagree about which tags exist. Result: stuck-on bold, ghosted toggles. Always wire both sides identically.

### 6.13 Don't share modal state across slots

Adapter modal state should be discriminated by slot. Press-release has a single image, so a `[showCropModal, setShowCropModal]` boolean is fine. Email-speakers has three speakers, so it uses `[cropModalFor, setCropModalFor]` typed as `SpeakerId | null`. Pick the form that scales with the slot count — never collapse multi-slot modal state into a single boolean.

### 6.14 The image editor lightbox (`ImageEditorModal`) — universal contract

The image edit flow uses **`ImageEditorModal`** (in `components/image-editor/`) — a single-modal, view-switching surface that owns Change Image / Zoom / Pan / Filters / Presets / Reset. There is no longer a separate `ImageLibraryModal` for migrated templates (library lives as a view *inside* `ImageEditorModal`), and no contextual toolbar for image-kind selections — selection opens the modal directly via `useImageSelectionEffect()`.

**Universal contract.** Every adapter passes the same shape:

```ts
import { type ImageSlotSettings } from '@/lib/image-filters'

<ImageEditorModal
  isOpen
  onClose={() => setEditorFor(null)}
  imageSrc={...}                    // current URL (fall back to placeholder if null)
  frameWidth={N}                    // template's export-frame width
  frameHeight={N}                   // template's export-frame height
  initialSettings={...}             // bundled { position, zoom, filters }
  onSettingsChange={(next) => ...}  // commit-on-dismiss handler
  onImageChange={(url) => ...}      // fired when user picks/uploads in library view
/>
```

`ImageSlotSettings` is the foundation type — `{ position, zoom, filters }`. Adapters map their bespoke store fields onto this shape at the modal boundary. The modal stays template-agnostic; future additions (rotation, crop ratio, etc.) extend the type, not the prop list.

**Commit semantics.** No Apply button. Closing the modal (Esc, backdrop, X) auto-commits via `onSettingsChange`. Reset wipes **everything** — position, zoom, all filters, preset selection — back to neutral; it does not close. So the dismiss-saves pattern means clicking Reset and then dismissing persists the neutral state.

**Filters wiring.** `lib/image-filters.ts` is the truth-source:

| Helper | Purpose |
|---|---|
| `ImageFilters` | `{ exposure, contrast, saturation }`, each −1..+1 |
| `NEUTRAL_FILTERS` | All zeros — neutral pass-through |
| `NEUTRAL_SLOT_SETTINGS` | Full `ImageSlotSettings` at neutral |
| `filtersToCss(filters)` | Returns CSS `filter:` string, or `undefined` when neutral (so unmodified images stay byte-identical in exports) |
| `applyGrayscaleBoolean(filters, grayscale)` | Reconciles legacy per-asset `grayscale` boolean: when `true`, clamps saturation to −1. Call at template render time so pre-existing grayscale=true assets render correctly without a store migration |
| `isNeutral(filters)` | True when every slider is 0 |

**Apply at the template's `<img>`:**

```tsx
import { applyGrayscaleBoolean, filtersToCss, NEUTRAL_FILTERS } from '@/lib/image-filters'

const effective = applyGrayscaleBoolean(imageFilters ?? NEUTRAL_FILTERS, grayscale)
const filterCss = filtersToCss(effective)

<img style={{ filter: filterCss ?? 'none', ... }} />
```

CSS filters are GPU-accelerated, render correctly in Puppeteer (proven via the legacy grayscale fallback), and impose zero JS cost. The slider→CSS mapping is `brightness(1 + value)`, `contrast(1 + value)`, `saturate(1 + value)` — linear, not photographic-log, but indistinguishable at the ±0.3 adjustments users typically make.

**Storage shape recommendations.**
- **Single-image templates** (press-release, etc.): extend the existing per-template `ImageSettings` record. The optional `filters?: ImageFilters` field on `ImageSettings` (`types/index.ts`) is already in place — drafts without it default to neutral.
- **Multi-image templates** (speakers, grids): add a per-slot filter field next to existing per-slot position/zoom. Mirror the pattern; don't bundle into one record unless the per-slot fields are *also* being bundled.
- **Image swap resets filters.** When the user picks a new image via Change Image, reset filters to neutral alongside position/zoom — matches the existing "fresh image, fresh crop" rule.

**Persistence pathways.** Filters flow through every per-asset path press-release supports: live preview, draft auto-save, asset-switching, queue add/edit, direct export, and queue export. See §6.15 for the generalized "three persistence pathways" pattern any per-asset state needs to follow.

**EmailSpeakers status.** Modal sliders move locally but per-speaker filters don't persist yet — no per-speaker filter store fields. Same wiring pattern as press-release, three × per-speaker. TODO marked in the adapter.

---

### 6.15 Per-asset state must travel three persistence pathways

When you add a new per-asset (or per-image-slot) field — filter values, custom-text settings, anything users can edit and expect to come back — it has to flow through **three** separate persistence pathways. Missing any one looks like a different bug, and the symptom is misleading enough to send you debugging in the wrong place.

| # | Pathway | Symptom if missing | Touch this code |
|---|---|---|---|
| **1** | **Draft auto-save** (browser refresh survival) | "My edit reverts on refresh." | `EditorLayout.tsx` `useEffect` deps array — see §6.16 — plus `saveDraft`'s payload in `store/index.ts` and `DraftState` in `lib/draft-storage.ts` |
| **2** | **Asset switching** (`goToAsset`) | "My edit survives refresh but reverts when I tab between assets or go to queue and back." | `store/index.ts` `goToAsset`: capture block (around line 887, builds `currentSettings: ManualAssetSettings`) AND restore block (around line 1126, rebuilds top-level state from `targetSettings`). Both sides need the new field. Also add to `defaultSettings` (around line 1005) so brand-new assets initialize correctly. |
| **3** | **Export pipeline** (Puppeteer PDF/PNG) | "My edit shows in the editor preview but exports render without it." | `ExportParamState` in `lib/export-params.ts`; per-template `BUILDERS` (or the shared `buildImageParams` helper); `buildExportParamsFromAsset` (queue → params); `renderProps` + `renderSchema.fields` + `assembleProps` in `lib/template-registry.tsx`; template component accepts the new prop and applies it at render time. |

Plus a fourth surface if your field belongs in the queue:
- **Queue / Generated-asset round-trips** — `snapshotToQueuedAsset` and `generatedAssetToQueuedAsset` in `lib/asset-snapshot.ts`; `QueuedAsset` and `GeneratedAsset` types in `types/index.ts`.

**Diagnosis rule of thumb.** Edit a field, then:
- Refresh — survives? → pathway 1 is wired.
- Switch asset and come back — survives? → pathway 2 is wired.
- Export and inspect the PDF — applied? → pathway 3 is wired.

Each "no" points at exactly which pathway is missing. Don't go grep-hunting blindly; use the triage above to scope where to look.

The filter rollout cost us ~3 round-trips with the user before we noticed the asset-switching pathway was missing. Use this checklist when adding any new per-asset field so the next person doesn't repeat the dance.

---

### 6.16 The `EditorLayout.tsx` auto-save deps array is hand-maintained

The auto-save effect is debounced over a `useEffect` whose deps list is hand-maintained:

```tsx
useEffect(() => {
  const timeoutId = setTimeout(saveDraft, 500)
  return () => clearTimeout(timeoutId)
}, [saveDraft, /* hand-maintained list of state fields */])
```

If your new field isn't in that array, **draft auto-save will not fire for it**. The store update happens; the localStorage write doesn't. There's no error, no warning, no type check failure. The symptom is "field reverts on refresh" — the same symptom an unrelated bug would produce, which makes it hard to find.

**Diagnose this trap when:** type-check is clean, the field is in `saveDraft`'s payload (`store/index.ts`), draft `DraftState` has the field, and the field is set into top-level state correctly — but refresh still wipes it.

**Fix:** add the field name to the deps array in `EditorLayout.tsx`. One-line change. The comment above the array warns about this — keep that comment intact when editing.

---

## 7. Post-flight verification

Run through this checklist before marking a template "migrated." All items must pass.

### 7.1 Type & build
- [ ] `npx tsc --noEmit` — zero errors.
- [ ] `npm run build` — zero errors. (Restart dev server after build per `CLAUDE.md`.)
- [ ] Confirm no `console.error` / `console.warn` from React (hydration, ref forwarding, missing keys).

### 7.2 Selection & toolbar
- [ ] Click each visible slot. Selection ring outlines the actual visible content with no collapse to a tiny rect.
- [ ] Toolbar appears at the correct anchor: above for text/cta/pill, inset top-left for image.
- [ ] Toolbar's actions all map to *this template's* store fields (not a sibling template's).
- [ ] Empty-content slots (deleted text) still render the placeholder so they remain selectable.

### 7.3 Bench drag
- [ ] Drag every bench-able slot from stage to bench: scrim fades, ghost chip appears at the bench tail, drop commits to `slot.hide()`, real chip pops in.
- [ ] Drag a parked chip back: stage scrim fades in, preview block appears at the slot's real position with z-index promotion (foundation-owned), drop commits to `slot.show()`.
- [ ] FLIP animation is smooth — no jank, no overshoot. Other slots flow into their new positions.

### 7.4 Inline edit
- [ ] Double-click any text slot. `InlineTextEdit` mounts in place. Existing chrome (font-weight, size) doesn't flicker.
- [ ] Edit commits to the store on every keystroke; refresh confirms persistence.
- [ ] Click another slot to exit edit mode; click the *same* slot inside the editor (cursor reposition) does not exit edit mode.

### 7.5 Image flows
- [ ] Selecting an image opens `ImageEditorModal` directly (no toolbar). Selection ring clears once the modal mounts.
- [ ] Zoom slider + drag-pan work; closing the modal commits position/zoom.
- [ ] Filter sliders (Exposure, Contrast, Saturation) update the live preview *and* the on-canvas image in real time. Dismiss commits filters.
- [ ] Click **Change Image** → swaps to library view in same modal. Picking a new image returns to editor with reset settings; crop + filters back to neutral.
- [ ] Click **Reset** → wipes zoom, pan, every filter, preset selection back to neutral. Modal stays open. Dismissing persists the neutral state.
- [ ] Pre-existing assets with `grayscale: true` render desaturated in the migrated template (via `applyGrayscaleBoolean`) even though the per-image filter is neutral.
- [ ] **Export caveat:** until export-pipeline filter plumbing lands (see §6.14), PDF/PNG exports render with neutral filters regardless of editor state. Flag this if release-blocking; otherwise track as a known follow-up.

### 7.6 Stage Bar
- [ ] Every selector in the stage bar drives the correct store field.
- [ ] Theme switch updates colors via `themeColors.*` everywhere, no orphan light-mode shades in dark mode.

### 7.7 Export parity
- [ ] Export the template via Export → PDF and PNG. Compare byte-for-byte (or via the eyeball test if byte-exact isn't available) against the pre-migration export. Identical.
- [ ] Confirm `app/render/[...]/page.tsx` renders the template with no render-props passed (it must, by construction).

### 7.8 Two-state-systems sanity (per `CLAUDE.md`)
- [ ] Auto-create flow (templateType + generatedAssets) still works for this template.
- [ ] Manual flow (selectedAssets + currentAssetIndex) still works.
- [ ] Switching between assets in the queue doesn't bleed state.

### 7.9 Draft persistence
- [ ] Make several edits; refresh. Every edit round-trips through `lib/draft-storage`.
- [ ] If the adapter holds any local `useState` for editing, confirm it `useEffect`-syncs to the store.

---

## 8. What belongs where — recap

| Concern | Lives in |
|---|---|
| Layout (where things sit on stage) | Template `.tsx` |
| Editable region wrapping | Adapter `renderBlock` |
| Inline editor activation | Adapter `renderInlineEditor` |
| Spacer drag handle | Adapter `renderSpacerBetween` |
| Stage scrim mount point | Adapter `renderOverlay` |
| Slot list (paths, labels, show/hide) | Template config |
| Per-slot font size config | Template config |
| Per-slot content+format | Template config |
| Per-slot image action handlers | Adapter (modal state + bindings) |
| Stage bar selectors (theme, color, alignment) | Adapter |
| Header (asset tabs) | `StageBenchHeader` (shared) |
| Action row (preview/queue/export) | `StageBenchActionRow` (shared) |
| Bench rail rendering | `StageBenchBench` (shared) |
| Drop targets | `useStageBenchDroppables` (shared) |
| FLIP animations | `useFlipReflow` (shared) |
| Selection ring | `SelectionRing` (shared, foundation) |
| Contextual toolbar | `ContextualToolbar` (shared, foundation) |
| Toolbar anchor logic | `ContextualToolbar.ANCHOR_BY_KIND` (foundation, edit if a new kind needs different anchoring) |
| Wrapper display promotion | `Editable.previewActive` (foundation, never re-implement) |

If you find yourself writing something that should be in the right column but you're tempted to put it in the left, **stop**. Promote it to the substrate first, then migrate.

---

## 9. Tech-debt watchlist (active risks)

These are the live risks to a "clean, stable, technical-debt-free new product experience" as of 2026-05-11. Re-evaluate before every migration wave.

1. **Two state systems in the store.** Auto-create (`generatedAssets` / `templateType`) vs. manual (`selectedAssets` / `currentAssetIndex`) — adapters must read from the right system. The seam already broke once for the press-release `solution` field. When migrating, audit every store-coupled field for "is this per-template or per-asset?"
2. **Legacy `Bench.tsx`.** A pre-substrate bench component (`components/canvas-editor/Bench.tsx`) still compiles. Once every template is migrated, delete this file along with the `SLOT_DRAG_MIME` constant in `VisibilityRegistry.tsx`.
3. **Numeric defaults scattered across template-configs.** Min/max/step for fonts and line-heights are inlined. If we add user-configurable typography ranges, we'll want one source of truth (`lib/typography-bounds.ts` or similar). Don't refactor pre-emptively, but don't fork the numbers per template either — copy from existing configs.
4. **Image editor export pipeline** — `ImageEditorModal` is the universal image-edit surface for migrated templates. Live editor + draft persistence work; filter values do NOT yet flow through `assetToExportParams` → render route, so PDF/PNG exports render with neutral filters. Wiring is mechanical (3 new params per image slot across `lib/asset-snapshot.ts`, `lib/export-params.ts`, `lib/template-registry.tsx`, `app/api/export/route.ts`); land in one focused pass when shipping filter-aware exports. See §6.14 for the data model.
5. **EmailSpeakers filters don't persist** — Per-speaker `imageFilters` store fields aren't wired yet. Sliders move locally; settings vanish on modal close. TODO marked in the adapter. Same wiring pattern as press-release, 3× per-speaker.
6. **Legacy `ImageCropModal.tsx`** still exists in the repo for non-migrated templates' `EditorScreen.tsx` paths. Deletes when the last template migrates.
5. **No automated screenshot diffing.** Until we have a snapshot test for each template's export, post-flight §7.7 is eyeball-driven. Treat byte-exact export parity as the highest bar a migration must clear.
6. **`StageBenchHeader` uses an inline SVG plus/trash icon.** Inconsistent with the rest of the editor which uses Lucide. Low priority — flag for a future cleanup.
7. **Render-prop API surface.** Each template defines its own `BlockId` union and own render-prop signatures. When ~5 templates have migrated, evaluate whether to extract a shared `TemplateRenderProps<BlockId>` type. Until then, the duplication is acceptable.

---

## 10. Template migration difficulty tiering

Rough estimate of effort for the remaining single-page templates. Use to plan migration order — start with Tier 1, validate, work down.

### Tier 1 — Mirror existing patterns (1 day each)
Single-column or two-column layouts with text + optional pill + optional CTA. Pattern is 1:1 with `email-dark-gradient`.

- `EmailImage.tsx`
- `EmailProductRelease.tsx`
- `EmailCorityConnect2026.tsx`
- `EmailCorityCustomerExchangeSignature.tsx`
- `EmailEhsAccelerateSignature.tsx`
- `NewsletterDarkGradient.tsx`
- `NewsletterTopBanner.tsx`
- `NewsletterLight.tsx`
- `NewsletterBlueGradient.tsx`
- `SocialDarkGradient.tsx`
- `SocialBlueGradient.tsx`
- `SocialImage.tsx`
- `SocialImageMeddbase.tsx`
- `SocialEhsAccelerate.tsx`

### Tier 2 — Press-release-shaped (1–2 days each)
Full-bleed image + content stack. Mirror `website-press-release` adapter.

- `WebsiteWebinar.tsx`
- `WebsiteReport.tsx`
- `WebsiteThumbnail.tsx`
- `WebsiteFloatingBanner.tsx`
- `WebsiteFloatingBannerMobile.tsx`
- `EmailCorityCustomerExchangeBanner.tsx`
- `EmailEhsAccelerateBanner.tsx`
- `EmailEhsAccelerateInvitation.tsx`

### Tier 3 — Nested groups or grids (2–3 days each)
Multiple repeated slot groups; mirror `email-speakers` (per-group registry entries, per-field render-props).

- `EmailGrid.tsx`
- `SocialGridDetail.tsx`
- `WebsiteEventListing.tsx`
- `WebsiteEhsAccelerateListing.tsx`

### Tier 4 — Multi-page collateral (deferred)
Don't migrate yet. These are PDF/multi-page documents with their own architecture (Stacker, Solution Overview, FAQ, Customer Library, Social Carousel). The Stage & Bench substrate assumes a single-page stage; multi-page needs a different shell (likely a page selector inside the stage column).

- `StackerPdf/`
- `SolutionOverviewPdf/`
- `FaqPdf/`
- `CustomerLibrary.tsx`
- `SocialCarousel.tsx`

---

## 11. References

- `.claude/STAGE-AND-BENCH.md` — substrate architecture, registries, decisions, roadmap. The truth-source for *what's in* the substrate.
- `.claude/ARCHITECTURE.md` — global app architecture (state, export pipeline, two-state-systems).
- `.claude/BRAND.md` — brand tokens, image handling, solution pills.
- `.claude/TEMPLATES.md` — template catalog + per-template gotchas.

Reference implementations to read top-to-bottom before migrating anything:
- `components/canvas-editor/template-adapters/EmailDarkGradientStageBench.tsx` — canonical adapter shape.
- `components/canvas-editor/template-adapters/EmailSpeakersStageBench.tsx` — nested groups, multi-field per group.
- `components/canvas-editor/template-adapters/WebsitePressReleaseStageBench.tsx` — absolute-positioned image, non-bench-able slot.
- `components/canvas-editor/template-configs/email-dark-gradient.ts` — canonical config shape.
