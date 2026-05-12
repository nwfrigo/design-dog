import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for social-ehs-accelerate.
 *
 * Smallest social slot inventory:
 *   headline · subhead · cta
 *
 * No eyebrow, no body, no metadata. Logo lockup is brand-locked (baked-in
 * cority + EHS+ ACCELERATE + workshop label) — not in any registry.
 * Background is baked into the asset — no color/theme selector.
 */

type SlotsParams = {
  showHeadline: boolean
  showSubhead: boolean
  showCta: boolean
  setShowHeadline: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getSocialEhsAccelerateSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'social-ehs-accelerate.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'social-ehs-accelerate.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'social-ehs-accelerate.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 84, min: 40, max: 140, step: 4 } as const
const SUBHEAD_CFG  = { default: 36, min: 20, max: 48,  step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getSocialEhsAccelerateSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'social-ehs-accelerate.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'social-ehs-accelerate.subhead',
      value: s.subheadFontSize ?? SUBHEAD_CFG.default,
      min: SUBHEAD_CFG.min,
      max: SUBHEAD_CFG.max,
      step: SUBHEAD_CFG.step,
      set: s.setSubheadFontSize,
    },
  ]
}

type ContentsParams = {
  headlineHtml: string
  subheadHtml: string
  ctaText: string
  setHeadlineHtml: (v: string) => void
  setSubheadHtml: (v: string) => void
  setCtaText: (v: string) => void
}

export function getSocialEhsAccelerateContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'social-ehs-accelerate.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'social-ehs-accelerate.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'social-ehs-accelerate.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
