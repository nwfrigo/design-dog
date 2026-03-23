import type { QueuedAsset, TemplateType } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { stripHtml } from '@/components/SimpleRichTextEditor'

// Import all template components
import { WebsiteThumbnail } from '@/components/templates/WebsiteThumbnail'
import { WebsitePressRelease } from '@/components/templates/WebsitePressRelease'
import { WebsiteWebinar } from '@/components/templates/WebsiteWebinar'
import { WebsiteReport } from '@/components/templates/WebsiteReport'
import { WebsiteEventListing } from '@/components/templates/WebsiteEventListing'
import { CustomerLibrary } from '@/components/templates/CustomerLibrary'
import { WebsiteFloatingBanner } from '@/components/templates/WebsiteFloatingBanner'
import { WebsiteFloatingBannerMobile } from '@/components/templates/WebsiteFloatingBannerMobile'
import { EmailGrid, type GridDetail } from '@/components/templates/EmailGrid'
import { EmailImage } from '@/components/templates/EmailImage'
import { EmailProductRelease } from '@/components/templates/EmailProductRelease'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import { SocialBlueGradient } from '@/components/templates/SocialBlueGradient'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialImageMeddbase } from '@/components/templates/SocialImageMeddbase'
import { SocialGridDetail, type GridDetailRow } from '@/components/templates/SocialGridDetail'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { NewsletterDarkGradient } from '@/components/templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from '@/components/templates/NewsletterBlueGradient'
import { NewsletterLight } from '@/components/templates/NewsletterLight'
import { NewsletterTopBanner } from '@/components/templates/NewsletterTopBanner'

interface QueueTextField {
  key: string
  label: string
  showKey?: string
  isHtml?: boolean
}

interface TemplateRegistryEntry {
  component: React.ComponentType<any> // Each template has unique props — typed via renderProps
  renderProps: (asset: QueuedAsset, colors: ColorsConfig, typography: TypographyConfig) => Record<string, unknown>
  queueTextFields: QueueTextField[]
}

export const TEMPLATE_REGISTRY: Partial<Record<TemplateType, TemplateRegistryEntry>> = {
  'website-thumbnail': {
    component: WebsiteThumbnail,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.ebookVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-press-release': {
    component: WebsitePressRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-webinar': {
    component: WebsiteWebinar,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Webinar',
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.webinarVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      speakerCount: asset.speakerCount,
      speaker1: { name: asset.speaker1Name, role: asset.speaker1Role, imageUrl: asset.speaker1ImageUrl, imagePosition: asset.speaker1ImagePosition, imageZoom: asset.speaker1ImageZoom },
      speaker2: { name: asset.speaker2Name, role: asset.speaker2Role, imageUrl: asset.speaker2ImageUrl, imagePosition: asset.speaker2ImagePosition, imageZoom: asset.speaker2ImageZoom },
      speaker3: { name: asset.speaker3Name, role: asset.speaker3Role, imageUrl: asset.speaker3ImageUrl, imagePosition: asset.speaker3ImagePosition, imageZoom: asset.speaker3ImageZoom },
      showSpeaker1: asset.showSpeaker1,
      showSpeaker2: asset.showSpeaker2,
      showSpeaker3: asset.showSpeaker3,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'email-grid': {
    component: EmailGrid,
    renderProps: (asset, colors, typography) => {
      const gridDetail1: GridDetail = { type: 'data', text: asset.gridDetail1Text }
      const gridDetail2: GridDetail = { type: 'data', text: asset.gridDetail2Text }
      const gridDetail3: GridDetail = { type: asset.gridDetail3Type, text: asset.gridDetail3Text }
      return {
        headline: asset.headline || 'Headline',
        body: asset.body,
        eyebrow: asset.eyebrow,
        subheading: asset.subheading,
        showEyebrow: asset.showEyebrow,
        showLightHeader: asset.showLightHeader,
        showHeavyHeader: false,
        showSubheading: asset.showSubheading,
        showBody: asset.showBody,
        showSolutionSet: asset.showSolutionSet,
        solution: asset.solution,
        logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
        showGridDetail2: asset.showGridDetail2,
        gridDetail1, gridDetail2, gridDetail3,
        headlineFontSize: asset.headlineFontSize ?? undefined,
        colors, typography, scale: 1,
      }
    },
    queueTextFields: [
      { key: 'gridDetail1Text', label: 'Detail 1' },
      { key: 'gridDetail2Text', label: 'Detail 2', showKey: 'showGridDetail2' },
      { key: 'gridDetail3Text', label: 'Detail 3' },
    ],
  },

  'email-image': {
    component: EmailImage,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
  },

  'email-product-release': {
    component: EmailProductRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Product Release',
      headline: asset.headline || 'GX2 2026.1',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'social-dark-gradient': {
    component: SocialDarkGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      body: asset.body,
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      logoColor: asset.logoColor === 'black' ? 'white' : asset.logoColor,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
  },

  'social-blue-gradient': {
    component: SocialBlueGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      body: asset.body,
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
  },

  'social-image': {
    component: SocialImage,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      metadata: asset.metadata || 'Day / Month | 00:00',
      ctaText: asset.ctaText || 'Learn More',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showMetadata: asset.showMetadata !== false,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
  },

  'social-image-meddbase': {
    component: SocialImageMeddbase,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      metadata: asset.metadata || 'Day / Month | 00:00',
      ctaText: asset.ctaText || 'Learn More',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showMetadata: asset.showMetadata !== false,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
  },

  'social-grid-detail': {
    component: SocialGridDetail,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || 'This is your subheader or description text.',
      eyebrow: asset.eyebrow || "Don't miss this.",
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showSolutionSet: asset.showSolutionSet !== false,
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showRow3: asset.showRow3 !== false,
      showRow4: asset.showRow4 !== false,
      gridDetail1: { type: 'data' as const, text: asset.gridDetail1Text || 'Date: January 1st, 2026' },
      gridDetail2: { type: 'data' as const, text: asset.gridDetail2Text || 'Time: Midnight, EST' },
      gridDetail3: { type: (asset.gridDetail3Type || 'data') as GridDetailRow['type'], text: asset.gridDetail3Text || 'Place: Wherever' },
      gridDetail4: { type: (asset.gridDetail4Type || 'cta') as GridDetailRow['type'], text: asset.gridDetail4Text || 'Join the event' },
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'gridDetail1Text', label: 'Row 1' },
      { key: 'gridDetail2Text', label: 'Row 2' },
      { key: 'gridDetail3Text', label: 'Row 3', showKey: 'showRow3' },
      { key: 'gridDetail4Text', label: 'Row 4', showKey: 'showRow4' },
    ],
  },

  'email-dark-gradient': {
    component: EmailDarkGradient,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      eyebrow: asset.eyebrow,
      subhead: asset.subhead,
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      alignment: asset.alignment || 'left',
      ctaStyle: asset.ctaStyle || 'link',
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      bottomSpacing: (asset.showCta !== false) ? 0 : (asset.bottomSpacing ?? 0),
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'email-speakers': {
    component: EmailSpeakers,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      eyebrow: asset.eyebrow,
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      speakerCount: asset.speakerCount || 3,
      speaker1: { name: asset.speaker1Name || 'Firstname Lastname', role: asset.speaker1Role || 'Role, Company', imageUrl: asset.speaker1ImageUrl || '', imagePosition: asset.speaker1ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker1ImageZoom || 1 },
      speaker2: { name: asset.speaker2Name || 'Firstname Lastname', role: asset.speaker2Role || 'Role, Company', imageUrl: asset.speaker2ImageUrl || '', imagePosition: asset.speaker2ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker2ImageZoom || 1 },
      speaker3: { name: asset.speaker3Name || 'Firstname Lastname', role: asset.speaker3Role || 'Role, Company', imageUrl: asset.speaker3ImageUrl || '', imagePosition: asset.speaker3ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker3ImageZoom || 1 },
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'newsletter-dark-gradient': {
    component: NewsletterDarkGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'newsletter-blue-gradient': {
    component: NewsletterBlueGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'newsletter-light': {
    component: NewsletterLight,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'newsletter-top-banner': {
    component: NewsletterTopBanner,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Month | Year',
      headline: asset.headline || 'EHS+ Newsletter',
      subhead: asset.subhead || '',
      variant: asset.newsletterTopBannerVariant || 'dark',
      showSubhead: asset.showSubhead && !!asset.subhead,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-report': {
    component: WebsiteReport,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'REPORT',
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.reportVariant,
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_report.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-event-listing': {
    component: WebsiteEventListing,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'LIVE EVENT',
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      variant: asset.eventListingVariant,
      gridDetail1Text: asset.gridDetail1Text || 'Add Details or Hide Me',
      gridDetail2Text: asset.gridDetail2Text || 'Add Details or Hide Me',
      gridDetail3Text: asset.gridDetail3Text || 'Add Details or Hide Me',
      gridDetail4Text: asset.gridDetail4Text || 'Add Details or Hide Me',
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'customer-library': {
    component: CustomerLibrary,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Chemical Library',
      eyebrow: asset.eyebrow || 'Chemical Safety Data Sheet Library',
      body: asset.body || 'Lorem ipsum',
      footerText: asset.subhead || 'Lorem ipsum',
      variant: asset.customerLibraryVariant || 'dark',
      qrCodeUrl: asset.thumbnailImageUrl || undefined,
      showHeadline: asset.showHeadline,
      showEyebrow: asset.showEyebrow,
      showBody: asset.showBody && !!asset.body,
      showFooterText: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-floating-banner': {
    component: WebsiteFloatingBanner,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'EYEBROW',
      headline: asset.headline || 'Headline',
      cta: asset.ctaText || 'Learn More',
      showEyebrow: asset.showEyebrow,
      variant: asset.floatingBannerVariant || 'dark',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },

  'website-floating-banner-mobile': {
    component: WebsiteFloatingBannerMobile,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'EYEBROW',
      headline: asset.headline || 'Headline',
      cta: asset.ctaText || 'Learn More',
      showEyebrow: asset.showEyebrow,
      variant: asset.floatingBannerMobileVariant || 'light',
      arrowType: asset.floatingBannerMobileArrowType || 'text',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },
}

export function getQueueTextFields(asset: QueuedAsset): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = []

  // Shared fields
  if (asset.eyebrow && asset.showEyebrow) fields.push({ label: 'Eyebrow', value: asset.eyebrow })
  if (asset.headline) fields.push({ label: 'Headline', value: stripHtml(asset.headline) })
  if (asset.subhead && asset.showSubhead) fields.push({ label: 'Subhead', value: stripHtml(asset.subhead) })
  if (asset.subheading && asset.showSubheading) fields.push({ label: 'Subheading', value: asset.subheading })
  if (asset.body && asset.showBody) fields.push({ label: 'Body', value: stripHtml(asset.body) })

  // Template-specific fields from registry
  const entry = TEMPLATE_REGISTRY[asset.templateType]
  if (entry) {
    for (const tf of entry.queueTextFields) {
      const value = (asset as unknown as Record<string, unknown>)[tf.key] as string | undefined
      if (!value) continue
      if (tf.showKey) {
        const show = (asset as unknown as Record<string, unknown>)[tf.showKey]
        if (show === false) continue
      }
      fields.push({ label: tf.label, value: tf.isHtml ? stripHtml(value) : value })
    }
  }

  return fields
}
