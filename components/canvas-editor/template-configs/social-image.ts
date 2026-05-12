import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for social-image.
 *
 * Slot inventory: solutionPill · headline · subhead · metadata · cta.
 * Logo is brand-locked topAnchor (not in registries). Image is fixed-
 * presence (selection opens ImageEditorModal — not in visibility
 * registry either).
 *
 * Headline is mandatory (not bench-able). Solution pill is a category
 * slot driven via CategoryRegistry at the adapter level.
 */

type SlotsParams = {
  showSubhead: boolean
  showMetadata: boolean
  showCta: boolean
  showSolutionSet: boolean
  setShowSubhead: (v: boolean) => void
  setShowMetadata: (v: boolean) => void
  setShowCta: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
}

export function getSocialImageSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'social-image.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'social-image.subhead',      label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,     hide: () => s.setShowSubhead(false),     show: () => s.setShowSubhead(true) },
    { path: 'social-image.metadata',     label: 'Metadata', iconKey: 'small-caption', isHidden: !s.showMetadata, hide: () => s.setShowMetadata(false), show: () => s.setShowMetadata(true) },
    { path: 'social-image.cta',          label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,         hide: () => s.setShowCta(false),         show: () => s.setShowCta(true) },
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

export function getSocialImageSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'social-image.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'social-image.subhead',
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
  metadata: string
  ctaText: string
  setHeadlineHtml: (v: string) => void
  setSubheadHtml: (v: string) => void
  setMetadata: (v: string) => void
  setCtaText: (v: string) => void
}

export function getSocialImageContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'social-image.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'social-image.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'social-image.metadata', format: 'plain', value: s.metadata,     set: s.setMetadata },
    { path: 'social-image.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
