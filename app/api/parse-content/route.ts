import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import officeparser from 'officeparser'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type SupportedFileType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, fileType, textContent } = body as {
      fileUrl?: string
      fileType?: SupportedFileType
      textContent?: string // For txt/md files, content can be passed directly
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // If text content is provided directly (for txt/md), use it
    if (textContent) {
      return NextResponse.json({
        content: textContent,
        source: 'text',
      })
    }

    if (!fileUrl || !fileType) {
      return NextResponse.json(
        { error: 'No file URL or file type provided' },
        { status: 400 }
      )
    }

    // For txt/md files, just fetch and return the text
    if (fileType === 'txt' || fileType === 'md') {
      const textResponse = await fetch(fileUrl)
      if (!textResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch file from storage' },
          { status: 500 }
        )
      }
      const content = await textResponse.text()
      return NextResponse.json({
        content,
        source: fileType,
      })
    }

    // Fetch the file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: 500 }
      )
    }
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())

    // Handle different file types
    if (fileType === 'pdf') {
      // PDFs can be sent directly to Claude's document API
      const fileBase64 = fileBuffer.toString('base64')

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
                  data: fileBase64,
                },
              } as any,
              {
                type: 'text',
                text: `Extract all the text content from this document. Preserve the structure and organization of the content as much as possible. Preserve headings, paragraphs, and bullet points.

Return the extracted text content directly - no JSON, no markdown code blocks, just the plain text content of the document organized in a readable way.`,
              },
            ],
          },
        ],
      })

      const textBlock = response.content.find(block => block.type === 'text')
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude')
      }

      return NextResponse.json({
        content: textBlock.text,
        source: fileType,
        debug: {
          model: 'claude-sonnet-4-20250514',
          fileSizeBytes: fileBuffer.byteLength,
          fileSizeMB: (fileBuffer.byteLength / 1024 / 1024).toFixed(2),
        },
      })
    } else if (fileType === 'docx') {
      // Word docs need text extraction via mammoth first
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      const content = result.value

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Could not extract text from document. The file may be empty or corrupted.' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        content,
        source: fileType,
        debug: {
          method: 'mammoth',
          fileSizeBytes: fileBuffer.byteLength,
          fileSizeMB: (fileBuffer.byteLength / 1024 / 1024).toFixed(2),
        },
      })
    } else if (fileType === 'pptx') {
      // PowerPoint files - extract text using officeparser
      const ast = await officeparser.parseOffice(fileBuffer)
      const content = ast.toText()

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Could not extract text from presentation. The file may be empty or corrupted.' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        content,
        source: fileType,
        debug: {
          method: 'officeparser',
          fileSizeBytes: fileBuffer.byteLength,
          fileSizeMB: (fileBuffer.byteLength / 1024 / 1024).toFixed(2),
        },
      })
    }

    // Fallback for unknown types
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Content parsing error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to parse content'
    const errorStr = String(error)

    const isRateLimited = errorMessage.includes('rate') || errorMessage.includes('429')
    const isInvalidFile = errorMessage.includes('Could not process') ||
                          errorMessage.includes('document') ||
                          errorStr.includes('Could not process')

    let userMessage: string
    if (isRateLimited) {
      userMessage = 'API rate limited. Please wait a moment and try again.'
    } else if (isInvalidFile) {
      userMessage = 'Could not read this file. It may be corrupted or password-protected. Try a different file or paste the content as text.'
    } else {
      userMessage = 'Failed to parse file. Try a different file or paste the content as text.'
    }

    return NextResponse.json(
      {
        error: userMessage,
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorDetails: errorMessage,
        }
      },
      { status: 500 }
    )
  }
}
