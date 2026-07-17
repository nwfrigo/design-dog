# Stage & Bench — Substrate Debt Ledger

> Durable record of deferred substrate work. Not a backlog — a **debt ledger** with trigger conditions: each entry names the moment paying it down becomes urgent.
>
> **Maintenance rule:** when work is deferred, add an entry here *before the commit lands*. Don't rely on commit messages or chat history to remember.
>
> **Companion docs.**
> - `STAGE-AND-BENCH.md` — substrate architecture (what exists today).
> - `STAGE-BENCH-REFACTOR-POSTMORTEM.md` — historical journal of the renovation that birthed this ledger.

---

## Entry format

```markdown
## <Item name>

**What:** One sentence describing the debt.
**Why deferred:** What blocked or de-prioritized it.
**Cost to ignore:** What gets harder if we don't pay it down.
**Trigger condition:** When this becomes urgent.
**Estimate to pay:** Rough effort.
**First step when you start:** Concrete entry point.
```

---

## EmailCorityCustomerExchangeBanner — no intra-block spacing

**What:** The headline / body / cta column on this 640×300 banner uses absolute positioning rather than ContentStack, so there's no spacer-drag UX for adjusting gaps between blocks.
**Why deferred:** Adding spacing requires migrating the right column to ContentStack — a template rewrite, not a config change. Substrate-conformant but not lightweight.
**Cost to ignore:** Users can't fine-tune the rhythm between headline / body / cta the way they can on other Track 1 templates.
**Trigger condition:** Either (a) ehs-accelerate-banner gets the same migration (since both are absolutely-positioned banners) and we batch the work, OR (b) a real export needs custom block spacing.
**Estimate to pay:** Medium (~1–2h per template — port the right column to ContentStack, wire `contentStack.maxGap` in the adapter, port `renderSpacerBetween`).
**First step when you start:** Read EmailDarkGradient.tsx for the ContentStack-with-absolutely-positioned-anchor pattern. Then convert the right column of EmailCorityCustomerExchangeBanner.tsx to use ContentStack while keeping the left logo panel absolute.

---

## Multi-page templates: fixed count only (no reorder / add-remove)

**What:** The multi-page primitive (`pages: { count, labels }` + `PageSelector`, STAGE-AND-BENCH.md §10) supports a **fixed** page count declared at build time. Users can't add, remove, or reorder pages, and there's no cross-page slot reference (a value edited on page 1 that echoes on page 2 must be two independent slots today — e.g. `executive-overview`'s partner name appears in both the page-1 headline and the page-2 tagline as separate editable slots).
**Why deferred:** The first consumer (`executive-overview`) is a fixed 2-pager; dynamic page management is a FAQ-style paradigm (auto-pagination) that needs its own design. Shipping fixed-count keeps the primitive honest and small.
**Cost to ignore:** A future variable-length multi-page asset (e.g. a paginated brief) can't reuse this primitive as-is; a user editing the partner name must type it on both pages.
**Trigger condition:** (a) a second multi-page template needs a variable page count, OR (b) real usage shows the duplicate partner-name edit is a genuine friction point.
**Estimate to pay:** Medium for reorder/add-remove (page list becomes store state, not a static descriptor); Small for partner-name propagation (a shared store field both slots read, with the page-1 headline composing `Cority & {partnerName}`).
**First step when you start:** For propagation — add a single `executiveOverviewPartnerName` field the headline and tagline both derive from, and decide whether on-canvas editing targets the whole headline or just the name token. For dynamic pages — promote `PagesConfig.count` to a store-backed page array and add pager add/remove affordances.

---

## Image slots can't be toggled off (no bench/eye affordance for kind:'image')

**What:** `kind:'image'` slots have no hide affordance — images don't drag to the bench (factory suppresses drag for images) and `EditbarImage` has no EyeOff button. So an image is either always-on or absent; there's no user toggle. `executive-overview` works around this by making its 3 images (partner logo, hero, contact avatar) always-on `benchable:false` with empty-state placeholders. This means a Cority-only prospect (no partner logo) still shows the partner-logo placeholder area, and the placeholder prints on export.
**Why deferred:** Adding image visibility is a substrate change (image visibility flag + an EyeOff in `EditbarImage`, or a stage-bar toggle) with its own QA; not required to ship the first multi-page collateral.
**Cost to ignore:** Templates can't offer optional images; empty image placeholders render in exports when the user has no asset to supply.
**Trigger condition:** A real request to omit the partner logo / hero on `executive-overview`, OR the next template that needs a genuinely optional image.
**Estimate to pay:** Small–Medium — add an EyeOff to `EditbarImage` wired to a `setVisible` on the image slot (bench chip for images), OR a per-image stage-bar on/off toggle; then gate the template's image render on the flag.
**First step when you start:** Add a `showX` flag for the image in the doc + a `setVisible` in the adapter's `slotState`, and surface a hide control (EditbarImage EyeOff is the substrate-consistent home).

---

## Executive Overview chip icons aren't user-editable

**What:** On `executive-overview` page 2, each feature chip's LABEL is an editable text slot, but its ICON is a fixed default (`EXEC_DEFAULT_CHIP_ICONS` in the template constants). A user who rewrites a chip label can't change the (now possibly mismatched) Lucide icon.
**Why deferred:** There's no "icon" editbar kind in the substrate; wiring a per-chip icon picker (the Stacker-style `IconPickerModal`) into the S&B editbar is its own change. Labels are the meaningful editable content for v1.
**Cost to ignore:** A chip icon can read as mismatched after a label rewrite.
**Trigger condition:** User feedback that chip icons feel wrong/locked, OR any other S&B template needs per-element icon selection (build the icon editbar kind once, reuse).
**Estimate to pay:** Medium — add an `icon` editbar kind + registry that opens `IconPickerModal` and writes the chip's `icon` via an adapter setter (`updateExecChip(doc, i, j, { icon })` already exists).
**First step when you start:** Model it after `EditbarCategory` (dropdown editbar) but opening the Lucide picker; add an `IconRegistry` slot for chip blockIds.

---

## Per-page thumbnails in the PageSelector

**What:** The `PageSelector` pager shows text labels ("1 Page 1 / 2 Page 2"), not live mini-thumbnails of each page.
**Why deferred:** Labels are enough to navigate a 2-page asset; thumbnails add a render/scale pass per page.
**Cost to ignore:** Slightly less glanceable navigation as page counts grow.
**Trigger condition:** A multi-page template with 4+ pages, OR user feedback that page identity is unclear.
**Estimate to pay:** Small–Medium — render each page through a scaled preview (reuse ScaledStage math) into the pager cells.
**First step when you start:** Render `renderTemplate` at each page index into a fixed-size, non-interactive scaled box inside `PageSelector`.

---

## Image-source-key for shared image slots

**What:** When the same image source is used across multiple templates (e.g., a newsletter image visible in dark + light variants of the same asset), there's no concept of a "shared image identity." Each template gets its own settings bundle, which is correct architecturally but creates a UX wrinkle: edit the image in one variant, the other variant doesn't pick it up.
**Why deferred:** Would require an explicit image-source-key concept in the store.
**Cost to ignore:** Minor UX inconvenience for multi-variant newsletter assets.
**Trigger condition:** Real-world feedback, OR newsletter→universal-image migration (since that's when the abstraction gets touched).
**Estimate to pay:** Medium — depends on data model.
**First step when you start:** Only when the newsletter→universal-image migration above runs.

---

## Brand chrome extraction (shared invariant block styling)

**What:** The invariant styling of rendered brand blocks — eyebrow (uppercase / letter-spacing / weight 500), headline (weight 300/350), CTA (label + `ArrowIcon`, weight 500), and the logo + solution-pill header row — is copy-pasted across the custom-size engine (`CustomSizeCanvas.tsx` `chrome()` / `headerRow()`) **and** ~19 ContentStack templates' `renderChrome` blocks (EmailImage, WebsiteThumbnail, SocialGridDetail, …).
**Why deferred:** It's a cross-cutting refactor of all ContentStack templates + the engine; not required to *ship* custom-size, but it's the thing that stops the engine and templates from drifting into two definitions of the brand look.
**Cost to ignore:** A brand-typography change (e.g. headline weight 300→350, new CTA arrow) must be hand-edited in ~20 places; the custom-size engine becomes an (N+1)th copy that silently diverges.
**Trigger condition:** Before wiring custom-size into the real editor (so the engine consumes the shared chrome rather than adding another copy), OR the next brand-typography change that would touch multiple templates.
**Estimate to pay:** Medium (~half day) — extract `brandChrome(id, { fontSize, theme, align })` + a `BrandHeaderRow`. Centralize ONLY the invariants (weight, casing, letter-spacing ratio, arrow geometry); keep per-template font sizes as params (they legitimately differ: 38.15 vs 35 vs 84).
**First step when you start:** Diff `chrome()` in `CustomSizeCanvas.tsx` against the `renderChrome` blocks in `EmailImage.tsx` / `WebsiteThumbnail.tsx` / `SocialGridDetail.tsx`; pull the common styling into `lib/brand-chrome.tsx`; have the engine import it first, then migrate templates opportunistically.

---

## Custom-size triage uses estimated, not measured, heights

**What:** The resolver's vertical-fit triage (`lib/custom-size/resolve.ts`) estimates block heights from a hardcoded `EST_LINES` table × 1.2 line-height, not measured layout — so it can mispredict drops for real wrapped text.
**Why deferred:** Estimation is fine for the spike and avoids a measure→render→remeasure loop; measured layout only matters once exports depend on pixel-exact, deterministic drop decisions.
**Cost to ignore:** A block may drop (or survive) when the opposite visibly looks right at certain content lengths.
**Trigger condition:** First time a user reports a block dropping that visibly fit (or vice versa), OR export-fidelity QA flags a triage mismatch.
**Estimate to pay:** Medium — move triage to a post-render measurement pass (measure actual block heights, then drop), keeping the resolver pure by doing the measure step in the editor/render layer.
**First step when you start:** Instrument the editor to log estimated vs actual block heights across the test ratios; if the gap is material, add a measured-fit pass.

---

## CTA button/link toggle shows on templates that can't switch

**What:** `EditbarCta`'s BUTTON⟷LINK toggle renders on *every* `kind:'cta'` slot, but most templates hardcode their CTA style — only the ones whose CTA chrome branches on `ctaStyle` (custom-size + the social gradients) actually change. On rigid templates the toggle is inert.
**Why deferred:** Surfaced while wiring custom-size's live CTA switch; gating is its own change with its own QA, intentionally scoped to a separate branch.
**Cost to ignore:** Misleading UX — a user flips the toggle on a rigid template and nothing happens.
**Trigger condition:** A user reports the dead toggle, OR the next time CTA styling / the editbar slot-kind dispatch is touched.
**Estimate to pay:** Small — add a "cta style switchable" capability (slot config or registry flag) and gate `EditbarCta`'s toggle on it.
**First step when you start:** `grep ctaStyle components/templates` to enumerate which CTAs actually branch; add the capability flag at the slot/registration level and read it in `EditbarCta`.

