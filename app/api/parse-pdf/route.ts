import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdf } = body

    if (!pdf) {
      return NextResponse.json(
        { error: 'No PDF data provided' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Extract base64 data from data URL
    const base64Match = pdf.match(/^data:application\/pdf;base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json(
        { error: 'Invalid PDF data format. Expected base64 data URL.' },
        { status: 400 }
      )
    }

    const base64Data = base64Match[1]

    // Check file size (max 25MB)
    const buffer = Buffer.from(base64Data, 'base64')
    const maxSize = 25 * 1024 * 1024
    if (buffer.length > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum size is 25MB. Try a smaller PDF or provide key details in the text field instead.',
          debug: {
            fileSize: buffer.length,
            maxSize: maxSize,
            fileSizeMB: (buffer.length / 1024 / 1024).toFixed(2),
          }
        },
        { status: 400 }
      )
    }

    // Send PDF to Claude for visual analysis
    // Note: Using 'as any' because the SDK types don't include 'document' yet, but the API supports it
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Data,
              },
            } as any,
            {
              type: 'text',
              text: `Analyze this PDF document and extract the following information for marketing purposes.

Read through the entire document carefully and provide:

1. **Title/Topic**: What is this document about? (e.g., "Safety Culture eBook", "Q3 Product Webinar", "Annual Conference")

2. **Main Message**: What is the primary message or value proposition? (1-2 sentences)

3. **Key Points**: List 3-5 key takeaways, benefits, or features mentioned in the document

4. **Target Audience**: Who is this content aimed at?

5. **Call to Action**: What action should the reader take? (e.g., register, download, learn more)

6. **Dates/Details**: Any important dates, times, locations, or logistics mentioned

7. **Speakers/Authors**: Any names or titles of speakers, authors, or featured people

Respond in JSON format only, no markdown code blocks:
{
  "title": "...",
  "mainMessage": "...",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "targetAudience": "...",
  "callToAction": "...",
  "dates": "..." or null,
  "speakers": ["name - title"] or null,
  "rawSummary": "A 2-3 paragraph summary of the document content for context"
}`,
            },
          ],
        },
      ],
    })

    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse Claude's response
    let jsonStr = textContent.text
    // Remove any markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    let extractedContent
    try {
      extractedContent = JSON.parse(jsonStr.trim())
    } catch {
      // If JSON parsing fails, return the raw text
      extractedContent = {
        title: 'Document',
        mainMessage: textContent.text.slice(0, 200),
        keyPoints: [],
        targetAudience: null,
        callToAction: null,
        dates: null,
        speakers: null,
        rawSummary: textContent.text,
      }
    }

    // Build the text content for asset generation (combining extracted info)
    const textForGeneration = buildContextFromExtraction(extractedContent)

    return NextResponse.json({
      text: textForGeneration,
      extracted: extractedContent,
      debug: {
        method: 'claude-vision',
        model: 'claude-sonnet-4-20250514',
        fileSizeBytes: buffer.length,
        fileSizeMB: (buffer.length / 1024 / 1024).toFixed(2),
        extractedFields: Object.keys(extractedContent).filter(k => extractedContent[k] !== null),
        rawResponse: textContent.text,
      },
    })
  } catch (error) {
    console.error('PDF analysis error:', error)

    // Check for specific Anthropic errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze PDF'
    const isRateLimited = errorMessage.includes('rate') || errorMessage.includes('429')
    const isInvalidPdf = errorMessage.includes('document') || errorMessage.includes('parse')

    return NextResponse.json(
      {
        error: isRateLimited
          ? 'API rate limited. Please wait a moment and try again.'
          : isInvalidPdf
          ? 'Could not read this PDF. It may be corrupted or password-protected. Try providing details in the text field instead.'
          : errorMessage,
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorDetails: error instanceof Error ? error.stack : String(error),
        }
      },
      { status: 500 }
    )
  }
}

// Build context string from extracted content for asset generation
function buildContextFromExtraction(extracted: {
  title?: string
  mainMessage?: string
  keyPoints?: string[]
  targetAudience?: string
  callToAction?: string
  dates?: string
  speakers?: string[]
  rawSummary?: string
}): string {
  const parts: string[] = []

  if (extracted.title) {
    parts.push(`Title: ${extracted.title}`)
  }

  if (extracted.mainMessage) {
    parts.push(`Main Message: ${extracted.mainMessage}`)
  }

  if (extracted.keyPoints && extracted.keyPoints.length > 0) {
    parts.push(`Key Points:\n${extracted.keyPoints.map(p => `- ${p}`).join('\n')}`)
  }

  if (extracted.targetAudience) {
    parts.push(`Target Audience: ${extracted.targetAudience}`)
  }

  if (extracted.callToAction) {
    parts.push(`Call to Action: ${extracted.callToAction}`)
  }

  if (extracted.dates) {
    parts.push(`Important Dates: ${extracted.dates}`)
  }

  if (extracted.speakers && extracted.speakers.length > 0) {
    parts.push(`Speakers/Authors: ${extracted.speakers.join(', ')}`)
  }

  if (extracted.rawSummary) {
    parts.push(`\nDocument Summary:\n${extracted.rawSummary}`)
  }

  return parts.join('\n\n')
}
