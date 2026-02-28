import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import brandVoiceConfig from '@/config/brand-voice.json'
import type { TemplateType } from '@/types'
import {
  getConstraintsForTemplate,
  buildConstraintsPrompt,
  validateCopy,
  CATEGORY_CONFIGS,
} from '@/lib/copy-constraints'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GenerateRequest {
  context: string
  templateType?: TemplateType
}

interface GeneratedCopy {
  headline: string
  subhead: string
  body: string
  cta: string
  variations?: {
    headlines: string[]
    ctas: string[]
  }
}

async function generateCopy(
  context: string,
  constraintsPrompt: string,
  isRetry: boolean = false
): Promise<GeneratedCopy> {
  const { voiceProfile, examples } = brandVoiceConfig

  // Build examples section from brand voice
  const brandExamplesSection = examples.length > 0
    ? `
Brand voice examples:
${examples.map(e => `[${e.type.toUpperCase()}]: "${e.content}"${e.context ? ` (${e.context})` : ''}`).join('\n')}
`
    : ''

  // Build voice profile section
  const voiceSection = `
Brand Voice Guidelines:
- ${voiceProfile.summary}
- Tone: ${voiceProfile.toneDescriptors.join(', ')}
- Style: ${voiceProfile.vocabularyPatterns.join('. ')}
- Structure: ${voiceProfile.structureNotes.join('. ')}
- Do: ${voiceProfile.doAndDonts.do.join('. ')}
- Don't: ${voiceProfile.doAndDonts.dont.join('. ')}
`

  const retryNote = isRetry
    ? `

IMPORTANT: The previous attempt was TOO LONG. You MUST be more concise this time.
Cut ruthlessly. Use fragments. Every word must earn its place.
If you can say it in 3 words, don't use 5.
`
    : ''

  const prompt = `You are an expert copywriter for ${brandVoiceConfig.companyName}. Write compelling, CONCISE marketing copy.
${voiceSection}
${brandExamplesSection}
${constraintsPrompt}
${retryNote}
The user wants to promote:
${context}

Generate copy that fits WITHIN the character and word limits above. Do not exceed them.
Also provide 2 alternative headlines and 2 alternative CTAs (same length constraints).

Respond in JSON format only, no markdown code blocks:
{
  "headline": "...",
  "subhead": "...",
  "body": "...",
  "cta": "...",
  "variations": {
    "headlines": ["alt1", "alt2"],
    "ctas": ["alt1", "alt2"]
  }
}`

  // Call Claude with retry logic for transient errors (429, 529)
  const MAX_RETRIES = 3
  let response: Anthropic.Messages.Message | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })
      break
    } catch (retryError) {
      const msg = String(retryError)
      const isRateLimit = msg.includes('429') || msg.includes('rate_limit')
      const isOverloaded = msg.includes('529') || msg.includes('overloaded') || msg.includes('Overloaded')
      const isRetryable = isRateLimit || isOverloaded
      if (isRetryable && attempt < MAX_RETRIES) {
        // Rate limits need longer waits (per-minute budget); overloaded needs shorter
        const delay = isRateLimit ? attempt * 15000 : attempt * 3000
        console.log(`generate: ${isRateLimit ? 'Rate limited' : 'Overloaded'} on attempt ${attempt}, waiting ${delay / 1000}s...`, msg.slice(0, 200))
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw retryError
    }
  }

  if (!response) {
    throw new Error('Failed to get response from Claude after retries')
  }

  const textContent = response.content.find(block => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Extract JSON from response
  let jsonStr = textContent.text
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  return JSON.parse(jsonStr.trim())
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    if (!body.context?.trim()) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Get constraints for the template type (default to email if not specified)
    const config = body.templateType
      ? getConstraintsForTemplate(body.templateType)
      : CATEGORY_CONFIGS.email

    const constraintsPrompt = buildConstraintsPrompt(config)

    // First attempt
    let copy = await generateCopy(body.context, constraintsPrompt, false)

    // Validate against constraints
    const validation = validateCopy(copy, config.constraints)

    // If over limits, retry once with stricter prompt
    if (!validation.valid) {
      console.log('Copy exceeded limits, retrying:', validation.violations)
      copy = await generateCopy(body.context, constraintsPrompt, true)

      // Log if still over limits (but return anyway - user can edit)
      const retryValidation = validateCopy(copy, config.constraints)
      if (!retryValidation.valid) {
        console.log('Retry still over limits:', retryValidation.violations)
      }
    }

    return NextResponse.json({
      copy,
      constraints: config.constraints,
      validated: validation.valid,
    })
  } catch (error) {
    console.error('Generation error:', error)
    const errorStr = String(error)
    const isRateLimited = errorStr.includes('429') || errorStr.includes('rate_limit')
    const isOverloaded = errorStr.includes('529') || errorStr.includes('overloaded') || errorStr.includes('Overloaded')

    let userMessage: string
    let errorCode: string
    if (isRateLimited) {
      userMessage = 'The AI service is temporarily busy. Please wait a moment and retry.'
      errorCode = 'rate_limit'
    } else if (isOverloaded) {
      userMessage = 'The AI service is temporarily overloaded. Please retry in a moment.'
      errorCode = 'overloaded'
    } else {
      userMessage = error instanceof Error ? error.message : 'Failed to generate copy'
      errorCode = 'unknown'
    }

    return NextResponse.json(
      { error: userMessage, errorCode },
      { status: 500 }
    )
  }
}
