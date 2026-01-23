import { NextRequest, NextResponse } from 'next/server'
import { parsePDF, extractBriefContent } from '@/lib/pdf-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert to buffer and parse
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const parsed = await parsePDF(buffer)

    // Extract relevant content
    const briefContent = extractBriefContent(parsed.text)

    return NextResponse.json({
      content: briefContent,
      metadata: {
        title: parsed.info.title,
        author: parsed.info.author,
        numPages: parsed.numPages,
        originalLength: parsed.text.length,
        extractedLength: briefContent.length,
      },
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
