import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-ehs-accelerate-signature.
 *
 * Track 2 signature row (400×100). 4 editable text targets:
 * eventDate, eventLocation, workshopName, cta. eventDate +
 * eventLocation share a single visibility flag (`showEventDetails`)
 * — they live in a tight 2-line block top-right and toggle together,
 * but remain independently selectable for content editing.
 */

type SlotsParams = {
  showEventDetails: boolean
  showWorkshopName: boolean
  showCta: boolean
  setShowEventDetails: (v: boolean) => void
  setShowWorkshopName: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getEmailEhsAccelerateSignatureSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-ehs-accelerate-signature.eventDetails', label: 'Event Details', iconKey: 'small-caption', isHidden: !s.showEventDetails, hide: () => s.setShowEventDetails(false), show: () => s.setShowEventDetails(true) },
    { path: 'email-ehs-accelerate-signature.workshopName', label: 'Workshop',      iconKey: 'subhead',       isHidden: !s.showWorkshopName, hide: () => s.setShowWorkshopName(false), show: () => s.setShowWorkshopName(true) },
    { path: 'email-ehs-accelerate-signature.cta',          label: 'CTA',           iconKey: 'cta',           isHidden: !s.showCta,          hide: () => s.setShowCta(false),          show: () => s.setShowCta(true) },
  ]
}

type ContentsParams = {
  eventDate: string
  eventLocation: string
  workshopName: string
  ctaText: string
  setEventDate: (v: string) => void
  setEventLocation: (v: string) => void
  setWorkshopName: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailEhsAccelerateSignatureContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-ehs-accelerate-signature.eventDate',     format: 'plain', value: s.eventDate,     set: s.setEventDate },
    { path: 'email-ehs-accelerate-signature.eventLocation', format: 'plain', value: s.eventLocation, set: s.setEventLocation },
    { path: 'email-ehs-accelerate-signature.workshopName',  format: 'plain', value: s.workshopName,  set: s.setWorkshopName },
    { path: 'email-ehs-accelerate-signature.cta',           format: 'plain', value: s.ctaText,       set: s.setCtaText },
  ]
}
