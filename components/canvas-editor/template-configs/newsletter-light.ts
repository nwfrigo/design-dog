import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for newsletter-light.
 *
 * Same shape as newsletter-dark-gradient (640×179, text column + optional
 * image column). No colorStyle — themed via the shared `theme` field
 * (light/dark) instead. Adapter swaps the color SelectorPrimitive for
 * a theme SelectorPrimitive.
 */

type SlotsParams = {
  showEyebrow: boolean
  showHeadline: boolean
  showSubhead: boolean
  showCta: boolean
  setShowEyebrow: (v: boolean) => void
  setShowHeadline: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getNewsletterLightSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'newsletter-light.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'newsletter-light.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'newsletter-light.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'newsletter-light.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 24, min: 14, max: 40, step: 2 } as const
const SUBHEAD_CFG  = { default: 12, min: 10, max: 20, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getNewsletterLightSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'newsletter-light.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'newsletter-light.subhead',
      value: s.subheadFontSize ?? SUBHEAD_CFG.default,
      min: SUBHEAD_CFG.min,
      max: SUBHEAD_CFG.max,
      step: SUBHEAD_CFG.step,
      set: s.setSubheadFontSize,
    },
  ]
}

type ContentsParams = {
  eyebrow: string
  headlineHtml: string
  subheadHtml: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadlineHtml: (v: string) => void
  setSubheadHtml: (v: string) => void
  setCtaText: (v: string) => void
}

export function getNewsletterLightContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'newsletter-light.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'newsletter-light.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'newsletter-light.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'newsletter-light.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
