import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotSize } from '../SizeRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for website-ehs-accelerate-listing.
 *
 * Twin of website-event-listing without the variant selector (the
 * background image is baked into the design). Same 3-text-block
 * left column + 4-row grid panel structure.
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

export function getWebsiteEhsAccelerateListingSlots(s: SlotsParams): SlotVisibility[] {
  return [
    { path: 'website-ehs-accelerate-listing.eyebrow',     label: 'Eyebrow', iconKey: 'eyebrow', isHidden: !s.showEyebrow, hide: () => s.setShowEyebrow(false), show: () => s.setShowEyebrow(true) },
    { path: 'website-ehs-accelerate-listing.subhead',     label: 'Subhead', iconKey: 'subhead', isHidden: !s.showSubhead, hide: () => s.setShowSubhead(false), show: () => s.setShowSubhead(true) },
    { path: 'website-ehs-accelerate-listing.gridDetail2', label: 'Row 2',   iconKey: 'body',    isHidden: !s.showRow3,    hide: () => s.setShowRow3(false),    show: () => s.setShowRow3(true) },
    { path: 'website-ehs-accelerate-listing.gridDetail3', label: 'Row 3',   iconKey: 'body',    isHidden: !s.showRow4,    hide: () => s.setShowRow4(false),    show: () => s.setShowRow4(true) },
  ]
}

const HEADLINE_CFG = { default: 58, min: 32, max: 80, step: 2 } as const

type SizesParams = {
  headlineFontSize: number | null
  setHeadlineFontSize: (v: number) => void
}

export function getWebsiteEhsAccelerateListingSizes(s: SizesParams): SlotSize[] {
  return [
    {
      path: 'website-ehs-accelerate-listing.headline',
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

export function getWebsiteEhsAccelerateListingContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'website-ehs-accelerate-listing.eyebrow',      format: 'plain', value: s.eyebrow,         set: s.setEyebrow },
    { path: 'website-ehs-accelerate-listing.headline',     format: 'plain', value: s.headline,        set: s.setHeadline },
    { path: 'website-ehs-accelerate-listing.subhead',      format: 'plain', value: s.subhead,         set: s.setSubhead },
    { path: 'website-ehs-accelerate-listing.gridDetail1',  format: 'plain', value: s.gridDetail1Text, set: s.setGridDetail1Text },
    { path: 'website-ehs-accelerate-listing.gridDetail2',  format: 'plain', value: s.gridDetail2Text, set: s.setGridDetail2Text },
    { path: 'website-ehs-accelerate-listing.gridDetail3',  format: 'plain', value: s.gridDetail3Text, set: s.setGridDetail3Text },
    { path: 'website-ehs-accelerate-listing.gridDetail4',  format: 'plain', value: s.gridDetail4Text, set: s.setGridDetail4Text },
  ]
}
