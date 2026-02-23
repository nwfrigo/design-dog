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
- **VISUAL LEAD**: Stats module OR image module immediately after header (NOT a paragraph - avoid walls of text at the top)
- Paragraph module placed 3rd or later for context
- Visual variety: mix text modules (paragraph, bullets) with visual modules (stats, cards, images)
- At least one image module (user will upload the actual image)
- Closing content before footer (cards, quote, or call-to-action)

## Critical Rules

1. **STATS ONLY FROM SOURCE**: Only include three-stats or one-stat modules if the source content contains actual numeric data (percentages, dollar amounts, counts, timeframes, etc.). If no stats exist in the source, DO NOT include any stats modules - use other module types instead.

2. **QUOTES ONLY VERBATIM FROM SOURCE**: CRITICAL - Only include a quote module if the source contains an actual customer testimonial or quote that you can attribute with a real name, title, and organization found in the source. NEVER fabricate quotes, names, or organizations. If the source doesn't contain a verbatim quote with attribution, DO NOT include a quote module - use other module types instead.

3. **VISUAL LEAD AFTER HEADER**: Never place a paragraph module immediately after the header. Start with a visual element (stats with real data, or an image module). This creates visual interest and avoids walls of text.

4. **IMAGE CARDS FOR PRODUCT CONTENT**: When describing product features, platform capabilities, or software functionality, prefer the "image" module type over "three-card". Image modules allow users to add screenshots showing the actual product. Use three-card for conceptual benefits; use image modules for demonstrable product features.

5. **Visual Rhythm**: Alternate between text-heavy modules (paragraph, bullet-three) and visual modules (three-stats, three-card, image). Never place two similar modules back-to-back.

6. **Rich Content**: Every text field should have substantive content. Headers need subheaders. Paragraphs need both intro and body. Cards need full descriptions, not single words.

7. **Meaningful Labels**: For bullet columns, use descriptive labels like "Current Challenges", "Solution Benefits", "Key Outcomes" - never generic "Column 1".

8. **Icon Selection**: For cards, choose relevant Lucide icons: shield-check, zap, clock, target, users, trending-up, bar-chart, lock, eye, clipboard-check, settings, refresh-cw, check-circle.

## Solution Categories
Choose the most relevant from: ${SOLUTION_CATEGORIES.join(', ')}

## Example Output

Here is an example of a well-structured document (note: stats/image as 2nd module, not paragraph):
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
      "type": "three-stats",
      "stats": [
        { "value": "40%", "label": "Reduction in recordable incidents" },
        { "value": "3x", "label": "Faster audit preparation" },
        { "value": "$2.1M", "label": "Average annual savings" }
      ]
    },
    {
      "type": "paragraph",
      "intro": "Safety compliance doesn't have to be a cost center.",
      "body": "Forward-thinking organizations are discovering that modern EHS platforms deliver measurable ROI through reduced incidents, streamlined audits, and real-time visibility across operations.",
      "showIntro": true,
      "showBody": true
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
      "type": "image",
      "imagePosition": "right",
      "eyebrow": "Product Feature",
      "heading": "Mobile Incident Capture",
      "body": "Workers can report incidents and near-misses from the field with photo evidence, GPS location, and voice-to-text descriptions.",
      "cta": "See how it works",
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
      "type": "three-card",
      "cards": [
        { "icon": "shield-check", "heading": "Proactive Risk Management", "description": "Identify and address hazards before they become incidents with predictive analytics." },
        { "icon": "clipboard-check", "heading": "Simplified Compliance", "description": "Stay ahead of regulatory requirements with automated tracking and audit-ready documentation." },
        { "icon": "trending-up", "heading": "Continuous Improvement", "description": "Use data-driven insights to continuously improve safety performance across operations." }
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
2. **VISUAL LEAD**: Place stats module (if source has numbers) OR image module as the 2nd module - NEVER a paragraph
3. Only include stats modules if the source contains actual numbers - otherwise use image module as the visual lead
4. For product features and platform capabilities, use "image" modules (not three-card) so users can add screenshots
5. Vary module types for visual rhythm - alternate text and visual modules
6. Write professional marketing copy, not just copy-paste
7. Every field should have substantive content

## Pre-Submission Checklist
Before returning, verify:
- 2nd module is stats (if source had numbers) OR image - NOT a paragraph
- Stats modules ONLY if source had numeric data (otherwise omit them)
- Quote module ONLY if source has a verbatim quote with real name/title/org (otherwise omit it)
- Product/feature content uses image modules (for screenshots), not three-card
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
