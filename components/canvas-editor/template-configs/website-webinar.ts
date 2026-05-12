import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-webinar.
 *
 * Slot inventory: solutionPill · eyebrow · subhead · body · cta.
 * Headline is mandatory. Side column (image or speakers panel) is
 * controlled by the stage-bar `variant` selector — fixed-presence
 * relative to the bench.
 *
 * The `speakers` panel is a single block-level slot; per-speaker
 * editing (name/role/avatar inline) is deferred — mirrors the
 * initial-shipped state of EmailSpeakers.
 */

type SlotsParams = {
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  setShowEyebrow: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
}

export function getWebsiteWebinarSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-webinar.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'website-webinar.eyebrow',      label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,     hide: () => s.setShowEyebrow(false),     show: () => s.setShowEyebrow(true) },
    { path: 'website-webinar.subhead',      label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,     hide: () => s.setShowSubhead(false),     show: () => s.setShowSubhead(true) },
    { path: 'website-webinar.body',         label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,        hide: () => s.setShowBody(false),        show: () => s.setShowBody(true) },
    { path: 'website-webinar.cta',          label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,         hide: () => s.setShowCta(false),         show: () => s.setShowCta(true) },
  ]
}

const HEADLINE_CFG = { default: 35.42, min: 20, max: 60, step: 2 } as const
const SUBHEAD_CFG  = { default: 22,    min: 14, max: 32, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getWebsiteWebinarSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-webinar.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'website-webinar.subhead',
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
  body: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
  setSubhead: (v: string) => void
  setBody: (v: string) => void
  setCtaText: (v: string) => void
}

export function getWebsiteWebinarContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-webinar.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'website-webinar.headline', format: 'plain', value: s.headline, set: s.setHeadline },
    { path: 'website-webinar.subhead',  format: 'plain', value: s.subhead,  set: s.setSubhead },
    { path: 'website-webinar.body',     format: 'plain', value: s.body,     set: s.setBody },
    { path: 'website-webinar.cta',      format: 'plain', value: s.ctaText,  set: s.setCtaText },
  ]
}
