/**
 * Stage & Bench registration for newsletter-top-banner.
 */

import { NewsletterTopBanner } from '@/components/templates/NewsletterTopBanner'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { NewsletterTopBannerStageBench } from './NewsletterTopBannerStageBench'

export const newsletterTopBannerRegistration: StageBenchRegistrationData = {
  templateId: 'newsletter-top-banner',
  Template: NewsletterTopBanner,
  Adapter: NewsletterTopBannerStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    subhead: asset.subhead || '',
    variant: asset.newsletterTopBannerVariant || 'dark',
    showHeadline: asset.showHeadline,
    showSubhead: asset.showSubhead && !!asset.subhead,
    subheadFontSize: asset.subheadFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 600,
    height: 240,
    background: null,
    dynamicBackground: (p) => p.variant === 'dark' ? '#060015' : '#FFFFFF',
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'variant', parser: 'enum', default: 'dark' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showSubhead', parser: 'boolFalse' },
      { param: 'subheadFontSize', parser: 'numberOrUndefined' },
    ],
  },
  exportBuilder: (s) => ({
    variant: s.newsletterTopBannerVariant,
    showHeadline: s.showHeadline,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    subheadFontSize: s.subheadFontSize ?? undefined,
  }),
}
