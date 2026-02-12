import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Generate unique IDs for blocks
const generateId = () => Math.random().toString(36).substring(2, 9)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { docUrl } = body

    if (!docUrl) {
      return NextResponse.json(
        { error: 'No document URL provided' },
        { status: 400 }
      )
    }

    // Detect file type from URL
    const isPdf = docUrl.toLowerCase().includes('.pdf')
    const isWord = docUrl.toLowerCase().includes('.doc')

    let documentContent: string

    // Fetch the document
    const docResponse = await fetch(docUrl)
    if (!docResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch document from storage' },
        { status: 500 }
      )
    }

    const docBuffer = Buffer.from(await docResponse.arrayBuffer())

    if (isPdf) {
      // For PDFs, send directly to Claude as base64
      const pdfBase64 = docBuffer.toString('base64')

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              } as any,
              {
                type: 'text',
                text: getFaqExtractionPrompt(),
              },
            ],
          },
        ],
      })

      const textContent = response.content.find(block => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude')
      }

      return processClaudeResponse(textContent.text)
    } else if (isWord) {
      // For Word docs, extract text with mammoth first
      const result = await mammoth.extractRawText({ buffer: docBuffer })
      documentContent = result.value

      if (!documentContent || documentContent.trim().length === 0) {
        return NextResponse.json(
          { error: 'Could not extract text from document' },
          { status: 400 }
        )
      }

      // Send text to Claude for extraction
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: `${getFaqExtractionPrompt()}\n\nDocument content:\n${documentContent}`,
          },
        ],
      })

      const textContent = response.content.find(block => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude')
      }

      return processClaudeResponse(textContent.text)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or Word document.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('FAQ parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse document'

    return NextResponse.json(
      { error: `Failed to parse document: ${errorMessage}` },
      { status: 500 }
    )
  }
}

function getFaqExtractionPrompt(): string {
  return `You are a content extraction assistant. Analyze this FAQ document and extract all question-answer pairs, section headings, and any tables.

IMPORTANT RULES:
1. Extract the EXACT text from the document. Do not rewrite or summarize.
2. Identify section headings (titles that introduce groups of questions).
3. Identify all question-answer pairs. Questions typically end with "?" or are formatted distinctly.
4. If there are tables, extract them with their row and column data.
5. Preserve the order of content as it appears in the document.

Return a JSON object with this exact structure:
{
  "blocks": [
    {
      "type": "heading",
      "text": "Section heading text here"
    },
    {
      "type": "qa",
      "question": "The question text?",
      "answer": "The answer text. Can include multiple paragraphs."
    },
    {
      "type": "table",
      "rows": 3,
      "cols": 2,
      "data": [["Header 1", "Header 2"], ["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]]
    }
  ]
}

For answers that have formatting:
- Use <p> tags for paragraphs
- Use <ul><li> for bullet points
- Use <ol><li> for numbered lists
- Use <a href="url">text</a> for links
- Use <strong> for bold text

If you cannot identify any FAQ content (no clear questions/answers), return:
{
  "blocks": [],
  "error": "Could not identify FAQ content in this document"
}

Return ONLY valid JSON, no markdown code blocks or additional text.`
}

function processClaudeResponse(responseText: string): NextResponse {
  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = responseText
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  let extractedContent
  try {
    extractedContent = JSON.parse(jsonStr.trim())
  } catch {
    console.error('Failed to parse Claude response:', responseText)
    return NextResponse.json(
      { error: 'Failed to parse extracted content' },
      { status: 500 }
    )
  }

  // Check if Claude couldn't find FAQ content
  if (extractedContent.error) {
    return NextResponse.json(
      { error: extractedContent.error },
      { status: 400 }
    )
  }

  // Check if blocks are empty
  if (!extractedContent.blocks || extractedContent.blocks.length === 0) {
    return NextResponse.json(
      { error: 'Could not identify FAQ content in this document. Please check the format.' },
      { status: 400 }
    )
  }

  // Convert to FaqPage[] structure with page breaks
  const pages = distributeBlocksToPages(extractedContent.blocks)

  return NextResponse.json({
    pages,
    blockCount: extractedContent.blocks.length,
  })
}

// Distribute blocks across pages based on estimated height
// This is a rough estimate - the editor will handle precise pagination
function distributeBlocksToPages(blocks: Array<{
  type: 'heading' | 'qa' | 'table'
  text?: string
  question?: string
  answer?: string
  rows?: number
  cols?: number
  data?: string[][]
}>): Array<{ id: string; blocks: Array<{
  type: 'heading' | 'qa' | 'table'
  id: string
  text?: string
  question?: string
  answer?: string
  rows?: number
  cols?: number
  data?: string[][]
}> }> {
  const PAGE_HEIGHT_ESTIMATE = 600 // Approximate content height per page in pixels
  const HEADING_HEIGHT = 40
  const QA_BASE_HEIGHT = 80
  const QA_CHAR_HEIGHT = 0.3 // Additional height per character in answer
  const TABLE_ROW_HEIGHT = 30

  const pages: Array<{ id: string; blocks: Array<{
    type: 'heading' | 'qa' | 'table'
    id: string
    text?: string
    question?: string
    answer?: string
    rows?: number
    cols?: number
    data?: string[][]
  }> }> = []

  let currentPage: Array<{
    type: 'heading' | 'qa' | 'table'
    id: string
    text?: string
    question?: string
    answer?: string
    rows?: number
    cols?: number
    data?: string[][]
  }> = []
  let currentHeight = 0

  for (const block of blocks) {
    let blockHeight = 0

    if (block.type === 'heading') {
      blockHeight = HEADING_HEIGHT
    } else if (block.type === 'qa') {
      const answerLength = (block.answer || '').length
      blockHeight = QA_BASE_HEIGHT + (answerLength * QA_CHAR_HEIGHT)
    } else if (block.type === 'table') {
      blockHeight = (block.rows || 3) * TABLE_ROW_HEIGHT + 20
    }

    // Check if this block would overflow the page
    if (currentHeight + blockHeight > PAGE_HEIGHT_ESTIMATE && currentPage.length > 0) {
      // Start a new page
      pages.push({
        id: generateId(),
        blocks: currentPage,
      })
      currentPage = []
      currentHeight = 0
    }

    // Add block with generated ID
    const blockWithId = {
      ...block,
      id: generateId(),
    }
    currentPage.push(blockWithId)
    currentHeight += blockHeight
  }

  // Don't forget the last page
  if (currentPage.length > 0) {
    pages.push({
      id: generateId(),
      blocks: currentPage,
    })
  }

  return pages
}
