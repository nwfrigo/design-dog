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

### BRAND.md — Do not add CSS gradient orbs over pre-rendered gradient background images
- **Source date:** 2026-04-02
- **Original lesson:** Do NOT add CSS gradient orb `<div>`s to templates that use a background image already containing the gradient. Overlaying orbs on top of a gradient background image doubles saturation and makes the render darker/more saturated than the Figma source. Check the background asset first — if the gradient is baked in, rely on the image alone. This applies to all EHS+ Accelerate templates (banner, invitation, signature) and any future templates using pre-rendered gradient backgrounds.
- **Rationale:** Will recur with any template using a pre-rendered gradient background image. Figma exports often bake in gradient layers that look like separate design elements — easy to accidentally recreate them in CSS on top.
- **Proposed text:** If a template uses a background image that already contains a gradient effect (e.g. EHS+ Accelerate templates), do NOT add CSS gradient orb `<div>`s on top. Overlaying CSS gradients doubles the saturation and makes the render darker than the Figma source. Check the background asset before adding any gradient overlays — if the gradient is baked into the image, rely on the image alone.
- **Proposed placement:** BRAND.md → Image Handling section (or Figma Override Rules), as a note on gradient backgrounds
