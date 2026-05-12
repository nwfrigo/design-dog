import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-cority-customer-exchange-banner.
 *
 * Track 2. 640×300 banner with translucent-panel logo + right content
 * block (headline + body + cta, distributed flex-end).
 *
 * Slot inventory: headline · body · cta. Logo is brand-locked.
 */

type SlotsParams = {
  showHeadline: boolean
  showBody: boolean
  showCta: boolean
  setShowHeadline: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getEmailCorityCustomerExchangeBannerSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-cority-customer-exchange-banner.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'email-cority-customer-exchange-banner.body',     label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,     hide: () => s.setShowBody(false),     show: () => s.setShowBody(true) },
    { path: 'email-cority-customer-exchange-banner.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 38, min: 20, max: 60, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailCorityCustomerExchangeBannerSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-cority-customer-exchange-banner.headline',
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

export function getEmailCorityCustomerExchangeBannerContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-cority-customer-exchange-banner.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'email-cority-customer-exchange-banner.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'email-cority-customer-exchange-banner.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
