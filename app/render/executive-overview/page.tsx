import { Suspense } from 'react'
import { GenericRenderContent } from '@/components/shared/GenericRenderContent'
import { ExecutiveOverviewPrint } from '@/components/templates/ExecutiveOverview/ExecutiveOverviewPrint'
import {
  defaultExecutiveOverviewDocument,
  type ExecutiveOverviewDocument,
} from '@/lib/executive-overview/document'
import { EXEC_PAGE_W, EXEC_PAGE_H } from '@/components/templates/ExecutiveOverview/constants'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { TypographyConfig } from '@/lib/brand-config'

const typographyConfig = typographyJson as TypographyConfig

/**
 * Bare render route for the Executive Overview 2-page PDF — mirrors the
 * custom-size / SO custom render pages (no app shell, no providers). The
 * `executiveOverviewConfig` param is the URL-encoded JSON document; both pages
 * render stacked with a page break so app/api/export's PDF branch paginates
 * them into one Letter PDF. Output equals the editor by construction (same
 * Page1/Page2 components, identity render-props).
 */
export default function ExecutiveOverviewRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let doc: ExecutiveOverviewDocument = defaultExecutiveOverviewDocument()
  try {
    const raw = searchParams.executiveOverviewConfig as string | undefined
    if (raw) doc = JSON.parse(decodeURIComponent(raw)) as ExecutiveOverviewDocument
  } catch {
    /* keep default doc */
  }

  return (
    <div style={{ width: EXEC_PAGE_W, margin: 0, padding: 0 }}>
      <Suspense fallback={<div style={{ width: EXEC_PAGE_W, height: EXEC_PAGE_H, background: '#FAFAFB' }} />}>
        <GenericRenderContent
          Component={ExecutiveOverviewPrint}
          props={{ doc, typography: typographyConfig }}
        />
      </Suspense>
    </div>
  )
}
