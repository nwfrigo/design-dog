import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for social-blue-gradient.
 *
 * Structurally identical to social-dark-gradient — same 6 editable
 * blocks, same per-slot continuous size controls. Differences are
 * cosmetic (background imagery, fixed-white logo). No logoColor
 * variant; no stage-bar logo toggle.
 */

type SlotsParams = {
  showEyebrow: boolean
  showHeadline: boolean
  showSubhead: boolean
  showBody: boolean
  showMetadata: boolean
  showCta: boolean
  setShowEyebrow: (v: boolean) => void
  setShowHeadline: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowMetadata: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getSocialBlueGradientSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'social-blue-gradient.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'social-blue-gradient.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'social-blue-gradient.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'social-blue-gradient.body',     label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,     hide: () => s.setShowBody(false),     show: () => s.setShowBody(true) },
    { path: 'social-blue-gradient.metadata', label: 'Metadata', iconKey: 'small-caption', isHidden: !s.showMetadata, hide: () => s.setShowMetadata(false), show: () => s.setShowMetadata(true) },
    { path: 'social-blue-gradient.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

/* Font-size config — same ranges as social-dark-gradient. */
const HEADLINE_CFG = { default: 84, min: 40, max: 140, step: 4 } as const
const SUBHEAD_CFG  = { default: 36, min: 20, max: 48,  step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getSocialBlueGradientSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'social-blue-gradient.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'social-blue-gradient.subhead',
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
  headlineHtml: string
  subheadHtml: string
  bodyHtml: string
  metadata: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadlineHtml: (v: string) => void
  setSubheadHtml: (v: string) => void
  setBodyHtml: (v: string) => void
  setMetadata: (v: string) => void
  setCtaText: (v: string) => void
}

export function getSocialBlueGradientContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'social-blue-gradient.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'social-blue-gradient.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'social-blue-gradient.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'social-blue-gradient.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'social-blue-gradient.metadata', format: 'plain', value: s.metadata,     set: s.setMetadata },
    { path: 'social-blue-gradient.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
