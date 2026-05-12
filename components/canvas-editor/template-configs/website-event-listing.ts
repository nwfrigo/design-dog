import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-event-listing.
 *
 * Track 1 left column (ContentStack: eyebrow / headline / subhead) +
 * Track-2-style right grid panel where each row is independently
 * editable. Row 1 + Row 4 (CTA) always visible; Rows 2/3 toggleable
 * via `showRow3` / `showRow4` (legacy off-by-one naming inherited
 * from social-grid-detail).
 */

type SlotsParams = {
  showEyebrow: boolean
  showSubhead: boolean
  showRow3: boolean
  showRow4: boolean
  setShowEyebrow: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowRow3: (v: boolean) => void
  setShowRow4: (v: boolean) => void
}

export function getWebsiteEventListingSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-event-listing.eyebrow',     label: 'Eyebrow', iconKey: 'eyebrow', isHidden: !s.showEyebrow, hide: () => s.setShowEyebrow(false), show: () => s.setShowEyebrow(true) },
    { path: 'website-event-listing.subhead',     label: 'Subhead', iconKey: 'subhead', isHidden: !s.showSubhead, hide: () => s.setShowSubhead(false), show: () => s.setShowSubhead(true) },
    { path: 'website-event-listing.gridDetail2', label: 'Row 2',   iconKey: 'body',    isHidden: !s.showRow3,    hide: () => s.setShowRow3(false),    show: () => s.setShowRow3(true) },
    { path: 'website-event-listing.gridDetail3', label: 'Row 3',   iconKey: 'body',    isHidden: !s.showRow4,    hide: () => s.setShowRow4(false),    show: () => s.setShowRow4(true) },
  ]
}

const HEADLINE_CFG = { default: 58, min: 32, max: 80, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getWebsiteEventListingSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-event-listing.headline',
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
  headline: string
  subhead: string
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  gridDetail4Text: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
  setSubhead: (v: string) => void
  setGridDetail1Text: (v: string) => void
  setGridDetail2Text: (v: string) => void
  setGridDetail3Text: (v: string) => void
  setGridDetail4Text: (v: string) => void
}

export function getWebsiteEventListingContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-event-listing.eyebrow',      format: 'plain', value: s.eyebrow,         set: s.setEyebrow },
    { path: 'website-event-listing.headline',     format: 'plain', value: s.headline,        set: s.setHeadline },
    { path: 'website-event-listing.subhead',      format: 'plain', value: s.subhead,         set: s.setSubhead },
    { path: 'website-event-listing.gridDetail1',  format: 'plain', value: s.gridDetail1Text, set: s.setGridDetail1Text },
    { path: 'website-event-listing.gridDetail2',  format: 'plain', value: s.gridDetail2Text, set: s.setGridDetail2Text },
    { path: 'website-event-listing.gridDetail3',  format: 'plain', value: s.gridDetail3Text, set: s.setGridDetail3Text },
    { path: 'website-event-listing.gridDetail4',  format: 'plain', value: s.gridDetail4Text, set: s.setGridDetail4Text },
  ]
}
