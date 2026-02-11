'use client'

import { useState, useEffect } from 'react'
import { ContentPage } from '@/components/templates/FaqPdf'
import type { FaqContentBlock } from '@/types'

export interface FaqPdfRenderProps {
  title: string
  pages: {
    id: string
    blocks: FaqContentBlock[]
  }[]
  // 'all' renders all pages with page breaks for PDF export
  // number renders a specific page
  pageIndex: number | 'all'
}

export function FaqPdfRender({ title, pages, pageIndex }: FaqPdfRenderProps) {
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

  const renderPage = (pageData: { id: string; blocks: FaqContentBlock[] }, index: number) => (
    <ContentPage
      key={pageData.id}
      title={title}
      blocks={pageData.blocks}
      pageNumber={index + 1}
      scale={1}
    />
  )

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}

      {/* Single page render */}
      {typeof pageIndex === 'number' && pages[pageIndex] && (
        renderPage(pages[pageIndex], pageIndex)
      )}

      {/* All pages for PDF export */}
      {pageIndex === 'all' && (
        <div>
          {pages.map((pageData, index) => (
            <div
              key={pageData.id}
              style={{
                pageBreakAfter: index < pages.length - 1 ? 'always' : undefined,
              }}
            >
              {renderPage(pageData, index)}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default FaqPdfRender
