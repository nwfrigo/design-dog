import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateModulePromptSection, createModuleFromAI, SOLUTION_CATEGORIES } from '@/lib/stacker-modules'
import type { StackerModule, SolutionCategory } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceContent, purpose } = body

    if (!sourceContent || sourceContent.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide more source content (minimum 50 characters)' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Build the prompt
    const modulePrompt = generateModulePromptSection()

    const systemPrompt = `You are an expert marketing content creator for Cority, a B2B software company specializing in Environmental, Health, Safety, and Quality (EHSQ) management solutions.

Your task is to create a well-structured document using the available modules. The document should be professional, concise, and suitable for executive audiences.

${modulePrompt}

## Important Guidelines

1. **Always start with logo-chip and header** - these are required
2. **Always end with footer** - this is required
3. **Choose modules strategically** based on the content
4. **Keep content concise** - this is a summary document, not a whitepaper
5. **Use stats when available** - numbers are impactful
6. **Include a quote if there's testimonial content**
7. **Don't overuse dividers** - only between major sections
8. **Image modules will need user-uploaded images** - write placeholder text assuming images will be added
9. **For bullet columns, provide meaningful labels and bullets** - don't just say "Column 1"
10. **For cards, suggest appropriate Lucide icon names** (e.g., "shield-check", "zap", "clock", "target", "users", "trending-up")

## Solution Categories
Choose the most relevant categories from: ${SOLUTION_CATEGORIES.join(', ')}

## Response Format
Return ONLY valid JSON (no markdown code blocks) in this exact structure:
{
  "modules": [
    {
      "type": "module-type",
      ...fields for that module type
    }
  ],
  "activeCategories": ["safety", "health"],
  "documentTitle": "Brief title for internal reference"
}

The modules array should contain the content modules in order. Logo-chip, header, and footer will be added automatically - focus on the content modules in between.`

    const userPrompt = `Create a Stacker document from the following source content.

## Source Content
${sourceContent}

${purpose ? `## Purpose/Context\n${purpose}\n` : ''}
## Instructions
- Analyze the content and determine the best structure
- Select appropriate modules to present the information effectively
- Write professional marketing copy (not just copy-paste from source)
- Keep it concise - this is a 1-2 page summary document
- Identify which Cority solution categories are most relevant

Generate the document structure now.`

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
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

    let generatedContent: {
      modules: Array<{ type: string; [key: string]: unknown }>
      activeCategories: string[]
      documentTitle: string
    }

    try {
      generatedContent = JSON.parse(jsonStr.trim())
    } catch {
      console.error('Failed to parse JSON:', jsonStr)
      throw new Error('Failed to parse AI response')
    }

    // Build the full module list
    const fullModules: StackerModule[] = []

    // 1. Add logo-chip
    const logoChip = createModuleFromAI('logo-chip', {
      showChips: true,
      activeCategories: (generatedContent.activeCategories || ['safety']) as SolutionCategory[],
    })
    if (logoChip) fullModules.push(logoChip)

    // 2. Find and add header from generated modules, or create default
    const headerModule = generatedContent.modules.find(m => m.type === 'header')
    const header = createModuleFromAI('header', headerModule || {
      heading: generatedContent.documentTitle || 'Document Title',
      headingSize: 'h1',
      showSubheader: false,
      showCta: false,
    })
    if (header) fullModules.push(header)

    // 3. Add content modules (excluding header and footer)
    for (const moduleData of generatedContent.modules) {
      if (moduleData.type === 'header' || moduleData.type === 'footer' || moduleData.type === 'logo-chip') {
        continue // Skip, we handle these specially
      }

      const stackerModule = createModuleFromAI(moduleData.type, moduleData)
      if (stackerModule) {
        fullModules.push(stackerModule)
      }
    }

    // 4. Add footer
    const footer = createModuleFromAI('footer', {})
    if (footer) fullModules.push(footer)

    return NextResponse.json({
      modules: fullModules,
      documentTitle: generatedContent.documentTitle || 'Generated Document',
      activeCategories: generatedContent.activeCategories || ['safety'],
      debug: {
        model: 'claude-sonnet-4-20250514',
        moduleCount: fullModules.length,
        contentModuleCount: generatedContent.modules.length,
        rawResponse: textContent.text,
      },
    })
  } catch (error) {
    console.error('Stacker generation error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate document'
    const isRateLimited = errorMessage.includes('rate') || errorMessage.includes('429')

    return NextResponse.json(
      {
        error: isRateLimited
          ? 'API rate limited. Please wait a moment and try again.'
          : `Failed to generate document: ${errorMessage}`,
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorDetails: errorMessage,
        },
      },
      { status: 500 }
    )
  }
}
