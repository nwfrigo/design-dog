# Stage & Bench — Layout Spec (EmailDarkGradient pilot)

> Companion to `STAGE-AND-BENCH.md`. This doc maps every control on the existing EmailDarkGradient editor to its new home in the Stage & Bench layout, lists the questions that block implementation, and proposes a migration order.
>
> **Out of scope:** multi-page templates (Stacker, FAQ, Solution Overview PDF). Those will be their own refactors — different in kind, not just degree.

---

## 1. Principles (validated)

1. **Visibility never lives in the sidebar.** Eye icons disappear from sidebar text/image cards. Hide → Bench. Drag from Bench → Stage to restore.
2. **Sidebar holds nothing at all (for migrated templates).** What used to live in the sidebar is split:
   - Canvas-wide settings → **Stage Bar** (theme, color style, alignment, stack alignment, layout variant, category — when applicable).
   - Slot-level settings → **Element Toolbar** that follows selection on the Stage (text content, font size, image swap, hide).
3. **Every editable element on the Stage has a contextual toolbar.** Single-element selection only (v1). Toolbar fragments dispatch by `EditableKind`.
4. **Anything hidden parks on the Bench.** Bench is a vertical chip rail in the negative space beside the Stage (already shipped via portal).

---

## 2. New editor screen — regions

```
┌───────────────────────────────────────────────────────────────────────────┐
│  Asset Tabs                                            (existing, keep)   │  ← top: selectedAssets navigation
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─ STAGE BAR ────────────────────────────────────────────────────────┐  │
│  │  [Color Style] [Align L/C] [Stack T/C/B] [Generate ✨]              │  │  ← canvas-wide
│  │                              [2x ▾] [Preview] [Queue] [Export]      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─ Bench rail ──┐  ┌─ STAGE (the design itself) ──────────────────────┐  │
│  │ Eyebrow       │  │  ┌─ Element Toolbar (floats on selection) ────┐  │  │
│  │ Subhead       │  │  │ B  I  A↑ A↓  ↕  👁                          │  │  │
│  │ CTA           │  │  └────────────────────────────────────────────┘  │  │
│  │ ...           │  │                                                   │  │
│  └───────────────┘  │   cority                                          │  │
│                     │   [Headline]                                      │  │
│                     │   [Body] ...                                      │  │
│                     └───────────────────────────────────────────────────┘  │
│                                                                           │
│  [no sidebar]                                                             │  ← migrated templates: gone
└───────────────────────────────────────────────────────────────────────────┘
```

**Three persistent regions** (top to bottom):
- **Asset Tabs** — unchanged. `selectedAssets` navigation, "+" to add.
- **Stage Bar** — new. Canvas-wide controls left, action buttons right. Always visible. Single 36-tall row; overflow into "More ▾" popover if a template needs more controls than fit.
- **Stage area** — gray pad with the design centered, Bench portaled to the pad's left, Element Toolbar portaled to body and positioned by selection bounds.

**Sidebar:** removed for migrated templates. Auto-create mode keeps its sidebar (asset list navigation). Manual mode on a non-migrated template keeps the legacy sidebar until that template migrates.

---

## 3. EmailDarkGradient — control inventory & target home

Every control currently in the manual-mode editor for email-dark-gradient. Each row's "New home" is the destination after migration.

### Canvas-wide (currently sidebar, top half)

| Current control | Current location | New home | Notes |
|---|---|---|---|
| **Color Style** (4 gradient swatches) | Sidebar `<div>` line 1462 | Stage Bar | Compact swatch row; same 4 presets. |
| **Alignment** (L / C segmented) | Sidebar line 1486 | Stage Bar | 2-button segmented toggle. |
| **Stack alignment** (T / C / B segmented) | Sidebar line 1513 | Stage Bar | 3-button segmented toggle. |
| **Theme** (Light / Dark) | Sidebar line 1383 — **not currently shown** for email-dark-gradient | Stage Bar (when shown for other templates) | Note: email-dark-gradient uses Color Style instead of Theme. No conflict — they're alternatives. |
| **Generate ✨** (AI copy regen) | Inline above Eyebrow textarea, line 2589 | Stage Bar (right of canvas-wide controls, before action buttons) | Sparkles icon, opens existing copy-generation flow. |

### Per-slot text controls (currently sidebar, lower half)

| Current control | Current location | New home | Notes |
|---|---|---|---|
| **Eyebrow** textarea | Sidebar line 2602 | **Drop entirely.** Inline-edit on Stage already shipping; sidebar copy is redundant. |
| **Eyebrow** eye-icon (show/hide) | Sidebar | **Bench** (via Element Toolbar's eye-off) | Already wired. |
| **Headline** rich-text editor | Sidebar line 2640 | **Drop entirely.** Inline-edit on Stage already shipping. |
| **Headline** font size (A↑ A↓) | Inline in `SimpleRichTextEditor` | Element Toolbar (`EditbarText`, placeholder buttons already there) | Wire `setHeadlineFontSize` to selection.storeKey. |
| **Headline** eye-icon | Sidebar | Bench (via toolbar eye-off) | |
| **Subhead** rich-text editor | Sidebar | **Drop entirely.** | |
| **Subhead** font size | Inline in editor | Element Toolbar | Wire `setSubheadFontSize` to selection. |
| **Subhead** eye-icon | Sidebar | Bench | |
| **Body Copy** rich-text editor | Sidebar | **Drop entirely.** | |
| **Body Copy** eye-icon | Sidebar | Bench | |
| **CTA Text** input | Sidebar | **Drop entirely.** | |
| **CTA Style** (Link / Button toggle) | Sidebar line 1533 | Element Toolbar — **`EditbarCta`** (new fragment) | CTA gets its own toolbar. Decision Q3 ✓. |
| **CTA** eye-icon | Sidebar | Bench | |

### Logo

| Current control | New home | Notes |
|---|---|---|
| Cority logo | Stage (display) | Brand-locked — not user-editable. Substrate exposes the slot but with no Element Toolbar (no capabilities). |

### Action buttons

| Current control | Current location | New home | Notes |
|---|---|---|---|
| **Scale dropdown** (1x/2x/3x) | Above preview, line 3886 | Stage Bar (right side) | Same control, relocated. |
| **Preview** button | Below preview | Stage Bar | |
| **Add to Queue** button | Above preview | Stage Bar | |
| **Export** button | Above preview | Stage Bar | |
| **Save & Cancel** (when editing from queue) | Below preview, line 4972 | Stage Bar (replaces normal action buttons in this mode) | Keep the conditional swap. |

---

## 4. Stage Bar — composition

```
[Color Style: 4 swatches ⌄] [Align ◐◑] [Stack ▴▪▾] [✨ Generate]                                             [2x ⌄] [↗ Preview] [☰ Queue] [↓ Export]
└───────── canvas-wide controls ─────────┘                                                                  └─── action buttons (right-anchored) ───┘
```

- **Height:** 36px (matches `EDITBAR_TOKENS.height` for visual consistency with the contextual toolbars).
- **Background:** lighter than the contextual toolbars — this is the *outer* chrome, not a floating element. Tentative: `bg-white dark:bg-surface-secondary` with bottom border. Final color is a phase-7 polish decision.
- **Overflow:** when a template needs more controls than fit, last item becomes "More ▾" → popover. EmailDarkGradient won't hit this; some templates (email-image with theme + category + variant) might.
- **Replaces:** the existing action-buttons row (currently above the preview), the "Mode Toggle" comment-out, and the per-template canvas-wide block in the sidebar.

---

## 5. Element Toolbar — per-kind composition

Already shipping. Updates needed during the migration:

### `EditbarText` (kind: `text`)
- **Currently shipped:** Bold, Italic, Font ↑ (placeholder), Font ↓ (placeholder), Line spacing (placeholder), Hide-to-bench (✓ wired).
- **Migration:**
  - Wire Font ↑/↓ to per-slot setter via `selection.storeKey`. Reads `HEADLINE_SIZE_CONFIG` / `BODY_SIZE_CONFIG` / `SUBHEAD_SIZE_CONFIG` for min/max/step.
  - Line-spacing: wire to a new `lineHeight` field per template. Lower priority — punt to phase 7+.
- **Used by:** eyebrow, headline, subhead, body. Not the CTA — see below.

### `EditbarCta` (new — kind: `cta`)
Distinct from `EditbarText`. CTAs are buttons/links, not body copy — bold/italic are off-brand for CTA labels.
- **Style** (Link / Button) — segmented toggle, calls `setCtaStyle`.
- **Font size** ↑ / ↓ — calls per-template CTA size setter (new field if not present).
- **Arrow color** — color chip / picker; only meaningful when CTA renders the arrow chevron (link style). Wire to a new `ctaArrowColor` field.
- **Hide-to-bench** — eye-off icon, identical behavior to `EditbarText`.
- **Explicitly absent:** Bold, Italic. CTA text styling is template-controlled, not user-controlled.
- **Routing:** new `EditableKind = 'cta'` added to the substrate; `<Editable kind="cta">` on the CTA slot in templates.

### `EditbarImage` (kind: `image`)
- **Currently:** placeholder buttons.
- **Migration:** Swap (open image library), Generate variant (AI), Crop. Out of scope for email-dark-gradient pilot (the cority logo is brand-locked) — defer to first template with an editable image.

### `EditbarImage` (kind: `image`)
- **Currently:** placeholder buttons.
- **Migration:** Swap (open image library), Generate variant (AI), Crop. Out of scope for email-dark-gradient pilot (the cority logo is brand-locked) — defer to first template with an editable image.

### `EditbarPill` (kind: `pill`)
- Not in email-dark-gradient. Listed for completeness — first appears when category-bearing templates migrate.

### Removing the `EditbarImage` stub for `kind: 'image'`
Template logos that are brand-locked should be wrapped in `<Editable kind="image" capabilities={{ canSwapImage: false, canCropImage: false }}>` so selection still works (visual feedback) but no toolbar renders. The substrate already supports per-element capability overrides.

---

## 6. Bench — composition (already shipping)

- Vertical chip rail at top-left of the gray preview pad.
- One chip per hidden slot, in template-canonical order (Eyebrow → Headline → Subhead → Body → CTA).
- Each chip: kind icon + slot label.
- Drag chip → drop on Stage → slot restores.
- Renders only in `mode === 'edit'`, only when at least one slot is hidden.

**No changes needed for the pilot.** Phase-7+ polish: drag preview ghost, drop-target highlight on Stage, animation on restore.

---

## 7. What dies entirely

- All five per-slot textareas / rich-text editors in the sidebar (Eyebrow, Headline, Subhead, Body, CTA Text). Inline edit on Stage replaces them.
- All five per-slot eye icons in the sidebar.
- The "Inline Generate button" above the Eyebrow textarea.
- The whole `currentTemplate === 'email-dark-gradient' &&` sidebar block (lines 1460–1560).
- The action-buttons row above the preview (relocated, but the row container goes).

---

## 8. Decisions

| # | Question | Decision |
|---|---|---|
| Q1 | **Sidebar fate when on a migrated template in manual mode** | ✅ **Collapse entirely.** No sidebar in the Stage & Bench UI. Reclaim the 340px for the Stage. |
| Q2 | **Auto-create mode sidebar** | ✅ **Stays.** Auto-create's sidebar is asset navigation, not editing. Stage Bar appears the same way. |
| Q3 | **CTA Style (Link/Button)** — own fragment or extension of `EditbarText`? | ✅ **Own fragment: `EditbarCta`.** Distinct from text — no Bold, no Italic. Includes Style toggle, font size ↑/↓, arrow color, hide. Future features attach here, not to `EditbarText`. |
| Q4 | **Stack alignment as a stage-bar control vs. a `kind: 'group'` toolbar on the content stack** | ✅ **Stage Bar.** Canvas-wide, one value per asset. Group selection isn't a user-facing primitive in v1. |
| Q5 | **Generate ✨ scope** — all-copy or per-slot? | ✅ **All-at-once for v1** (matches current). Per-slot AI assist is a later feature. |
| Q6 | **Stage Bar visual chrome** | 🟡 **Deferred.** Functional shape first; colorways and exact theming handled in a later polish pass. Use any neutral default during the build (e.g. plain white / surface-secondary) — not load-bearing. |
| Q7 | **Where does Theme (light/dark) sit for templates that use it?** | ✅ **Stage Bar**, alongside Color Style. Email-dark-gradient doesn't use Theme (Color Style fills that role). |
| Q8 | **Prototype delivery — separate route, feature flag, or template-gated dispatch?** | ✅ **Template-gated dispatch.** Same `/editor` route. `EditorScreen` checks `STAGE_BENCH_TEMPLATES` and dispatches to `<StageEditorScreen />` for migrated templates, falls back to legacy for the rest. Auto-create links unchanged; per-template gradual rollout; legacy code becomes unreachable when set is full and gets deleted. |

---

## 9. Migration order — pilot completion

The current pilot has the substrate, the contextual toolbar shell, the Bench, and inline text editing. To finish the pilot per this spec:

1. **Wire font-size +/- in `EditbarText`** to `selection.storeKey` + the existing `HEADLINE_SIZE_CONFIG` / `BODY_SIZE_CONFIG` / `SUBHEAD_SIZE_CONFIG` tables. (~2h.)
2. **Add `'cta'` to `EditableKind`**, extend `DEFAULTS_BY_KIND` in `capabilities.ts`, route `kind: 'cta'` → `EditbarCta` in `ContextualToolbar.tsx`. Update the email-dark-gradient slot config so the CTA slot uses `kind="cta"` (currently `kind="text"`). (~2h.)
3. **Build `EditbarCta`** (`components/canvas-editor/editbar/EditbarCta.tsx`): Style toggle (Link/Button) wired to `setCtaStyle`, font size ↑/↓, arrow color picker, hide-to-bench. No Bold/Italic. (~4h.)
4. **Build the Stage Bar component** (`components/canvas-editor/StageBar.tsx`): canvas-wide controls section + action buttons section. Initially renders only when `currentTemplate === 'email-dark-gradient'` to avoid regressing other templates. Reads canvas-wide state (Color Style, Alignment, Stack Alignment) from `useStore` directly. Visual chrome is neutral / placeholder per Q6 — polish later. (~1d.)
5. **Mount the Stage Bar in `EditorScreen.tsx`** above the gray pad. Move the action buttons (Scale, Preview, Queue, Export) from above the preview into the Stage Bar's right side. (~3h.)
6. **Delete the email-dark-gradient sidebar block** (lines 1460–1560) and the per-slot text fields for that template. Hide the sidebar column entirely when `currentTemplate === 'email-dark-gradient'` in manual mode (Q1 = collapse). (~2h.)
7. **Manual test pass:** every control in §3 reachable from new home; export still produces identical PDFs/PNGs; draft persistence round-trips. (~2h.)

**Estimated total to ship the pilot:** ~3.5 days of focused work after this spec is approved.

After the pilot ships, **second-template migration** (a social or newsletter template) should follow the same spec adjusted for that template's specific controls (variants, theme, category dropdown). The Stage Bar's per-template control configuration becomes a registry pattern — `STAGE_BAR_BY_TEMPLATE: Record<TemplateKey, StageBarSpec>` — so adding a template is declarative.

---

## 10. References

- `STAGE-AND-BENCH.md` — substrate, phasing, Stage / Bench / Toolbar / Slot vocabulary
- `components/canvas-editor/Bench.tsx` — Bench implementation (portaled to `data-canvas-preview-pad`)
- `components/canvas-editor/editbar/EditbarText.tsx` — current text toolbar (Bold/Italic/sizes/line-spacing/hide)
- `components/canvas-editor/VisibilityRegistry.tsx` — slot registry consumed by Bench + EditbarText hide button
- `components/EditorScreen.tsx:1460-1560` — email-dark-gradient sidebar block (target for deletion)
- `components/EditorScreen.tsx:3878-3993` — current action-buttons row (target for relocation)
- ARCHITECTURE.md, BRAND.md, TEMPLATES.md — project conventions
