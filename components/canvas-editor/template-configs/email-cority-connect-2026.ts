import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-cority-connect-2026.
 *
 * Track 2 (fixed-composition): no stack alignment, no per-gap spacing.
 * Slot inventory: headline · body · cta. Logo is brand-locked (mode
 * derived from backgroundVariant). Background is selected via the
 * stage bar's enum primitive.
 */

type SlotsParams = {
  showHeadline: boolean
  showBody: boolean
  showCta: boolean
  setShowHeadline: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getEmailCorityConnect2026Slots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-cority-connect-2026.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'email-cority-connect-2026.body',     label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,     hide: () => s.setShowBody(false),     show: () => s.setShowBody(true) },
    { path: 'email-cority-connect-2026.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 38.15, min: 20, max: 60, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailCorityConnect2026Sizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-cority-connect-2026.headline',
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

export function getEmailCorityConnect2026Contents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-cority-connect-2026.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'email-cority-connect-2026.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'email-cority-connect-2026.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
