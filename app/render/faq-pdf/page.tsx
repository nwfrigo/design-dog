import { Suspense } from 'react'
import { FaqPdfRender } from './render-content'
import type { FaqContentBlock } from '@/types'
import type { SolutionCategory } from '@/config/solution-overview-assets'
import type { Metadata } from 'next'
import { parseString, parseNumber, parseBoolFalse } from '@/lib/render-params'

interface FaqPage {
  id: string
  blocks: FaqContentBlock[]
}

// Dynamic metadata to set PDF title from URL params
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const title = parseString(searchParams, 'title', 'FAQ')
  return {
    title: title,
  }
}

export default function FaqPdfRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse URL params
  const title = parseString(searchParams, 'title', 'FAQ')
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
  const coverSubheader = parseString(searchParams, 'coverSubheader', 'Frequently Asked Questions')
  const coverSolution = parseString(searchParams, 'coverSolution', 'safety') as SolutionCategory | 'none'
  const coverImageUrl = searchParams.coverImageUrl as string | undefined
  const coverImagePositionX = parseNumber(searchParams, 'coverImagePositionX', 0)
  const coverImagePositionY = parseNumber(searchParams, 'coverImagePositionY', 0)
  const coverImageZoom = parseNumber(searchParams, 'coverImageZoom', 1)
  const coverImageGrayscale = parseBoolFalse(searchParams, 'coverImageGrayscale')

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
