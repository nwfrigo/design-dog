import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-floating-banner.
 *
 * Track 2 (fixed-composition). 2256×100 horizontal strip.
 * Slot inventory: eyebrow · headline · cta. Logo is brand-locked
 * (colored per variant; not editable).
 */

type SlotsParams = {
  showEyebrow: boolean
  showHeadline: boolean
  showCta: boolean
  setShowEyebrow: (v: boolean) => void
  setShowHeadline: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getWebsiteFloatingBannerSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-floating-banner.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'website-floating-banner.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'website-floating-banner.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 32.73, min: 20, max: 48, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getWebsiteFloatingBannerSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-floating-banner.headline',
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

export function getWebsiteFloatingBannerContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-floating-banner.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'website-floating-banner.headline', format: 'plain', value: s.headline, set: s.setHeadline },
    { path: 'website-floating-banner.cta',      format: 'plain', value: s.ctaText,  set: s.setCtaText },
  ]
}
