import { Suspense } from 'react'
import { FaqPdfRender } from './render-content'
import type { FaqContentBlock } from '@/types'

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
          pages={pages}
          pageIndex={pageIndex}
        />
      </Suspense>
    </div>
  )
}
