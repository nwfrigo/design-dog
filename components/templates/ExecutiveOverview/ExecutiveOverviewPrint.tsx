'use client'

import { Page1 } from './Page1'
import { Page2 } from './Page2'
import {
  execDocToPage1Props,
  execDocToPage2Props,
  type ExecutiveOverviewDocument,
} from '@/lib/executive-overview/document'
import type { TypographyConfig } from '@/lib/brand-config'

/**
 * Print composite — renders both Executive Overview pages stacked with a hard
 * page break between them, so Puppeteer's `page.pdf({ width:612, height:792 })`
 * paginates them into a single 2-page Letter PDF. Used by the export render
 * route only; identity render-props (no editor wiring) keep it export-pure.
 */
export function ExecutiveOverviewPrint({
  doc,
  typography,
}: {
  doc: ExecutiveOverviewDocument
  typography: TypographyConfig
}) {
  return (
    <>
      <div style={{ pageBreakAfter: 'always' }}>
        <Page1 {...execDocToPage1Props(doc)} typography={typography} scale={1} />
      </div>
      <div>
        <Page2 {...execDocToPage2Props(doc)} typography={typography} scale={1} />
      </div>
    </>
  )
}
