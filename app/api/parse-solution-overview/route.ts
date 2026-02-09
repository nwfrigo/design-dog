import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'

// Expected structure from Claude extraction
interface SolutionOverviewContent {
  // Page 1
  solutionName: string
  tagline: string
  // Page 2
  page2Header: string
  sectionHeader: string
  introParagraph: string
  keySolutions: [string, string, string, string, string, string]
  quoteText: string
  quoteName: string
  quoteTitle: string
  quoteCompany: string
  // Page 3
  benefits: Array<{ title: string; description: string }>
  features: Array<{ title: string; description: string }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { docUrl } = body

    if (!docUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      )
    }

    // Fetch the document from the URL
    const docResponse = await fetch(docUrl)
    if (!docResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 400 }
      )
    }

    const docBuffer = Buffer.from(await docResponse.arrayBuffer())

    // Parse the Word document to extract text
    const result = await mammoth.extractRawText({ buffer: docBuffer })
    const rawText = result.value

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from document' },
        { status: 400 }
      )
    }

    // Use Claude to extract and map content to fields
    const anthropic = new Anthropic()

    const extractionPrompt = `You are a content extraction assistant. Extract content from this Solution Overview document and map it to the exact fields below.

IMPORTANT:
- Extract the EXACT text from the document. Do not rewrite, summarize, or modify any content.
- Preserve all original wording, punctuation, and formatting.
- If a field cannot be found, use an empty string "".

Document text:
${rawText}

Extract and return a JSON object with these exact fields:

{
  "solutionName": "The solution name (e.g., 'Employee Health Essentials')",
  "tagline": "The tagline on page 1 (e.g., 'Built for Healthcare. Ready for You.')",
  "page2Header": "The main header on page 2 (e.g., 'Employee Health Solutions')",
  "sectionHeader": "The section subheader (e.g., 'Streamline Employee Health. Strengthen Compliance')",
  "introParagraph": "The intro paragraph describing the solution",
  "keySolutions": ["Solution 1", "Solution 2", "Solution 3", "Solution 4", "Solution 5", "Solution 6"],
  "quoteText": "The customer quote text (include the quotation marks if present)",
  "quoteName": "The name of the person quoted",
  "quoteTitle": "The job title of the person quoted",
  "quoteCompany": "The company/organization of the person quoted",
  "benefits": [
    { "title": "Benefit title", "description": "Benefit description" }
  ],
  "features": [
    { "title": "Feature title", "description": "Feature description" }
  ]
}

Notes:
- keySolutions should have exactly 6 items (the bullet points under "Key Solutions")
- benefits should have 5 items from "Key Benefits" section (title + description for each)
- features should have 5-6 items from "Key Features" section (title + description for each)
- For the quote, separate the quote text from the attribution (name, title, company)

Return ONLY valid JSON, no additional text.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: extractionPrompt,
        },
      ],
    })

    // Extract the text content from Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let extractedContent: SolutionOverviewContent
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      let jsonStr = responseText
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }
      extractedContent = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse extracted content' },
        { status: 500 }
      )
    }

    // Validate and normalize the response
    const normalizedContent: SolutionOverviewContent = {
      solutionName: extractedContent.solutionName || '',
      tagline: extractedContent.tagline || '',
      page2Header: extractedContent.page2Header || '',
      sectionHeader: extractedContent.sectionHeader || '',
      introParagraph: extractedContent.introParagraph || '',
      keySolutions: normalizeKeySolutions(extractedContent.keySolutions),
      quoteText: extractedContent.quoteText || '',
      quoteName: extractedContent.quoteName || '',
      quoteTitle: extractedContent.quoteTitle || '',
      quoteCompany: extractedContent.quoteCompany || '',
      benefits: normalizeBenefits(extractedContent.benefits),
      features: normalizeFeatures(extractedContent.features),
    }

    return NextResponse.json({ content: normalizedContent })
  } catch (error) {
    console.error('Error parsing solution overview:', error)
    return NextResponse.json(
      { error: 'Failed to parse document' },
      { status: 500 }
    )
  }
}

// Ensure exactly 6 key solutions
function normalizeKeySolutions(solutions: string[] | undefined): [string, string, string, string, string, string] {
  const arr = solutions || []
  return [
    arr[0] || '',
    arr[1] || '',
    arr[2] || '',
    arr[3] || '',
    arr[4] || '',
    arr[5] || '',
  ]
}

// Ensure benefits array with title/description
function normalizeBenefits(benefits: Array<{ title: string; description: string }> | undefined) {
  const arr = benefits || []
  return arr.map(b => ({
    title: b.title || '',
    description: b.description || '',
  }))
}

// Ensure features array with title/description
function normalizeFeatures(features: Array<{ title: string; description: string }> | undefined) {
  const arr = features || []
  return arr.map(f => ({
    title: f.title || '',
    description: f.description || '',
  }))
}
