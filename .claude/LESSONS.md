# Design Dog — Lessons Log

> This is a running log of feedback, error patterns, and design decisions captured during QA and development.
> Items here should be applied silently during future work. Validated patterns get proposed for graduation
> into reference docs (BRAND.md, ARCHITECTURE.md, TEMPLATES.md) via GRADUATED_PENDING.md.

---

<!--
FORMAT: Add new entries under a date heading. Use tags to help with future categorization.
Tags: [ui], [pattern], [bug], [export], [dark-mode], [template], [state], [perf], [ux], [a11y]
-->

## 2026-03-30

- [state] `exportedBy` and other top-level store fields must be placed in the main `create()` block in `store/index.ts`, not inside helper functions like `getDefaultAssetSettings()`. Putting state in the wrong location causes TypeScript to see it as missing from `AppState`.

- [pattern] Export API logging must be fully awaited — NOT fire-and-forget. Vercel serverless functions terminate the moment the HTTP response is sent, killing any unresolved `.then()` chains. Both `uploadThumbnail()`/`uploadPdf()` and `logExport()` must be `await`ed before the `return new NextResponse(...)`. The latency cost (~1s blob upload) is acceptable because Puppeteer already dominates at 3–8s.

- [ux] Identity/user-facing utility UI (name picker modal, user badge chip) should use `text-xs font-mono text-gray-400 dark:text-content-secondary` — matching the about blurb tone — to keep it subtle and out of the way. These elements are infrastructure, not primary UI.

- [bug] Name picker shows empty (only "+ add") when the dev server isn't running or the `/api/team-members` call fails. The modal silently falls back to `[]` on any error. This is expected behavior — not a code bug. Ensure dev server is running before testing the picker.

- [pattern] Admin stat cards: use `flex flex-wrap gap-4` container + `w-fit min-w-[160px]` on each card rather than a CSS grid. Grid forces cards to fill the row width; flex lets them hug their content naturally.

