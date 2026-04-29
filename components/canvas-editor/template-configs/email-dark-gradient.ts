import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'
import type { SlotLineHeight } from '../LineHeightRegistry'
import { EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS } from '@/components/templates/EmailDarkGradient'

/**
 * Stage & Bench config for email-dark-gradient.
 *
 * Single source of truth for which slots this template surfaces, what kind
 * each slot is, and how visibility hooks into the store. The Bench reads this
 * (via VisibilityRegistry) to show/hide chips; the toolbar's eye-off button
 * reads this to know how to hide the selected slot.
 *
 * Phase 3 will add `stageBarControls` to declare which canvas-wide controls
 * appear in the Stage Bar for this template.
 */

type SlotsParams = {
  showEyebrow: boolean
  showHeadline: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  setShowEyebrow: (v: boolean) => void
  setShowHeadline: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowCta: (v: boolean) => void
}

export function getEmailDarkGradientSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-dark-gradient.eyebrow',  label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,  hide: () => s.setShowEyebrow(false),  show: () => s.setShowEyebrow(true) },
    { path: 'email-dark-gradient.headline', label: 'Headline', iconKey: 'headline', isHidden: !s.showHeadline, hide: () => s.setShowHeadline(false), show: () => s.setShowHeadline(true) },
    { path: 'email-dark-gradient.subhead',  label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,  hide: () => s.setShowSubhead(false),  show: () => s.setShowSubhead(true) },
    { path: 'email-dark-gradient.body',     label: 'Body',     iconKey: 'body',     isHidden: !s.showBody,     hide: () => s.setShowBody(false),     show: () => s.setShowBody(true) },
    { path: 'email-dark-gradient.cta',      label: 'CTA',      iconKey: 'cta',      isHidden: !s.showCta,      hide: () => s.setShowCta(false),      show: () => s.setShowCta(true) },
  ]
}

/* Font-size config — values pulled from EditorScreen's central tables.
 * As more templates migrate, their entries leave the central tables; once
 * empty, those tables can be deleted. */
const HEADLINE_CFG = { default: 38, min: 16, max: 50, step: 2 } as const
const SUBHEAD_CFG  = { default: 24, min: 12, max: 36, step: 1 } as const

type SizesParams = {
  headlineFontSize: number | null
  subheadFontSize: number | null
  setHeadlineFontSize: (v: number) => void
  setSubheadFontSize: (v: number) => void
}

export function getEmailDarkGradientSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-dark-gradient.headline',
      value: s.headlineFontSize ?? HEADLINE_CFG.default,
      min: HEADLINE_CFG.min,
      max: HEADLINE_CFG.max,
      step: HEADLINE_CFG.step,
      set: s.setHeadlineFontSize,
    },
    {
      path: 'email-dark-gradient.subhead',
      value: s.subheadFontSize ?? SUBHEAD_CFG.default,
      min: SUBHEAD_CFG.min,
      max: SUBHEAD_CFG.max,
      step: SUBHEAD_CFG.step,
      set: s.setSubheadFontSize,
    },
    // Body and Eyebrow have no per-slot font-size control on this template.
  ]
}

type ContentsParams = {
  eyebrow: string
  headlineHtml: string
  subheadHtml: string
  bodyHtml: string
  ctaText: string
  setEyebrow: (v: string) => void
  setHeadlineHtml: (v: string) => void
  setSubheadHtml: (v: string) => void
  setBodyHtml: (v: string) => void
  setCtaText: (v: string) => void
}

export function getEmailDarkGradientContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-dark-gradient.eyebrow',  format: 'plain', value: s.eyebrow,      set: s.setEyebrow },
    { path: 'email-dark-gradient.headline', format: 'html',  value: s.headlineHtml, set: s.setHeadlineHtml },
    { path: 'email-dark-gradient.subhead',  format: 'html',  value: s.subheadHtml,  set: s.setSubheadHtml },
    { path: 'email-dark-gradient.body',     format: 'html',  value: s.bodyHtml,     set: s.setBodyHtml },
    { path: 'email-dark-gradient.cta',      format: 'plain', value: s.ctaText,      set: s.setCtaText },
  ]
}

/* Line-height range applies uniformly to every slot. Bounds chosen for typography
 * — 0.8 is tight (ALL CAPS posters), 2.5 is airy (large body callouts). */
const LINE_HEIGHT_RANGE = { min: 0.8, max: 2.5, step: 0.05 } as const

type LineHeightsParams = {
  lineHeights: Record<string, number>
  setLineHeight: (contentKey: string, value: number) => void
}

export function getEmailDarkGradientLineHeights(s: LineHeightsParams): SlotLineHeight[] {
  const make = (slotKey: 'headline' | 'subhead' | 'body'): SlotLineHeight => ({
    path: `email-dark-gradient.${slotKey}`,
    value: s.lineHeights[slotKey] ?? EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS[slotKey],
    min: LINE_HEIGHT_RANGE.min,
    max: LINE_HEIGHT_RANGE.max,
    step: LINE_HEIGHT_RANGE.step,
    set: (v) => s.setLineHeight(slotKey, v),
  })
  return [make('headline'), make('subhead'), make('body')]
}
