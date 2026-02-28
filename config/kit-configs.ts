import type { TemplateType } from '@/types'

export type KitType = 'webinar' | 'ebook' | 'live-event' | 'custom'

export interface KitConfig {
  id: KitType
  label: string
  description: string
  icon: 'video' | 'book' | 'calendar' | 'sparkles'
  recommendedAssets: TemplateType[]
  contentPrompts: {
    placeholder: string
    upload: string
    manual: string
  }
}

export const KIT_CONFIGS: Record<KitType, KitConfig> = {
  webinar: {
    id: 'webinar',
    label: 'Webinar',
    description: 'Promote an upcoming webinar or virtual event',
    icon: 'video',
    recommendedAssets: ['email-speakers', 'website-webinar', 'newsletter-dark-gradient', 'social-grid-detail'],
    contentPrompts: {
      placeholder: 'Describe your webinar, paste content, or attach a file...',
      upload: 'Upload your webinar details, agenda, or speaker information',
      manual: 'Describe your webinar topic, speakers, and key takeaways',
    },
  },
  ebook: {
    id: 'ebook',
    label: 'eBook',
    description: 'Promote a downloadable eBook or whitepaper',
    icon: 'book',
    recommendedAssets: ['email-image', 'social-image', 'website-thumbnail', 'newsletter-light'],
    contentPrompts: {
      placeholder: 'Describe your eBook, paste content, or attach a file...',
      upload: 'Upload your eBook PDF or content outline',
      manual: 'Describe the eBook topic, key insights, and target audience',
    },
  },
  'live-event': {
    id: 'live-event',
    label: 'Live Event',
    description: 'Promote an in-person conference or event',
    icon: 'calendar',
    recommendedAssets: ['email-grid', 'website-event-listing', 'website-floating-banner', 'website-floating-banner-mobile', 'social-image'],
    contentPrompts: {
      placeholder: 'Describe your event, paste content, or attach a file...',
      upload: 'Upload event details, schedule, or speaker bios',
      manual: 'Describe the event, location, agenda, and speakers',
    },
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    description: 'Start from scratch and pick your own assets',
    icon: 'sparkles',
    recommendedAssets: [],
    contentPrompts: {
      placeholder: 'Describe what you need, paste content, or attach a file...',
      upload: 'Upload any relevant materials or content',
      manual: 'Describe what you want to create',
    },
  },
}

export const KIT_LIST = Object.values(KIT_CONFIGS)
