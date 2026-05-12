# Stage & Bench — Post-Migration Cleanup Plan

> Single-file playbook for the next big-step engineering pass. Designed so a fresh-context agent (or future-you) can execute it end-to-end without re-reading the migration history.
>
> **Status as of this doc:** all of Track 1 (17 templates) and 8/9 of Track 2 are migrated and shipped. The substrate works. This doc is about the *next* layer — making the next template, the next bug fix, and the next contributor 10× cheaper.

---

## Execution log

| Task | Status | Commits | Notes |
|------|--------|---------|-------|
| 5 — SUBSTRATE-DEBT.md seed | ✅ Done | `97a8771` | 7 entries; CLAUDE.md + RENOVATION-PLAN.md cross-references wired. |
| 4 — Dead-prop audit | ✅ Done | `ac11f85` | Catalog clean. Only actionable find: `WebsiteWebinar.speakerCount`. Removed across 6 files. `EmailCorityConnect2026.colors` left as known-acceptable tax per §4.5. |
| 1 phase A — Factory + 3 pilots | ✅ Done | `949903c`, `93ba8ae` | `defineStageBenchAdapter` lands. Pilots ported: social-ehs-accelerate (−54%), social-image (−45%), email-cority-connect-2026 (−53%). Validation pass added color-N selector kinds. Multi-image (EmailSpeakers) deferred via `renderTemplate` escape. |
| 3 §3.2 + §3.3 — Conventions | ✅ Done | `7b85321` | Three subsections under §8 of STAGE-AND-BENCH.md (factory pointer, visibility-flag naming, bench-toggle-ability). |
| **Visual smoke test of 3 pilots** | ⏸ **Required before mass-port** | — | TypeScript clean and production build compiles, but no in-browser verification yet. **Run dev server, open each pilot in the editor: selection / inline edit / bench drag / stage-bar selectors / image modal (social-image) / export to PNG.** |
| 2 — Auto-registration | Not started | — | Folds the factory's descriptor into `template-registry.tsx` + `export-params.ts` + `migrated-templates.ts` + `StageBenchEditor.tsx`. Start with the 3 pilots, then propagate. |
| 1 phase B — Mass-port 24 adapters | Not started | — | Order: sibling templates of pilots first (newsletter variants, social-blue-gradient, social-image-meddbase, email-image), then signatures + banners, then grids (combine with §3.1 grid rename here), then Speakers last (use the §1.4 easy-path). |
| 3 §3.1 — Grid off-by-one rename | Not started | — | Bundle with grid-template ports under the new factory. |
| 6 — Contribution playbook | Not started | — | Rewrite STAGE-BENCH-MIGRATION.md once the factory is stable. |

---

## How to use this doc

Each task below is **self-contained** — a fresh agent can run any one of them without the others. Tasks are ordered by ROI; some have hard dependencies (noted). Estimates are focused-work days, not calendar time.

Before starting any task, run the **Pre-flight** section once.

---

## Pre-flight (read before any task)

1. `.claude/RENOVATION-PLAN.md` — full per-template status. Source of truth for what's migrated and what's deferred.
2. `.claude/STAGE-AND-BENCH.md` — substrate architecture, registries, primitives.
3. Pick one reference adapter to anchor your mental model:
   - **Track 1 simple:** `components/canvas-editor/template-adapters/SocialEhsAccelerateStageBench.tsx` (303 lines, no image, no category)
   - **Track 1 image-flow:** `components/canvas-editor/template-adapters/SocialImageStageBench.tsx` (445 lines, image + category + theme + layout)
   - **Track 2:** `components/canvas-editor/template-adapters/EmailCorityConnect2026StageBench.tsx` (304 lines, fixed-composition)
4. Run `npx tsc --noEmit` once to confirm a clean baseline before you start. Run it after each commit.
5. Commit pattern in this branch: one focused commit per logical step, conventional-commit-ish prefix (`feat:`, `refactor:`, `docs:`, `chore:`), trailer line `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

---

## Task 1 — Adapter factory (CORE)

**Goal:** Replace ~10,000 lines of adapter boilerplate (27 files × ~380 lines) with a single descriptor-driven factory. Future templates ship in <100 lines of declarative config.

**Why this matters:** every substrate change (new bench feature, new toolbar action, new selection model) currently touches 27 files. After this task: 1 file. Every new template currently takes 2–4 hours of adapter porting. After this task: <30 min.

**Estimate:** 1.5–2 days.

**Dependency:** none — start here.

### 1.1 What to keep generic vs. template-specific

**Audit first.** Open 3 adapters side-by-side (use the trio in Pre-flight). For each line, ask: *would this differ between templates?* You'll find ~80% is identical. The template-specific decisions are:

- Which `Template` component to render
- Slot list (BlockId union → store field + kind + benchable-or-not + preview placeholder + chip-icon)
- Stage-bar items (which `SelectorPrimitive` kinds, which store fields they bind to, optional value-mapping function for vocabulary translation)
- Image-slot config (template-key in `thumbnailImageSettings`, frame dimensions — possibly variant-dependent)
- Category-slot config (path, which store field, source list)
- Per-block inline-editor rules (which blocks are HTML vs plain text, which are single-line)

**Don't try to factor:** the renderBlock dispatch shape, the renderInlineEditor dispatch shape, the renderSpacerBetween + SpacingHandle wiring, the `useStageBenchDroppables` + FLIP setup, the modal mounting, the `ImageSelectionEffect` helper at the bottom (move it to `ImageRegistry.tsx` exports instead — see §1.5).

### 1.2 Descriptor shape (target API)

Land it in `components/canvas-editor/factory/defineStageBenchAdapter.tsx`. Sample shape — refine during implementation:

```ts
type SlotDescriptor<TBlockId extends string> = {
  blockId: TBlockId
  storeField: string  // e.g. 'verbatimCopy.headline', 'ctaText', 'eventDate'
  kind: 'text' | 'cta' | 'image' | 'pill' | 'group'
  /** false = always on stage, no bench chip (logo, mandatory headline, etc.) */
  benchable?: boolean
  /** Bench chip label + icon. Defaults derived from blockId. */
  chip?: { label: string; iconKey: BenchChipIconKey }
  /** Format for inline edit. Defaults to 'plain'. */
  format?: 'plain' | 'html'
  /** Whether inline editor uses singleLine. Defaults: true for cta/eyebrow/etc., false for headline/body. */
  singleLine?: boolean
  /** When inline edit is suppressed (e.g. logo). Defaults: true unless kind is text/cta. */
  inlineEditable?: boolean
  /** Placeholder shown when value is empty in preview-active state. */
  placeholder?: string
}

type StageBarItem =
  | { kind: 'theme' | 'alignment' | 'stack', storeField: string }
  | { kind: 'layout', storeField: string, mapToStore: (v: 'image'|'even'|'text') => string, mapFromStore: (v: string) => 'image'|'even'|'text' }
  | { kind: 'enum', storeField: string, options: EnumOption[] }
  | { kind: 'color-2'|'color-3'|'color-4', storeField: string, options: ColorOption[] }
  | { kind: 'toggle', storeField: string, options: ReadonlyArray<{ value: string; label: string }> }
  | { kind: 'custom', render: () => ReactNode }  // escape hatch

type StageBenchAdapterDescriptor<TBlockId extends string, TProps> = {
  templateId: TemplateType
  Template: ComponentType<TProps>
  /** Used by template-registry, export-params, and the adapter. Single source of truth. */
  registerSchema: TemplateRegisterSchema  // see Task 2
  slots: SlotDescriptor<TBlockId>[]
  stageBar?: StageBarItem[]
  image?: {
    /** Key inside thumbnailImageSettings. */
    templateKey: TemplateType
    /** Frame dimensions for the lightbox. May depend on other state. */
    frameDims: (state: AppState) => { width: number; height: number }
    /** Default image URL when none is set. */
    placeholderSrc: string
  }
  category?: {
    /** Slot path, e.g. 'social-image.solutionPill' */
    path: string
    /** Where the source list lives in colorsConfig (e.g. 'solutions'). */
    sourceListKey: 'solutions'
    /** Store field bound to the selection. */
    storeField: 'solution'
  }
  /** Optional content-stack alignment (Track 1 only). When omitted, no stack-align controls + no gap handles. */
  contentStack?: {
    /** Key inside templateGaps. */
    templateKey: TemplateType
    /** Max gap value for the slider. Defaults to 96. */
    maxGap?: number
  }
  /** Escape hatch for one-off rendering. Receives the auto-built props and returns the customized template element. */
  renderTemplate?: (autoProps: TProps, ctx: AdapterContext) => ReactNode
}

export function defineStageBenchAdapter<TBlockId extends string, TProps>(
  descriptor: StageBenchAdapterDescriptor<TBlockId, TProps>
): React.ComponentType<StageBenchEditorProps>
```

### 1.3 Implementation order

1. **Write the type** in `defineStageBenchAdapter.tsx`. Don't implement yet — just get the shape feeling right.
2. **Pick 3 pilot templates that represent the spectrum**:
   - `social-ehs-accelerate` (Track 1, no image, no category, no theme) — proves minimum case
   - `social-image` (Track 1, image + category + theme + layout) — proves the full image-flow case
   - `email-cority-connect-2026` (Track 2, enum-swatch background, no content-stack) — proves Track 2 + custom selector
3. **Implement the factory enough to power those 3.** Replace each pilot's adapter with a ~50–80 line descriptor + a `defineStageBenchAdapter({ ... })` export. Type check, manual QA each in the browser.
4. **Stop. Sit with it for a day.** The remaining 24 adapters will tell you whether the API is right. Resist a big-bang port.
5. **Port the next ~5 templates** that look like simple ports (sibling templates of the pilots — newsletter blue/light, social blue gradient, social image meddbase, email image). When you hit friction, evolve the descriptor *or* add a `renderTemplate` override; don't force the abstraction.
6. **Port the rest in groups**: signatures and banners (Track 2 simple), then grid templates (Group D), then Webinar + Speakers (Track 1 complex). Speakers will be the hardest — see §1.4.

### 1.4 EmailSpeakers will fight you

`EmailSpeakersStageBench.tsx` is 577 lines because it has nested editable groups (3 speakers × { name, role, avatar }). The factory's `slots: SlotDescriptor[]` is flat — it doesn't natively express nested editables.

**Two ways to handle:**
- **Easier:** treat each speaker as a single `kind: 'group'` slot; defer per-piece editing to a v2. This matches how I shipped `WebsiteWebinar.speakers` (already deferred per-speaker editing in current code).
- **Cleaner:** add an optional `nested: SlotDescriptor[]` to `SlotDescriptor` for one level of recursion. Use it ONLY for speakers — don't make it general-purpose. The factory dispatches `renderSpeakerField` and `renderSpeakerFieldInline` for nested slots.

Pick the easier path first. If speakers feel unusable, upgrade to the nested approach. Don't pre-build nesting before you need it.

### 1.5 Cleanups that fall out

While porting, also:

- **Move `ImageSelectionEffect`** (the 3-line `useImageSelectionEffect; return null` helper) from each adapter's bottom into `ImageRegistry.tsx` as an exported named component. 12 adapters currently re-declare it. After the factory, callers shouldn't even know about it — but it should exist once if needed.
- **Move the image-filter cascade** (the 8-line `applyGrayscaleBoolean → filtersToCss → imageFilterStyle` decision tree) into a hook `useImageFilterStyle({ imageFilters, grayscale, grayscaleImageUrl })` in `lib/image-filters.ts`. Replace inline copies in 8 templates. The factory's image wiring uses the hook.
- **Move `PREVIEW_PLACEHOLDERS` lookup** into the slot descriptor (`placeholder?: string`). Drop the per-adapter `const PREVIEW_PLACEHOLDERS = { ... }`.
- **Move `ICON_KIND_TO_CHIP_KIND`** mapping into a shared lookup in `bench/BenchChip.tsx` keyed by `iconKey`. Drop the per-adapter map.

### 1.6 Acceptance criteria

- [ ] Pilot 3 adapters replaced with descriptor-driven exports. Each is ≤ 100 lines.
- [ ] `npx tsc --noEmit` clean.
- [ ] Manual smoke test: open each pilot template in the editor; verify selection, inline edit, bench drag, stage-bar selectors, image modal (where applicable), export to PNG.
- [ ] Single commit per pilot. Commit message names the descriptor as the new pattern.
- [ ] Add a one-paragraph "Adapter Factory" section to `STAGE-AND-BENCH.md` pointing at `defineStageBenchAdapter.tsx`. Don't write the full API doc — that's Task 6.

### 1.7 Pitfalls

- **Don't force every template into the factory immediately.** The API isn't perfect on day 1. Let 3 templates stress-test it, evolve, then port the rest.
- **Don't make the descriptor too strict.** `renderTemplate?: (autoProps, ctx) => ReactNode` is your escape hatch for templates that need bespoke rendering. Reserve it for rare cases — but reserve it.
- **Don't touch templates' visual output.** This task is editor-wiring only. Templates' `<div style={...}>` JSX shouldn't change.
- **Don't combine with Task 2 in one commit.** Land the factory first; the registration consolidation rides on top.

---

## Task 2 — Single registration descriptor (CORE)

**Goal:** Today, to add a template you touch 4 files (`migrated-templates.ts`, `StageBenchEditor.tsx` adapter map, `template-registry.tsx`, `export-params.ts`). Half of that is duplicate metadata. Consolidate to one declarative export per template.

**Why this matters:** the parallel sources of truth are real bug bait. I had to wire `imageFilters` to both `template-registry.renderProps` and `export-params.builder` for newsletter — easy to forget half. Got caught for ProductRelease and had to ship a follow-up fix (`c2763a3`).

**Estimate:** 0.5–1 day. **Dependency: Task 1 must land first** — this leans on the factory's descriptor.

### 2.1 The 4 things being registered

For every template today:

1. **`migrated-templates.ts`**: an entry in `STAGE_BENCH_TEMPLATES: Set<TemplateType>`. Says "this template uses Stage & Bench."
2. **`StageBenchEditor.tsx`**: an entry in `TEMPLATE_ADAPTERS: Partial<Record<TemplateType, ComponentType>>`. The adapter component.
3. **`lib/template-registry.tsx`**: an entry with `{ component, renderProps, queueTextFields, renderSchema }`. Powers the Puppeteer render route + queue UI.
4. **`lib/export-params.ts`**: an entry in `BUILDERS: Record<string, ExportParamBuilder>`. Maps store state → URL params for the render route.

### 2.2 The unified shape

Extend the `defineStageBenchAdapter` descriptor from Task 1 with a `registerSchema` field that contains everything `template-registry` needs:

```ts
type TemplateRegisterSchema = {
  width: number
  height: number
  background: string | null
  /** Defaults for the Puppeteer render — these are the renderSchema.fields. */
  fields: SchemaField[]
  /** Optional reshape pass for parsed URL params. */
  assembleProps?: (parsed, raw) => Partial<TProps>
  /** Optional dynamic background based on parsed params. */
  dynamicBackground?: (parsed) => string
  /** Optional queue text fields list. */
  queueTextFields?: { key: string; label: string; showKey?: string }[]
}
```

The factory then:
1. Builds and exports the adapter component (used by `StageBenchEditor`).
2. Auto-generates the `template-registry` entry by combining `Template`, `registerSchema`, and a `renderProps` derived from `slots` + `image` + `category` + `contentStack`.
3. Auto-generates the `export-params` builder by walking the same `slots` (their `storeField`s tell you what to emit) + `image` + `contentStack`.
4. Auto-registers in `STAGE_BENCH_TEMPLATES`.

### 2.3 How registration becomes one-step

Each adapter file ends with:

```ts
export const socialImageAdapter = defineStageBenchAdapter({
  templateId: 'social-image',
  Template: SocialImage,
  registerSchema: { ... },
  slots: [ ... ],
  stageBar: [ ... ],
  image: { ... },
  category: { ... },
  contentStack: { ... },
})
```

A single `registerAdapters([socialImageAdapter, ...])` call at app boot wires up all four registries from these exports. `migrated-templates.ts` collapses to a derived getter. `StageBenchEditor.tsx`'s map collapses to a derived lookup. `template-registry.tsx` and `export-params.ts` collapse to their non-Stage-Bench entries plus the auto-generated ones.

### 2.4 Implementation order

1. Implement the `registerAdapters()` plumbing — internal registries that the existing consumers read from.
2. Port the 3 pilot adapters (from Task 1) — they each get the `registerSchema` field added.
3. Delete the manual entries for those 3 templates from `template-registry.tsx` + `export-params.ts` + `migrated-templates.ts` + `StageBenchEditor.tsx`.
4. Type check + smoke test. Confirm Puppeteer export still works for those 3 templates (this is the highest-risk surface).
5. Port the rest as Task 1 progresses.

### 2.5 Acceptance criteria

- [ ] After landing, opening any one of the 3 pilot template adapter files shows the *complete* registration shape — no need to grep across 4 files.
- [ ] `template-registry.tsx` and `export-params.ts` shrink meaningfully (each Stage-Bench entry deleted).
- [ ] Puppeteer export produces byte-identical (within reason) PNG for the 3 pilots before and after.
- [ ] `tsc --noEmit` clean.

### 2.6 Pitfalls

- **The auto-generated `renderProps` must match what the template actually receives in editor mode.** Walk through them carefully — if the factory props don't match the template's prop types, you'll get silent rendering differences only caught at QA time.
- **`assembleProps` is template-specific reshaping** (e.g., `imagePositionX` + `imagePositionY` → `{ x, y }`). Keep it as an escape hatch.
- **Some templates have `queueTextFields`** for the queue UI. Don't drop them — preserve via the new schema.

---

## Task 3 — Convention pass: visibility flags + grid naming

**Goal:** Eliminate the 3 inconsistencies that will trap new contributors. One-time cleanup. Document the convention so it doesn't regrow.

**Estimate:** 2–3 hours.

**Dependency:** none — can run before or after Task 1/2. Recommended *after* the factory lands so renames sweep through the descriptor instead of 27 adapter files.

### 3.1 Inconsistency #1 — Grid off-by-one

In `WebsiteEventListing`, `WebsiteEhsAccelerateListing`, `SocialGridDetail`:
- Template prop `gridDetail1` is row 1, `gridDetail2` is row 2, etc.
- Visibility flag `showRow3` controls **`gridDetail2`** visibility (NOT row 3).
- Flag `showRow4` controls **`gridDetail3`** visibility (NOT row 4).

The naming came from one template and propagated. Today there are 24 references to this off-by-one pattern in adapter code.

**Fix:**
- Rename store fields: `showRow3` → `showGridDetail2`, `showRow4` → `showGridDetail3`. Or alternatively, rename `gridDetail2` → `gridDetail3` etc. so the numbers line up. Pick whichever is fewer touches (probably the former — only 2 store setters + uses).
- Update the 3 templates' prop signatures.
- Update the 3 adapters' subscriptions.
- Update `template-configs/{event-listing,ehs-accelerate-listing,social-grid-detail}.ts` slot paths.
- Update `template-registry.tsx` and `export-params.ts` for these 3 templates.
- Update the renovation plan's notes that mention the off-by-one (1–2 lines).

**Verification:** type check + render-route export for the 3 templates.

### 3.2 Inconsistency #2 — Visibility-flag prefixing

Today we have a mix:
- Generic: `showEyebrow`, `showHeadline`, `showSubhead`, `showBody`, `showCta`, `showSolutionSet`, `showRow3`
- Template-prefixed: `showCceEventDate`, `showCceEventLocation`, `showCceEventTime`, `showSignatureWorkshopName`, `showSignatureEventDetails`
- Inconsistent: `showLightHeader`, `showHeavyHeader`, `showGridDetail2`

The prefixed ones exist because `eventDate` is shared across multiple templates but the visibility is per-template. Fine in principle, but the rule should be:

**Convention to adopt:** *If a store field is shared across N templates and visibility is per-template, prefix the visibility flag with the template's short name (e.g., `showCce*`, `showSignature*`). If the store field is per-template or shared, use the generic flag (`showEyebrow`, etc.).*

**Don't rename existing ones unless they're wrong** — that's churn for no gain. Just document the rule (Task 6) and audit any new flags against it.

### 3.3 Inconsistency #3 — Some slots have show-flags, some don't

`EmailCorityConnect2026` has `showHeadline`/`showBody`/`showCta`. `EmailProductRelease` has zero visibility flags — eyebrow and headline are always-on. `EmailEhsAccelerateBanner` has only `showBody`; eyebrow/date/location/cta are always-on.

There's no rule about when a slot is bench-toggleable vs. fixed-presence. Decisions were made template-by-template based on what the legacy editor exposed.

**Convention to adopt:** *If a slot is shown in the bench (the chip list), it has a `show<Field>` flag. If a slot is always-on (logo, mandatory headline, baked-in branding), it has no flag and no bench chip.*

This is the rule the migration mostly followed. Just document it. **Don't add flags to templates where the design says "always on"** — that's design drift.

### 3.4 Acceptance criteria

- [ ] Grid off-by-one renamed in store + the 3 affected templates + their adapters + registry.
- [ ] `tsc --noEmit` clean.
- [ ] Document the two conventions in `STAGE-AND-BENCH.md` (one paragraph each). They become the rules for Task 6's playbook.

### 3.5 Pitfalls

- **Renames touch store-side persistence.** Existing user drafts may have the old field names. Add a one-time migration shim in `loadDraft()` (mirrors the pattern used for `templateGaps` bundling): `showGridDetail2: draft.showGridDetail2 ?? draft.showRow3`.

---

## Task 4 — One-time dead-prop audit

**Goal:** Sweep the catalog for destructured-but-unused template props. The migration uncovered `logoColor` (7 templates) and `cta` (2 templates) but only because TypeScript errored when callers passed them. There may be more that just sit dead and unused.

**Estimate:** 1–2 hours.

**Dependency:** none.

### 4.1 The pattern that's been recurring

A template prop existed for legacy reasons (e.g., `logoColor: 'black' | 'orange'`). The template destructured it: `function Foo({ logoColor, ... })`. But the template's render derived the actual color from theme or hardcoded values, never using the prop. Callers (`EditorScreen`, `AssetSidebar`, `TemplateTile`) kept passing it. TypeScript only caught it when the prop was *removed* — never while it sat unused.

### 4.2 Sweep procedure

Two options. **Pick one — don't do both.**

**Option A — manual sweep (recommended, faster, less risk):**

```bash
# For each template in components/templates/, list destructured props that don't appear elsewhere in the file.
# Then manually verify each suspect.
cd ~/claude-projects/design-dog/web/components/templates
for f in *.tsx; do
  echo "=== $f ==="
  # Get the destructured names from the function signature, then grep each one's body usage.
  # (You'll iterate — pattern depends on each template's signature shape.)
done
```

Suspects to spot-check first (these have logoColor-shaped histories — props that were "carried forward"):

- `EmailGrid` — re-check post-rename. Already cleaned.
- `EmailImage` — already cleaned, verify clean.
- `WebsiteWebinar` — `speakerCount` prop is suspect (do we ever USE it, vs deriving from `showSpeaker1/2/3`?).
- Newsletter templates (`-dark-gradient`, `-blue-gradient`, `-light`) — verify `colorStyle` is still used post-renovation, not just destructured.
- `WebsiteFloatingBanner` / `-mobile` — already cleaned but check for stragglers.
- `EmailCorityConnect2026` — `colors` prop appears in signature but the template may not use it (only `typography` is used). If unused, drop.

**Option B — ESLint rule (more thorough, takes longer to set up):**

Add `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'` enabled at the strictest level. It already catches unused locals; combine with `no-unused-properties` on function parameter destructuring. This will surface every dead destructured prop in the codebase, not just templates. Worth doing eventually, but the audit is faster as a one-shot.

### 4.3 What to do when you find one

For each dead prop:

1. Remove it from the template's interface and function signature.
2. Type-check. If callers fail, drop the prop from them too (`EditorScreen.tsx`, `QuickStartEditor/AssetSidebar.tsx`, `TemplateTile.tsx`, the relevant adapter, `template-registry.tsx` renderProps, `export-params.ts` builder, any render schema field).
3. **Special care:** if the prop is in the `renderSchema.fields` array, removing the schema field changes the Puppeteer export URL. Verify the field wasn't load-bearing for some legacy export path.

### 4.4 Acceptance criteria

- [ ] Single audit commit (or one commit per template-with-cleanup) listing each dead prop removed.
- [ ] `tsc --noEmit` clean.
- [ ] Smoke test: export a PNG of each template touched. Compare visually to a pre-audit export.

### 4.5 Pitfalls

- **`grayscale` looks unused** in some templates but it's a real prop — it triggers `useGrayscaleImage` and the `applyGrayscaleBoolean` cascade. Don't drop without tracing.
- **`colors` and `typography`** are passed to every template. Some templates only use `typography.fontFamily.primary` — `colors` is dead weight. But removing it changes every adapter call site. **Don't bother** — the cost exceeds the benefit. Mark as known-acceptable-tax.

---

## Task 5 — Stand up `SUBSTRATE-DEBT.md`

**Goal:** A single durable doc that tracks deferred items so they don't get lost in commit history. Not a backlog — a *debt ledger* with triggers ("when X happens, this gets done").

**Estimate:** 1 hour to seed; living doc thereafter.

**Dependency:** none.

### 5.1 File location

Create `.claude/SUBSTRATE-DEBT.md`. Reference it from `RENOVATION-PLAN.md` and from `CLAUDE.md`'s reference-docs table.

### 5.2 Format

Each entry is ~5 lines:

```markdown
## <Item name>

**What:** One sentence describing the debt.
**Why deferred:** What blocked or de-prioritized it.
**Cost to ignore:** What gets harder if we don't pay it down.
**Trigger condition:** When this becomes urgent (e.g., "when N=3 templates need rich text" or "before catalog hits 35 templates").
**Estimate to pay:** Rough effort.
**First step when you start:** Concrete entry point.
```

### 5.3 Seed entries (write these in)

1. **Rich-text inline editing**
   - What: `InlineTextEdit` is plain-text-only. HTML body fields in `EmailEhsAccelerateInvitation` (deferred) and any future collateral templates need rich editing.
   - Why deferred: paired with the upcoming collateral-rich-text work in a couple weeks.
   - Cost to ignore: blocks Invitation migration; users edit body via legacy sidebar (if available) or paste-HTML.
   - Trigger condition: collateral work starts, OR a third HTML-body template lands.
   - Estimate to pay: ~1–2 days for a minimal contenteditable-with-toolbar editor inside `InlineTextEdit`.
   - First step: prototype rich-text editing inside the existing `InlineTextEdit` portal. Reuse the `format: 'html'` ContentRegistry path that's already there.

2. **Newsletter → universal `thumbnailImageSettings`**
   - What: Newsletter image data lives in 4 flat globals (`newsletterImageUrl`, `newsletterImagePosition`, `newsletterImageZoom`, `newsletterImageFilters`). Every other image-flow template uses the universal per-template-bundled `thumbnailImageSettings[templateId]`.
   - Why deferred: would have ballooned the original migration. I extended the flat-field shape with `newsletterImageFilters` instead.
   - Cost to ignore: every newsletter image change touches a different code path. Adapter is ~30 lines longer than its peers. Export route has a special-case `newsletter-*` → `image*` param remap.
   - Trigger condition: any new newsletter template, OR the next time anything image-related changes across newsletters.
   - Estimate to pay: ~1 day. Delete 4 store fields, migrate 3 adapters, remove the export-route remap.
   - First step: `git grep newsletterImageUrl` to see the full surface area.

3. **Per-row data/cta type toggle on grids**
   - What: 4 Group D templates have rows whose `type: 'data' | 'cta'` comes from the store but isn't editable in S&B. Users see the existing type rendered; can't swap it interactively.
   - Why deferred: required a new per-block toolbar control. Out of scope for the migration sprint.
   - Cost to ignore: real-world feedback when users want to change a row's type and can't.
   - Trigger condition: first user complaint or design ask, OR the per-block toolbar gains a similar toggle for another reason.
   - Estimate to pay: ~3 hours. Add a 2-state `Toggle` inside `EditbarText`/`EditbarCta` that swaps the row's store `type` field. The factory descriptor should declare which slots support type-toggling.
   - First step: pick `EmailGrid` (smallest grid). Wire the toggle. Port to the other 3 once feel is right.

4. **`SelectorPrimitive kind="enum"` overflow carousel**
   - What: The N-state enum primitive renders all cells inline. Works for 3–7 cells; overflows the stage bar at 7+. Hits hardest on `EmailCorityConnect2026` (16 backgrounds) and the 7-variant floating banners.
   - Why deferred: design pass pending — Nick to finesse the UX.
   - Cost to ignore: stage bar looks bad for templates with >5 enum options.
   - Trigger condition: Nick's design pass; OR a new template lands that needs >5 enum options.
   - Estimate to pay: ~1 day depending on UX design.
   - First step: get the design (popover grid vs horizontal scroll vs ↔ buttons), implement once in `SelectorPrimitive`.

5. **Image-source-key for shared image slots**
   - What: When the same image source is used across multiple templates (e.g., a newsletter image visible in dark + light variants of the same asset), there's no concept of a "shared image identity." Each template gets its own settings bundle, which is correct architecturally but creates a UX wrinkle: edit the image in one variant, the other variant doesn't pick it up.
   - Why deferred: would require an explicit image-source-key concept in the store.
   - Cost to ignore: minor UX inconvenience for multi-variant newsletter assets.
   - Trigger condition: real-world feedback, OR newsletter→universal-image migration (since that's when the abstraction gets touched).
   - Estimate to pay: medium — depends on data model.
   - First step: only when the migration above runs.

6. **Per-speaker editing in WebsiteWebinar + EmailSpeakers**
   - What: The `speakers` panel in WebsiteWebinar is wrapped as a single block (`renderBlock('speakers', ...)`) but per-speaker fields (name, role, avatar) aren't independently editable in S&B. EmailSpeakers has the same "per-speaker filter wiring pending" note in the renovation plan.
   - Why deferred: requires deep-click + nested-slot semantics in the factory (Task 1, §1.4).
   - Cost to ignore: speaker fields are edited via legacy sidebar (if available) or by store-state surgery.
   - Trigger condition: factory's nested-slot support lands (whichever branch of Task 1 §1.4 wins), OR user feedback.
   - Estimate to pay: ~1 day once the factory supports nested slots.
   - First step: pick one speaker, wire its name field as a deep-click child of the speakers group. Validate, then propagate.

7. **Filter wiring on remaining image-flow templates**
   - What: A few image-flow templates accept `imageFilters` but don't fully thread filters through the renderProps + export-params pipeline. Caught and fixed for `email-product-release` (`c2763a3`). Worth a one-pass sweep to verify everything works end-to-end now.
   - Why deferred: easy to miss the second half (renderProps OR export-params, not both) when adding filters. Easier to catch with the factory in place.
   - Cost to ignore: image filters set in the editor don't survive Puppeteer export for some templates.
   - Trigger condition: after Task 1 (the factory makes this a non-issue going forward).
   - Estimate to pay: ~1 hour audit after factory lands.
   - First step: list all templates with `imageFilters` prop. Verify each has the filter scalars in renderSchema.fields and the assembleProps reshape. Grep `imageFilterExposure` to inventory.

### 5.4 Maintenance rule

Add to `CLAUDE.md`'s Lessons System section: *"When work is deferred, add a SUBSTRATE-DEBT.md entry before the commit lands. Don't rely on commit messages or chat history to remember."*

---

## Task 6 — Contribution playbook

**Goal:** A single one-page doc that a new contributor (human or agent) can read in 5 minutes and ship a new Stage & Bench template in 1 hour.

**Estimate:** 2–3 hours.

**Dependency:** **Task 1 must land first** — the playbook is built around the factory's descriptor.

### 6.1 File location

`.claude/STAGE-BENCH-MIGRATION.md` already exists but predates Group D and the factory. Either:
- **Option A:** Rewrite it in place. Best if it ages cleanly into the new shape.
- **Option B:** Archive the old as `STAGE-BENCH-MIGRATION-legacy.md` and start fresh.

Recommend Option A — the existing doc has substrate-map sections worth preserving.

### 6.2 Structure (≤ 1 page printed)

```markdown
# How to add a Stage & Bench template

## 1. Audit (15 min)
- Read the legacy template's render function.
- List editable elements + their store fields.
- Identify variants (theme, color, layout, custom).
- Note which slots are bench-toggleable vs. fixed-presence.
- Pick a paradigm:
  - **Track 1** (ContentStack + adjustable gaps) if the column has text-stack vibes.
  - **Track 2** (preserve composition exactly) if the design is fixed-pixel.
  - Grid panel: rows stay equal-flex (don't try to ContentStack-ify).

## 2. Renovate the template file (20 min)
- Add the `<TemplateName>BlockId` union export.
- Add render-prop signatures: `renderBlock?`, `renderInlineEditor?`, `renderSpacerBetween?` (Track 1), `renderOverlay?`.
- Replace `space-between` with ContentStack (Track 1) OR keep absolute positioning (Track 2).
- Wrap editable elements in `wrapBlock('<id>', node)`.
- Apply `useImageFilterStyle()` for image filters (post-Task-1).
- Don't change the visual output.

## 3. Write the adapter descriptor (15 min)
Single file: `template-adapters/<Name>StageBench.tsx`.

\`\`\`ts
export const fooAdapter = defineStageBenchAdapter({
  templateId: 'foo',
  Template: FooTemplate,
  registerSchema: { width, height, background, fields, ... },
  slots: [
    { blockId: 'eyebrow',  storeField: 'eyebrow', kind: 'text' },
    { blockId: 'headline', storeField: 'verbatimCopy.headline', kind: 'text', benchable: false },
    ...
  ],
  stageBar: [ ... ],
  image: { templateKey: 'foo', frameDims: ..., placeholderSrc: '...' },  // optional
  category: { ... },  // optional
  contentStack: { templateKey: 'foo' },  // Track 1 only
})
\`\`\`

## 4. Register (5 min)
Add to `adapters/index.ts`'s export list. That's it. The factory wires `STAGE_BENCH_TEMPLATES`, `template-registry`, and `export-params` automatically.

## 5. Verify (10 min)
- `npx tsc --noEmit`
- Open the template in the editor. Select each slot. Inline-edit. Drag to bench. Use stage-bar selectors. Open the image modal (if applicable).
- Export to PNG. Compare to legacy editor's export.
- Update `RENOVATION-PLAN.md` status row.
- Commit with message: `feat: Stage & Bench — <template-id>`.

## Conventions
- **Visibility:** every bench-toggleable slot has `show<Field>` flag.
- **Naming:** match slot path (`<template-id>.<blockId>`) to BlockId exactly.
- **Compound slots:** independent `<Editable>` siblings sharing a visibility flag (no compound-slot primitive).
- **Decorative chrome (dividers/borders):** stays visible always; not editable.
- **Always-on slots:** no `show<Field>` flag.
- **Logo:** brand-locked anchor, wrapped only for selection-ring feedback (never bench-able).

## Things to NOT do
- Don't share visual code between sibling templates (blue/dark/light, etc.) — that's design drift.
- Don't add `imageFilters` plumbing if the template doesn't have an editable image.
- Don't extend `SelectorPrimitive` for a one-off control — use `kind: 'custom'`.
- Don't ContentStack a grid-row panel.
- Don't migrate `newsletter-top-banner` or `email-ehs-accelerate-invitation` — both deferred (see `SUBSTRATE-DEBT.md`).

## Where things live
- Factory: `components/canvas-editor/factory/defineStageBenchAdapter.tsx`
- Substrate primitives: `components/canvas-editor/{ContentStack, Editable, InlineTextEdit, ...}.tsx`
- Stage-bar selectors: `components/canvas-editor/stage-bar/SelectorPrimitive.tsx`
- Registries (auto-wired by factory): `lib/template-registry.tsx`, `lib/export-params.ts`
```

### 6.3 Anti-goals

- **Don't include all the substrate's internal API docs.** That belongs in `STAGE-AND-BENCH.md`. The playbook is task-oriented, not reference-oriented.
- **Don't document the legacy editor migration steps.** Those are obsolete after the factory lands.
- **Don't write a tutorial.** A senior dev (or agent) just needs the descriptor shape and the conventions.

---

## Order of operations

```
Task 4 (dead-prop audit)       ──┐
                                 │
Task 5 (SUBSTRATE-DEBT.md seed)  │  ◄── all of these can run in parallel
                                 │       and before the factory
[Optional: Task 3 §3.1 grid     ─┘
 off-by-one rename]

         ▼

Task 1 (Adapter factory + 3 pilots)
    Sit with it 1 day before mass-porting.

         ▼

Task 2 (Single registration descriptor — folds into Task 1's pilots)

         ▼

[Port the remaining 22 templates onto the factory, in groups]

         ▼

Task 3 §3.2 + §3.3 (write visibility-flag conventions into STAGE-AND-BENCH.md)

         ▼

Task 6 (Contribution playbook — needs factory to be stable first)
```

---

## Total estimate

- Task 1: 1.5–2 days
- Task 2: 0.5–1 day (concurrent with Task 1)
- Task 3: 2–3 hours
- Task 4: 1–2 hours
- Task 5: 1 hour
- Task 6: 2–3 hours
- **Porting remaining 22 templates onto factory:** ~3 days (15 min × 22, plus QA, plus the inevitable surprises)

**Total: ~4–5 focused days** of work. After this, every future template ships in <1 hour and every substrate enhancement is 25× cheaper than today.

---

## Red lines — things to resist

These are temptations that will look smart but erode the design system:

- **Don't share visual code between sibling templates** (blue/dark/light variants, social-image vs meddbase, etc.). The 5% differences ARE the brand.
- **Don't unify Track 1 and Track 2 into a mega-factory.** Two factories. Each has clear rules.
- **Don't ContentStack-ify grid panels** (Group D right-side rows). Equal-flex distribution is the design contract.
- **Don't touch substrate primitives** (`ContentStack`, `Editable`, `SelectorPrimitive`, `ImageRegistry`, `CategoryRegistry`) unless a real new template forces a change. They earn their keep.
- **Don't gold-plate the descriptor.** Reserve `renderTemplate` and `kind: 'custom'` for rare cases. If you find yourself adding a 6th specialized selector kind, ask if it's really needed.
- **Don't migrate the deferred templates** (Invitation, newsletter-top-banner) before their trigger conditions in `SUBSTRATE-DEBT.md` fire.

---

## Closing note for the agent picking this up

If you're starting from a cold context: read this doc top to bottom once, run Pre-flight, then pick ONE task and execute. The dependency graph above shows you what's safe to do without the factory landing first. Resist the urge to do too many tasks at once — the value is in landing each cleanly, not in a heroic megacommit.

When in doubt: **simplify**. When you find yourself writing more code to solve a problem, step back and question. The migration's "design freedom > developer ergonomics" rule still applies — for templates. For the editor wiring, ergonomics matter a lot, because there will be 25+ of them.

Good luck.
