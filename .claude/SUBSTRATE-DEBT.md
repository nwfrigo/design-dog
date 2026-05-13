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

---

## Nested image slots (per-speaker avatars)

**What:** The nested-slot factory primitive (`parent: 'parentBlockId'` on SlotDescriptor) supports text children — per-speaker name + role are now editable on WebsiteWebinar + EmailSpeakers. Avatar (image) children are NOT yet supported: image slots have their own framework (`image: { blockId, placeholderSrc }` on the adapter, position/zoom/filters settings, ImageEditorModal) and that framework currently assumes one image slot per template.
**Why deferred:** Image substrate is more involved than text substrate (image-editor modal, settings bundle, per-image filters). The text case unblocked per-speaker name/role editing which was the user-visible gap; avatars stay editable via the existing per-speaker lightbox flow.
**Cost to ignore:** Avatar position/zoom/upload still works via the legacy per-speaker editor lightbox in `EmailSpeakersStageBench`; it just doesn't compose with the bench/chip surface the way text children do.
**Trigger condition:** A new template needs multiple image children inside a group, OR user feedback that per-speaker avatar editing should match per-speaker name/role editing.
**Estimate to pay:** ~1 day. Extend the factory's `image` config to accept a child variant, route `imageSlotState` per child, hook into the existing per-block ImageEditorModal opener.
**First step when you start:** Promote one speaker avatar to a child image slot in WebsiteWebinar — wire the bench-chip suppression and ImageEditorModal opener through the same channel name/role children use.
