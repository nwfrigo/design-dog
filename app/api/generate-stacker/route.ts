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

Your task is to create a VISUALLY RICH, well-structured document using the available modules. The document should feel complete and professional, suitable for executive audiences.

${modulePrompt}

## Document Structure Requirements

**Minimum 6-8 content modules** for a full-feeling document. A strong document typically includes:
- Header with a compelling subheader (always include subheader for context)
- Opening paragraph to set the stage
- Stats module with REAL numbers (never empty values)
- Visual variety: mix text modules (paragraph, bullets) with visual modules (stats, cards, images)
- At least one image module (user will upload the actual image)
- Closing content before footer (cards, quote, or call-to-action)

## Critical Rules

1. **STATS ONLY FROM SOURCE**: Only include three-stats or one-stat modules if the source content contains actual numeric data (percentages, dollar amounts, counts, timeframes, etc.). If no stats exist in the source, DO NOT include any stats modules - use other module types instead.

2. **Visual Rhythm**: Alternate between text-heavy modules (paragraph, bullet-three) and visual modules (three-stats, three-card, image). Never place two similar modules back-to-back.

3. **Rich Content**: Every text field should have substantive content. Headers need subheaders. Paragraphs need both intro and body. Cards need full descriptions, not single words.

4. **Meaningful Labels**: For bullet columns, use descriptive labels like "Current Challenges", "Solution Benefits", "Key Outcomes" - never generic "Column 1".

5. **Icon Selection**: For cards, choose relevant Lucide icons: shield-check, zap, clock, target, users, trending-up, bar-chart, lock, eye, clipboard-check, settings, refresh-cw, check-circle.

## Solution Categories
Choose the most relevant from: ${SOLUTION_CATEGORIES.join(', ')}

## Example Output

Here is an example of a well-structured document:
{
  "modules": [
    {
      "type": "header",
      "heading": "Transform Safety Compliance into Competitive Advantage",
      "headingSize": "h1",
      "subheader": "How leading manufacturers are reducing incidents by 40% while cutting compliance costs",
      "showSubheader": true,
      "showCta": false
    },
    {
      "type": "paragraph",
      "intro": "Safety compliance doesn't have to be a cost center.",
      "body": "Forward-thinking organizations are discovering that modern EHS platforms deliver measurable ROI through reduced incidents, streamlined audits, and real-time visibility across operations.",
      "showIntro": true,
      "showBody": true
    },
    {
      "type": "three-stats",
      "stats": [
        { "value": "40%", "label": "Reduction in recordable incidents" },
        { "value": "3x", "label": "Faster audit preparation" },
        { "value": "$2.1M", "label": "Average annual savings" }
      ]
    },
    {
      "type": "image",
      "imagePosition": "left",
      "eyebrow": "Platform Overview",
      "heading": "Unified Safety Management",
      "body": "A single platform connecting incident reporting, corrective actions, audits, and compliance tracking across all locations.",
      "cta": "See the platform",
      "showEyebrow": true,
      "showHeading": true,
      "showBody": true,
      "showCta": true
    },
    {
      "type": "bullet-three",
      "heading": "",
      "columns": [
        {
          "label": "Current Challenges",
          "bullets": ["Manual incident reporting", "Disconnected compliance data", "Reactive safety culture", "Audit preparation bottlenecks"]
        },
        {
          "label": "Platform Capabilities",
          "bullets": ["Mobile-first incident capture", "Automated compliance tracking", "Predictive risk analytics", "Integrated audit management"]
        },
        {
          "label": "Business Outcomes",
          "bullets": ["Fewer workplace incidents", "Reduced compliance costs", "Proactive risk mitigation", "Audit-ready documentation"]
        }
      ]
    },
    {
      "type": "quote",
      "quote": "We reduced our incident rate by 35% in the first year and cut audit prep time from weeks to days.",
      "name": "Sarah Chen",
      "jobTitle": "VP of Operations",
      "organization": "Global Manufacturing Corp"
    },
    {
      "type": "three-card",
      "cards": [
        {
          "icon": "smartphone",
          "title": "Mobile-First Design",
          "description": "Capture incidents and observations from the field with an intuitive mobile app that workers actually want to use."
        },
        {
          "icon": "refresh-cw",
          "title": "Automated Workflows",
          "description": "Route corrective actions, escalate issues, and track resolution automatically without manual follow-up."
        },
        {
          "icon": "bar-chart",
          "title": "Real-Time Analytics",
          "description": "Identify trends, predict risks, and demonstrate compliance with executive-ready dashboards and reports."
        }
      ]
    }
  ],
  "activeCategories": ["safety", "quality"],
  "documentTitle": "Safety Compliance ROI Overview"
}

## Response Format
Return ONLY valid JSON (no markdown code blocks) matching the structure above. The modules array should contain 6-8 content modules. Logo-chip, header, and footer are added automatically by the system.`

    const userPrompt = `Create a Stacker document from the following source content.

## Source Content
${sourceContent}

${purpose ? `## Purpose/Context\n${purpose}\n` : ''}
## Instructions
1. Create a visually rich document with 6-8 content modules
2. Only include stats modules if the source contains actual numbers - otherwise skip stats entirely
3. Vary module types for visual rhythm - alternate text and visual modules
4. Write professional marketing copy, not just copy-paste
5. Every field should have substantive content
6. Include at least one image module for visual interest

## Pre-Submission Checklist
Before returning, verify:
- Stats modules ONLY if source had numeric data (otherwise omit them)
- Header has a subheader
- At least 6 content modules total
- No two identical module types in a row
- Bullet column labels are descriptive (not "Column 1")

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
