import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-thumbnail.
 *
 * Slot inventory: solutionPill · eyebrow · subhead · cta. Headline is
 * mandatory. Logo is brand-locked topAnchor. Image is fixed-presence
 * (selection opens ImageEditorModal — visibility is controlled by the
 * stage-bar `variant` toggle, not by the bench).
 */

type SlotsParams = {
  showEyebrow: boolean
  showSubhead: boolean
  showCta: boolean
  showSolutionSet: boolean
  setShowEyebrow: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowCta: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
}

export function getWebsiteThumbnailSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-thumbnail.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'website-thumbnail.eyebrow',      label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,     hide: () => s.setShowEyebrow(false),     show: () => s.setShowEyebrow(true) },
    { path: 'website-thumbnail.subhead',      label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,     hide: () => s.setShowSubhead(false),     show: () => s.setShowSubhead(true) },
    { path: 'website-thumbnail.cta',          label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,         hide: () => s.setShowCta(false),         show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 35, min: 20, max: 60, step: 2 } as const
const SUBHEAD_CFG  = { default: 20, min: 14, max: 32, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getWebsiteThumbnailSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-thumbnail.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'website-thumbnail.subhead',
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
  headline: string
  subhead: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
  setSubhead: (v: string) => void
  setCtaText: (v: string) => void
}

export function getWebsiteThumbnailContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-thumbnail.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'website-thumbnail.headline', format: 'plain', value: s.headline, set: s.setHeadline },
    { path: 'website-thumbnail.subhead',  format: 'plain', value: s.subhead,  set: s.setSubhead },
    { path: 'website-thumbnail.cta',      format: 'plain', value: s.ctaText,  set: s.setCtaText },
  ]
}
