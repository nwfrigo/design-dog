import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for newsletter-dark-gradient.
 *
 * 4 editable blocks: eyebrow / headline / subhead / cta. CTA renders as
 * a sibling of the ContentStack at the bottom of the text column (not
 * in the stack list), so it's not part of the spacer-adjustable flow.
 * Eyebrow, headline, subhead participate in ContentStack.
 *
 * Known deferred work: imageSize selector + image editing for the
 * newsletter image (separate from thumbnailImageUrl). Image rendering
 * uses whatever store values exist; users must change image via the
 * legacy sidebar for now.
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

export function getNewsletterDarkGradientSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'newsletter-dark-gradient.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'newsletter-dark-gradient.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'newsletter-dark-gradient.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'newsletter-dark-gradient.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

/* Font-size config — narrow ranges given the 179px canvas; headline
 * defaults to 24, subhead to 12. */
const HEADLINE_CFG = { default: 24, min: 14, max: 40, step: 2 } as const
const SUBHEAD_CFG  = { default: 12, min: 10, max: 20, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getNewsletterDarkGradientSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'newsletter-dark-gradient.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'newsletter-dark-gradient.subhead',
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

export function getNewsletterDarkGradientContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'newsletter-dark-gradient.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'newsletter-dark-gradient.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'newsletter-dark-gradient.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'newsletter-dark-gradient.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
