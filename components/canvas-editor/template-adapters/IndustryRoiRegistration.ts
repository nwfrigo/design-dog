/**
 * Stage & Bench registration for industry-roi.
 *
 * The whole asset lives in the `industryRoiDocument` blob, so the wire
 * format is one JSON param (`industryRoiConfig`, in the export route's
 * COMPLEX_KEYS) — the custom-size/executive-overview pattern. The render
 * route assembles props from the schema (not renderProps), hence
 * `assembleProps` maps the parsed blob to the `doc` prop.
 *
 * Export is ALWAYS a single long-page PDF at 612 × measured height:
 * `exportBuilder` pins `format: 'pdf'`, and the export route's measured
 * branch (shared with stacker-pdf) measures `#industry-roi-content`.
 */

import { IndustryRoi } from '@/components/templates/IndustryRoi'
import { defaultIndustryRoiDocument } from '@/lib/industry-roi/document'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { IndustryRoiStageBench } from './IndustryRoiStageBench'

export const industryRoiRegistration: StageBenchRegistrationData = {
  templateId: 'industry-roi',
  Template: IndustryRoi,
  Adapter: IndustryRoiStageBench,
  renderProps: (asset, colors, typography) => ({
    doc: asset.industryRoiDocument ?? defaultIndustryRoiDocument(),
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 612,
    // Nominal only — the template is variable-height flow; the export
    // route measures the real height before producing the PDF.
    height: 1980,
    dynamicHeight: true,
    background: '#ffffff',
    assembleProps: (parsed) => {
      // jsonRecord parses a missing param to {} — shape-check, don't ??
      const cfg = parsed.industryRoiConfig as ReturnType<typeof defaultIndustryRoiDocument> | Record<string, never> | null
      const valid = cfg && Array.isArray((cfg as { rows?: unknown }).rows)
      return { doc: valid ? cfg : defaultIndustryRoiDocument() }
    },
    fields: [
      { param: 'industryRoiConfig', parser: 'jsonRecord' },
    ],
  },
  exportBuilder: (s) => ({
    industryRoiConfig: s.industryRoiDocument ?? defaultIndustryRoiDocument(),
    format: 'pdf',
  }),
}
