/**
 * Stage & Bench registration for executive-overview (the first multi-page S&B
 * template).
 *
 * - `Template` + `renderProps` → queue thumbnail (page 1 = the cover).
 * - `renderPreview` → the editor Preview lightbox shows BOTH pages stacked.
 * - `exportBuilder` → emits `page: 'all'` + the `executiveOverviewConfig` blob
 *   (a COMPLEX_KEY) so app/api/export renders both pages into one Letter PDF.
 *
 * No renderSchema: this template has its own static render route
 * (/render/executive-overview), not the dynamic [slug] route.
 */

import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { Page1, Page2 } from '@/components/templates/ExecutiveOverview'
import { ExecutiveOverviewStageBench } from './ExecutiveOverviewStageBench'
import {
  defaultExecutiveOverviewDocument,
  execDocToPage1Props,
  execDocToPage2Props,
} from '@/lib/executive-overview/document'

export const executiveOverviewRegistration: StageBenchRegistrationData = {
  templateId: 'executive-overview',
  // Queue thumbnail renders the cover (page 1).
  Template: Page1,
  Adapter: ExecutiveOverviewStageBench,
  renderProps: (asset, _colors, typography) => {
    const doc = asset.executiveOverviewDocument ?? defaultExecutiveOverviewDocument()
    return {
      ...execDocToPage1Props(doc),
      typography,
      scale: 1,
    }
  },
  // Preview lightbox: both pages stacked (each framed), so PREVIEW shows the
  // whole 2-page asset rather than a single page.
  renderPreview: (asset, _colors, typography) => {
    const doc = asset.executiveOverviewDocument ?? defaultExecutiveOverviewDocument()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="shadow-2xl rounded overflow-hidden">
          <Page1 {...execDocToPage1Props(doc)} typography={typography} scale={1} />
        </div>
        <div className="shadow-2xl rounded overflow-hidden">
          <Page2 {...execDocToPage2Props(doc)} typography={typography} scale={1} />
        </div>
      </div>
    )
  },
  queueTextFields: [],
  exportBuilder: (s) => {
    const doc = s.executiveOverviewDocument ?? defaultExecutiveOverviewDocument()
    return {
      // `page: 'all'` flags the multi-page PDF branch in app/api/export/route.ts
      // (isExecutiveOverview) so both pages render into one Letter PDF.
      page: 'all',
      executiveOverviewConfig: doc,
    }
  },
}
