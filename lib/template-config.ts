import type { TemplateType } from '@/types'

export interface TemplateInfo {
  type: TemplateType
  label: string
  dimensions: string
  width: number
  height: number
}

export interface ChannelConfig {
  id: string
  label: string
  templates: TemplateInfo[]
}

// Subchannel within a distribution channel
export interface SubChannelConfig {
  id: string
  label: string
  icon: 'mail' | 'share' | 'globe' | 'newspaper'
  templates: TemplateInfo[]
}

// Distribution channel (top-level grouping)
export interface DistributionChannel {
  id: string
  label: string
  description: string
  subChannels: SubChannelConfig[]
  comingSoon?: boolean
}

// Template definitions for email
const EMAIL_TEMPLATES: TemplateInfo[] = [
  {
    type: 'email-grid',
    label: 'Grid Details',
    dimensions: '640 × 300px',
    width: 640,
    height: 300,
  },
  {
    type: 'email-image',
    label: 'Image',
    dimensions: '640 × 300px',
    width: 640,
    height: 300,
  },
  {
    type: 'email-dark-gradient',
    label: 'Dark & Simple',
    dimensions: '640 × 300px',
    width: 640,
    height: 300,
  },
  {
    type: 'email-speakers',
    label: 'Speakers & Guests',
    dimensions: '640 × 300px',
    width: 640,
    height: 300,
  },
  {
    type: 'email-product-release',
    label: 'Product Release Banner',
    dimensions: '640 × 164px',
    width: 640,
    height: 164,
  },
]

// Template definitions for social
const SOCIAL_TEMPLATES: TemplateInfo[] = [
  {
    type: 'social-dark-gradient',
    label: 'Dark & Simple',
    dimensions: '1200 × 628px',
    width: 1200,
    height: 628,
  },
  {
    type: 'social-blue-gradient',
    label: 'Blue & Colorful',
    dimensions: '1200 × 628px',
    width: 1200,
    height: 628,
  },
  {
    type: 'social-image',
    label: 'Image',
    dimensions: '1200 × 628px',
    width: 1200,
    height: 628,
  },
  {
    type: 'social-grid-detail',
    label: 'Grid Details',
    dimensions: '1200 × 628px',
    width: 1200,
    height: 628,
  },
]

// Template definitions for website
const WEBSITE_TEMPLATES: TemplateInfo[] = [
  {
    type: 'website-thumbnail',
    label: 'eBook Featured Image',
    dimensions: '800 × 450px',
    width: 800,
    height: 450,
  },
  {
    type: 'website-press-release',
    label: 'Press Release Featured Image',
    dimensions: '800 × 450px',
    width: 800,
    height: 450,
  },
  {
    type: 'website-webinar',
    label: 'Webinar Featured Image',
    dimensions: '800 × 450px',
    width: 800,
    height: 450,
  },
  {
    type: 'website-event-listing',
    label: 'Event Listing Featured Image',
    dimensions: '800 × 450px',
    width: 800,
    height: 450,
  },
  {
    type: 'website-report',
    label: 'Report Featured Image',
    dimensions: '800 × 450px',
    width: 800,
    height: 450,
  },
  {
    type: 'website-floating-banner',
    label: 'Floating Banner (Desktop)',
    dimensions: '2256 × 100px',
    width: 2256,
    height: 100,
  },
  {
    type: 'website-floating-banner-mobile',
    label: 'Floating Banner (Mobile)',
    dimensions: '580 × 80px',
    width: 580,
    height: 80,
  },
]

// Template definitions for newsletter
const NEWSLETTER_TEMPLATES: TemplateInfo[] = [
  {
    type: 'newsletter-dark-gradient',
    label: 'Dark & Simple',
    dimensions: '640 × 179px',
    width: 640,
    height: 179,
  },
  {
    type: 'newsletter-blue-gradient',
    label: 'Blue & Colorful',
    dimensions: '640 × 179px',
    width: 640,
    height: 179,
  },
  {
    type: 'newsletter-light',
    label: 'Light & Simple',
    dimensions: '640 × 179px',
    width: 640,
    height: 179,
  },
  {
    type: 'newsletter-top-banner',
    label: 'Top Banner',
    dimensions: '600 × 240px',
    width: 600,
    height: 240,
  },
]

// New: Distribution channels organized by use case
export const DISTRIBUTION_CHANNELS: DistributionChannel[] = [
  {
    id: 'digital',
    label: 'Digital',
    description: 'Email campaigns, social media, and web assets',
    subChannels: [
      {
        id: 'email',
        label: 'Email Banner',
        icon: 'mail',
        templates: EMAIL_TEMPLATES,
      },
      {
        id: 'social',
        label: 'Social Post',
        icon: 'share',
        templates: SOCIAL_TEMPLATES,
      },
      {
        id: 'website',
        label: 'Website Asset',
        icon: 'globe',
        templates: WEBSITE_TEMPLATES,
      },
      {
        id: 'newsletter',
        label: 'Newsletter Banner',
        icon: 'newspaper',
        templates: NEWSLETTER_TEMPLATES,
      },
    ],
  },
  {
    id: 'collateral',
    label: 'Collateral',
    description: 'Sales and marketing materials',
    subChannels: [
      {
        id: 'collateral-pdf',
        label: 'Collateral',
        icon: 'globe',
        templates: [
          {
            type: 'solution-overview-pdf',
            label: 'Solution Overview',
            dimensions: 'Letter (8.5" × 11") • 3 pages',
            width: 612,
            height: 792,
          },
          {
            type: 'faq-pdf',
            label: 'FAQs',
            dimensions: 'Letter (8.5" × 11") • Multi-page',
            width: 612,
            height: 792,
          },
        ],
      },
    ],
  },
  {
    id: 'community',
    label: 'Community & Academy',
    description: 'Community engagement and learning materials',
    subChannels: [],
    comingSoon: true,
  },
]

// Legacy: All templates organized by channel (for backwards compatibility)
export const CHANNELS: ChannelConfig[] = [
  {
    id: 'email',
    label: 'Email Banners',
    templates: EMAIL_TEMPLATES.map(t => ({ ...t, label: `Email - ${t.label}` })),
  },
  {
    id: 'social',
    label: 'Social Posts',
    templates: SOCIAL_TEMPLATES.map(t => ({ ...t, label: `Social - ${t.label}` })),
  },
  {
    id: 'website',
    label: 'Website Assets',
    templates: WEBSITE_TEMPLATES.map(t => ({ ...t, label: `Website - ${t.label}` })),
  },
  {
    id: 'newsletter',
    label: 'Newsletter Banners',
    templates: NEWSLETTER_TEMPLATES.map(t => ({ ...t, label: `Newsletter - ${t.label}` })),
  },
]

// Flat list of all templates (for backwards compatibility)
export const ALL_TEMPLATES: TemplateInfo[] = CHANNELS.flatMap(channel => channel.templates)

// Quick lookup by template type
export const TEMPLATE_INFO: Record<TemplateType, TemplateInfo> = Object.fromEntries(
  ALL_TEMPLATES.map(t => [t.type, t])
) as Record<TemplateType, TemplateInfo>

// Template dimensions lookup
export const TEMPLATE_DIMENSIONS: Record<TemplateType, { width: number; height: number }> = Object.fromEntries(
  ALL_TEMPLATES.map(t => [t.type, { width: t.width, height: t.height }])
) as Record<TemplateType, { width: number; height: number }>

// Template labels lookup
export const TEMPLATE_LABELS: Record<TemplateType, string> = Object.fromEntries(
  ALL_TEMPLATES.map(t => [t.type, t.label])
) as Record<TemplateType, string>
