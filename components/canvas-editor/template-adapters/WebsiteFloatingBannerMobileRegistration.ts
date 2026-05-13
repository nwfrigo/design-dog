/**
 * Stage & Bench registration for website-floating-banner-mobile.
 */

import { WebsiteFloatingBannerMobile } from '@/components/templates/WebsiteFloatingBannerMobile'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const websiteFloatingBannerMobileRegistration: StageBenchRegistrationData = {
  templateId: 'website-floating-banner-mobile',
  Template: WebsiteFloatingBannerMobile,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    cta: asset.ctaText || '',
    showEyebrow: asset.showEyebrow,
    variant: asset.floatingBannerMobileVariant || 'light',
    arrowType: asset.floatingBannerMobileArrowType || 'text',
    headlineFontSize: asset.headlineFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  exportBuilder: (s) => ({
    variant: s.floatingBannerMobileVariant,
    arrowType: s.floatingBannerMobileArrowType,
    cta: s.ctaText,
  }),
}
