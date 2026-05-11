import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for social-dark-gradient.
 *
 * Slot inventory (6 editable, logo brand-locked, background = stage bar):
 *   eyebrow · headline · subhead · body · metadata · cta
 *
 * Heading size note: legacy template exposes a `headingSize: S | M | L`
 * preset that scales headline / subhead / body together. Stage & Bench
 * drops the preset from the UI in favor of per-slot continuous A↑/A↓
 * controls on headline + subhead. Body retains the legacy formula
 * (BODY_SIZES[headingSize]) so existing assets render unchanged.
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

export function getSocialDarkGradientSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'social-dark-gradient.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'social-dark-gradient.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'social-dark-gradient.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'social-dark-gradient.body',     label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,     hide: () => s.setShowBody(false),     show: () => s.setShowBody(true) },
    { path: 'social-dark-gradient.metadata', label: 'Metadata', iconKey: 'small-caption', isHidden: !s.showMetadata, hide: () => s.setShowMetadata(false), show: () => s.setShowMetadata(true) },
    { path: 'social-dark-gradient.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

/* Font-size config — values mirror the central legacy tables
 * (EditorScreen.tsx HEADLINE_SIZE_CONFIG / SUBHEAD_SIZE_CONFIG entries
 * for this template). Body has no per-slot control today. */
const HEADLINE_CFG = { default: 84, min: 40, max: 140, step: 4 } as const
const SUBHEAD_CFG  = { default: 36, min: 20, max: 48,  step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getSocialDarkGradientSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'social-dark-gradient.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'social-dark-gradient.subhead',
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

export function getSocialDarkGradientContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'social-dark-gradient.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'social-dark-gradient.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'social-dark-gradient.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'social-dark-gradient.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'social-dark-gradient.metadata', format: 'plain', value: s.metadata,     set: s.setMetadata },
    { path: 'social-dark-gradient.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}
