import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-speakers.
 *
 * Slots:
 *  - eyebrow / body / cta — standard text slots
 *  - solutionPill — bench-able as a 'category' chip; toggles via showSolutionSet
 *  - speaker1 / speaker2 / speaker3 — each independently bench-able as
 *    'speaker' chips. Drag-onto-stage = add that speaker; drag-to-bench
 *    = remove it. Speaker count = count of currently-shown speakers.
 *
 * Headline isn't bench-able (mandatory visual element). Logo isn't
 * bench-able (template-controlled).
 */

type SlotsParams = {
  showEyebrow: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  setShowEyebrow: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
  setShowSpeaker1: (v: boolean) => void
  setShowSpeaker2: (v: boolean) => void
  setShowSpeaker3: (v: boolean) => void
}

export function getEmailSpeakersSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-speakers.eyebrow',      label: 'Eyebrow',      iconKey: 'eyebrow',      isHidden: !s.showEyebrow,      hide: () => s.setShowEyebrow(false),      show: () => s.setShowEyebrow(true) },
    { path: 'email-speakers.body',         label: 'Body',         iconKey: 'body',         isHidden: !s.showBody,         hide: () => s.setShowBody(false),         show: () => s.setShowBody(true) },
    { path: 'email-speakers.cta',          label: 'CTA',          iconKey: 'cta',          isHidden: !s.showCta,          hide: () => s.setShowCta(false),          show: () => s.setShowCta(true) },
    { path: 'email-speakers.solutionPill', label: 'Category',     iconKey: 'category',     isHidden: !s.showSolutionSet,  hide: () => s.setShowSolutionSet(false),  show: () => s.setShowSolutionSet(true) },
    { path: 'email-speakers.speaker1',     label: 'Speaker 1',    iconKey: 'speaker',      isHidden: !s.showSpeaker1,     hide: () => s.setShowSpeaker1(false),     show: () => s.setShowSpeaker1(true) },
    { path: 'email-speakers.speaker2',     label: 'Speaker 2',    iconKey: 'speaker',      isHidden: !s.showSpeaker2,     hide: () => s.setShowSpeaker2(false),     show: () => s.setShowSpeaker2(true) },
    { path: 'email-speakers.speaker3',     label: 'Speaker 3',    iconKey: 'speaker',      isHidden: !s.showSpeaker3,     hide: () => s.setShowSpeaker3(false),     show: () => s.setShowSpeaker3(true) },
  ]
}

const HEADLINE_CFG = { default: 38, min: 16, max: 50, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailSpeakersSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-speakers.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
  ]
}

type ContentsParams = {
  eyebrow: string
  headlineHtml: string
  bodyHtml: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadlineHtml: (v: string) => void
  setBodyHtml: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailSpeakersContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-speakers.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'email-speakers.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'email-speakers.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'email-speakers.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
