import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-grid.
 *
 * Track 1 left column (ContentStack: eyebrow / headline / subheading
 * / body) + Track-2-style right grid panel where each row is an
 * independently editable block but rows retain their equal-distribute
 * layout (the design's identity).
 *
 * Row 1 and Row 3 are always visible; Row 2 toggleable via
 * `showGridDetail2`.
 */

type SlotsParams = {
  showEyebrow: boolean
  showSubheading: boolean
  showBody: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  setShowEyebrow: (v: boolean) => void
  setShowSubheading: (v: boolean) => void
  setShowBody: (v: boolean) => void
  setShowSolutionSet: (v: boolean) => void
  setShowGridDetail2: (v: boolean) => void
}

export function getEmailGridSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'email-grid.solutionPill', label: 'Category',   iconKey: 'category', isHidden: !s.showSolutionSet, hide: () => s.setShowSolutionSet(false), show: () => s.setShowSolutionSet(true) },
    { path: 'email-grid.eyebrow',      label: 'Eyebrow',    iconKey: 'eyebrow',  isHidden: !s.showEyebrow,     hide: () => s.setShowEyebrow(false),     show: () => s.setShowEyebrow(true) },
    { path: 'email-grid.subheading',   label: 'Subheading', iconKey: 'subhead',  isHidden: !s.showSubheading,  hide: () => s.setShowSubheading(false),  show: () => s.setShowSubheading(true) },
    { path: 'email-grid.body',         label: 'Body',       iconKey: 'body',     isHidden: !s.showBody,        hide: () => s.setShowBody(false),        show: () => s.setShowBody(true) },
    { path: 'email-grid.gridDetail2',  label: 'Detail 2',   iconKey: 'body',     isHidden: !s.showGridDetail2, hide: () => s.setShowGridDetail2(false), show: () => s.setShowGridDetail2(true) },
  ]
}

const HEADLINE_CFG = { default: 38, min: 24, max: 56, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getEmailGridSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'email-grid.headline',
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
  subheading: string
  body: string
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
  setSubheading: (v: string) => void
  setBody: (v: string) => void
  setGridDetail1Text: (v: string) => void
  setGridDetail2Text: (v: string) => void
  setGridDetail3Text: (v: string) => void
}

export function getEmailGridContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-grid.eyebrow',      format: 'plain', value: s.eyebrow,         set: s.setEyebrow },
    { path: 'email-grid.headline',     format: 'plain', value: s.headline,        set: s.setHeadline },
    { path: 'email-grid.subheading',   format: 'plain', value: s.subheading,      set: s.setSubheading },
    { path: 'email-grid.body',         format: 'plain', value: s.body,            set: s.setBody },
    { path: 'email-grid.gridDetail1',  format: 'plain', value: s.gridDetail1Text, set: s.setGridDetail1Text },
    { path: 'email-grid.gridDetail2',  format: 'plain', value: s.gridDetail2Text, set: s.setGridDetail2Text },
    { path: 'email-grid.gridDetail3',  format: 'plain', value: s.gridDetail3Text, set: s.setGridDetail3Text },
  ]
}
