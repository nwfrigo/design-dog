/**
 * Stacker Module Registry
 *
 * Single source of truth for all available Stacker modules.
 * Used for AI prompt generation and module creation.
 */

import type { StackerModule, SolutionCategory } from '@/types'

// Module type definitions for AI prompt
export interface ModuleDefinition {
  type: string
  name: string
  description: string
  whenToUse: string
  fields: FieldDefinition[]
  locked?: boolean // Cannot be reordered or deleted
}

export interface FieldDefinition {
  name: string
  type: 'string' | 'boolean' | 'number' | 'array' | 'object'
  description: string
  required?: boolean
  default?: unknown
  options?: string[] // For enum-like fields
}

// V1 Module Library
export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    type: 'logo-chip',
    name: 'Logo & Category Chips',
    description: 'Cority logo with optional solution category indicator chips',
    whenToUse: 'Always include at the top of every document. The chips highlight which Cority solutions are relevant.',
    locked: true,
    fields: [
      { name: 'showChips', type: 'boolean', description: 'Whether to show solution category chips', default: true },
      { name: 'activeCategories', type: 'array', description: 'Which solution categories to highlight', default: ['safety'] },
    ],
  },
  {
    type: 'header',
    name: 'Header',
    description: 'Main title/headline with optional subheader and CTA link',
    whenToUse: 'Use immediately after logo for the main document title. Every document needs a header.',
    locked: true,
    fields: [
      { name: 'heading', type: 'string', description: 'Main headline text', required: true },
      { name: 'headingSize', type: 'string', description: 'Size of heading', options: ['h1', 'h2', 'h3'], default: 'h1' },
      { name: 'subheader', type: 'string', description: 'Supporting text below headline' },
      { name: 'showSubheader', type: 'boolean', description: 'Whether to show subheader', default: true },
      { name: 'cta', type: 'string', description: 'Call-to-action link text' },
      { name: 'ctaUrl', type: 'string', description: 'URL for CTA link' },
      { name: 'showCta', type: 'boolean', description: 'Whether to show CTA', default: false },
    ],
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    description: 'Text block with bold intro sentence and regular body text',
    whenToUse: 'Use for explanatory content, introductions, or any prose that needs more detail than a header.',
    fields: [
      { name: 'intro', type: 'string', description: 'Bold introductory sentence', required: true },
      { name: 'showIntro', type: 'boolean', description: 'Whether to show intro', default: true },
      { name: 'body', type: 'string', description: 'Main paragraph body text' },
      { name: 'showBody', type: 'boolean', description: 'Whether to show body', default: true },
    ],
  },
  {
    type: 'bullet-three',
    name: '3-Column Bullets',
    description: 'Three columns of bullet points with labels, ideal for features or benefits',
    whenToUse: 'Use when presenting 3 parallel categories of information (e.g., features by solution area, benefits by stakeholder).',
    fields: [
      { name: 'heading', type: 'string', description: 'Optional heading above the columns' },
      { name: 'columns', type: 'array', description: 'Array of 3 column objects, each with label and bullets array' },
    ],
  },
  {
    type: 'image',
    name: 'Image - 1:1',
    description: 'Square image (180x180) with eyebrow, heading, body text, and CTA',
    whenToUse: 'Use for featuring a key visual with explanatory content. Good for product screenshots, team photos, or concept illustrations.',
    fields: [
      { name: 'imagePosition', type: 'string', description: 'Image on left or right', options: ['left', 'right'], default: 'left' },
      { name: 'imageUrl', type: 'string', description: 'URL of the image (user will upload)' },
      { name: 'eyebrow', type: 'string', description: 'Small category label above heading' },
      { name: 'showEyebrow', type: 'boolean', description: 'Whether to show eyebrow', default: true },
      { name: 'heading', type: 'string', description: 'Main heading text', required: true },
      { name: 'showHeading', type: 'boolean', description: 'Whether to show heading', default: true },
      { name: 'body', type: 'string', description: 'Body text' },
      { name: 'showBody', type: 'boolean', description: 'Whether to show body', default: true },
      { name: 'cta', type: 'string', description: 'CTA link text' },
      { name: 'ctaUrl', type: 'string', description: 'URL for CTA' },
      { name: 'showCta', type: 'boolean', description: 'Whether to show CTA', default: true },
    ],
  },
  {
    type: 'image-16x9',
    name: 'Image - 16:9',
    description: 'Wide image (180x100) with eyebrow, heading, and body text. No CTA.',
    whenToUse: 'Use for landscape images like charts, diagrams, or wide screenshots. More compact than 1:1.',
    fields: [
      { name: 'imagePosition', type: 'string', description: 'Image on left or right', options: ['left', 'right'], default: 'left' },
      { name: 'imageUrl', type: 'string', description: 'URL of the image (user will upload)' },
      { name: 'eyebrow', type: 'string', description: 'Small category label above heading' },
      { name: 'showEyebrow', type: 'boolean', description: 'Whether to show eyebrow', default: true },
      { name: 'heading', type: 'string', description: 'Main heading text', required: true },
      { name: 'showHeading', type: 'boolean', description: 'Whether to show heading', default: true },
      { name: 'body', type: 'string', description: 'Body text' },
      { name: 'showBody', type: 'boolean', description: 'Whether to show body', default: true },
    ],
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'Horizontal line to separate sections',
    whenToUse: 'Use sparingly between major sections to create visual breaks. Do not overuse.',
    fields: [],
  },
  {
    type: 'three-card',
    name: 'Simple Cards',
    description: 'Three cards with icons, titles, and descriptions',
    whenToUse: 'Use for presenting 3 key points, features, or benefits in a visually equal layout.',
    fields: [
      { name: 'cards', type: 'array', description: 'Array of 3 card objects with icon (lucide icon name), title, and description' },
    ],
  },
  {
    type: 'image-cards',
    name: 'Image Cards',
    description: 'Two or three cards with images, eyebrow, title, and body text',
    whenToUse: 'Use when you need visual cards with images. Good for team members, case studies, or featured content.',
    fields: [
      { name: 'heading', type: 'string', description: 'Optional heading above cards' },
      { name: 'showHeading', type: 'boolean', description: 'Whether to show heading', default: true },
      { name: 'showCard3', type: 'boolean', description: 'Whether to show third card', default: true },
      { name: 'cards', type: 'array', description: 'Array of 3 card objects with imageUrl, eyebrow, showEyebrow, title, body' },
    ],
  },
  {
    type: 'quote',
    name: 'Quote',
    description: 'Customer testimonial or pull quote with attribution',
    whenToUse: 'Use for customer quotes, testimonials, or impactful statements. Adds credibility and human voice.',
    fields: [
      { name: 'quote', type: 'string', description: 'The quote text', required: true },
      { name: 'name', type: 'string', description: 'Name of person quoted' },
      { name: 'jobTitle', type: 'string', description: 'Job title of person' },
      { name: 'organization', type: 'string', description: 'Organization/company name' },
    ],
  },
  {
    type: 'three-stats',
    name: '3 Stats',
    description: 'Three statistics displayed prominently with labels',
    whenToUse: 'Use to highlight impressive numbers, ROI metrics, or key data points. Very impactful.',
    fields: [
      { name: 'stats', type: 'array', description: 'Array of 3 stat objects with value (e.g., "50%") and label' },
    ],
  },
  {
    type: 'one-stat',
    name: '1 Stat',
    description: 'Single prominent statistic with context',
    whenToUse: 'Use when one number tells the story. Good for hero stats or single impressive metrics.',
    fields: [
      { name: 'value', type: 'string', description: 'The stat value (e.g., "2.5M")', required: true },
      { name: 'label', type: 'string', description: 'What the stat represents' },
      { name: 'eyebrow', type: 'string', description: 'Category label above stat' },
      { name: 'body', type: 'string', description: 'Additional context text' },
    ],
  },
  {
    type: 'footer',
    name: 'Footer',
    description: 'Cority company stats footer with 5 data points',
    whenToUse: 'Always include at the bottom. Shows Cority credibility stats (employees, customers, etc.).',
    locked: true,
    fields: [
      { name: 'stat1Value', type: 'string', description: 'First stat value', default: '1,300+' },
      { name: 'stat1Label', type: 'string', description: 'First stat label', default: 'Employees' },
      { name: 'stat2Value', type: 'string', description: 'Second stat value', default: '1,500+' },
      { name: 'stat2Label', type: 'string', description: 'Second stat label', default: 'Customers' },
      { name: 'stat3Value', type: 'string', description: 'Third stat value', default: '75' },
      { name: 'stat3Label', type: 'string', description: 'Third stat label', default: 'Countries' },
      { name: 'stat4Value', type: 'string', description: 'Fourth stat value', default: '2.5M' },
      { name: 'stat4Label', type: 'string', description: 'Fourth stat label', default: 'Users' },
      { name: 'stat5Value', type: 'string', description: 'Fifth stat value', default: 'G2' },
      { name: 'stat5Label', type: 'string', description: 'Fifth stat label', default: 'Leader' },
    ],
  },
]

// Get content modules only (non-locked)
export function getContentModules(): ModuleDefinition[] {
  return MODULE_REGISTRY.filter(m => !m.locked)
}

// Get locked modules only
export function getLockedModules(): ModuleDefinition[] {
  return MODULE_REGISTRY.filter(m => m.locked)
}

// Generate prompt section for AI
export function generateModulePromptSection(): string {
  const contentModules = getContentModules()

  let prompt = `## Available Content Modules

You can use the following modules to structure the document. Choose modules based on the content and purpose.

`

  for (const moduleDef of contentModules) {
    prompt += `### ${moduleDef.name} (type: "${moduleDef.type}")
${moduleDef.description}
**When to use:** ${moduleDef.whenToUse}

`
  }

  return prompt
}

// Solution categories for reference
export const SOLUTION_CATEGORIES: SolutionCategory[] = [
  'environmental',
  'health',
  'safety',
  'quality',
  'sustainability',
  'converged',
]

// Helper to create a module with defaults
export function createModuleFromAI(type: string, data: Record<string, unknown>): StackerModule | null {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  switch (type) {
    case 'logo-chip':
      return {
        id,
        type: 'logo-chip',
        showChips: data.showChips !== false,
        activeCategories: (data.activeCategories as SolutionCategory[]) || ['safety'],
      }

    case 'header':
      return {
        id,
        type: 'header',
        heading: (data.heading as string) || '',
        headingSize: (data.headingSize as 'h1' | 'h2' | 'h3') || 'h1',
        subheader: (data.subheader as string) || '',
        showSubheader: data.showSubheader !== false,
        cta: (data.cta as string) || '',
        ctaUrl: (data.ctaUrl as string) || '',
        showCta: data.showCta === true,
      }

    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        intro: (data.intro as string) || '',
        body: (data.body as string) || '',
        showIntro: data.showIntro !== false,
        showBody: data.showBody !== false,
      }

    case 'bullet-three': {
      const defaultColumns: [{ label: string; bullets: string[] }, { label: string; bullets: string[] }, { label: string; bullets: string[] }] = [
        { label: 'Column 1', bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'] },
        { label: 'Column 2', bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'] },
        { label: 'Column 3', bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'] },
      ]
      const dataColumns = data.columns as Array<{ label: string; bullets: string[] }> | undefined
      const columns: [{ label: string; bullets: string[] }, { label: string; bullets: string[] }, { label: string; bullets: string[] }] =
        dataColumns && dataColumns.length >= 3
          ? [dataColumns[0], dataColumns[1], dataColumns[2]]
          : defaultColumns
      return {
        id,
        type: 'bullet-three',
        heading: (data.heading as string) || '',
        columns,
      }
    }

    case 'image':
      return {
        id,
        type: 'image',
        imagePosition: (data.imagePosition as 'left' | 'right') || 'left',
        imageUrl: null, // User will upload
        imagePan: { x: 0, y: 0 },
        imageZoom: 1,
        grayscale: false,
        eyebrow: (data.eyebrow as string) || '',
        showEyebrow: data.showEyebrow !== false,
        heading: (data.heading as string) || '',
        showHeading: data.showHeading !== false,
        body: (data.body as string) || '',
        showBody: data.showBody !== false,
        cta: (data.cta as string) || 'Learn More',
        ctaUrl: (data.ctaUrl as string) || '',
        showCta: data.showCta !== false,
      }

    case 'image-16x9':
      return {
        id,
        type: 'image-16x9',
        imagePosition: (data.imagePosition as 'left' | 'right') || 'left',
        imageUrl: null,
        imagePan: { x: 0, y: 0 },
        imageZoom: 1,
        grayscale: false,
        eyebrow: (data.eyebrow as string) || '',
        showEyebrow: data.showEyebrow !== false,
        heading: (data.heading as string) || '',
        showHeading: data.showHeading !== false,
        body: (data.body as string) || '',
        showBody: data.showBody !== false,
      }

    case 'divider':
      return {
        id,
        type: 'divider',
      }

    case 'three-card': {
      type CardType = { icon: string; title: string; description: string }
      const defaultCards: [CardType, CardType, CardType] = [
        { icon: 'zap', title: 'Card 1', description: 'Description' },
        { icon: 'shield-check', title: 'Card 2', description: 'Description' },
        { icon: 'clock', title: 'Card 3', description: 'Description' },
      ]
      const dataCards = data.cards as Array<CardType> | undefined
      const cards: [CardType, CardType, CardType] =
        dataCards && dataCards.length >= 3
          ? [dataCards[0], dataCards[1], dataCards[2]]
          : defaultCards
      return {
        id,
        type: 'three-card',
        cards,
      }
    }

    case 'image-cards': {
      type ImageCardType = {
        imageUrl: string | null
        imagePan: { x: number; y: number }
        imageZoom: number
        eyebrow: string
        showEyebrow: boolean
        title: string
        body: string
      }
      const defaultImageCards: [ImageCardType, ImageCardType, ImageCardType] = [
        { imageUrl: null, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: '', showEyebrow: true, title: '', body: '' },
        { imageUrl: null, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: '', showEyebrow: true, title: '', body: '' },
        { imageUrl: null, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: '', showEyebrow: true, title: '', body: '' },
      ]
      const dataImageCards = data.cards as Array<ImageCardType> | undefined
      const imageCards: [ImageCardType, ImageCardType, ImageCardType] =
        dataImageCards && dataImageCards.length >= 3
          ? [dataImageCards[0], dataImageCards[1], dataImageCards[2]]
          : defaultImageCards
      return {
        id,
        type: 'image-cards',
        heading: (data.heading as string) || '',
        showHeading: data.showHeading !== false,
        cards: imageCards,
        showCard3: data.showCard3 !== false,
        grayscale: false,
      }
    }

    case 'quote':
      return {
        id,
        type: 'quote',
        quote: (data.quote as string) || '',
        name: (data.name as string) || '',
        jobTitle: (data.jobTitle as string) || '',
        organization: (data.organization as string) || '',
      }

    case 'three-stats': {
      type StatType = { value: string; label: string }
      const defaultStats: [StatType, StatType, StatType] = [
        { value: '50%', label: 'Improvement' },
        { value: '2x', label: 'Faster' },
        { value: '100+', label: 'Features' },
      ]
      const dataStats = data.stats as Array<StatType> | undefined
      const stats: [StatType, StatType, StatType] =
        dataStats && dataStats.length >= 3
          ? [dataStats[0], dataStats[1], dataStats[2]]
          : defaultStats
      return {
        id,
        type: 'three-stats',
        stats,
        showStat3: data.showStat3 !== false,
      }
    }

    case 'one-stat':
      return {
        id,
        type: 'one-stat',
        value: (data.value as string) || '',
        label: (data.label as string) || '',
        eyebrow: (data.eyebrow as string) || '',
        body: (data.body as string) || '',
      }

    case 'footer':
      return {
        id,
        type: 'footer',
        stat1Value: (data.stat1Value as string) || '1,300+',
        stat1Label: (data.stat1Label as string) || 'Employees',
        stat2Value: (data.stat2Value as string) || '1,500+',
        stat2Label: (data.stat2Label as string) || 'Customers',
        stat3Value: (data.stat3Value as string) || '75',
        stat3Label: (data.stat3Label as string) || 'Countries',
        stat4Value: (data.stat4Value as string) || '2.5M',
        stat4Label: (data.stat4Label as string) || 'Users',
        stat5Value: (data.stat5Value as string) || 'G2',
        stat5Label: (data.stat5Label as string) || 'Leader',
      }

    default:
      return null
  }
}
