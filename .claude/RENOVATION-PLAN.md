# Design Dog — Stage & Bench Renovation Plan

> **Living doc.** Tracks the strategy, sequencing, and per-template status for renovating + migrating every single-image template onto the Stage & Bench substrate. Updated as templates ship.
>
> **Companion docs.**
> - `STAGE-AND-BENCH.md` — substrate architecture (the *what*).
> - `STAGE-BENCH-MIGRATION.md` — per-template playbook (the *how*).
> - This doc — the project-level plan (the *why* and *in what order*).

---

## 1. Mandate

Every single-image template (non-collateral) in Design Dog will:

1. Eliminate hard-coded spacing and `space-between` distributions where structurally possible. Adopt a uniform vertical content-stack pattern with **adjustable per-gap spacing** + `stackAlign` (top/center/bottom).
2. Run on the **Stage & Bench substrate** — direct manipulation editing via the new editor UI, replacing the legacy sidebar form for these templates.
3. Function structurally identically to the proving-ground templates (EmailDarkGradient, WebsitePressRelease) — same editing mental model regardless of which template the user is in.

This is not just an editor migration. It's a **layout-model unification at the application level**. The branch name (`feature-drag-editor`) reflects this: spacing becomes a first-class editable concept, and the editor surface is what makes it usable.

### Goal

A consistent, direct-manipulation editing experience across every single-image template, with the user controlling spacing as readily as they control text content.

### Non-goals

- Multi-page collateral (Stacker, FAQ, Solution Overview PDF, Customer Library, Social Carousel). These need a different shell with a page selector inside the stage column. Out of scope for v1.
- New design language. Templates retain their existing visual design; only the editing model changes (and some templates' layout primitives swap for editor-aware equivalents).
- AI-driven layout generation.

---

## 2. The critical insight: two paradigms

A full audit of all 29 single-image templates (26 in flight + 3 already done) revealed a sharp structural split that determines how renovation applies.

### Paradigm 1 — Stack-based templates (~17 templates)

Templates with vertical content stacks (logo at top, content middle, CTA bottom; or content + image two-column). Hard-coded gaps and `space-between` distribution. These are the natural fit for the renovation.

### Paradigm 2 — Fixed-composition templates (~9 templates)

Templates designed at specific pixel coordinates — logo at `left: 27, top: 18`, eyebrow in a calculated box, dividers at exact positions. The layout *is* the design. There's no "stack with adjustable gaps" to expose; forcing one would obliterate the visual design.

**Critical principle:** the renovation premise (adjustable spacing instead of hardcoded) does NOT apply to Paradigm 2 templates. They get a different track:
- **Track 1 (Paradigm 1)** — renovate layout *and* migrate to S&B in one PR per template.
- **Track 2 (Paradigm 2)** — migrate to S&B only, no layout change. Each element becomes an `<Editable>` at its existing pixel position. The visual design is preserved exactly.

This is the only way to avoid "design convergence" — the failure mode where every template starts looking the same because they all use the same layout primitive.

---

## 3. Template audit (per-template categorization)

### Group A — Proving ground (3 templates, done)

| Template | Status | Notes |
|---|---|---|
| EmailDarkGradient | ✅ Done | Pilot. Has bespoke stack column logic (will refactor onto `ContentStack` in Phase A). |
| WebsitePressRelease | ✅ Done | Has `PressReleaseLeftColumn` — bespoke stack. Filters fully wired end-to-end. |
| EmailSpeakers | ✅ Done | Has `LeftColumn` — bespoke stack. Nested-group reference (3 speaker avatars). Per-speaker filter wiring pending. |

### Group B — Track 1 single-column / outer-space-between (10 templates)

Mostly `space-between` outer (logo top, content middle, cta bottom) with an inner content stack. ContentStack fits the inner stack.

| Template | Tier | Status |
|---|---|---|
| SocialDarkGradient | 1 | ✅ Done |
| SocialBlueGradient | 1 | ✅ Done |
| SocialEhsAccelerate | 1 | ✅ Done (smallest social — no image / no color / no theme / no eyebrow) |
| SocialImage | 1 | ✅ Done (universal image model; layout 3-state via substrate primitive) |
| SocialImageMeddbase | 1 | ✅ Done (twin of social-image; no theme, MeddbaseLogo, brand-primary arrow) |
| EmailImage | 1 | ✅ Done (universal image model + 3-state layout; sibling of social-image at 640×300) |
| NewsletterDarkGradient | 1 | ✅ Done (image content editing deferred — see image-source-key follow-up) |
| NewsletterBlueGradient | 1 | ✅ Done (image content editing deferred — see image-source-key follow-up) |
| NewsletterLight | 1 | ✅ Done (image content editing deferred — see image-source-key follow-up) |
| NewsletterTopBanner | 1 | Queued |

### Group C — Track 1 two-column press-release-shaped (3 templates)

Left content stack + right image. ContentStack for the left column; image stays as-is (the press-release pattern).

| Template | Tier | Status |
|---|---|---|
| WebsiteWebinar | 2 | ✅ Done (3-variant text/image/speakers; speakers panel wrapped as single block — inner editing deferred, mirrors EmailSpeakers) |
| WebsiteReport | 2 | ✅ Done (image-left variant + text-only; press-release shape mirrored) |
| WebsiteThumbnail | 2 | ✅ Done (image-right variant + text-only; press-release shape mirrored) |

### Group D — Track 1 nested stacks (4 templates)

Outer stack of repeated child groups. Each child has its own internal composition. Mirrors EmailSpeakers pattern.

| Template | Tier | Status |
|---|---|---|
| EmailGrid | 3 | Queued |
| SocialGridDetail | 3 | Queued |
| WebsiteEventListing | 3 | Queued |
| WebsiteEhsAccelerateListing | 3 | Queued |

### Group E — Track 2 absolute-positioned compositions (7 templates)

Designed at fixed pixel coordinates. ContentStack does NOT apply. Migrate to S&B with each element as an `<Editable>` at its existing position.

| Template | abs-pos count | Status |
|---|---|---|
| EmailProductRelease | 7 | ✅ Done (Track 2; eyebrow + headline + universal image slot, decorative dividers preserved as chrome) |
| EmailCorityConnect2026 | 2 | ✅ Done (Track 2; 16-background enum selector, validates new substrate primitive) |
| EmailCorityCustomerExchangeSignature | 5 | ✅ Done (Track 2; 4 text slots, empty stage bar) |
| EmailCorityCustomerExchangeBanner | 4 | ✅ Done (Track 2; 4-color enum selector, flex-end CTA anchor) |
| EmailEhsAccelerateSignature | 5 | ✅ Done (Track 2; date/location share visibility flag but stay independently editable) |
| EmailEhsAccelerateBanner | 5 | ✅ Done (Track 2; logo + headline + body + bottom info bar with date/location/cta) |
| EmailEhsAccelerateInvitation | 8 | ⏸ Deferred — body field is rich HTML; pairs with the upcoming collateral-rich-text work in a couple weeks. Migrate when InlineTextEdit gains rich-text support. |

### Group F — Track 2 horizontal banner strips (2 templates)

2256×100 horizontal strips. Logo / content / CTA distributed horizontally. No vertical stack semantically. Migrate to S&B; no stage-bar spacing controls.

| Template | Status |
|---|---|
| WebsiteFloatingBanner | ✅ Done (Track 2; 7-variant enum selector — mirrors mobile, adds logo anchor) |
| WebsiteFloatingBannerMobile | ✅ Done (Track 2; 7-variant enum + arrow-type toggle) |

### Totals

- **Track 1**: 17 templates done (Groups A–C complete; Group D queued)
- **Track 2**: 8 of 9 done; EmailEhsAccelerateInvitation deferred (rich-text dep)
- **Substrate primitives added**: `SelectorPrimitive kind="enum"` (N-state, icons/swatches/labels — overflow carousel pending design pass)

---

## 4. The `ContentStack` primitive

The substrate addition that makes Track 1 cheap and uniform.

### What ContentStack owns

| Concern | Behavior |
|---|---|
| **Flex column structure** | Renders `display: flex; flex-direction: column` with the visible blocks. |
| **stackAlign distribution** | `top` / `center` / `bottom` controls `justifyContent` on the wrapping container. |
| **Visibility-aware gap collapsing** | When a block is hidden, the adjacent gap key collapses to the next visible neighbor pair (no phantom double-gaps). |
| **Spacer render-prop injection** | Calls `renderSpacerBetween(prevId, nextId, gapKey, gapValue)` between visible blocks. Returns the editor's drag-handle node, or a static `<div height={gap}>` in export mode. |
| **Width stretch** | Accepts a `width` prop or stretches to fill parent. |

### What ContentStack must NEVER touch

These belong to the template, not the primitive. Touching them causes design convergence.

| Concern | Owner |
|---|---|
| Block typography (font size, weight, family, color, line-height) | Template per-block |
| Default gap value | Template specifies via `defaultGap` prop |
| Block ordering | Template decides which blocks appear in which order |
| Block visibility logic | Adapter writes visibility flags; template reads them |
| Stack column width default | Template (396px for press-release-shaped, full-bleed for social, etc.) |
| Per-block padding/margin | Template per-block |
| Per-block alignment override | Template per-block |

### API shape (draft — finalized in Phase A)

```tsx
type StackBlock = { id: string; node: ReactNode } | null

interface ContentStackProps {
  blocks: StackBlock[]                          // nulls filter out (visibility-hidden slots)
  stackAlign: 'top' | 'center' | 'bottom'
  defaultGap: number                             // template-specified
  gaps: Record<string, number>                   // sparse overrides keyed by gap-${prev}-to-${next}
  renderSpacerBetween?: (gapKey: string, value: number, prevId: string, nextId: string) => ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'            // alignment within the stack
  alignItems?: 'flex-start' | 'center' | 'flex-end'
}
```

### Variants?

**None.** A 42pt-header-with-button template and a 64pt-header-subhead-body-button template compose ContentStack identically; their blocks differ in count and rendering. Typography lives in what the template puts INSIDE each block, never in the primitive.

Two-column templates render `<ContentStack>` for *one* column + their image element as a sibling. The primitive does not become a two-column layout. That's the template's composition responsibility.

### Where the primitive might break down (watchlist)

1. **Two-column templates** (Group C) still need bespoke outer composition. ContentStack only handles one column.
2. **Nested stacks** (Group D) recurse — outer ContentStack contains nodes that are themselves ContentStacks. Tested and clean via EmailSpeakers.
3. **Inner micro-stacks within Group B's space-between layouts.** E.g., SocialDarkGradient's outer is space-between (logo / text / cta), but the middle "text" slot is itself a small vertical stack (eyebrow + headline-group + body + metadata). ContentStack composes there cleanly.
4. **Per-template default gap.** Press-release uses 25.10px (Figma export); EmailDarkGradient uses 24px; others may differ. The `defaultGap` prop is the escape hatch. NEVER hardcode in the primitive.

---

## 5. Phasing

### Phase A — Substrate consolidation (~3 days)

**Single PR. No new templates shipped.** Output: a working ContentStack primitive, the 3 proving-ground templates refactored onto it, store-shape consolidation if needed.

- Extract `components/canvas-editor/ContentStack.tsx` from the existing column components.
- Define final API shape; lock anti-convergence guardrails.
- Refactor **four templates** onto ContentStack:
  - EmailDarkGradient — bespoke column logic → ContentStack (zero visual change)
  - WebsitePressRelease — bespoke `PressReleaseLeftColumn` → ContentStack (zero visual change)
  - EmailSpeakers — bespoke `LeftColumn` → ContentStack (zero visual change)
  - SocialDarkGradient — was migrated today **without** the spacer feature (used inline `gap: 24`). Phase A *completes* its renovation by introducing per-gap spacing via ContentStack + adding `socialDarkGradientGaps` store wiring. **First template gaining the spacer feature as part of renovation, not just migration.**
- Decide: bundle the per-template `<template>Gaps` store fields into a single `templateGaps: Record<TemplateType, Record<string, number>>` field. Migrate the 3 existing fields + add SocialDarkGradient. *(This reduces store-field-explosion risk as 13 more templates onboard.)*
- Update `STAGE-BENCH-MIGRATION.md` with a new section: how to use ContentStack in your adapter + Track 1 vs Track 2 guidance.
- Update `STAGE-AND-BENCH.md` substrate inventory.

**Exit criteria:** Three already-done templates render byte-identically. Type-check clean. Draft / asset-switch / export all still work for those three. Migration playbook reflects the new pattern.

### Phase B — Track 1 rollout (~3–4 weeks)

Per-template renovation + migration. One PR per template. Sequence by group:

1. **Group B (10 templates, ~1.5 days each)** — SocialBlueGradient → SocialEhsAccelerate → SocialImage → SocialImageMeddbase → EmailImage → NewsletterDarkGradient → NewsletterBlueGradient → NewsletterLight → NewsletterTopBanner. Each one is a small variation of the SocialDarkGradient adapter we already shipped.
2. **Group C (3 templates, ~2 days each)** — WebsiteWebinar, WebsiteReport, WebsiteThumbnail. Two-column, image on right. Mirror WebsitePressRelease adapter.
3. **Group D (4 templates, ~3 days each)** — EmailGrid, SocialGridDetail, listings. Nested stacks. Mirror EmailSpeakers adapter.

**Per-template work (Track 1):**
- Layout renovation: replace `space-between` + hardcoded gaps with `<ContentStack>` invocation.
- Add `BlockId` export to template.
- `template-configs/<id>.ts` (slots + sizes + contents).
- `template-adapters/<Name>StageBench.tsx` (store subscriptions + stage bar + render-prop wiring).
- Register in `STAGE_BENCH_TEMPLATES` + `TEMPLATE_ADAPTERS`.
- Post-flight verification per `STAGE-BENCH-MIGRATION.md §7`.

### Phase C — Track 2 rollout (~1 week)

Per-template S&B migration WITHOUT layout renovation. One PR per template. Group E + F, ~0.5 day each.

**Per-template work (Track 2):**
- **Slot-decoration audit** — for each editable text/image slot with surrounding decorative elements (boxes, dividers, frames), decide: *hide group* (rectangle + text together) or *hide text only* (chrome stays, text disappears). Document the decision per slot. The substrate supports both via slot-path / visibility-flag mapping — no new work.
- Wrap each absolute-positioned content element in `<Editable>` at its existing position.
- `template-configs/<id>.ts` (slots + sizes + contents; no spacers since no stacks).
- `template-adapters/<Name>StageBench.tsx` (smaller — no spacer render-prop, no stackAlign, simpler stage bar).
- Register and verify.

Order: start with the simpler ones (signatures, 5 abs-pos each) → banners → most complex (EmailEhsAccelerateInvitation, 8 abs-pos) last.

### Phase D — Cleanup (~2 days)

After every template has migrated:

- Delete `EditorScreen.tsx`'s template-specific sidebar blocks. The component drops from 5000+ lines to whatever's left for `solution-overview-pdf` and other non-migrated collateral.
- Delete `components/ImageCropModal.tsx` (no remaining consumers).
- Delete legacy `components/canvas-editor/Bench.tsx` and `SLOT_DRAG_MIME` constant.
- Decide: declarative Layer-1 adapter descriptor? Hold per user direction (current preference: per-template adapter remains, prioritizing design freedom).
- Decide: queue retirement?

### Phase E — Polish (~ongoing)

Items deferred to after rollout:
- AI image generation ("Create Image" lights up when API is ready)
- Image filters on remaining templates (per-speaker for EmailSpeakers; any other template with editable images gains them)
- Multi-page collateral migration (out of scope for v1; future v2 with page selector)

---

## 6. Risks and decision points

### Visual regression on existing assets

Renovating layouts will subtly shift existing asset rendering. Example: an asset rendered today with `space-between` (CTA at bottom) becomes `stackAlign: 'top'` (CTA right under body) by default. Looks "wrong" to a user comparing before/after.

**Mitigation:**
- Per-template sensible default for `stackAlign` on first render of a renovated asset. Press-release-style templates default to `'top'` (logo + content top, image fills right). Outer-`space-between` templates (Group B) default to `'center'` or `'bottom'` depending on original layout intent.
- Eyeball test on 1-2 representative content sets per template before merge.
- Document the migration as a deliberate behavior change in release notes: "Your content now stacks naturally; drag spacing to fine-tune."

### `headingSize` (S/M/L) preset drop

Several Tier-1 templates have a `headingSize: S | M | L` preset that scales headline/subhead/body together. S&B drops the preset in favor of per-slot continuous `A↑/A↓` controls (substrate-native via SizeRegistry). Body retains the legacy formula for now via the still-stored `headingSize` value.

**Risk:** users who rely on the preset see a UX shift.

**Call:** drop the preset for consistency with EmailDarkGradient's precedent. Revisit if user feedback demands it; could add a `size-preset` SelectorPrimitive kind as a stage-bar control later.

### CTA Style (link/button) substrate gap

`ctaStyle` is an asset-level field (`'link' | 'button'`) read by templates. EditbarCta should grow a Style toggle for this. Currently no S&B UI exposes it — users can't change it within Stage & Bench.

**Call:** treat as a substrate gap. Add Style toggle to EditbarCta in Phase A or Phase B (mechanical, ~30 min). Until then, ctaStyle stays at whatever default the asset was created with.

### Slot-decoration semantics (Track 2)

For fixed-composition templates with rectangles/dividers around text, the bench `hide()` decision per slot is non-obvious. Captured as a per-template QA step in Phase C.

### Track 1 vs Track 2 classification correctness

Audit was thorough but not infallible. A template may turn out to be more like the other paradigm than its initial categorization suggests when we get into the code. **Trust but verify** — first PR for any group is a chance to reclassify if needed.

### Store field explosion

If we don't bundle `<template>Gaps` into one record, we add a new top-level store field per Track 1 template (10+ new fields). Phase A bundling is preventive maintenance; deferring it to later means a bigger refactor with templates already in flight.

---

## 7. Anti-convergence guardrails (load-bearing principle)

The risk of `ContentStack` is that it homogenizes visual output. **It must not.** Restating §4 as guardrails:

1. **ContentStack accepts a `defaultGap` prop.** Never hardcoded. Templates set their own per-instance value.
2. **ContentStack does not style its children.** Blocks receive zero CSS from the primitive — typography, color, padding, alignment all happen INSIDE the `node` field of each `StackBlock`.
3. **ContentStack does not impose a column width.** Templates pass their own.
4. **ContentStack does not pick block order.** Templates pass blocks in their preferred order.
5. **ContentStack does not own visibility logic.** Templates pass nulls for hidden blocks (or filter beforehand).
6. **No "variants" of ContentStack.** If a template's needs don't fit the primitive, the template composes the layout manually for that section. The primitive doesn't grow tendrils.

A code review of any Track 1 PR includes: "Does this PR add styling defaults to ContentStack?" If yes, reject.

---

## 8. Documentation updates landing with Phase A

- **`STAGE-BENCH-MIGRATION.md`** — new §6.17 "ContentStack primitive (Track 1 layout)" + new §6.18 "Track 2 fixed-composition migrations" with the slot-decoration audit step.
- **`STAGE-AND-BENCH.md`** — ContentStack added to §4 substrate inventory + roadmap updated to reflect the renovation plan.
- **`CLAUDE.md`** — reference table includes RENOVATION-PLAN.md.
- **This doc (`RENOVATION-PLAN.md`)** — the per-template status table in §3 is updated at the end of every template PR.

---

## 9. Success criteria

The renovation is complete when:

- [ ] All 26 templates are in `STAGE_BENCH_TEMPLATES`.
- [ ] All Track 1 templates use `ContentStack` for their primary vertical stacks.
- [ ] No `<template>Gaps` per-template store fields remain — bundled into `templateGaps`.
- [ ] `EditorScreen.tsx` no longer contains template-specific sidebar logic for any migrated template.
- [ ] `ImageCropModal.tsx`, legacy `Bench.tsx`, and `SLOT_DRAG_MIME` constant deleted.
- [ ] Type-check clean. All affected templates' exports render byte-identically (where unchanged) or with a deliberate, documented visual change (where renovated).
- [ ] User can click any text, image, pill, or spacer across any single-image template and edit it directly. No template feels like a different editing model than another.

The end state: one editing experience across the app, no design convergence between templates.
