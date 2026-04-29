# Stage & Bench Editor — Plan

> Branch: `feature-drag-editor`
> Status: Phase 3 in progress · contextual toolbar shipped, Bench prototype shipped on EmailDarkGradient
> Pilot template: EmailDarkGradient

This document is the planning artifact for moving Design Dog's editor from "sidebar form + passive preview" to **Stage & Bench**: click any element on the design (the **Stage**) to edit it directly via a contextual toolbar; toggle visibility off and the slot parks on the **Bench** — a vertical chip rail in the negative space beside the Stage. Drag a chip back onto the Stage to restore the slot. Templates remain structurally rigid; users edit *content within* declared slots, not layout. The substrate (`components/canvas-editor/`) absorbs lessons from the Milo canvas editor and the existing Stacker spacing-handle implementation.

**Vocabulary**:
- **Stage** — the design itself; the editable surface where slots are "in play."
- **Bench** — the rail of parked/hidden slots, anchored to the preview pad's negative space (portaled out of the Stage's scaled-transform tree).
- **Toolbar** — the contextual editor that follows selection on the Stage (`EditbarText`, `EditbarImage`, `EditbarColor`).
- **Slot** — a template-declared editable element (`email-dark-gradient.headline`, etc.).
- **VisibilityRegistry** — the per-template slot table that drives both Bench chips and the toolbar's eye-off button.

---

## 1. Goal & Non-Goals

### What we're building
- **Click-to-select**: Clicking any editable element on a template selects it and shows a contextual toolbar.
- **Direct manipulation**: Spacing drag handles, image swap, color picks, text edits all happen in or next to the design itself, not (only) in a sidebar.
- **Substrate first, templates second**: The first deliverable is reusable infrastructure — selection model, `<Editable>` primitive, command dispatch, capability registry, history. The pilot template is the proof.
- **Coexists with sidebars**: Templates not yet migrated keep their form-based editor. Both UIs write to the same store.

### What we're NOT building
- Not a free-composition canvas. Templates remain rigid: users edit *content within* defined slots, not *layout* of slots.
- Not Fabric/Konva/PixiJS. We keep React/DOM rendering — non-negotiable, because the export pipeline reads the same DOM through Puppeteer.
- Not AI-driven layout generation (that's Milo's territory).
- Not a replacement for the sidebar — it's an additional, more direct editing surface.
- Not multi-select (initially). Single selection only in v1.
- Not snap-to-grid, alignment guides, or freeform positioning.

### Constraints we must preserve
- **Export pipeline contract**: `exportParams` mirrors visible props; render page must keep producing identical PDFs/PNGs.
- **Rigidity**: Slots are declared in template code; users cannot add or remove slots.
- **Two state systems** (per CLAUDE.md): auto-create vs manual flow remain separate. The substrate plugs into both.
- **Local-state-syncs-to-store** rule (per ARCHITECTURE.md): any new local state in editors must `useEffect`-sync to the Zustand store for draft persistence.

---

## 2. Architecture

### 2.1 Selection model (Zustand slice)

Add to `store/index.ts`:

```ts
type EditableKind = 'text' | 'image' | 'spacer' | 'color' | 'pill' | 'group'

type Selection = {
  path: string                  // editable identity, e.g. 'email-dark-gradient.headline'
  kind: EditableKind
  templateId: string
  storeKey: string              // shared store field this slot writes to, e.g. 'headline'
  capabilities: CapabilitySet   // intersection across selected nodes (future-proof for multi)
  bounds?: DOMRect              // captured on select for toolbar positioning
} | null

type EditorMode = 'idle' | 'text-edit' | 'crop' | 'drag-spacer'

interface CanvasEditorSlice {
  selection: Selection
  hover: { path: string; kind: EditableKind } | null
  mode: EditorMode

  setSelection: (next: Selection) => void
  setHover: (next: CanvasEditorSlice['hover']) => void
  setMode: (mode: EditorMode) => void
  clearSelection: () => void
}
```

**Identity scheme**: `{templateId}.{slotKey}` — stable, declarative, lives in template code. Example: `email-dark-gradient.headline`, `email-dark-gradient.body`, `email-dark-gradient.cta`, `email-dark-gradient.spacer-headline-body`.

Why path-based and not UUIDs (Milo's choice): templates are rigid, so paths are static. UUIDs would force us to maintain an ID registry per asset, which is overhead with no benefit in a non-freeform world.

**Path → store key indirection** (phase-0 finding): The Design Dog store is *not* namespaced per template. Fields like `headline`, `body`, `ctaText`, `eyebrow`, `subhead`, `bottomSpacing` are shared scalar fields on the root Zustand store, and the same campaign content surfaces across EmailGrid, EmailDarkGradient, SocialDarkGradient, etc. So slot identity (`email-dark-gradient.headline`) is for *toolbar/selection scoping*; the *write target* is the shared store key (`headline`). `<Editable>` declares both:

```tsx
<Editable
  templateId="email-dark-gradient"
  slotKey="headline"
  storeKey="headline"   // shared field; same content reused across templates by design
  kind="text"
>
  ...
</Editable>
```

This is intentional — when a user edits a headline in one template, it propagates to every template that uses it, which matches the existing UX. The substrate must preserve that behavior.

### 2.2 The `<Editable>` primitive

```tsx
// components/canvas-editor/Editable.tsx

type EditableProps = {
  templateId: string
  slotKey: string
  kind: EditableKind
  capabilities?: Partial<CapabilitySet>  // overrides defaults from kind
  children: React.ReactNode
  // The element this wraps — usually a div/span/img.
  // In edit mode, we add hover/select rings + click handler.
  // In export mode, we render only children.
}
```

Behavior:
- **Edit mode** (`useCanvasMode() === 'edit'`): wraps `children` in a div with `data-editable-path`, hover ring on mouseenter, selection ring when selected, `onClick` → `setSelection({ path, kind, ... })`. Captures `getBoundingClientRect()` on select for toolbar positioning.
- **Export mode** (Puppeteer render page): the wrapper collapses to `<>{children}</>`. Zero DOM impact, zero CSS impact, no event handlers.

Mode is determined by a `<CanvasEditorProvider mode="edit | export">` near the root of each surface. Render pages mount with `mode="export"` and never see selection state.

Critical: rings/handles use absolutely-positioned overlays driven by `getBoundingClientRect`, not borders/outlines on the children themselves — this guarantees zero layout shift between edit and export.

### 2.3 Capability registry

```ts
// components/canvas-editor/capabilities.ts

type CapabilitySet = {
  canEditText: boolean
  canSwapImage: boolean
  canCropImage: boolean
  canRecolor: boolean
  canDragSpacing: boolean
  canTogglePill: boolean
}

const DEFAULTS_BY_KIND: Record<EditableKind, Partial<CapabilitySet>> = {
  text:   { canEditText: true, canRecolor: true },
  image:  { canSwapImage: true, canCropImage: true },
  spacer: { canDragSpacing: true },
  color:  { canRecolor: true },
  pill:   { canTogglePill: true, canRecolor: true },
  group:  {},
}
```

Each `<Editable>` inherits defaults from its `kind` and can opt in/out via the `capabilities` prop. The toolbar reads `selection.capabilities` and renders only applicable controls. Adding a new node type = adding a row to `DEFAULTS_BY_KIND` plus a toolbar fragment.

### 2.4 Command dispatch

```ts
// components/canvas-editor/commands.ts

type Command<T = unknown> = {
  id: string                              // e.g. 'text.update'
  appliesTo: EditableKind[]
  apply: (state: AppState, args: T) => AppState  // pure mutation
}

const registry = new Map<string, Command>()
export const registerCommand = <T,>(cmd: Command<T>) => registry.set(cmd.id, cmd)

export const dispatch = <T,>(commandId: string, args: T) => {
  const cmd = registry.get(commandId)
  if (!cmd) throw new Error(`Unknown command: ${commandId}`)
  useStore.setState(state => cmd.apply(state, args))
}
```

Initial command set:
- `text.update` — `{ path, value }` → updates store field for that slot
- `image.swap` — `{ path, src }`
- `image.crop` — `{ path, transform: { scale, offsetX, offsetY } }`
- `spacing.set` — `{ path, value }` (clamped 0–96 like Stacker)
- `color.set` — `{ path, color }`
- `selection.set` / `selection.clear` — also commands so they enter history

Each command is the single mutation seam. Toolbars never `setState` directly.

### 2.5 ContextualToolbar

```tsx
// components/canvas-editor/ContextualToolbar.tsx

export const ContextualToolbar = () => {
  const selection = useStore(s => s.selection)
  if (!selection) return null

  const toolbarPos = computeToolbarPosition(selection.bounds)
  const fragments = TOOLBAR_FRAGMENTS_BY_KIND[selection.kind]

  return createPortal(
    <div className="canvas-toolbar" style={{ top: toolbarPos.y, left: toolbarPos.x }}>
      {fragments.map(F => <F.Component key={F.id} selection={selection} />)}
    </div>,
    document.body
  )
}
```

- One toolbar component, content varies by `selection.kind`.
- Fragments: `<TextEditFragment>`, `<ImageSwapFragment>`, `<SpacerDragFragment>` (note: most spacer interaction happens on the handle itself, but the fragment shows the numeric value), `<ColorPickerFragment>`.
- Position: above the selection if there's room, below otherwise. Pinned to viewport edges if necessary.
- Renders via React portal so it's not clipped by template overflow.

### 2.6 History (Zundo)

```bash
npm install zundo
```

Wrap the canvas editor slice with `temporal()`. Bind `Cmd+Z` / `Cmd+Shift+Z` at the editor screen level. Configure:
- 40-frame history limit (matches Milo)
- `partialize` to only track canvas-relevant fields (skip ephemeral hover/mode)
- `equality` function to dedupe redundant frames
- **Pause history during gestures** (drag spacing, drag crop) — commit one frame on `pointer:up` only. This is the single most important detail Milo learned the hard way.

### 2.7 File layout

```
components/canvas-editor/
├── Editable.tsx              # The wrapper primitive
├── CanvasEditorProvider.tsx  # Mode + portal target context
├── ContextualToolbar.tsx     # Floating toolbar
├── capabilities.ts           # Kind → default capabilities map
├── commands.ts               # Command registry + dispatch
├── selection.ts              # Selection helpers, bounds calc
├── history.ts                # Zundo config + keyboard bindings
├── handles/
│   ├── SpacingHandle.tsx     # Generalized from StackerSpacingHandle
│   └── (image crop, etc.)
└── fragments/
    ├── TextEditFragment.tsx       # Popover input v1
    ├── ImageSwapFragment.tsx
    ├── SpacerDragFragment.tsx     # Numeric readout
    └── ColorPickerFragment.tsx

store/index.ts                # Add CanvasEditorSlice
```

---

## 3. Pilot: EmailDarkGradient

### 3.1 Why this template
- Already has a `BottomSpacingHandle` — the only template besides Stacker with a drag handle. Migrating it is a forcing function: prove the substrate without regressing existing functionality.
- Mid-complexity: image, headline, body, CTA, optional pill, optional logo. Exercises text + image + spacer + (color, optionally) capabilities in one template.
- Workhorse template — high enough usage that the UX win is felt.

### 3.2 Slot inventory (finalized — phase 0 complete)

Read of `components/templates/EmailDarkGradient.tsx`:

| Slot path | Kind | Store key | Visibility gate | Notes |
|---|---|---|---|---|
| `email-dark-gradient.background` | `color` | `colorStyle` | always | Picks 1 of 4 preset gradient backgrounds (`'1'..'4'`). Not user-uploadable image. |
| `email-dark-gradient.eyebrow` | `text` | `eyebrow` | `showEyebrow` | Plain text, uppercase styling applied via CSS. |
| `email-dark-gradient.headline` | `text` | `headline` | `showHeadline` | Rich text (HTML, supports `<strong>`, `<em>`, `<br>`). Has `headlineFontSize`. |
| `email-dark-gradient.subhead` | `text` | `subhead` | `showSubhead` | Rich text. Has `subheadFontSize`. |
| `email-dark-gradient.body` | `text` | `body` | `showBody` | Rich text. |
| `email-dark-gradient.cta` | `text` | `ctaText` | `showCta` | Plain text. Style toggled by `ctaStyle` (`'link' \| 'button'`). |
| `email-dark-gradient.spacer-bottom` | `spacer` | `bottomSpacing` | `!showCta` | Drag handle only appears when CTA is hidden — adds extra bottom padding to push text up. Currently driven by `BottomSpacingHandle` in `EditorScreen.tsx:110`. |

**Slots intentionally not in v1:**
- Logo (Cority logo, brand-locked, no per-asset variation).
- `alignment` (`'left' \| 'center'`) — applies to whole template, not a slot. Stays in sidebar.
- `ctaStyle` (`'link' \| 'button'`) — applies to the CTA slot but is a *style* control, not a content edit. Could surface in the CTA toolbar later; punt for v1.
- `headlineFontSize` / `subheadFontSize` — punt; sidebar control stays.

**Visibility behavior**: a hidden slot (e.g. `showHeadline=false`) renders nothing in the DOM, so there's nothing to click. Toggling visibility stays in the sidebar for v1. Phase 5 decision: do we add a "ghost slot" placeholder when off, or keep visibility as a sidebar-only concern?

### 3.3 Migration steps

1. Wrap each slot in EmailDarkGradient.tsx with `<Editable templateId="email-dark-gradient" slotKey="..." storeKey="..." kind="...">` per the inventory in §3.2.
2. Generalize the spacing handle: `StackerSpacingHandle.tsx` and `BottomSpacingHandle` (in `EditorScreen.tsx:110`) collapse into `components/canvas-editor/handles/SpacingHandle.tsx`. The `BOTTOM_SPACING_RANGES` table at `EditorScreen.tsx:100-107` (covers 7 templates: website-press-release, website-webinar, website-report, 4 newsletters) becomes a per-slot config the new `SpacingHandle` reads via its `path`.
3. Replace EmailDarkGradient's existing `BottomSpacingHandle` usage at `EditorScreen.tsx:4919` with `<SpacingHandle path="email-dark-gradient.spacer-bottom" direction="up" />`. Stacker's call sites swap to the same component but keyed by their own paths. Verify Stacker still works before touching anything else.
4. Confirm export render pages (Puppeteer-rendered) mount with `<CanvasEditorProvider mode="export">`. Verify no visual diff in PDF/PNG output (compare before/after exports for one EmailDarkGradient asset and one Stacker asset).
5. Wire the editor screen to mount `<CanvasEditorProvider mode="edit">` and render `<ContextualToolbar />`.
6. Smoke-test: click each visible slot, verify toolbar appears with the right controls, edit each, verify edits persist to the store, survive a page reload, and round-trip through the sidebar form (sidebar edit shows up on canvas, canvas edit shows up in sidebar).
7. Sidebar form for EmailDarkGradient: leave intact. Both surfaces drive the same store keys; either edits the same data.

### 3.4 Done criteria for the pilot
- Clicking any element shows the contextual toolbar.
- Spacing drag works exactly as today (no regression).
- Text edits via popover work and persist.
- Image swap works.
- Cmd+Z / Cmd+Shift+Z undoes/redoes the last edit.
- PDF export of an edited asset is visually identical to a sidebar-edited equivalent.
- Sidebar form still works; edits round-trip with on-canvas edits.

---

## 4. Phasing & milestones

| Phase | Scope | LOE | Status / Done criteria |
|---|---|---|---|
| **0 — Audit** | Read EmailDarkGradient JSX, finalize slot inventory, confirm store shape | 0.5 day | **Done.** Slot inventory in §3.2; shared-store-fields finding documented in §2.1. |
| **1 — Substrate** | Provider, `<Editable>`, selection slice, command dispatch, capability registry, history, no template changes | 3 days | **Done.** Build clean, `/canvas-editor-test` page renders and proves selection on 5 dummy slots (text, image, color, spacer). See §10 for what shipped + deviations from plan. |
| **2 — Spacing migration** | Generalize `StackerSpacingHandle` → `SpacingHandle`, swap EmailDarkGradient's `BottomSpacingHandle` for it | 1 day | **Done.** Three call sites consolidated (Stacker, FAQ, EmailDarkGradient). `BottomSpacingHandle` and `StackerSpacingHandle` deleted. Build clean; `/editor` route shed ~1 kB. See §9 Phase 2. |
| **3 — Pilot toolbar** | ContextualToolbar + popover text edit + image swap fragment for EmailDarkGradient | 3 days | Pilot done criteria above |
| **4 — Validation** | Test PDF export, draft persistence, undo/redo, second user round-trip | 1 day | No export regressions; undo/redo solid |
| **5 — Decision gate** | Review with Nick: ship as is? upgrade to contentEditable? add color picker? second template? | — | Roadmap for phase 6+ |
| **6 — Second template** | Apply substrate to a social or newsletter template | 1.5 days | Two templates on the new substrate; shared `<Editable>` wrapping is the only template-side change |
| **7+ — Roll out** | Migrate templates one or two at a time | ~1 day each | All templates on the substrate |

**Total to validation gate (phase 5):** ~8.5 days of focused work.

---

## 5. Inline text editing — decision deferred

Phase 3 ships **popover input** (small floating textarea anchored to the selected text, prefilled with current value, commits on Enter or blur, cancels on Escape).

Phase 5 decision gate: do we upgrade to contentEditable?

| Dimension | Popover input | contentEditable (no lib) | contentEditable (Lexical/Tiptap) |
|---|---|---|---|
| Substrate LOE | ~2 days | ~1.5 weeks | ~3–5 days |
| Per-field wiring | ~30 min | ~15 min | ~20 min |
| Bundle cost | 0 | 0 | +50–200KB |
| Caret/IME bugs | none | many | handled |
| Paste-strips-styles | n/a | manual | handled |
| React reconciliation conflict | none | real | handled |
| Browser undo vs Zundo | n/a | conflicts | conflicts |
| Editor↔export divergence risk | low | medium-high | medium |
| "Feels like editing the design" | weak | strong | strong |

The command pattern means the upgrade is local: only `TextEditFragment` changes; commands, store, and render stay identical.

---

## 6. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `<Editable>` wrapper changes layout (padding, margins, z-index) and silently breaks PDF export | Med | High | Wrappers must be position-neutral. Edit-mode rings are absolutely-positioned overlays driven by `getBoundingClientRect`, not borders on children. Visual PDF diff in CI before merging the pilot. |
| Selection bounds drift on scroll/zoom (toolbar appears in wrong place) | Med | Med | `getBoundingClientRect` recomputed on scroll/resize; toolbar uses `IntersectionObserver` or rAF to follow selection. |
| History pollution during drag (60+ frames/sec) | High if not handled | Med | Pause Zundo during gestures, commit one frame on pointer-up. Same fix Milo landed. |
| Stacker breakage when we generalize `SpacingHandle` | Med | High (Stacker is good as-is) | First task in phase 2 is a refactor with green tests on Stacker before we touch EmailDarkGradient. |
| Sidebar and on-canvas edits race / overwrite | Low | Med | Both write through commands → single store → no race. Verify in phase 4 by alternating sidebar and canvas edits in one session. |
| Export render page accidentally mounts `mode="edit"` and embeds toolbar/rings in the PDF | Low | Critical | Provider defaults to `'export'`; only the editor screen explicitly opts into `'edit'`. Snapshot test on PDF output. |
| Popover input feels janky on multi-line headlines or near canvas edges | Med | Low | Edge-clamp the popover; allow textarea to grow vertically. Fall back to "edit in sidebar" link if popover would clip. |
| Capability flags become a lying API as we add edge-case behaviors | Med (over time) | Med | Treat capabilities as a typed contract; add a runtime assertion in `dispatch()` that the command's `appliesTo` includes `selection.kind`. |
| Zundo state size balloons (whole store snapshotted per frame) | Low | Med | Use `partialize` to only track canvas-relevant fields. Cap at 40 frames. |
| Touch / mobile selection (if anyone uses Design Dog on iPad) | Low (desktop-first product) | Low | Out of scope for v1. Document in a follow-up. |

---

## 7. Open questions

1. ~~**Slot ID stability across regenerations.**~~ **Resolved (phase 0):** templates are rigid + slot keys are declared in template code, so they're stable. Content lives in shared root-store fields; regeneration overwrites field values, not slot identities.
2. **Selection clearing UX.** Click outside the design clears selection. What about clicking the sidebar — does that count as "outside"? Tentative: yes, sidebar interaction clears selection unless the sidebar control is editing the selected slot.
3. **Spacer slots in non-Stacker templates.** Phase 0 confirmed 7 templates already use `BottomSpacingHandle`; the substrate must support all of them on day one of the migration even though only EmailDarkGradient is the named pilot. Stacker per-module spacing stays separate (it's `Record<moduleId, number>`, not a single scalar). Verify the new `SpacingHandle` covers both shapes (single scalar + record entry) cleanly.
4. **Color editing scope.** "Recolor" means what — only brand color tokens (preferred) or freeform color picker? For EmailDarkGradient specifically, the `colorStyle` slot is one of 4 preset gradients (`'1'..'4'`), which is brand-locked by design. Other templates may want broader color editing later; brand-tokens-only fits the rigidity rule and matches BRAND.md.
5. **Visibility toggles on canvas.** Per the slot inventory, hidden slots render nothing — there's no DOM to click. Should the canvas show "ghost" placeholders for hidden slots so users can turn them on without going to the sidebar? Decided punt for v1; phase 5 decision.
6. **CTA style on canvas.** `ctaStyle` (`'link' | 'button'`) is a meaningful per-template control. Surface it in the CTA toolbar in v1 or leave in sidebar? Tentative: leave in sidebar for v1 to keep the toolbar focused on text content.
7. **Multi-element grouping.** Some elements (pill + headline) might want to behave as a unit. Punt to phase 6+; declare `kind: 'group'` exists but don't build it yet.
8. **Inline text edit — second decision.** At phase 5 gate, evaluate popover in real use before committing to contentEditable upgrade.
9. **Rich text in popover input** (new). Headline/subhead/body store HTML (`<strong>`, `<em>`, `<br>`). The v1 popover textarea would let users edit the raw HTML or strip formatting on input. Tentative: the popover input edits the *plain-text projection* of the rich text, preserving inline tags only when the user doesn't change them. This is messy enough that it's a strong argument for skipping straight to contentEditable + a real RTE library. Re-decide at phase 5 gate after pilot use.

---

## 8. What this plan does NOT decide

- The visual design of the contextual toolbar (component library? floating chip? Notion-style? Figma-style?).
- The visual design of selection rings (color, weight, radius).
- Keyboard shortcuts beyond undo/redo.
- Whether and how to surface "reset slot to template default" UX (the soft-break override pattern from Milo).
- Multi-template canvas-editor onboarding/tutorial.

These come out of the phase 5 decision gate after we've used the pilot for real.

---

## 9. Implementation log

### Phase 1 — substrate scaffolded

### Files created

| Path | Purpose |
|---|---|
| `components/canvas-editor/types.ts` | `EditableKind`, `EditorMode`, `Selection`, `Hover`, `CapabilitySet` |
| `components/canvas-editor/capabilities.ts` | `DEFAULTS_BY_KIND` map, `resolveCapabilities()` |
| `components/canvas-editor/CanvasEditorProvider.tsx` | Mode context (`'edit' \| 'export'`); click-outside selection clearing |
| `components/canvas-editor/Editable.tsx` | Wrapper primitive; `display: contents` in edit mode, `<>{children}</>` in export mode |
| `components/canvas-editor/ContextualToolbar.tsx` | Floating toolbar (phase 1: shows path + kind only; real fragments come in phase 3) |
| `components/canvas-editor/commands.ts` | Command registry, `registerCommand()`, `dispatch()`, `listCommandsFor()` |
| `store/canvas-editor.ts` | Separate Zustand store for `selection`, `hover` |
| `app/canvas-editor-test/page.tsx` | Test page with 5 dummy slots covering text, image, color, spacer kinds |

### Deviations from plan

1. **Zundo deferred to phase 2.** The plan called for Zundo + temporal middleware in phase 1. There are no commands registered yet (commands ship in phase 2 as part of the EmailDarkGradient migration), so undo/redo has nothing to track. Shipping Zundo against an empty registry is dead weight. Phase 2 will register commands for `text.update`, `image.swap`, `spacing.set`, `color.set`, and at that point we wire history. Leaning toward a custom snapshot-based history manager in `commands.ts` (record `{ before, after }` per dispatch) over Zundo middleware on the main store, because the main store is 2,300 lines with `subscribeWithSelector` middleware and wrapping it is invasive — but final Zundo-vs-custom call deferred to phase 2.
2. **Separate store, not a slice on `useStore`.** Plan §2.1 implied adding `CanvasEditorSlice` to `store/index.ts`. Instead, canvas-editor state (selection, hover) lives in a standalone `useCanvasEditorStore`. Reasons: (a) selection/hover are pure UI state, no overlap with template content; (b) avoids touching a 2,300-line file with established middleware. Content commands in phase 2 will write to the main `useStore` directly via `setState()`; the canvas-editor store stays focused on selection.
3. **`<Editable>` uses `display: contents` for layout transparency.** Confirmed approach from plan §2.2 — wrapper attaches event handlers + data attributes but contributes zero box to layout. `getBoundingClientRect()` reads from `wrapperRef.current.firstElementChild` (the actual rendered content). Constraint: `<Editable>` must wrap a single element child (not a Fragment with multiple roots). All EmailDarkGradient slots in §3.2 satisfy this.
4. **No commands registered yet.** Substrate is operational; toolbar shows selection details only. Phase 2 introduces the first real commands.

### Tiptap finding (changes phase-3 calculus)

`package.json` already includes `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-underline`, `@tiptap/pm`. There are existing `RichTextEditor.tsx` and `SimpleRichTextEditor.tsx` components in the project. **The bundle-cost argument against contentEditable in §5 collapses** — Tiptap is already shipped. The phase-3 inline-text-edit decision should likely jump straight to a Tiptap-based contentEditable rather than popover-textarea, especially given the rich-text concern in §7 Q9 (headline/subhead/body store HTML). To be re-evaluated at phase-2 close before scoping phase 3.

### How to test phase 1 manually

1. `npm run dev`
2. Navigate to `http://localhost:3000/canvas-editor-test`
3. Click each of the 5 dummy slots in turn. Verify:
   - Toolbar appears above the clicked element with the correct path + kind.
   - Selection state pane at the bottom updates with path, kind, storeKey, capabilities, bounds.
   - Hovering over a slot updates the hover state in the pane (path + kind, no bounds).
   - Clicking outside any slot clears the selection.
   - No console errors.

### Phase 2 — spacing handle consolidated

**Files created:**
- `components/canvas-editor/handles/SpacingHandle.tsx` — unified drag-handle component supporting both Stacker-style inline gaps and EmailDarkGradient-style overlay padding.

**Files updated:**
- `components/StackerPreviewEditor.tsx` — import + call site swapped.
- `components/FaqEditorScreen.tsx` — import + call site swapped.
- `components/EditorScreen.tsx` — local `BottomSpacingHandle` definition (~90 lines) deleted; call site swapped; new import added.

**Files deleted:**
- `components/StackerSpacingHandle.tsx` — no remaining consumers.

**Unified `<SpacingHandle>` API:**
```ts
spacing: number
onChange: (value: number) => void
scale: number
direction?: 'down' | 'up'           // default 'down' — drag direction that increases value
mode?: 'inline' | 'overlay'         // default 'inline'
min?: number                        // default 0
max?: number                        // default 96
showUnit?: boolean                  // default false (shows "32" vs "32px")
minInteractiveHeight?: number       // default 6
onAddModule?: () => void            // optional Stacker-only "Add Module" button
```

**Per call site:**

| Site | Notable props |
|---|---|
| Stacker (`StackerPreviewEditor.tsx`) | defaults; `onAddModule` provided |
| FAQ (`FaqEditorScreen.tsx`) | defaults |
| EmailDarkGradient (`EditorScreen.tsx`) | `direction="up"`, `mode="overlay"`, `max={100}`, `showUnit`, `minInteractiveHeight={12}` |

**Corrections to earlier claims:**

1. **Scope was 2 implementations + 3 call sites, not 3 implementations + 7 call sites.** Earlier reports conflated the `BOTTOM_SPACING_RANGES` table I expected to find with an unrelated font-size config table at `EditorScreen.tsx:95-107`. The local `BottomSpacingHandle` was used by **only EmailDarkGradient**, guarded by `currentTemplate === 'email-dark-gradient'`. The third call site I missed was actually FAQ (`FaqEditorScreen.tsx:2329`), which used `StackerSpacingHandle` directly, not via `BottomSpacingHandle`.
2. **`align` prop was unused.** `StackerSpacingHandle` declared an `align: 'center' | 'left'` prop but never read it in render (`justifyContent: 'center'` was hardcoded). FAQ passed `align="left"` and was getting centered behavior. The unified `SpacingHandle` drops the prop entirely; visual behavior preserved across all call sites. If left-align is wanted in FAQ later, it's a deliberate change, not an accidental fix.

**onChange signature change:**
The old `StackerSpacingHandle` took `onChange: (moduleId, value) => void` baked in via a `moduleId` prop. The unified handle takes `onChange: (value) => void` and lets the caller wrap if it needs an ID. Stacker and FAQ call sites now wrap inline (`onChange={(v) => onSpacingChange(moduleId, v)}`); EmailDarkGradient passes the setter directly.

**Behavior preserved:**
- Stacker: inline mode, range 0-96, drag-down increases, no `px` suffix, optional Add-Module button — identical to before.
- FAQ: same as Stacker, same as before.
- EmailDarkGradient: overlay mode, range 0-100, drag-up increases, `px` suffix, 12px min interactive height — identical to before.
- Guide-line opacity standardized to 0.4 (was 0.5 in BottomSpacing, 0.4 in Stacker). Trivial; flag if visible regression appears.

**Build:** clean. `/editor` route went 109 kB → 108 kB (~1 kB dedup win).

**No commands registered yet.** Phase 2 deliberately did not introduce command dispatch — the handle still uses direct prop callbacks. Commands enter the picture in phase 3 when EmailDarkGradient slots get wrapped in `<Editable>` and a `spacing.set` command takes ownership of the mutation.

### Phase 2.5a — EmailDarkGradient layout refactor + stack alignment

**Why:** Today's `bottomSpacing` drag did two intent jobs at once ("anchor stack to bottom" + "fine-tune the last gap"), neither of which composes cleanly with per-gap inter-block editing. Replaced with a stack-alignment toggle (top/center/bottom) — recognizable design-tooling primitive (Figma autolayout). Per-gap editing comes in 2.5b without conflict.

**Layout change in `EmailDarkGradient.tsx`:**
- Outer flex `justifyContent: 'space-between'` → flex-start, with logo as the first child and a content-stack container below
- Inner `gap: 24` flex container → block-list pipeline that renders visible blocks with default-24 spacers between visible neighbors only (visibility-aware: hidden blocks collapse, no phantom gaps)
- New `stackAlign: 'top' | 'center' | 'bottom'` prop drives `justifyContent` of the content-stack container (within the area below the logo)
- Logo stays locked to the top of the frame regardless of stackAlign

**Field migration: `bottomSpacing: number` → `stackAlign: StackAlign`**

Touched 9 files in this single rename:

| File | Change |
|---|---|
| `types/index.ts` | Added `StackAlign = 'top' \| 'center' \| 'bottom'` union; replaced 4 `bottomSpacing` field declarations across `ManualAssetSettings`, two `AppState` variants, and `DraftState`-style snapshot type; replaced `setBottomSpacing` setter type with `setStackAlign` |
| `lib/asset-snapshot.ts` | `'bottomSpacing'` → `'stackAlign'` in `SNAPSHOT_KEYS` |
| `lib/draft-storage.ts` | `bottomSpacing: number` → `stackAlign: StackAlign` in `DraftState`; restoration now reads `state.stackAlign ?? 'top'`; added `StackAlign` to type imports |
| `lib/template-registry.tsx` | `assetToExportParams` now passes `stackAlign` (no longer conditionalized on `showCta`); render schema swaps `numberOrUndefined` parser for `enum` parser with default `'top'` |
| `lib/export-params.ts` | `SnapshotState` typed with `stackAlign: StackAlign`; capture/restore use `stackAlign`; added `StackAlign` to type imports |
| `store/index.ts` | Initial states (2 init blocks), setter, snapshot capture, snapshot init values, queued-asset restoration, snapshot return value, draft restoration — 9 swap sites |
| `components/templates/EmailDarkGradient.tsx` | Full layout refactor: prop swap (`bottomSpacing?: number` → `stackAlign?: StackAlign`), block list + visibility-aware spacers with `DEFAULT_GAP = 24`, logo locked to top, stack container gets `justifyContent` from `STACK_JUSTIFY[stackAlign]`. Old `space-between`-driven layout fully replaced. |
| `components/EditorScreen.tsx` | Destructure swap (`bottomSpacing, setBottomSpacing` → `stackAlign, setStackAlign`); snapshot return swap; template-render prop swap (`bottomSpacing={...}` → `stackAlign={stackAlign}`); deleted the SpacingHandle drag-overlay block at the bottom of the email preview; deleted now-unused `SpacingHandle` import; added a "Stack alignment" segmented toggle (Top/Center/Bottom) in the EmailDarkGradient sidebar block, immediately after the existing horizontal Alignment toggle |
| `app/canvas-editor-test/page.tsx` | Test-page dummy spacer's `storeKey` updated to a generic placeholder (was `bottomSpacing`, now `demoSpacer` — irrelevant in the substrate but kept clean) |

**Build:** clean. No regressions in route sizes; `/editor` stayed at 108 kB.

**What changed visually:**
- Content-rich emails (headline + body + CTA): pixel-identical to before at `stackAlign: 'top'` (default), because the inner gap of 24 matches today's `gap: 24` exactly.
- Content-sparse emails (e.g., headline + CTA only): visually shift on first reopen. CTA was previously bottom-anchored via `space-between`; now it sits 24px under the headline at `stackAlign: 'top'`. To recreate the old look, user picks `stackAlign: 'bottom'` from the sidebar and the entire stack hugs the bottom of the frame. (Accepted regression per the no-migration plan.)

**Known follow-ups deferred to 2.5b/3:**
- Per-gap default of 24 is hardcoded. Phase 2.5b makes it editable via per-block-pair drag handles (`gap-{prev}-to-{next}`), backed by a sparse `Record<string, number>` in the store, with the `<Editable>` substrate driving selection + `spacing.set` commands.
- Stack alignment is currently a sidebar-only control. If we want it on-canvas later, it'd be a toolbar fragment (3-button chip) wired to `selection.kind === 'group'` for the whole-stack — out of scope for now.

### Phase 2.5b — per-gap drag handles (no substrate yet)

Scope split-decision: original 2.5b combined drag handles + `<Editable>` substrate adoption. Split into 2.5b (drag handles via direct prop wiring, mirroring Stacker's existing `renderSpacerBetween` pattern) and Phase 3 (substrate adoption). Drag handles are direct manipulation and don't require selection/toolbar machinery to work.

**New field: `emailDarkGradientGaps: Record<string, number>`**

Sparse map keyed as `gap-{prevBlockId}-to-{nextBlockId}` (e.g., `gap-logo-to-headline`, `gap-headline-to-body`). Missing keys fall back to `DEFAULT_GAP = 24`. Block IDs: `'logo' | 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'`. Visibility-aware: when a block is hidden, the gap key uses the next *visible* neighbor (e.g., subhead hidden → `gap-headline-to-body`, not `gap-headline-to-subhead`).

**Files touched:**

| File | Change |
|---|---|
| `types/index.ts` | Added `emailDarkGradientGaps: Record<string, number>` to all 4 state-shape interfaces; added `setEmailDarkGradientGap: (gapKey: string, value: number) => void` setter type |
| `store/index.ts` | Initial states (2 spots), setter (merges into existing record), destructure for snapshot, snapshot return value, snapshot init values (2), queued-asset restoration, draft restoration |
| `lib/asset-snapshot.ts` | Added `'emailDarkGradientGaps'` to `SNAPSHOT_KEYS` |
| `lib/draft-storage.ts` | Added field to `DraftState`; restoration uses `state.emailDarkGradientGaps ?? {}` |
| `lib/export-params.ts` | Added field to `SnapshotState`; capture passes as `gaps`; queued-asset restore reads back into `emailDarkGradientGaps` |
| `lib/template-registry.tsx` | Added `'jsonRecord'` to `FieldParser` union; email-dark-gradient render schema gains `{ param: 'gaps', parser: 'jsonRecord' }`; `assetToExportParams` passes `gaps` |
| `lib/render-params.ts` | New `parseJsonRecord<V>()` helper — JSON-decodes a URL-encoded record, defaults to `{}` on missing/invalid |
| `app/render/[slug]/page.tsx` | Added `'jsonRecord'` case to schema-driven parser switch |
| `app/api/export/route.ts` | Added `'gaps'` to `COMPLEX_KEYS`; new dedicated branch JSON-encodes `body.gaps` into the URL param when non-empty |
| `components/templates/EmailDarkGradient.tsx` | Added `EmailDarkGradientBlockId` type + exported `gapKey()` helper; new `gaps?` and `renderSpacerBetween?` props; spacer between every visible neighbor pair (and between logo and the first visible block) computed via `renderSpacer()` helper. Plain `<div>` spacer in export mode; consumer-provided drag-handle node in editor mode. Spacers wrap in `width: 100%` so absolute-positioned overlays inside `<SpacingHandle>` get a full-width box to render the centered pill. |
| `components/EditorScreen.tsx` | Re-imported `<SpacingHandle>`; destructured `emailDarkGradientGaps` + `setEmailDarkGradientGap`; passed `gaps` + `renderSpacerBetween` callback into the EmailDarkGradient render. Callback renders inline-mode `<SpacingHandle>` (range 0–96, drag-down increases, `showUnit`) wired to `setEmailDarkGradientGap(gapKey, value)` |

**Behavior preserved / changed:**

- Default behavior (no gap overrides set): every spacer renders as 24px, identical to phase 2.5a.
- In the editor preview, hovering between any two visible blocks (or between logo + first visible block when `stackAlign='top'`) now shows the pink-pill spacing handle; dragging adjusts that one gap.
- Each gap is independently editable; the master "set all" UX is implicit (untouched gaps stay at the 24 default).
- Visibility-aware: hide subhead → the gap between headline and body becomes editable as one unit (`gap-headline-to-body`), not two phantom halves.
- Stack alignment toggle still works orthogonally (no conflict with per-gap edits).

**Gotcha — drag direction depends on `stackAlign`:**

The `<SpacingHandle>`'s drag direction (`'down'` = drag down to increase) only matches user intuition when the content motion happens in the dragged direction. With the stack anchored differently per `stackAlign`, increasing a middle gap moves different parts of the stack:

| `stackAlign` | Effect of increasing a middle gap | Drag direction |
|---|---|---|
| `top` | content *below* the gap → downward (stack grows down from the top) | `direction='down'` (drag down increases) |
| `center` | content above ↑ AND below ↓ symmetrically (stack grows around center) | `direction='down'` (mixed, but acceptable) |
| `bottom` | content *above* the gap → upward (stack grows up from the bottom) | `direction='up'` (drag up increases) |

The editor's `renderSpacerBetween` callback dynamically picks `direction` based on `stackAlign`. Drag movement now matches the visible motion of the content the user is targeting.

**Gotcha — logo→first gap is conditional on `stackAlign === 'top'`:**

The logo→first-block spacer is a flex sibling of the stack container, so its height only contributes a real visible gap when the stack content is anchored at the top of the remaining area:
- `stackAlign='top'`: dragging the logo→first handle moves the stack down 1:1. Editable.
- `stackAlign='center'`: dragging shifts the centered content by `delta/2` (half-effect). Confusing UX.
- `stackAlign='bottom'`: stack is pinned to the padding-bottom edge regardless; dragging trades flex space and produces no visible change. Vestigial.

Fix: render the logo→first spacer slot only when `stackAlign === 'top'`. The stored gap value persists across stack-alignment changes (just inert in center/bottom) — switching back to `'top'` restores the previously-edited value. Same conditional applies in editor preview and export render since they share the template code.

**Build:** clean. No regressions in route sizes.

**Manual test plan:**

1. `npm run dev` → `/editor` → switch to EmailDarkGradient
2. Hover the area between any two blocks → pink "24px" pill appears
3. Drag the pill up/down → that gap updates live in preview
4. Drag the gap above the logo (logo→eyebrow/headline area) → also adjustable
5. Toggle a block's visibility (e.g., hide subhead) → the gap key collapses; only visible-pair spacers show
6. Reload the page → edited gap values persist (draft storage)
7. Export PDF → spacing values flow through to the rendered output
8. Switch to Stacker / FAQ → no regressions; their handles still work via the same shared `<SpacingHandle>` component

### Phase 3 — substrate adoption

This is where `<Editable>`, commands, and the contextual toolbar enter. Drag handles already work; this layer adds **selection + toolbar** for click-to-edit text/image/color UX.

1. Mount `<CanvasEditorProvider mode="edit">` around the EmailDarkGradient editor preview; `mode="export"` on the render page (provider defaults to export, so this might be a no-op).
2. Wrap each block in `<Editable kind="text" | kind="image">` and the color-style swatch element in `<Editable kind="color">`. Wrap each spacer in `<Editable kind="spacer">` so spacer drags double as selectable nodes (toolbar shows numeric value, hover ring follows).
3. Decide history approach (custom snapshot manager vs. Zundo on a partialized slice). Lean toward custom snapshots given the main store's existing `subscribeWithSelector` middleware (Zundo would be invasive).
4. Register first commands: `text.update`, `color.set`, `spacing.set`, `image.swap`. Each command writes to the main `useStore` and records snapshots for undo/redo.
5. Build toolbar fragments: `TextEditFragment` (Tiptap inline edit, since it's already in the bundle), `ColorPickerFragment` (4-preset chips for EmailDarkGradient's `colorStyle`), `SpacerDragFragment` (numeric readout), `ImageSwapFragment` (open image library modal).
6. Mount `<ContextualToolbar />`; verify selection rings + handles use absolute overlays and don't shift layout (export mode pixel-identical regression test).
7. Validate: PDF export round-trip on edited assets, sidebar↔canvas round-trip, Cmd+Z works for content edits.

---

## 10. References

- Milo audit findings (this conversation, 2026-04-27)
- Stacker spacing-handle implementation: `components/StackerSpacingHandle.tsx`, `components/StackerPreviewEditor.tsx`, `components/StackerEditorScreen.tsx`, `store/index.ts:497,791`, `app/render/stacker-pdf/page.tsx:24-36`
- ARCHITECTURE.md — export pipeline, two state systems, draft persistence rules
- BRAND.md — brand token contract for color editing
- TEMPLATES.md — full template catalog
- LESSONS.md — running QA feedback log
