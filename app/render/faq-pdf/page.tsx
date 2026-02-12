import { Suspense } from 'react'
import { FaqPdfRender } from './render-content'
import type { FaqContentBlock } from '@/types'
import type { SolutionCategory } from '@/config/solution-overview-assets'

interface FaqPage {
  id: string
  blocks: FaqContentBlock[]
}

export default function FaqPdfRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse URL params
  const title = (searchParams.title as string) || 'FAQ'
  const pageIndexParam = searchParams.page as string

  // Parse page index - 'all' or a number
  let pageIndex: number | 'all' = 0
  if (pageIndexParam === 'all') {
    pageIndex = 'all'
  } else if (pageIndexParam) {
    pageIndex = parseInt(pageIndexParam, 10) || 0
  }

  // Parse pages JSON
  let pages: FaqPage[] = []
  try {
    const pagesJson = searchParams.pages as string
    if (pagesJson) {
      const parsed = JSON.parse(decodeURIComponent(pagesJson))
      if (Array.isArray(parsed)) {
        pages = parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse pages JSON:', e)
  }

  // If no pages provided, use default placeholder
  if (pages.length === 0) {
    pages = [{
      id: 'default',
      blocks: [
        {
          type: 'heading',
          id: '1',
          text: 'Frequently Asked Questions',
        },
        {
          type: 'qa',
          id: '2',
          question: 'What is this document?',
          answer: 'This is an FAQ template. Add your questions and answers using the editor.',
        },
      ],
    }]
  }

  // Parse cover page params
  const coverSubheader = (searchParams.coverSubheader as string) || 'Frequently Asked Questions'
  const coverSolution = (searchParams.coverSolution as string) as SolutionCategory | 'none' || 'safety'
  const coverImageUrl = searchParams.coverImageUrl as string | undefined
  const coverImagePositionX = parseFloat(searchParams.coverImagePositionX as string) || 0
  const coverImagePositionY = parseFloat(searchParams.coverImagePositionY as string) || 0
  const coverImageZoom = parseFloat(searchParams.coverImageZoom as string) || 1
  const coverImageGrayscale = searchParams.coverImageGrayscale === 'true'

  return (
    <div
      style={{
        width: 612,
        height: pageIndex === 'all' ? 'auto' : 792,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <FaqPdfRender
          title={title}
          coverSubheader={coverSubheader}
          pages={pages}
          pageIndex={pageIndex}
          coverSolution={coverSolution}
          coverImageUrl={coverImageUrl}
          coverImagePosition={{ x: coverImagePositionX, y: coverImagePositionY }}
          coverImageZoom={coverImageZoom}
          coverImageGrayscale={coverImageGrayscale}
        />
      </Suspense>
    </div>
  )
}
