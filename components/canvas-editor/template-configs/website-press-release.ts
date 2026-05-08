import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-press-release.
 *
 * Slots:
 *  - eyebrow / subhead / body / cta — standard text slots
 *  - solutionPill — bench-able as a 'category' chip
 *
 * Headline isn't bench-able (mandatory). Featured image stays on stage
 * always — selection surfaces the EditbarImage toolbar instead of being
 * draggable to the bench. Logo is template-controlled.
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

export function getWebsitePressReleaseSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-press-release.eyebrow',      label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,     hide: () => s.setShowEyebrow(false),     show: () => s.setShowEyebrow(true) },
    { path: 'website-press-release.subhead',      label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,     hide: () => s.setShowSubhead(false),     show: () => s.setShowSubhead(true) },
    { path: 'website-press-release.body',         label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,        hide: () => s.setShowBody(false),        show: () => s.setShowBody(true) },
    { path: 'website-press-release.cta',          label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,         hide: () => s.setShowCta(false),         show: () => s.setShowCta(true) },
    { path: 'website-press-release.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
  ]
}

const HEADLINE_CFG = { default: 35, min: 16, max: 50, step: 2 } as const
const SUBHEAD_CFG  = { default: 22, min: 12, max: 36, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getWebsitePressReleaseSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-press-release.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'website-press-release.subhead',
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

export function getWebsitePressReleaseContents(s: ContentsParams): SlotContent[] {
  // Press release uses plain text throughout (no rich formatting in
  // current template render).
  return [
    { path: 'website-press-release.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'website-press-release.headline', format: 'plain', value: s.headline, set: s.setHeadline },
    { path: 'website-press-release.subhead',  format: 'plain', value: s.subhead,  set: s.setSubhead },
    { path: 'website-press-release.body',     format: 'plain', value: s.body,     set: s.setBody },
    { path: 'website-press-release.cta',      format: 'plain', value: s.ctaText,  set: s.setCtaText },
  ]
}
