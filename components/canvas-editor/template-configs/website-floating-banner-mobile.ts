import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-floating-banner-mobile.
 *
 * Track 2 (fixed-composition). 580×80 horizontal strip.
 * Slot inventory: eyebrow · headline · cta.
 */

type SlotsParams = {
  showEyebrow: boolean
  showHeadline: boolean
  showCta: boolean
  setShowEyebrow: (v: boolean) => void
  setShowHeadline: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getWebsiteFloatingBannerMobileSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-floating-banner-mobile.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'website-floating-banner-mobile.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'website-floating-banner-mobile.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 14, min: 10, max: 24, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getWebsiteFloatingBannerMobileSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-floating-banner-mobile.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
  ]
}

type ContentsParams = {
  eyebrow: string
  headline: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
  setCtaText: (v: string) => void
}

export function getWebsiteFloatingBannerMobileContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-floating-banner-mobile.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'website-floating-banner-mobile.headline', format: 'plain', value: s.headline, set: s.setHeadline },
    { path: 'website-floating-banner-mobile.cta',      format: 'plain', value: s.ctaText,  set: s.setCtaText },
  ]
}
