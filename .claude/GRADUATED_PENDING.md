# Design Dog — Graduation Queue

> Items proposed for promotion from LESSONS.md into a reference doc.
> Nick reviews and approves/rejects. Do not modify reference docs until explicitly approved.

---

<!--
FORMAT:

### [Proposed destination] — Short description
- **Source date:** YYYY-MM-DD
- **Original lesson:** The exact text from LESSONS.md
- **Rationale:** Why this is ready (validated across 2+ instances, clearly universal, etc.)
- **Proposed text:** The exact text to insert into the destination doc
- **Proposed placement:** Which section of the destination doc it should go in
-->

### ARCHITECTURE.md — Export API logging must be fully awaited
- **Source date:** 2026-03-30
- **Original lesson:** Export API logging must be fully awaited — NOT fire-and-forget. Vercel serverless functions terminate the moment the HTTP response is sent, killing any unresolved `.then()` chains. Both `uploadThumbnail()`/`uploadPdf()` and `logExport()` must be `await`ed before the `return new NextResponse(...)`. The latency cost (~1s blob upload) is acceptable because Puppeteer already dominates at 3–8s.
- **Rationale:** Vercel architectural constraint — applies to any future async side-effects in the export route (logging, analytics, notifications). Not a one-off.
- **Proposed text:** `await` all side-effect calls (`uploadThumbnail()`, `uploadPdf()`, `logExport()`, any future analytics) before returning `NextResponse` in the export route. Vercel serverless functions terminate the instant the response is sent — any unresolved `.then()` chains are killed. Fire-and-forget does not work on Vercel. The latency cost (~1s blob upload) is acceptable because Puppeteer already dominates at 3–8s.
- **Proposed placement:** ARCHITECTURE.md → Export Pipeline section, under a new "Export Gotchas" or "Async Side-Effects" note

### ARCHITECTURE.md — DELETE "Show toggles need content checks" guidance (now wrong)

- **Source date:** 2026-05-14
- **Original lesson:** Pattern A cleanup (commit `351a76c`) removed `showFoo: asset.showFoo && !!asset.foo` from every registration's `renderProps` and `exportBuilder` — that pattern was the root cause of editor/export drift (editor showed placeholders, export dropped the slot entirely). Substrate §8.4 already documents the rule: never gate visibility on content presence.
- **Rationale:** `ARCHITECTURE.md:304-308` currently recommends the exact anti-pattern we just removed everywhere. Leaving the stale guidance means future template work will reintroduce the bug.
- **Proposed text:** *(delete current item 2 under "Common Gotchas" in the "Image Settings: Editor ↔ Queue ↔ Export Consistency" section, replace with):* **Show toggles render from `show*` alone.** Substrate §8.4: a slot renders whenever its `show*` flag is true, regardless of content presence. The template's `defaultInner: value || SLOT_PLACEHOLDERS.foo` handles the empty case. **Never** write `showFoo: asset.showFoo && !!asset.foo` in `renderProps` or `exportBuilder` — that pattern makes the export drop slots the editor shows. `npm run validate:registrations` will catch a missing flag; visual sweep of empty-field exports catches this anti-pattern.
- **Proposed placement:** ARCHITECTURE.md → "Image Settings: Editor ↔ Queue ↔ Export Consistency" → "Common Gotchas", replacing the current item 2 (lines ~304–308).

---

### ARCHITECTURE.md — Vercel Deployment Protection bypass for Puppeteer

- **Source date:** 2026-05-14
- **Original lesson:** Commit `7fc0abb` wired `VERCEL_AUTOMATION_BYPASS_SECRET` into `app/api/export/route.ts` so Puppeteer can navigate SSO-protected preview deployments. Without it, the headless browser hits the Vercel login interstitial instead of `/render/...` and times out on `#render-ready`.
- **Rationale:** Will recur on every protected preview deploy; not obvious from the error log (the Vercel login HTML is what comes back, not a 401). Worth a sentence in the Export Gotchas list so future debugging starts at the right place.
- **Proposed text:** **Preview deployments are SSO-gated.** Vercel's Deployment Protection blocks Puppeteer's bare navigation to `/render/[slug]` — the browser receives the Vercel login HTML, not the template, and the export times out on `#render-ready`. The export route reads `VERCEL_AUTOMATION_BYPASS_SECRET` and sends it as `x-vercel-protection-bypass`. Enable "Protection Bypass for Automation" in project settings; the env var is auto-injected. Symptom of misconfig: page content at timeout contains `--raw-sidebar-width` / `--raw-omniagent-panel-width` CSS variables.
- **Proposed placement:** ARCHITECTURE.md → Export System → "Export Gotchas", as a new bullet.

---

### STAGE-AND-BENCH.md — Reference SLOT_PLACEHOLDERS as the canonical source

- **Source date:** 2026-05-14
- **Original lesson:** Commit `0fdfe47` lifted the canonical placeholder table out of §8.4 into `lib/slot-placeholders.ts`, with every template + adapter importing from there. The table in §8.4 is now duplicated; future placeholder changes touch one file, not 50.
- **Rationale:** Mechanical update — the table is identical to the runtime constant.
- **Proposed text:** In §8.4 ("Block existence is independent of content"), replace the inline canonical placeholder table with:  *"Canonical placeholders live in `lib/slot-placeholders.ts` (constant `SLOT_PLACEHOLDERS`). Templates import the constant for `defaultInner: value || SLOT_PLACEHOLDERS.foo` fallbacks; adapter slot descriptors import it for `content: { placeholder: SLOT_PLACEHOLDERS.foo }`. Editor preview and Puppeteer export read the same string for empty slots. Override per-template only when the design calls for a flavored default."*  Keep the "When to override the canonical" guidance below.
- **Proposed placement:** STAGE-AND-BENCH.md §8.4, replacing the inline table.

---

### STAGE-AND-BENCH.md — TEMPLATE_SUBCHANNEL_LABEL drives editor tab prefix

- **Source date:** 2026-05-14
- **Original lesson:** Commit `7a77ac5` added `TEMPLATE_SUBCHANNEL_LABEL` in `lib/template-config.ts`, derived from `SUBCHANNELS`. The Stage & Bench editor header (`StageBenchHeader.tsx`) reads from this map so the tab prefix ("EMAIL BANNER / GRID DETAILS") matches the homepage filter chip label. Previously it derived the prefix by splitting `templateId.split('-')[0]`, which drifted from the homepage source.
- **Rationale:** Future template work will land in `SUBCHANNELS`; the tab prefix lights up automatically. Worth a sentence so the editor surface isn't a "wait, how does this know its label" black box.
- **Proposed text:** Add a short bullet in §4.x (perhaps near §4.13 ActionRow / shell components, or as a new §4.18) noting:  *"`StageBenchHeader` renders the asset breadcrumb as `<SUBCHANNEL LABEL> / <TEMPLATE LABEL>`. Both come from `lib/template-config.ts`: `TEMPLATE_SUBCHANNEL_LABEL` (derived from `SUBCHANNELS`, honoring `TemplateInfo.channelLabel` overrides) and `TEMPLATE_LABELS`. Slotting a template into the right `SUBCHANNELS` entry lights up the prefix automatically — no per-template wiring."*
- **Proposed placement:** STAGE-AND-BENCH.md §4 (Substrate inventory), new subsection or appended to §4.13.

---

### BRAND.md — Do not add CSS gradient orbs over pre-rendered gradient background images
- **Source date:** 2026-04-02
- **Original lesson:** Do NOT add CSS gradient orb `<div>`s to templates that use a background image already containing the gradient. Overlaying orbs on top of a gradient background image doubles saturation and makes the render darker/more saturated than the Figma source. Check the background asset first — if the gradient is baked in, rely on the image alone. This applies to all EHS+ Accelerate templates (banner, invitation, signature) and any future templates using pre-rendered gradient backgrounds.
- **Rationale:** Will recur with any template using a pre-rendered gradient background image. Figma exports often bake in gradient layers that look like separate design elements — easy to accidentally recreate them in CSS on top.
- **Proposed text:** If a template uses a background image that already contains a gradient effect (e.g. EHS+ Accelerate templates), do NOT add CSS gradient orb `<div>`s on top. Overlaying CSS gradients doubles the saturation and makes the render darker than the Figma source. Check the background asset before adding any gradient overlays — if the gradient is baked into the image, rely on the image alone.
- **Proposed placement:** BRAND.md → Image Handling section (or Figma Override Rules), as a note on gradient backgrounds
