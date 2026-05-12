import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for newsletter-blue-gradient.
 *
 * Structural twin of newsletter-dark-gradient (640×179, text column +
 * optional image column, eyebrow / headline / subhead / cta editable).
 * Same slot layout, same size ranges; differs only in background imagery
 * (handled by the template itself).
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

export function getNewsletterBlueGradientSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'newsletter-blue-gradient.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'newsletter-blue-gradient.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'newsletter-blue-gradient.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'newsletter-blue-gradient.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
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

export function getNewsletterBlueGradientSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'newsletter-blue-gradient.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'newsletter-blue-gradient.subhead',
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

export function getNewsletterBlueGradientContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'newsletter-blue-gradient.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'newsletter-blue-gradient.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'newsletter-blue-gradient.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'newsletter-blue-gradient.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
