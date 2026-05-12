import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for social-grid-detail.
 *
 * Track 1 left column (ContentStack: eyebrow / headline / subhead) +
 * Track-2-style right grid panel where each row is an independently
 * editable block. Rows 1 + 2 always visible; rows 3 + 4 toggleable.
 */

type SlotsParams = {
  showEyebrow: boolean
  showSubhead: boolean
  showSolutionSet: boolean
  showRow3: boolean
  showRow4: boolean
  setShowEyebrow: (v: boolean) => void
  setShowSubhead: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
  setShowRow3: (v: boolean) => void
  setShowRow4: (v: boolean) => void
}

export function getSocialGridDetailSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'social-grid-detail.solutionPill', label: 'Category', iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'social-grid-detail.eyebrow',      label: 'Eyebrow',  iconKey: 'eyebrow',  isHidden: !s.showEyebrow,     hide: () => s.setShowEyebrow(false),     show: () => s.setShowEyebrow(true) },
    { path: 'social-grid-detail.subhead',      label: 'Subhead',  iconKey: 'subhead',  isHidden: !s.showSubhead,     hide: () => s.setShowSubhead(false),     show: () => s.setShowSubhead(true) },
    { path: 'social-grid-detail.gridDetail3',  label: 'Row 3',    iconKey: 'body',     isHidden: !s.showRow3,        hide: () => s.setShowRow3(false),        show: () => s.setShowRow3(true) },
    { path: 'social-grid-detail.gridDetail4',  label: 'Row 4',    iconKey: 'body',     isHidden: !s.showRow4,        hide: () => s.setShowRow4(false),        show: () => s.setShowRow4(true) },
  ]
}

const HEADLINE_CFG = { default: 84, min: 40, max: 140, step: 4 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getSocialGridDetailSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'social-grid-detail.headline',
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

export function getSocialGridDetailContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'social-grid-detail.eyebrow',      format: 'plain', value: s.eyebrow,         set: s.setEyebrow },
    { path: 'social-grid-detail.headline',     format: 'plain', value: s.headline,        set: s.setHeadline },
    { path: 'social-grid-detail.subhead',      format: 'plain', value: s.subhead,         set: s.setSubhead },
    { path: 'social-grid-detail.gridDetail1',  format: 'plain', value: s.gridDetail1Text, set: s.setGridDetail1Text },
    { path: 'social-grid-detail.gridDetail2',  format: 'plain', value: s.gridDetail2Text, set: s.setGridDetail2Text },
    { path: 'social-grid-detail.gridDetail3',  format: 'plain', value: s.gridDetail3Text, set: s.setGridDetail3Text },
    { path: 'social-grid-detail.gridDetail4',  format: 'plain', value: s.gridDetail4Text, set: s.setGridDetail4Text },
  ]
}
