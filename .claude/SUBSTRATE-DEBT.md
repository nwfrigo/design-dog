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

