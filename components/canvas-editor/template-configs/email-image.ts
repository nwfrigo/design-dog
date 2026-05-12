import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-image.
 *
 * Slot inventory: solutionPill · body · cta. Headline is mandatory.
 * Logo is brand-locked topAnchor. Image is fixed-presence (selection
 * opens ImageEditorModal — not in visibility registry).
 *
 * Body has no per-slot font size in this template (fixed 18.07px in
 * the render). Only headline has an A↑/A↓ control.
 */

type SlotsParams = {
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
}

export function getEmailImageSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-image.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'email-image.body',         label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,        hide: () => s.setShowBody(false),        show: () => s.setShowBody(true) },
    { path: 'email-image.cta',          label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,         hide: () => s.setShowCta(false),         show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 38.15, min: 20, max: 60, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailImageSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-image.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
  ]
}

type ContentsParams = {
  headlineHtml: string
  bodyHtml: string
  ctaText: string
  setHeadlineHtml: (v: string) => void
  setBodyHtml: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailImageContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-image.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'email-image.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'email-image.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
