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

