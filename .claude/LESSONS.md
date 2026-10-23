# Design Dog — Lessons Log

> This is a running log of feedback, error patterns, and design decisions captured during QA and development.
> Items here should be applied silently during future work. Validated patterns get proposed for graduation
> into reference docs (BRAND.md, ARCHITECTURE.md, TEMPLATES.md) via GRADUATED_PENDING.md.

---

<!--
FORMAT: Add new entries under a date heading. Use tags to help with future categorization.
Tags: [ui], [pattern], [bug], [export], [dark-mode], [template], [state], [perf], [ux], [a11y]
-->

## 2026-10-23
- [state] My Designs invariant (Nick): one design = one card. Cards are created ONLY by picking a template or Clone; Edit never adds one, exported or not. Two seams used to violate it: (1) the logo-exit save resurrected a draft the export had just retired (fixed: exit save skips when the active entry no longer exists in storage — `hasDraftEntry` guard in EditorLayout); (2) continuing to edit after an export recreated the draft next to its own export row (fixed: exports are stamped with `draft_id`; the sidebar hides an export row whose source draft is live, and deleting a draft cascades a soft-hide to its linked rows). Any new save-on-exit or export path must preserve this invariant.
