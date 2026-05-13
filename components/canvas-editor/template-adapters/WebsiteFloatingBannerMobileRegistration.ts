/**
 * Stage & Bench registration for website-floating-banner-mobile.
 */

import { WebsiteFloatingBannerMobile } from '@/components/templates/WebsiteFloatingBannerMobile'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteFloatingBannerMobileStageBench } from './WebsiteFloatingBannerMobileStageBench'

export const websiteFloatingBannerMobileRegistration: StageBenchRegistrationData = {
  templateId: 'website-floating-banner-mobile',
  Template: WebsiteFloatingBannerMobile,
  Adapter: WebsiteFloatingBannerMobileStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    cta: asset.ctaText || '',
    showEyebrow: asset.showEyebrow,
    showHeadline: asset.showHeadline !== false,
    showCta: asset.showCta !== false,
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
    showEyebrow: s.showEyebrow,
    showHeadline: s.showHeadline,
    showCta: s.showCta,
  }),
}
