import type { TemplateType } from '@/types'

// Style definitions for copy generation
export type CopyStyle = 'punchy' | 'standard' | 'detailed'

export interface FieldConstraint {
  maxChars: number
  maxWords: number
  style: CopyStyle
}

export interface CopyConstraints {
  headline: FieldConstraint
  subhead: FieldConstraint
  body: FieldConstraint
  cta: FieldConstraint
}

export interface CategoryConfig {
  constraints: CopyConstraints
  styleDescription: string
  examples: {
    headline: string[]
    subhead: string[]
    body: string[]
    cta: string[]
  }
}

// Style descriptions for prompts
export const STYLE_DESCRIPTIONS: Record<CopyStyle, string> = {
  punchy: 'Fragments welcome. No fluff. Action words. Maximum 1 sentence per field. Think billboard, not brochure.',
  standard: 'Complete but concise. One short sentence max per field. Clear and direct.',
  detailed: 'For content-heavy assets. Still scannable. Can use 2 short sentences if needed.',
}

// Category-based constraints
// Easy to adjust limits per category later
export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  email: {
    constraints: {
      headline: { maxChars: 35, maxWords: 5, style: 'punchy' },
      subhead: { maxChars: 60, maxWords: 10, style: 'punchy' },
      body: { maxChars: 90, maxWords: 15, style: 'punchy' },
      cta: { maxChars: 20, maxWords: 3, style: 'punchy' },
    },
    styleDescription: 'Email headers need to be scannable in cluttered inboxes. Ultra-short, benefit-focused. Every word must earn its place.',
    examples: {
      headline: [
        'Safety that scales.',
        'Compliance made simple.',
        'Risk, meet your match.',
        'Your audit-ready future.',
      ],
      subhead: [
        'Enterprise protection, mid-market simplicity.',
        'One platform. Complete visibility.',
        'From reactive to proactive in weeks.',
      ],
      body: [
        'See how 500+ companies reduced incidents by 40%.',
        'Join the leaders transforming workplace safety.',
        'Your complete EHS solution starts here.',
      ],
      cta: [
        'Get the guide',
        'See how',
        'Start free',
        'Learn more',
        'Watch now',
      ],
    },
  },

  social: {
    constraints: {
      headline: { maxChars: 45, maxWords: 7, style: 'punchy' },
      subhead: { maxChars: 70, maxWords: 12, style: 'punchy' },
      body: { maxChars: 80, maxWords: 14, style: 'punchy' },
      cta: { maxChars: 20, maxWords: 3, style: 'punchy' },
    },
    styleDescription: 'Social posts compete for attention in feeds. Punchy, scroll-stopping headlines. Subhead optional but impactful. Minimal body text.',
    examples: {
      headline: [
        'The future of safety is here.',
        'Incidents down 40%. Culture up.',
        'Built for how you actually work.',
        'Safety leaders choose differently.',
      ],
      subhead: [
        'See what predictive EHS looks like.',
        'Real results from real companies.',
        'The platform that grows with you.',
      ],
      body: [
        'Leading companies are transforming safety culture.',
        'Discover why 2,500+ organizations trust Cority.',
      ],
      cta: [
        'Explore now',
        'See the data',
        'Join them',
        'Get started',
      ],
    },
  },

  website: {
    constraints: {
      headline: { maxChars: 50, maxWords: 8, style: 'punchy' },
      subhead: { maxChars: 90, maxWords: 15, style: 'standard' },
      body: { maxChars: 120, maxWords: 20, style: 'standard' },
      cta: { maxChars: 25, maxWords: 4, style: 'punchy' },
    },
    styleDescription: 'Website banners can be slightly longer but still scannable. Clear value proposition in headline. Subhead expands on benefit. Body provides proof or context.',
    examples: {
      headline: [
        'Enterprise EHS, simplified.',
        'The platform safety leaders trust.',
        'From compliance to culture.',
        'Your complete safety solution.',
      ],
      subhead: [
        'One platform for environmental, health, safety, and quality management.',
        'Join 2,500+ organizations transforming workplace safety.',
        'Reduce risk, ensure compliance, build culture.',
      ],
      body: [
        'See how leading companies reduced incidents by 40% while cutting compliance time in half.',
        'Trusted by Fortune 500 companies and growing mid-market leaders alike.',
      ],
      cta: [
        'Request a demo',
        'Get the guide',
        'See it in action',
        'Start your journey',
      ],
    },
  },

  newsletter: {
    constraints: {
      headline: { maxChars: 40, maxWords: 6, style: 'punchy' },
      subhead: { maxChars: 70, maxWords: 12, style: 'punchy' },
      body: { maxChars: 100, maxWords: 18, style: 'punchy' },
      cta: { maxChars: 20, maxWords: 3, style: 'punchy' },
    },
    styleDescription: 'Newsletter banners are compact. Punchy headline, brief supporting text. Gets readers to click through for more.',
    examples: {
      headline: [
        'Your weekly safety intel.',
        'New: Predictive analytics.',
        'Safety culture decoded.',
        'The compliance shortcut.',
      ],
      subhead: [
        'Insights that drive better decisions.',
        'What leading EHS teams do differently.',
        'Trends shaping workplace safety.',
      ],
      body: [
        'Get the strategies top safety leaders use every day.',
        'See how automation is transforming EHS workflows.',
      ],
      cta: [
        'Read now',
        'Get insights',
        'Dive in',
        'Learn more',
      ],
    },
  },
}

// Map template types to categories
const TEMPLATE_CATEGORY_MAP: Record<TemplateType, string> = {
  'website-thumbnail': 'website',
  'website-press-release': 'website',
  'website-webinar': 'website',
  'website-event-listing': 'website',
  'website-report': 'website',
  'website-floating-banner': 'website',
  'website-floating-banner-mobile': 'website',
  'email-grid': 'email',
  'email-image': 'email',
  'email-dark-gradient': 'email',
  'email-speakers': 'email',
  'social-dark-gradient': 'social',
  'social-blue-gradient': 'social',
  'social-image': 'social',
  'social-grid-detail': 'social',
  'newsletter-dark-gradient': 'newsletter',
  'newsletter-blue-gradient': 'newsletter',
  'newsletter-light': 'newsletter',
  'newsletter-top-banner': 'newsletter',
}

/**
 * Get copy constraints for a specific template type
 */
export function getConstraintsForTemplate(templateType: TemplateType): CategoryConfig {
  const category = TEMPLATE_CATEGORY_MAP[templateType] || 'email'
  return CATEGORY_CONFIGS[category]
}

/**
 * Get the category for a template type
 */
export function getCategoryForTemplate(templateType: TemplateType): string {
  return TEMPLATE_CATEGORY_MAP[templateType] || 'email'
}

/**
 * Validate copy against constraints
 * Returns true if all fields are within limits
 */
export function validateCopy(
  copy: { headline?: string; subhead?: string; body?: string; cta?: string },
  constraints: CopyConstraints
): { valid: boolean; violations: string[] } {
  const violations: string[] = []

  if (copy.headline) {
    const words = copy.headline.trim().split(/\s+/).length
    const chars = copy.headline.length
    if (chars > constraints.headline.maxChars) {
      violations.push(`Headline exceeds ${constraints.headline.maxChars} chars (has ${chars})`)
    }
    if (words > constraints.headline.maxWords) {
      violations.push(`Headline exceeds ${constraints.headline.maxWords} words (has ${words})`)
    }
  }

  if (copy.subhead) {
    const words = copy.subhead.trim().split(/\s+/).length
    const chars = copy.subhead.length
    if (chars > constraints.subhead.maxChars) {
      violations.push(`Subhead exceeds ${constraints.subhead.maxChars} chars (has ${chars})`)
    }
    if (words > constraints.subhead.maxWords) {
      violations.push(`Subhead exceeds ${constraints.subhead.maxWords} words (has ${words})`)
    }
  }

  if (copy.body) {
    const words = copy.body.trim().split(/\s+/).length
    const chars = copy.body.length
    if (chars > constraints.body.maxChars) {
      violations.push(`Body exceeds ${constraints.body.maxChars} chars (has ${chars})`)
    }
    if (words > constraints.body.maxWords) {
      violations.push(`Body exceeds ${constraints.body.maxWords} words (has ${words})`)
    }
  }

  if (copy.cta) {
    const words = copy.cta.trim().split(/\s+/).length
    const chars = copy.cta.length
    if (chars > constraints.cta.maxChars) {
      violations.push(`CTA exceeds ${constraints.cta.maxChars} chars (has ${chars})`)
    }
    if (words > constraints.cta.maxWords) {
      violations.push(`CTA exceeds ${constraints.cta.maxWords} words (has ${words})`)
    }
  }

  return { valid: violations.length === 0, violations }
}

/**
 * Build the constraints portion of a generation prompt
 */
export function buildConstraintsPrompt(config: CategoryConfig): string {
  const { constraints, styleDescription, examples } = config

  return `
COPY CONSTRAINTS (STRICT - DO NOT EXCEED):
${styleDescription}

Field limits:
- Headline: Max ${constraints.headline.maxWords} words, ${constraints.headline.maxChars} characters. ${STYLE_DESCRIPTIONS[constraints.headline.style]}
- Subhead: Max ${constraints.subhead.maxWords} words, ${constraints.subhead.maxChars} characters. ${STYLE_DESCRIPTIONS[constraints.subhead.style]}
- Body: Max ${constraints.body.maxWords} words, ${constraints.body.maxChars} characters. ${STYLE_DESCRIPTIONS[constraints.body.style]}
- CTA: Max ${constraints.cta.maxWords} words, ${constraints.cta.maxChars} characters. Action verb required.

GOOD EXAMPLES (match this brevity):
Headlines: ${examples.headline.slice(0, 3).map(h => `"${h}"`).join(', ')}
Subheads: ${examples.subhead.slice(0, 2).map(s => `"${s}"`).join(', ')}
Body: ${examples.body.slice(0, 2).map(b => `"${b}"`).join(', ')}
CTAs: ${examples.cta.slice(0, 3).map(c => `"${c}"`).join(', ')}
`
}
