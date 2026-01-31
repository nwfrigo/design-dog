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

// All templates organized by channel
export const CHANNELS: ChannelConfig[] = [
  {
    id: 'email',
    label: 'Email',
    templates: [
      {
        type: 'email-grid',
        label: 'Email - Grid Details',
        dimensions: '640 × 300px',
        width: 640,
        height: 300,
      },
      {
        type: 'email-image',
        label: 'Email - Image',
        dimensions: '640 × 300px',
        width: 640,
        height: 300,
      },
      {
        type: 'email-dark-gradient',
        label: 'Email - Dark Gradient',
        dimensions: '640 × 300px',
        width: 640,
        height: 300,
      },
      {
        type: 'email-speakers',
        label: 'Email - Speakers',
        dimensions: '640 × 300px',
        width: 640,
        height: 300,
      },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    templates: [
      {
        type: 'social-dark-gradient',
        label: 'Social - Dark Gradient',
        dimensions: '1200 × 628px',
        width: 1200,
        height: 628,
      },
      {
        type: 'social-blue-gradient',
        label: 'Social - Blue Gradient',
        dimensions: '1200 × 628px',
        width: 1200,
        height: 628,
      },
      {
        type: 'social-image',
        label: 'Social - Image',
        dimensions: '1200 × 628px',
        width: 1200,
        height: 628,
      },
      {
        type: 'social-grid-detail',
        label: 'Social - Grid Detail',
        dimensions: '1200 × 628px',
        width: 1200,
        height: 628,
      },
    ],
  },
  {
    id: 'website',
    label: 'Website',
    templates: [
      {
        type: 'website-thumbnail',
        label: 'Website Thumbnail',
        dimensions: '700 × 434px',
        width: 700,
        height: 434,
      },
    ],
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    templates: [
      {
        type: 'newsletter-dark-gradient',
        label: 'Newsletter - Dark Gradient',
        dimensions: '640 × 179px',
        width: 640,
        height: 179,
      },
      {
        type: 'newsletter-blue-gradient',
        label: 'Newsletter - Blue Gradient',
        dimensions: '640 × 179px',
        width: 640,
        height: 179,
      },
      {
        type: 'newsletter-light',
        label: 'Newsletter - Light',
        dimensions: '640 × 179px',
        width: 640,
        height: 179,
      },
    ],
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
