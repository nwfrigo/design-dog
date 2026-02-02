import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

    // Check file size (max 25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB. Try a smaller PDF or provide key details in the text field instead.' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

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

1. **Title/Topic**: What is this document about?
2. **Main Message**: What is the primary message or value proposition? (1-2 sentences)
3. **Key Points**: List 3-5 key takeaways, benefits, or features
4. **Target Audience**: Who is this content aimed at?
5. **Call to Action**: What action should the reader take?
6. **Dates/Details**: Any important dates, times, locations mentioned
7. **Speakers/Authors**: Any names or titles of speakers, authors, or featured people

Respond in JSON format only:
{
  "title": "...",
  "mainMessage": "...",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "targetAudience": "...",
  "callToAction": "...",
  "dates": "..." or null,
  "speakers": ["name - title"] or null,
  "rawSummary": "A 2-3 paragraph summary of the document"
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
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    let extractedContent
    try {
      extractedContent = JSON.parse(jsonStr.trim())
    } catch {
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

    // Build content string for asset generation
    const content = buildContextFromExtraction(extractedContent)

    return NextResponse.json({
      content,
      extracted: extractedContent,
      metadata: {
        method: 'claude-vision',
        fileSizeBytes: buffer.length,
        extractedFields: Object.keys(extractedContent).filter(k => extractedContent[k as keyof typeof extractedContent] !== null),
      },
    })
  } catch (error) {
    console.error('PDF analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze PDF' },
      { status: 500 }
    )
  }
}

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
