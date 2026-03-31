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

## 2026-03-31
- [export] Never put `padding` on the outer container element of a template (the one with the explicit `width`/`height`). The Puppeteer render environment may resolve `height` as content-box, making the element `height + padding*2` pixels tall and adding whitespace to the exported PNG. Always put padding on an inner child div, leaving the outer container with only `width`, `height`, and `overflow: hidden`. This matches the pattern used by all existing templates (EmailDarkGradient, EmailProductRelease, etc.).

- [export] `TEMPLATE_DIMENSIONS` in `app/api/export/route.ts` is a **hardcoded local constant** — it is NOT imported from `lib/template-config.ts`. Every new template MUST be manually added to this map or exports fall back to `website-thumbnail` dimensions (800×450), capturing white body background below/beside the template. This is the #1 cause of whitespace in exported PNGs for new templates. Always add `'template-slug': { width: N, height: N }` to this constant as part of the "adding a new template" checklist.

- [pattern] Major backend feature shipped: admin/monitor system with team identity (team code gate + name picker), Vercel Postgres database (team_members, drafts, activity_log tables), export thumbnail storage to Vercel Blob, shared activity feed, and export gallery. See Team-Identity-Feature-Request.docx in project root for full spec. Key architectural decisions: team code as env var (TEAM_ACCESS_CODE), name-based identity with long-lived cookies, localStorage kept as fallback alongside database persistence, auto-save debounce preserved for DB writes.

