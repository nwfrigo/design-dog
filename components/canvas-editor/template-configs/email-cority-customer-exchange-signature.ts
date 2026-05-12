import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-cority-customer-exchange-signature.
 *
 * Track 2. 400×100 signature. Slot inventory:
 *   eventDate · eventLocation · eventTime · cta.
 * Logo lockup is brand-locked on the left. No font-size controls
 * (all sizes fixed by design).
 */

type SlotsParams = {
  showEventDate: boolean
  showEventLocation: boolean
  showEventTime: boolean
  showCta: boolean
  setShowEventDate: (v: boolean) => void
  setShowEventLocation: (v: boolean) => void
  setShowEventTime: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getEmailCorityCustomerExchangeSignatureSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-cority-customer-exchange-signature.eventDate',     label: 'Date',     iconKey: 'small-caption', isHidden: !s.showEventDate,     hide: () => s.setShowEventDate(false),     show: () => s.setShowEventDate(true) },
    { path: 'email-cority-customer-exchange-signature.eventLocation', label: 'Location', iconKey: 'small-caption', isHidden: !s.showEventLocation, hide: () => s.setShowEventLocation(false), show: () => s.setShowEventLocation(true) },
    { path: 'email-cority-customer-exchange-signature.eventTime',     label: 'Time',     iconKey: 'small-caption', isHidden: !s.showEventTime,     hide: () => s.setShowEventTime(false),     show: () => s.setShowEventTime(true) },
    { path: 'email-cority-customer-exchange-signature.cta',           label: 'CTA',      iconKey: 'cta',           isHidden: !s.showCta,           hide: () => s.setShowCta(false),           show: () => s.setShowCta(true) },
  ]
}

type ContentsParams = {
  eventDate: string
  eventLocation: string
  eventTime: string
  ctaText: string
  setEventDate: (v: string) => void
  setEventLocation: (v: string) => void
  setEventTime: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailCorityCustomerExchangeSignatureContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-cority-customer-exchange-signature.eventDate',     format: 'plain', value: s.eventDate,     set: s.setEventDate },
    { path: 'email-cority-customer-exchange-signature.eventLocation', format: 'plain', value: s.eventLocation, set: s.setEventLocation },
    { path: 'email-cority-customer-exchange-signature.eventTime',     format: 'plain', value: s.eventTime,     set: s.setEventTime },
    { path: 'email-cority-customer-exchange-signature.cta',           format: 'plain', value: s.ctaText,       set: s.setCtaText },
  ]
}
