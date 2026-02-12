'use client'

import { useState, useEffect } from 'react'
import { ContentPage, CoverPage } from '@/components/templates/FaqPdf'
import type { FaqContentBlock } from '@/types'
import type { SolutionCategory } from '@/config/solution-overview-assets'

export interface FaqPdfRenderProps {
  title: string
  coverSubheader?: string
  pages: {
    id: string
    blocks: FaqContentBlock[]
  }[]
  // 'all' renders all pages with page breaks for PDF export
  // number renders a specific page
  pageIndex: number | 'all'
  // Cover page props
  coverSolution: SolutionCategory | 'none'
  coverImageUrl?: string
  coverImagePosition: { x: number; y: number }
  coverImageZoom: number
  coverImageGrayscale: boolean
}

export function FaqPdfRender({
  title,
  coverSubheader,
  pages,
  pageIndex,
  coverSolution,
  coverImageUrl,
  coverImagePosition,
  coverImageZoom,
  coverImageGrayscale,
}: FaqPdfRenderProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for fonts to load before signaling ready
    const waitForFonts = async () => {
      try {
        await document.fonts.ready
        setTimeout(() => setReady(true), 100)
      } catch {
        setTimeout(() => setReady(true), 500)
      }
    }
    waitForFonts()
  }, [])

  const renderContentPage = (pageData: { id: string; blocks: FaqContentBlock[] }, index: number) => (
    <ContentPage
      key={pageData.id}
      title={title}
      blocks={pageData.blocks}
      pageNumber={index + 2} // +2 because cover is page 1
      scale={1}
    />
  )

  const renderCoverPage = () => (
    <CoverPage
      title={title}
      subheader={coverSubheader}
      solution={coverSolution}
      coverImageUrl={coverImageUrl}
      coverImagePosition={coverImagePosition}
      coverImageZoom={coverImageZoom}
      coverImageGrayscale={coverImageGrayscale}
      scale={1}
    />
  )

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}

      {/* Single page render */}
      {typeof pageIndex === 'number' && pages[pageIndex] && (
        renderContentPage(pages[pageIndex], pageIndex)
      )}

      {/* All pages for PDF export - Cover + Content pages */}
      {pageIndex === 'all' && (
        <div>
          {/* Cover Page */}
          <div style={{ pageBreakAfter: 'always' }}>
            {renderCoverPage()}
          </div>
          {/* Content Pages */}
          {pages.map((pageData, index) => (
            <div
              key={pageData.id}
              style={{
                pageBreakAfter: index < pages.length - 1 ? 'always' : undefined,
              }}
            >
              {renderContentPage(pageData, index)}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default FaqPdfRender
