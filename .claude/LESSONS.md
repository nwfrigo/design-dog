# Design Dog — Lessons Log

> This is a running log of feedback, error patterns, and design decisions captured during QA and development.
> Items here should be applied silently during future work. Validated patterns get proposed for graduation
> into reference docs (BRAND.md, ARCHITECTURE.md, TEMPLATES.md) via GRADUATED_PENDING.md.

---

<!--
FORMAT: Add new entries under a date heading. Use tags to help with future categorization.
Tags: [ui], [pattern], [bug], [export], [dark-mode], [template], [state], [perf], [ux], [a11y]
-->

## 2026-10-15
- [export] CSS gradients with alpha stops (e.g. `rgba(255,255,255,0)`) break in `page.pdf()` exports: Chromium encodes them as soft-masked shadings that pdf.js-based viewers (Firefox, Highspot, Seismic, SharePoint/Teams previews) render as solid magenta/pink. macOS Preview and Acrobat look fine, so the bug only surfaces after distribution. Fix: pre-render the fade as a transparent PNG (`scripts/generate-roi-overlays.mjs`) and place it as an `<img>` overlay — alpha PNGs become plain SMask images, which every PDF renderer handles. Applied to industry-roi hero scrims.
- [export] `box-shadow` in `page.pdf()` exports renders as hard-edged rectangular banding instead of a soft blur (seen on industry-roi benefit-card cobalt glows and solution-pill shadows). Same fix: transparent PNG glow stretched behind the element (`RasterShadow` in components/shared). PNG/screenshot exports are unaffected — only templates that go through `page.pdf()` need this.

## 2026-10-23
- [state] My Designs invariant (Nick): one design = one card. Cards are created ONLY by picking a template or Clone; Edit never adds one, exported or not. Two seams used to violate it: (1) the logo-exit save resurrected a draft the export had just retired (fixed: exit save skips when the active entry no longer exists in storage — `hasDraftEntry` guard in EditorLayout); (2) continuing to edit after an export recreated the draft next to its own export row (fixed: exports are stamped with `draft_id`; the sidebar hides an export row whose source draft is live, and deleting a draft cascades a soft-hide to its linked rows). Any new save-on-exit or export path must preserve this invariant.
