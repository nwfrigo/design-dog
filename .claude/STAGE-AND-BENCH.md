# Stage & Bench — Architecture & Substrate Reference

> **Status (1.5).** All 28 single-page templates run on Stage & Bench via the factory adapter (`defineStageBenchAdapter`). Zero hand-rolled adapters. The 3 multi-page PDFs (solution-overview, faq, stacker) stay on the legacy sidebar-form editor.
>
> **Companion docs.**
> - `ARCHITECTURE.md` — global app architecture (state, export pipeline, draft persistence, telemetry).
> - `SUBSTRATE-DEBT.md` — open substrate work with trigger conditions.
> - `STAGE-BENCH-REFACTOR-POSTMORTEM.md` — historical journal of how the substrate was built.
> - `TEMPLATES.md` — adding a new template (the playbook).
> - `CUSTOM-SIZE.md` — the custom-size feature (arbitrary-dimension assets) built on this substrate.
> - `BRAND.md` — orthogonal concerns.

This doc describes **what the substrate is, what's in it, and how the pieces fit**. It is the architectural truth-source for the *current* state. For the *history* of how we got here, see the postmortem; for *adding a new template*, see TEMPLATES.md.

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

All paths relative to `web/`.

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
| `IconRegistry` | `icon` (Lucide id), `set()` | EditbarChip Replace button (opens the Lucide `IconPickerModal`). One entry per `kind:'chip'` slot. |

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

Activation: adapter's `renderInlineEditor` swaps the static inner for `<InlineTextEdit>` only when `editingPath === slotPath`. `Editable`'s double-click on `kind: 'text' | 'cta' | 'chip'` sets `editingPath`. `Esc` clears it. Click outside a slot also clears it (via `CanvasEditorProvider`).

**Line cap (`maxLines`).** `SlotContentSpec.maxLines` (threaded into `InlineTextEdit`) hard-caps the rendered line count — input that would overflow is measured (`scrollHeight` vs `lineHeight × maxLines`) and, for plain text, trimmed from the end to fit (keeps as much as possible, handles paste); rich text reverts to the last valid value. Content-independent, so `maxLines: 1` is a true one-line field and `maxLines: 4` a true four-line field (used by executive-overview's headline/card title/card body).

**Paste-and-match-style.** `InlineTextEdit`'s `onPaste` inserts the clipboard's PLAIN text at the caret (`document.execCommand('insertText')`), stripping source formatting (Word highlights/colors/fonts); newlines collapse to spaces on single-line fields. Any bold/italic already in the field survives. Substrate-wide — every S&B slot gets it.

Rich text Bold/Italic operates at two levels (see EditbarText):
- While editing: `document.execCommand` on the current text-range selection (character-level). **Chrome emits `<b>` / `<i>` here, not `<strong>` / `<em>`** — both spellings must be handled downstream.
- While block-selected only: the registry setter wraps/unwraps the whole content in `<strong>` / `<em>` via `ContentRegistry.set()` (block-level).

**B/I are disabled on plain-text slots in *both* modes.** They used to re-enable on entering edit mode, which meant `execCommand` visibly bolted the selection and then the `innerText` read dropped the tag on commit — formatting that appeared to work and silently didn't. `InlineTextEdit` also swallows Cmd/Ctrl+B/I/U on plain slots, because contentEditable handles those natively and disabling a toolbar button does nothing about a keystroke. A control that can't persist its effect isn't offered.

#### The render-site contract (load-bearing)

Each `SlotContentSpec.format` has a matching render primitive. Declaring the format in the adapter is only half the wiring — the template's render site is the other half, and both halves are gated by `npm run validate:registrations` (§4.16).

| Slot | Renders through | Why |
|---|---|---|
| `format: 'html'` | `<RichText html={…} />` | Stores real HTML; a React text child escapes it → literal `<strong>` / `<div>` on canvas *and* export. |
| `format: 'plain'`, multi-line | `<PlainText text={…} />` | Stores a literal `\n`; HTML collapses it → the user's line break vanishes on commit. |
| `format: 'plain'`, single-line | plain text child | Can hold neither a tag nor a newline; needs no primitive. |

"Multi-line" means the factory would allow Enter: `singleLine` not `true`, and not `kind: 'cta'` (which defaults to single-line).

Both shapes, in both template tracks:

```tsx
import { RichText } from '@/components/shared/RichText'
import { PlainText } from '@/components/shared/PlainText'

// ContentStack (Track 1)
defaultInner: <RichText html={headline || SLOT_PLACEHOLDERS.headline} />
// Track 2
{wrapInline('headline', <RichText html={headline || SLOT_PLACEHOLDERS.headline} />)}
// multi-line plain
{wrapInline('subhead', <PlainText text={subhead || SLOT_PLACEHOLDERS.subhead} />)}
```

Both primitives carry a canonical class — `.dd-rich-text` and `.dd-plain-text` — whose rules live **once** in `app/globals.css`, inherited by the editor and the Puppeteer render route alike. So bold reads as Fakt Pro Medium (500) rather than the browser default 700 everywhere, and a `\n` survives as a line break. `InlineTextEdit` applies `.dd-rich-text` too, so the editing view matches the committed view matches the export. Per-template deviations layer a second class on top (`<RichText className="exec-rich-text" …>`, double-class selector so it wins on specificity, not stylesheet order); they never restate the canonical rules.

**Why this needed a gate rather than a doc.** The legacy sidebar editor gated rich text behind a hardcoded template allow-list (still visible in `EditorScreen.tsx`), and only those templates ever had their render sites converted to accept HTML. The Stage & Bench migration then handed `format: 'html'` to *every* template's headline/subhead/body. Nothing connected the two halves, so 21 slots across 11 templates shipped rendering escaped markup — invisible until a user actually pressed ⌘B or Enter. `TEMPLATES.md` had documented the rule the whole time; documentation alone did not hold it. Consolidating 14 copy-pasted `RICH_TEXT_STYLES` blocks (under 8 class names) into one rule set removed the substrate-level cause; the validator prevents the next instance.

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

`action-row/ActionRow.tsx` + `ui/ActionButton.tsx`. The shared "Preview / Add to Queue / Export" row. `StageBenchActionRow` is the bench-screen wrapper that hides "Add to Queue" when editing from the queue, and renders the export-resolution selector (`ui/ExportScaleSelect`, 1×/2×/3×) just before Export — one shared picker, used here and in the legacy editor toolbar.

### 4.13a Asset breadcrumb (Stage Bench Header)

`StageBenchHeader.tsx` renders the asset tab as `<SUBCHANNEL LABEL> / <TEMPLATE LABEL>` (e.g. "EMAIL BANNER / GRID DETAILS"). Both halves come from `lib/template-config.ts`: `TEMPLATE_SUBCHANNEL_LABEL` (derived from the template's placement in `SUBCHANNELS`, honoring `TemplateInfo.channelLabel` overrides) and `TEMPLATE_LABELS`. Slotting a template into the right `SUBCHANNELS` entry lights up the prefix automatically — no per-template wiring. Editor tab + homepage filter chip stay aligned because they read the same source.

### 4.14 Editbar (per-kind contextual toolbars)

`components/canvas-editor/editbar/`. All built out. New kinds add a new file here AND an entry in `ContextualToolbar.tsx`'s `EDITBAR_BY_KIND` table.

| File | Kind | Composition |
|---|---|---|
| `EditbarText.tsx` | `text` | EyeOff · Bold · Italic · A↑ · A↓ · LineHeight popout |
| `EditbarCta.tsx` | `cta` | EyeOff · Style toggle (link/button) · A↑ · A↓ · Arrow color |

> The link/button **Style toggle** flips the shared `ctaStyle` and shows on every `kind:'cta'` slot, but is only *meaningful* where a template's CTA chrome branches on `ctaStyle` (custom-size + the social gradients today). Gating it off rigid templates is open — see `SUBSTRATE-DEBT.md`.
| `EditbarImage.tsx` | `image` | Change · Generate (ghosted until API) · Edit |
| `EditbarCategory.tsx` | `pill` | EyeOff · Category dropdown |
| `EditbarChip.tsx` | `chip` | EyeOff · Replace icon (opens `IconPickerModal`). Label stays inline-editable (Editable allows `kind:'chip'`). First used by `executive-overview` detail chips. |
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
```

Defaults are identity (`(_id, content) => content`). The export render page never passes them — by construction, export output equals editor output for the same store state.

**Nested groups** (per-speaker name/role/avatar, per-card fields, etc.) flow through these same render-props using flat child `blockId`s. The factory's `SlotDescriptor.parent` and `AdapterDescriptor.childImages` configs handle the per-child wiring; templates just nest `wrapBlock(childId, ...)` inside the parent group. No per-template render-prop indirection.

### 4.16 Registration validator

`scripts/validate-registrations.ts` — runnable via `npm run validate:registrations`. Required-passing before merging template work. Two static checks:

1. **Visibility-flag wiring.** For each adapter, every toggleable slot (one with `setVisible: setShow*` wired in `slotState`) is referenced in both the registration's `renderProps` and `exportBuilder`. Accepts direct LHS keys (`showFoo: s.showFoo`) AND RHS rename patterns (`showRenamed: s.showFoo`). Catches the class of bug where a user-toggleable flag silently drops out of the export pipeline.

2. **Text render sites.** Every `format: 'html'` slot must render through `<RichText>`, and every multi-line `format: 'plain'` slot through `<PlainText>` (§4.7). The script resolves the adapter's `templates/` imports, locates each slot's render site (`defaultInner:` for ContentStack, `wrapInline('id', …)` for Track 2), and fails if the site doesn't use the right primitive. A render site it cannot locate is reported as a failure too — silence never counts as a pass. Applies to computed-slot adapters as well; the format↔render-site contract is independent of how the slot set is resolved.

### 4.17 Telemetry hooks

`useTelemetry()` and `trackEvent()` (`lib/telemetry.ts`) emit fire-and-forget events to `POST /api/track`. The factory wires 4 events internally — `slot_edited` (on `editingPath` end), `block_dragged_to_bench` (hide), `block_restored_from_bench` (show), `variant_changed` (stage-bar setter wrap). The store emits `asset_queued` from `addToQueue`; the export route emits `asset_exported`. See `ARCHITECTURE.md` → "Telemetry" for the wire format and admin view.

---

## 5. The adapter pattern

`StageBenchEditor.tsx` reads the per-template adapter from a central registry:

```ts
// components/canvas-editor/StageBenchEditor.tsx
const Adapter = getStageBenchAdapter(props.currentTemplate)
```

That lookup pulls from `lib/stage-bench-registry.ts`'s `REGISTRATIONS` array — the single source of truth that feeds the adapter dispatch, the `template-registry` consumed by Puppeteer, and the `export-params` builder. Adding a template = one Registration entry; the four downstream registries pick it up automatically.

All 28 adapters are produced by the **factory**:

```ts
// components/canvas-editor/factory/defineStageBenchAdapter.tsx
export const Foo = defineStageBenchAdapter<FooBlockId>({
  templateId: 'foo',
  slots: [...],
  stageBar: [...],
  image: {...},        // optional — single top-level image
  childImages: [...],  // optional — nested per-blockId image slots
  category: {...},     // optional — solution-pill chip
  contentStack: {...}, // optional — Track 1 spacing primitive
  useStoreBindings: () => ({...}),
  renderTemplate: (ctx) => <Foo {...} />,
})
```

The factory owns the React wiring: store subscriptions, FLIP reflow, drop targets, stage-bar dispatch, registry providers, image-editor modal, contextual toolbar, selection ring. Adapters stay declarative.

Reference implementations by shape: see the table in `TEMPLATES.md` → "Adding a New Template" → "Reference templates."

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
| 1 | Sidebar fate on migrated templates | **Collapse entirely.** The 340px reclaims as Stage area. (Sidebar form survives only for the 3 PDFs.) |
| 2 | Visibility toggle location | **Bench, not sidebar.** Every kind's editbar has an EyeOff button → `VisibilityRegistry.hide()`. |
| 3 | CTA is its own kind | **Yes.** `EditbarCta` is separate from `EditbarText`. No Bold/Italic — CTA styling is template-controlled. |
| 4 | Stack alignment scope | **Canvas-wide (Stage Bar).** One value per asset. Group selection isn't a v1 primitive. |
| 5 | Inline text editor implementation | **Custom uncontrolled contentEditable** (`InlineTextEdit.tsx`), not Tiptap. The uncontrolled approach sidesteps React reconciliation conflicts; Tiptap's bundle weight isn't justified for slot-scoped editing. |
| 6 | Rich-text vs plain-text format | **Per-slot.** `SlotContentSpec.format` declares; `InlineTextEdit.format` matches; B/I disabled on plain in both modes (toolbar *and* the native ⌘B/I/U). The render site must use the primitive matching the format — `<RichText>` / `<PlainText>` — since declaration and render site are two halves of one contract, gated by `validate:registrations` (§4.7, §4.16). |
| 7 | Selection identity | **Path-based** (`<templateId>.<slotKey>`), not UUIDs. Templates are rigid; paths are stable. |
| 8 | Slot identity vs store keys | **Decoupled.** Slot path is for toolbar scoping; the storeKey is the actual write target. Same content surfaces across templates that share store keys (headline, ctaText, etc.) — this is intentional. |
| 9 | Drop-target plumbing | **Factory-owned via `useStageBenchDroppables(slots)`.** Adapters do not write `onDropToStage` / `onDropToBench` handlers. |
| 10 | Toolbar anchor per kind | **Factory-owned via `ANCHOR_BY_KIND`.** Image inset; everything else above. Adapters do not position toolbars. |
| 11 | DnD library | **Custom pointer-events** (`lib/dnd/`), not react-dnd / dnd-kit. We needed full control of cursor-follower preview + settleTo animation. |
| 12 | History (undo/redo) | **Not built.** `commands.ts` exists as a stub for future use; no commands registered. Direct setter calls today. Re-evaluate when multi-step edit flows demand it. |
| 13 | Multi-select | **Out of scope for v1.** Foundation assumes single selection. |
| 14 | Image lightbox modal | **`ImageEditorModal` with embedded library view.** Universal modal contract via `ImageSlotSettings`. Factory mounts one modal per top-level image slot; `childImages` config adds per-blockId modal state for nested image children (per-speaker avatars). Opens to the **library view when the slot is empty** (no src), the editor view otherwise — an empty src in the editor view would sit on a perpetual "loading…". |
| 15 | Adapter form | **Factory-driven.** Every adapter uses `defineStageBenchAdapter`. Zero hand-rolled adapters. |
| 16 | Nested editing (per-card patterns) | **Flat blockIds + `parent` reference.** A child slot declares `parent: 'parentBlockId'` so it's excluded from the bench surface; deep-click cascades via DOM ancestor walking in `Editable.tsx`. Same pattern for text and image children. |

### 8.1 Adapter factory

Every adapter is produced by `defineStageBenchAdapter` (`components/canvas-editor/factory/defineStageBenchAdapter.tsx`). The factory absorbs registry wiring, droppables, FLIP, drag preview-key, render dispatchers, image-editor modal, and stage-bar selectors. Per-template work is a declarative descriptor (slots, stage-bar items, optional image / childImages / category / contentStack configs) plus two small functions: `useStoreBindings()` for store reads and `renderTemplate(ctx)` for the template's JSX. The "Adding a New Template" checklist in `TEMPLATES.md` walks through the full shape.

### 8.2 Visibility-flag naming

**Use generic flags when the store field is template-agnostic.** If a slot's visibility is controlled by a flag that any template could reuse (`showEyebrow`, `showHeadline`, `showSubhead`, `showBody`, `showCta`, `showSolutionSet`), use the generic name. These flags are global in the store and shared across templates.

**Prefix template-specific flags with a short template key.** If a slot's store field is shared across N templates but visibility decisions are per-template, prefix the flag with the template's short name: `showCceEventDate` (Cority Connect 2026 event date), `showSignatureWorkshopName` (signature workshop name), etc. The prefix prevents cross-template visibility coupling.

Don't rename existing flags that already follow this rule. Audit only when you add a new flag, and pick the right form based on whether the underlying field is shared.

### 8.3 Slot bench-toggle-ability

**Rule:** if a slot appears in the bench (the chip list), it has a `show<Field>` visibility flag. If a slot is always-on (logo, brand-locked anchor, mandatory headline, baked-in decorative chrome), it has no flag and no bench chip — declare `benchable: false` in the slot descriptor.

This is the rule the migration mostly followed. Don't add `show*` flags to slots whose design contract is "always on" — that's design drift dressed up as user control.

Decorative chrome (dividers, borders, baked-in shapes) stays visible always. It is not editable and not bench-able. Wrap it in `<Editable>` only if you need a selection ring for navigation feedback — never as a toggleable slot.

### 8.4 Block existence is independent of content

**Rule:** a slot renders whenever its `show*` flag is true, regardless of whether the user has typed anything yet. Never gate visibility on content presence (`showEyebrow && !!eyebrow`, `showSubhead && hasSubhead`, etc.).

Why: WYSIWYG editing depends on the slot existing on stage so the user can double-click into it. If the block only renders when content is present, the user can't get into edit mode for an empty slot — and they can't add content without entering edit mode.

How to implement, by template paradigm:

- **ContentStack (Track 1):** in the block's `defaultInner`, fall back to the placeholder string when the value is empty (e.g. `defaultInner: <RichText html={subhead || 'Subheadline'} />` for an `html` slot, or `defaultInner: subhead || 'Subheadline'` for a `plain` one — see §4.7). `renderChrome` already wraps the inner; the placeholder inherits the chrome's styling.
- **Track 2 (inline `wrapInline`):** put the styled wrapper *outside* `wrapInline` (see §8.5 below) and pass `value || 'Placeholder'` into the body that `wrapInline` receives.

#### Canonical placeholder strings

Canonical placeholders live in `lib/slot-placeholders.ts` as the constant `SLOT_PLACEHOLDERS`. Templates import it for `defaultInner: value || SLOT_PLACEHOLDERS.foo` fallbacks; adapter slot descriptors import it for `content: { placeholder: SLOT_PLACEHOLDERS.foo }`. Editor preview and Puppeteer export read the same string for empty slots — one source of truth.

Keys: `eyebrow`, `headline`, `subhead`, `subheading`, `body`, `metadata`, `cta`, `eventDate`, `eventLocation`, `eventTime`, `workshopName`, `speakerName`, `speakerRole`, `gridDetail1`–`gridDetail4`.

Eyebrow strings live in mixed case in source; CSS `text-transform: uppercase` handles the rendered casing.

**When to override the canonical:** event-specific templates (EHS+ Accelerate, Cority Connect, Customer Exchange) keep their flavored defaults inline so the editor preview reads like a real banner instead of a blank scaffold. EmailProductRelease keeps `Product Release` / `GX2 2026.1` for the same reason. The rule of thumb is *would a non-designer expect to see this default copy on first open?* If yes, inline a flavored default; if no, import from `SLOT_PLACEHOLDERS`.

### 8.5 Styling wrappers live outside `wrapInline`

**Rule:** when an editable block is replaced by `InlineTextEdit` (on double-click), the styled wrapper must survive the swap. Put the styled `<div className="rich-text" style={{...}}>` *around* the `wrapInline(...)` call, not inside the JSX that `wrapInline` receives.

```tsx
// ❌ Wrong — styling is INSIDE wrapInline, gets replaced on edit
wrapInline('headline', (
  <div className="rich-text" style={{ color, fontSize, fontWeight }}>
    {headline || 'Headline'}
  </div>
))

// ✅ Right — styled wrapper survives the editor swap
<div style={{ color, fontSize, fontWeight }}>
  {wrapInline('headline', <RichText html={headline || 'Headline'} />)}
</div>
```

(`<RichText>` because `headline` is an `html`-format slot — see §4.7. A `plain` slot passes `<span>{value || 'Placeholder'}</span>` instead.)

For ContentStack templates the `renderChrome` callback already implements this pattern — `renderChrome((inner) => <styled-wrapper>{inner}</styled-wrapper>)` wraps the inline editor when it takes over from `defaultInner`. Track 2 templates have to hand-wire it.

CTA blocks that include an `ArrowIcon` next to text: the arrow stays outside `wrapInline` so it doesn't vanish during edit. Pattern: a flex container holds both the `wrapInline(...)`-wrapped text and the static `<ArrowIcon />`.

---

## 9. Known limits

1. **No automated export diff.** Export visual regressions are eyeball-verified post-change. `npm run validate:registrations` covers the show-flag pipeline but doesn't catch visual drift.
2. **History / undo deferred.** Multi-step edit flows (resequencing, batch operations) would need it; until then, direct setter calls are simpler than a command bus.
3. **Per-speaker filter persistence** — `EmailSpeakers` and `WebsiteWebinar` speaker avatars feed `NEUTRAL_FILTERS` into the editor modal; the modal sliders move locally but don't persist across opens. Wiring 3× per-speaker `imageFilters` store fields is the follow-up if real-world feedback demands it.
4. **Single-element selection.** Multi-select is not in v1.

Open substrate work lives in `SUBSTRATE-DEBT.md` — currently one entry (image-source-key for newsletter dark/light variants).

---

## 10. Multi-page templates (page selector)

> **Status.** Substrate primitive shipped for the first fixed multi-page collateral (`executive-overview`, 2 pages). Single-page templates are entirely unaffected — the primitive is dormant unless an adapter declares `pages`.

The multi-page paradigm the postmortem flagged as "would need a different shell (page selector inside the stage column)" is exactly this: **one page is on stage at a time**, switched by a pager. This preserves every single-canvas assumption — one active stage, one bench reflecting the current page's slots, single-element selection (§2, §8 decisions #4/#6/#13). It is *not* a multi-canvas / free-scroll surface.

**The pieces:**

- **`currentStagePage`** (`store/canvas-editor.ts`) — ephemeral editor UI state (1-based), sibling to `selection`/`editingPath`. `setCurrentStagePage(n)` also clears `selection` + `editingPath` so a stale ring / inline editor doesn't trail across the page swap.
- **`PageSelector`** (`stage-bench/PageSelector.tsx`) — pure segmented pager. Rendered in the stage column via the shell's `aboveStage` seam. Distinct from the header's asset tabs (which switch *assets*); this switches *pages within one asset*.
- **`StageBenchShell.aboveStage`** — optional center-column slot above the Stage (mirrors the existing `belowStage`). Single-page templates pass nothing.
- **Factory (`defineStageBenchAdapter`)** — an optional `pages: { count, labels }` descriptor. When present the factory: (a) reads/clamps `currentStagePage` → `currentPage`; (b) passes `currentPage` as the **second arg to the `slots` resolver** so the adapter returns *the current page's slots* (the bench, droppables, FLIP, registries all follow automatically); (c) exposes `ctx.currentPage` so `renderTemplate` renders the active page; (d) renders the `PageSelector`; (e) resets to page 1 when the asset changes. `descriptor.slots` may now be an array (single-page, unchanged) or `(bindings, page) => SlotDescriptor[]`.

**Adapter contract for a multi-page template:**

1. Declare `pages: { count, labels }`.
2. Make `slots` a resolver: `(bindings, page) => page === 1 ? PAGE1_SLOTS(bindings) : PAGE2_SLOTS(bindings)`.
3. In `renderTemplate(ctx)`, branch on `ctx.currentPage` to render the matching page component (each page is its own `components/templates/<Name>/PageN.tsx`, threaded with `ctx.renderBlock`/`renderInlineEditor`).
4. `useStoreBindings` must return `slotState` for **all** blockIds across all pages (bench/registries only read the current page's, but the render context resolves text/visibility for whichever page is mounted).

**Invariants preserved:** export purity is untouched — the render route renders **all** pages (page-break-separated) with identity render-props, so editor-page N is byte-identical to export-page N. `currentStagePage` is editor-only and never enters the export params. Selection stays single-element (only the on-stage page has interactive slots).

**Preview (all pages).** The editor's Preview lightbox shows one page (the registration's `Template`) for single-page templates. Multi-page templates add an optional **`renderPreview(asset, colors, typography)`** to their registration (carried into `TemplateRegistryEntry`) that returns all pages stacked; the S&B lightbox renders it when present. So Preview shows the whole asset, matching export.

**Deferred (see `SUBSTRATE-DEBT.md`):** page reordering / add-remove (fixed-count only for v1); cross-page slot references; per-page thumbnails in the pager.

---

## 11. References

- `components/canvas-editor/factory/defineStageBenchAdapter.tsx` — the factory; lone canonical adapter entry point.
- `lib/stage-bench-registry.ts` — central registry feeding adapter dispatch + template-registry + export-params.
- `components/canvas-editor/Editable.tsx` — selection / deep-click / drag-source wiring; the foundation every adapter sits on.
- `components/canvas-editor/InlineTextEdit.tsx` — contentEditable text editor; `format: 'html'` preserves bold/italic.
- `components/canvas-editor/editbar/EditbarText.tsx` — bold/italic + font-size + line-height + visibility toolbar.
- `components/shared/RichText.tsx` / `PlainText.tsx` + `.dd-rich-text` / `.dd-plain-text` in `app/globals.css` — the one way to render each slot format's value (§4.7).
- `scripts/validate-registrations.ts` — static validator for the export-pipeline visibility-flag wiring **and** the slot-format render-site contract.
- `lib/telemetry.ts` + `/api/track` + `/admin/events` — telemetry shell.
- `app/stage-bench-atoms/page.tsx` — visual lab for substrate primitives (Editbar variants, BenchChip kinds, etc.).
- For the historical journal of how the substrate was built: `STAGE-BENCH-REFACTOR-POSTMORTEM.md`.
- For "how to add a new template": `TEMPLATES.md` → "Checklist: Adding a New Template".
