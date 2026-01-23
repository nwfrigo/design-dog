import type { TemplateType } from '@/types'

export interface TemplateInfo {
  type: TemplateType
  label: string
  description: string
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
        label: 'Email Grid',
        description: 'Email header with grid details',
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
        description: 'Dark gradient background with customizable layout',
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
        description: 'Content download cards, resource thumbnails',
        dimensions: '700 × 434px',
        width: 700,
        height: 434,
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
