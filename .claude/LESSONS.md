# Design Dog — Lessons Log

> This is a running log of feedback, error patterns, and design decisions captured during QA and development.
> Items here should be applied silently during future work. Validated patterns get proposed for graduation
> into reference docs (BRAND.md, ARCHITECTURE.md, TEMPLATES.md) via GRADUATED_PENDING.md.

---

<!--
FORMAT: Add new entries under a date heading. Use tags to help with future categorization.
Tags: [ui], [pattern], [bug], [export], [dark-mode], [template], [state], [perf], [ux], [a11y]
-->

## 2026-03-06
- [template] New templates must be registered in ExportQueueScreen.tsx in THREE places: (1) text fields extraction (~getTextFields), (2) queue thumbnail rendering (the scaled preview in the queue card), (3) preview modal rendering (full-size preview on click). This is separate from EditorScreen.tsx and TemplateTile.tsx — missing it causes the queue to show an empty box instead of the template preview. The "Adding a New Template" checklist in TEMPLATES.md should include this as an explicit step.
