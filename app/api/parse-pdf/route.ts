import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  let requestFileSize: number | null = null

  try {
    const body = await request.json()
    const { pdfUrl, fileSize } = body
    requestFileSize = fileSize || null

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'No PDF URL provided' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Fetch PDF from Blob URL and convert to base64
    // This is more reliable than having Claude fetch the URL directly
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch PDF from storage' },
        { status: 500 }
      )
    }
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // Send PDF to Claude for visual analysis using base64 (with retry for transient errors)
    const MAX_RETRIES = 3
    let response: Anthropic.Messages.Message | null = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        response = await anthropic.messages.create({
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
                    data: pdfBase64,
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
        break // Success — exit retry loop
      } catch (retryError) {
        const msg = String(retryError)
        const isRetryable = msg.includes('529') || msg.includes('overloaded') || msg.includes('Overloaded')
        if (isRetryable && attempt < MAX_RETRIES) {
          console.log(`parse-pdf: Retryable error on attempt ${attempt}, retrying in ${attempt * 2}s...`, msg.slice(0, 200))
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
          continue
        }
        throw retryError // Not retryable or max retries reached
      }
    }

    if (!response) {
      throw new Error('Failed to get response from Claude after retries')
    }

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
        method: 'claude-base64',
        model: 'claude-sonnet-4-20250514',
        fileSizeBytes: pdfBuffer.byteLength,
        fileSizeMB: (pdfBuffer.byteLength / 1024 / 1024).toFixed(2),
        extractedFields: Object.keys(extractedContent).filter(k => extractedContent[k] !== null),
        rawResponse: textContent.text,
      },
    })
  } catch (error) {
    console.error('PDF analysis error:', error)

    // Check for specific Anthropic errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze PDF'
    const errorStr = String(error)

    console.error('parse-pdf error details:', errorStr.slice(0, 500))

    const isRateLimited = errorStr.includes('429') || errorStr.includes('rate_limit')
    const isOverloaded = errorStr.includes('529') || errorStr.includes('overloaded') || errorStr.includes('Overloaded')
    const isTokenLimit = errorStr.includes('input tokens') || errorStr.includes('token') && (errorStr.includes('limit') || errorStr.includes('exceed'))
    const isInvalidPdf = errorStr.includes('Could not process') || errorStr.includes('invalid_request_error')

    let userMessage: string
    let errorCode: string
    if (isRateLimited || isTokenLimit) {
      const fileSizeMB = requestFileSize ? (requestFileSize / 1024 / 1024).toFixed(1) : null
      userMessage = fileSizeMB && parseFloat(fileSizeMB) > 5
        ? `This PDF is too large (${fileSizeMB} MB) for the current API plan. Try a shorter document, or paste the key content as text instead.`
        : 'The AI service is temporarily busy. Please wait a moment and try again, or paste your content as text instead.'
      errorCode = 'rate_limit'
    } else if (isOverloaded) {
      userMessage = 'The AI service is temporarily overloaded. Please wait a moment and try again.'
      errorCode = 'overloaded'
    } else if (isInvalidPdf) {
      userMessage = 'Could not read this PDF. It may be scanned, corrupted, or password-protected. Try a different PDF or provide details in the text field instead.'
      errorCode = 'invalid_pdf'
    } else {
      userMessage = 'Something went wrong analyzing this PDF. Try a different file or paste your content as text instead.'
      errorCode = 'unknown'
    }

    return NextResponse.json(
      {
        error: userMessage,
        errorCode,
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorDetails: errorMessage,
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
