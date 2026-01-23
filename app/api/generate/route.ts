import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import brandVoiceConfig from '@/config/brand-voice.json'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GenerateRequest {
  context: string
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

    const { voiceProfile, examples } = brandVoiceConfig

    // Build examples section
    const examplesSection = examples.length > 0
      ? `
Here are examples of our brand's voice:
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

    const prompt = `You are an expert copywriter for ${brandVoiceConfig.companyName}. Your task is to write compelling marketing copy.
${voiceSection}
${examplesSection}

The user wants to promote the following:
${body.context}

Generate marketing copy with:
1. A headline (attention-grabbing, benefit-focused, 6-10 words)
2. A subhead (supports the headline, adds context)
3. Body copy (2-3 sentences max, focused on benefits)
4. A CTA (action verb + clear outcome)

Also provide 2 alternative headlines and 2 alternative CTAs.

Respond in JSON format only, no markdown:
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

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

    const copy = JSON.parse(jsonStr.trim())

    return NextResponse.json({ copy })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate copy' },
      { status: 500 }
    )
  }
}
