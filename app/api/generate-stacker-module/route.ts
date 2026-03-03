import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateSingleModulePromptSection, createModuleFromAI } from '@/lib/stacker-modules'
import type { StackerModule } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moduleType, sourceContent, existingModules } = body as {
      moduleType: string
      sourceContent: string
      existingModules: { type: string; heading?: string }[]
    }

    if (!moduleType) {
      return NextResponse.json(
        { error: 'Module type is required' },
        { status: 400 }
      )
    }

    if (!sourceContent || sourceContent.trim().length < 50) {
      return NextResponse.json(
        { error: 'Source content is required (minimum 50 characters)' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const modulePrompt = generateSingleModulePromptSection(moduleType)
    if (!modulePrompt) {
      return NextResponse.json(
        { error: `Unknown module type: ${moduleType}` },
        { status: 400 }
      )
    }

    // Build existing modules context to avoid duplication
    const existingContext = existingModules && existingModules.length > 0
      ? `\n## Existing Document Modules (avoid duplicating their content)\n${existingModules.map((m, i) => `${i + 1}. ${m.type}${m.heading ? `: "${m.heading}"` : ''}`).join('\n')}\n`
      : ''

    const systemPrompt = `You are an expert marketing content creator for Cority, a B2B software company specializing in Environmental, Health, Safety, and Quality (EHSQ) management solutions.

Your task is to generate content for a SINGLE module to be added to an existing Stacker document. Generate rich, professional content that complements the existing document.

${modulePrompt}

## Critical Rules

1. **STATS ARE VERBATIM — NEVER INVENT OR ALTER**: Copy numbers EXACTLY as they appear in the source. Do not round, estimate, reframe, or combine numbers. If the source says "37 items", the stat must say "37", not "35+" or "nearly 40".
2. **QUOTES ARE VERBATIM — NEVER COMPOSE OR PARAPHRASE**: Copy quote text EXACTLY as written in the source. Copy name, title, and organization EXACTLY. Do not rewrite, summarize, or improve wording.
3. **Rich Content**: Every text field should have substantive content. Don't leave fields empty or with placeholder text.
4. **Meaningful Labels**: Use descriptive labels, never generic placeholders like "Column 1".
5. **Icon Selection**: For cards, choose relevant Lucide icons: shield-check, zap, clock, target, users, trending-up, bar-chart, lock, eye, clipboard-check, settings, refresh-cw, check-circle.
6. **Avoid Duplication**: The new module should complement existing modules, not repeat their content.
7. **MATCH MODULE COMPLEXITY TO CONTENT**: Every text field you include MUST contain substantive content.

## Response Format
Return ONLY valid JSON (no markdown code blocks) with the module fields for the "${moduleType}" type.`

    const userPrompt = `Generate content for a single "${moduleType}" module based on this source content.
${existingContext}
## Source Content
${sourceContent}

## Instructions
1. Generate substantive, professional content for ALL fields of the "${moduleType}" module
2. Content should be based on the source material
3. Do not duplicate content from existing modules listed above
4. Return ONLY valid JSON with the module fields

Generate the module content now.`

    // Call Claude with retry logic for transient errors
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: userPrompt }],
          system: systemPrompt,
        })

        const textContent = response.content.find(block => block.type === 'text')
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text response from Claude')
        }

        // Parse response
        let jsonStr = textContent.text
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch) {
          jsonStr = jsonMatch[1]
        }

        let moduleData: Record<string, unknown>
        try {
          moduleData = JSON.parse(jsonStr.trim())
        } catch {
          console.error('Failed to parse JSON:', jsonStr)
          throw new Error('Failed to parse AI response')
        }

        // Content-aware cleanup (same logic as full-doc endpoint)
        if (moduleType === 'one-stat') {
          if (!moduleData.body || (moduleData.body as string).trim() === '') {
            moduleData.body = ''
          }
          if (!moduleData.eyebrow || (moduleData.eyebrow as string).trim() === '') {
            moduleData.eyebrow = ''
          }
        }

        // image (1:1) with sparse text: downgrade to image-16x9
        let finalType = moduleType
        if (moduleType === 'image') {
          const hasBody = moduleData.body && (moduleData.body as string).trim().length > 0
          const hasHeading = moduleData.heading && (moduleData.heading as string).trim().length > 0
          const hasCta = moduleData.showCta === true && moduleData.cta && (moduleData.cta as string).trim().length > 0

          if (!hasBody || (!hasHeading && !hasCta)) {
            finalType = 'image-16x9'
            delete moduleData.cta
            delete moduleData.ctaUrl
            delete moduleData.showCta
          }
        }

        // paragraph with empty fields: toggle off
        if (moduleType === 'paragraph') {
          if (!moduleData.body || (moduleData.body as string).trim() === '') {
            moduleData.showBody = false
          }
          if (!moduleData.intro || (moduleData.intro as string).trim() === '') {
            moduleData.showIntro = false
          }
        }

        // Create the typed module
        const generatedModule: StackerModule | null = createModuleFromAI(finalType, moduleData)
        if (!generatedModule) {
          throw new Error(`Failed to create module of type: ${finalType}`)
        }

        return NextResponse.json({ module: generatedModule })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        const errorMessage = lastError.message || ''
        const isRetryable = errorMessage.includes('529') ||
          errorMessage.includes('overloaded') ||
          errorMessage.includes('Overloaded') ||
          errorMessage.includes('429') ||
          errorMessage.includes('rate')

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          console.log(`Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        throw lastError
      }
    }

    throw lastError || new Error('Failed after retries')
  } catch (error) {
    console.error('Stacker module generation error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate module'
    const isOverloaded = errorMessage.includes('529') || errorMessage.includes('overloaded') || errorMessage.includes('Overloaded')
    const isRateLimited = errorMessage.includes('rate') || errorMessage.includes('429')

    return NextResponse.json(
      {
        error: isOverloaded
          ? 'The AI service is temporarily busy. Please wait a moment and try again.'
          : isRateLimited
          ? 'API rate limited. Please wait a moment and try again.'
          : `Failed to generate module: ${errorMessage}`,
      },
      { status: isOverloaded ? 503 : 500 }
    )
  }
}
