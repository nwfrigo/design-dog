# Stage & Bench — Substrate Debt Ledger

> Durable record of deferred substrate work. Not a backlog — a **debt ledger** with trigger conditions: each entry names the moment paying it down becomes urgent.
>
> **Maintenance rule:** when work is deferred, add an entry here *before the commit lands*. Don't rely on commit messages or chat history to remember.
>
> **Companion docs.**
> - `STAGE-AND-BENCH.md` — substrate architecture (what exists today).
> - `RENOVATION-PLAN.md` — per-template migration status.
> - `STAGE-BENCH-CLEANUP-PLAN.md` — the post-migration cleanup playbook this ledger was seeded from.

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

## Image-source-key for shared image slots

**What:** When the same image source is used across multiple templates (e.g., a newsletter image visible in dark + light variants of the same asset), there's no concept of a "shared image identity." Each template gets its own settings bundle, which is correct architecturally but creates a UX wrinkle: edit the image in one variant, the other variant doesn't pick it up.
**Why deferred:** Would require an explicit image-source-key concept in the store.
**Cost to ignore:** Minor UX inconvenience for multi-variant newsletter assets.
**Trigger condition:** Real-world feedback, OR newsletter→universal-image migration (since that's when the abstraction gets touched).
**Estimate to pay:** Medium — depends on data model.
**First step when you start:** Only when the newsletter→universal-image migration above runs.

