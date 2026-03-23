# Template Field Schema Refactor — Implementation Plan

> Branch: `refactor/template-field-schema`
> Status: COMPLETE — renderSchema + dynamic route + cleanup all implemented.
> Commits: `04ac7ab` (subhead rename), pending (schema + dynamic route)

---

## Goal

Add a `renderSchema` to each template in `lib/template-registry.tsx` that declaratively describes every field the template's render page needs. Use this schema to:

1. **Create a dynamic render route** (`app/render/[slug]/page.tsx`) replacing 22 individual render pages
2. **Auto-derive SNAPSHOT_FIELDS** from the schema, replacing the hardcoded 90-field array in `lib/asset-snapshot.ts`
3. (Future) Drive export param generation — NOT in this branch

---

## What's Already Done

- [x] Cleanup: `subheading`→`subhead` rename for EmailDarkGradient (commit `04ac7ab`)
- [x] Full analysis of all 26 render pages (field names, parser types, defaults, custom logic)
- [x] Full analysis of SNAPSHOT_FIELDS (90 fields)
- [x] Full analysis of export BUILDERS

---

## Step 1: Define Schema Types

Add to `lib/template-registry.tsx`:

```typescript
type FieldParser = 'string' | 'boolTrue' | 'boolFalse' | 'number' | 'numberOrUndefined' | 'enum' | 'stringOrNull' | 'int'

interface RenderField {
  /** URL param name (and component prop name unless propName is set) */
  param: string
  /** Component prop name if different from param */
  propName?: string
  /** Parser type — determines which lib/render-params helper to use */
  parser: FieldParser
  /** Default value passed to parser */
  default?: string | number | boolean | null
  /** For 'enum' parser: valid values (first is used if no default specified) */
  enumValues?: string[]
}

interface TemplateRenderSchema {
  /** Template dimensions in pixels */
  width: number
  height: number
  /** Background color — static string or function of parsed params */
  background: string | null | ((params: Record<string, unknown>) => string)
  /** Field definitions for URL param parsing */
  fields: RenderField[]
  /**
   * Custom prop assembly — called AFTER schema-driven parsing.
   * Use for complex transformations: image position objects, speaker
   * assembly, grid detail objects, CTA dual-key fallback.
   * Receives the parsed flat params and raw searchParams.
   * Returns additional/override props to merge.
   */
  assembleProps?: (parsed: Record<string, unknown>, raw: Record<string, string | string[] | undefined>) => Record<string, unknown>
}
```

Add `renderSchema?: TemplateRenderSchema` to `TemplateRegistryEntry`.

---

## Step 2: Populate Schema for All 22 Templates

Add `renderSchema` to each entry in `TEMPLATE_REGISTRY`. Data source: the comprehensive render page analysis (in agent context from the Explore agent).

### Templates by complexity:

**Simple (no custom logic, ~12 templates):**
email-dark-gradient, email-grid, social-dark-gradient, social-blue-gradient, newsletter-top-banner, customer-library

**Image position assembly (~8 templates):**
email-image, email-product-release, social-image, social-image-meddbase, website-thumbnail, website-press-release, website-report, newsletter-dark-gradient, newsletter-blue-gradient, newsletter-light

Use `assembleProps` to combine `imagePositionX`/`imagePositionY` into `imagePosition: { x, y }`.

**CTA dual-key fallback (~6 templates):**
website-thumbnail, website-press-release, website-report, website-event-listing, website-webinar, website-floating-banner

Use `assembleProps` to handle `(ctaText || cta || default)` pattern.

**Speaker assembly (2 templates):**
email-speakers, website-webinar

Use `assembleProps` with `parseSpeakerParams` from render-params.ts.

**Grid detail objects (2 templates):**
email-grid, social-grid-detail

Use `assembleProps` to construct `{ type, text }` objects.

### Key field reference per template:

See the full extraction in the agent conversation. Condensed version:

| Template | Special fields | assembleProps needed? |
|----------|---------------|----------------------|
| email-dark-gradient | colorStyle, alignment, ctaStyle, bottomSpacing | No |
| email-grid | gridDetail1-3 (type+text), subheading, showLightHeader | Yes (grid objects) |
| email-image | imagePosition, layout | Yes (image position) |
| email-product-release | minimal fields | Yes (image position) |
| email-speakers | speakerCount, speakers 1-3 | Yes (speaker assembly) |
| social-dark-gradient | metadata, colorStyle, headingSize, alignment, ctaStyle, logoColor | No |
| social-blue-gradient | same as dark (no logoColor) | No |
| social-image | imagePosition, layout, logoColor | Yes (image position) |
| social-image-meddbase | same as social-image (no logoColor) | Yes (image position) |
| social-grid-detail | gridDetail1-4 (type+text), showRow3/4 | Yes (grid objects) |
| newsletter-dark-gradient | colorStyle, imageSize, imagePosition | Yes (image position) |
| newsletter-blue-gradient | same as dark | Yes (image position) |
| newsletter-light | same but no colorStyle | Yes (image position) |
| newsletter-top-banner | variant | No (but dynamic background) |
| website-thumbnail | variant, imagePosition, logoColor | Yes (image position + CTA fallback) |
| website-press-release | imagePosition | Yes (image position + CTA fallback) |
| website-report | variant, imagePosition | Yes (image position + CTA fallback) |
| website-event-listing | variant, gridDetail1-4Text, showRow3/4 | Yes (CTA fallback + dynamic bg) |
| website-webinar | variant, speakers, imagePosition | Yes (speakers + image + CTA fallback) |
| website-floating-banner | variant | Yes (CTA fallback) |
| website-floating-banner-mobile | variant, arrowType | No (has own render page with custom logic) |
| customer-library | variant, qrCodeUrl, hasQrCode, footerText | No (but dynamic background) |

---

## Step 3: Create Generic Render Content Component

Create `components/shared/GenericRenderContent.tsx`:

```typescript
// Wraps any template component with font-ready signal
// Replaces 22 identical render-content.tsx files
function GenericRenderContent({ Component, props }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { document.fonts.ready.then(() => setTimeout(() => setReady(true), 100)) }, [])
  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <Component {...props} />
    </>
  )
}
```

---

## Step 4: Create Dynamic Render Route

Create `app/render/[slug]/page.tsx`:

1. Look up template in `TEMPLATE_REGISTRY` by `params.slug`
2. Read `renderSchema.fields` and parse each field using the appropriate `render-params` helper
3. Call `renderSchema.assembleProps()` if defined, merge results
4. Add `colors` and `typography` from brand config
5. Compute background color (static or from function)
6. Render with GenericRenderContent wrapper

**Important:** The `[slug]` dynamic route must NOT conflict with existing static routes. Next.js static routes take precedence, so the old `app/render/email-grid/page.tsx` etc. would override `[slug]`. We need to either:
- Delete old render pages first (risky — no rollback)
- Or rename old pages temporarily while testing

**Approach:** Keep old pages during development. Once the dynamic route is verified for all templates, delete old pages in a batch.

---

## Step 5: Auto-derive SNAPSHOT_FIELDS

In `lib/asset-snapshot.ts`, replace the hardcoded array with:

```typescript
import { TEMPLATE_REGISTRY } from './template-registry'

function deriveSnapshotFields(): string[] {
  const fields = new Set<string>()
  for (const entry of Object.values(TEMPLATE_REGISTRY)) {
    if (!entry?.renderSchema) continue
    for (const field of entry.renderSchema.fields) {
      // Map param names to state field names where they differ
      fields.add(field.stateKey || field.param)
    }
  }
  // Add fields that aren't in render schemas but are in snapshots
  // (carousel, solution-overview, etc. — templates with custom screens)
  for (const field of LEGACY_SNAPSHOT_FIELDS) {
    fields.add(field)
  }
  return Array.from(fields)
}
```

**Validation:** Sort and diff the derived list against the old hardcoded list. They must match exactly (minus any confirmed dead fields).

**Note:** Some SNAPSHOT_FIELDS are for templates NOT in the registry (carousel, SO PDF, FAQ, Stacker). These need to be kept as a `LEGACY_SNAPSHOT_FIELDS` array until those templates are added to the registry.

---

## Step 6: Delete Old Render Pages

Once the dynamic route is verified, delete:
- 22 `app/render/{slug}/page.tsx` files
- 22 `app/render/{slug}/render-content.tsx` files

Keep render pages for templates with truly custom logic:
- `solution-overview-pdf` (multi-page, JSON arrays, custom metadata)
- `faq-pdf` (multi-page, JSON parsing, dynamic metadata)
- `stacker-pdf` (custom module parsing)
- `social-carousel` (dual-mode rendering: all slides vs single)
- `website-floating-banner-mobile` (if it has custom logic — verify)

---

## Validation Checklist

- [ ] `npm run build` passes
- [ ] Every template in TEMPLATE_REGISTRY has a renderSchema
- [ ] Dynamic route renders correctly for all 22 templates (verify by visiting `/render/{slug}?headline=Test` in browser)
- [ ] Auto-derived SNAPSHOT_FIELDS matches old hardcoded list (sorted diff)
- [ ] Export from editor works (unchanged — still uses BUILDERS)
- [ ] Export from queue works (unchanged — uses buildExportParamsFromAsset)
- [ ] Queue thumbnail + preview modal still render correctly (unchanged — uses TemplateRenderer)

---

## What This Branch Does NOT Change

- Export BUILDERS in `lib/export-params.ts` — stay as-is
- `buildExportParams` / `buildExportParamsFromAsset` — stay as-is
- Store shape, setters, defaults — stay as-is
- TypeScript interfaces in `types/index.ts` — stay as-is
- EditorScreen.tsx — no changes
- ExportQueueScreen.tsx — no changes
- Template components — no changes (they still receive the same props)

---

## Risk Areas

1. **Boolean defaults** — parseBoolTrue vs parseBoolFalse varies per template per field. Getting even ONE wrong means a field that should default ON renders as OFF (or vice versa) in exports. Must verify every field against the old render page.

2. **Dynamic route precedence** — Next.js `[slug]` vs static routes. Must delete old pages for the dynamic route to take effect.

3. **assembleProps complexity** — speaker assembly, grid detail objects, CTA fallback. These are template-specific transforms that must exactly match the old render pages.

4. **SNAPSHOT_FIELDS parity** — the old list includes fields for templates NOT in the registry (carousel, PDFs). These must be preserved.
