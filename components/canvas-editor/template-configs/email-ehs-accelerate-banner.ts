import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-ehs-accelerate-banner.
 *
 * Track 2 (fixed-composition) 600×373 banner. Only `body` is
 * visibility-toggleable in the design — logo, headline, event-detail
 * row fields, and CTA are always present. So the bench surfaces a
 * single `body` chip; everything else is fixed-presence.
 */

type SlotsParams = {
  showBody: boolean
  setShowBody: (v: boolean) => void
}

export function getEmailEhsAccelerateBannerSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-ehs-accelerate-banner.body', label: 'Body', iconKey: 'body', isHidden: !s.showBody, hide: () => s.setShowBody(false), show: () => s.setShowBody(true) },
  ]
}

const HEADLINE_CFG = { default: 63.6, min: 32, max: 96, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailEhsAccelerateBannerSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-ehs-accelerate-banner.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
  ]
}

type ContentsParams = {
  headline: string
  body: string
  eventDate: string
  eventLocation: string
  ctaText: string
  setHeadline: (v: string) => void
  setBody: (v: string) => void
  setEventDate: (v: string) => void
  setEventLocation: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailEhsAccelerateBannerContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-ehs-accelerate-banner.headline',      format: 'plain', value: s.headline,      set: s.setHeadline },
    { path: 'email-ehs-accelerate-banner.body',          format: 'plain', value: s.body,          set: s.setBody },
    { path: 'email-ehs-accelerate-banner.eventDate',     format: 'plain', value: s.eventDate,     set: s.setEventDate },
    { path: 'email-ehs-accelerate-banner.eventLocation', format: 'plain', value: s.eventLocation, set: s.setEventLocation },
    { path: 'email-ehs-accelerate-banner.cta',           format: 'plain', value: s.ctaText,       set: s.setCtaText },
  ]
}
