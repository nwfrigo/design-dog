/**
 * Stage & Bench registration for website-floating-banner.
 */

import { WebsiteFloatingBanner } from '@/components/templates/WebsiteFloatingBanner'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteFloatingBannerStageBench } from './WebsiteFloatingBannerStageBench'

export const websiteFloatingBannerRegistration: StageBenchRegistrationData = {
  templateId: 'website-floating-banner',
  Template: WebsiteFloatingBanner,
  Adapter: WebsiteFloatingBannerStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    cta: asset.ctaText || '',
    showEyebrow: asset.showEyebrow,
    variant: asset.floatingBannerVariant || 'dark',
    headlineFontSize: asset.headlineFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 2256,
    height: 100,
    background: null,
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'showEyebrow', parser: 'boolFalse' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'variant', parser: 'enum', default: 'dark' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
    ],
    assembleProps: (parsed, raw) => ({
      cta: (raw.cta as string) || (raw.ctaText as string) || '',
    }),
  },
  exportBuilder: (s) => ({
    variant: s.floatingBannerVariant,
    cta: s.ctaText,
  }),
}
