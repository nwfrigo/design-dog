import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotContent } from '../ContentRegistry'

/**
 * Stage & Bench config for email-product-release.
 *
 * Track 2. 640×164 product-release banner. Slot inventory:
 * eyebrow · headline. Logo is brand-locked (orange Cority mark);
 * image is fixed-presence (selection opens ImageEditorModal).
 *
 * No visibility flags in the legacy design — all slots are always
 * present. So the bench surfaces no chips and no drag-to-bench
 * actions; the registry exists only so future visibility additions
 * have a place to land.
 */

type SlotsParams = Record<string, never>

export function getEmailProductReleaseSlots(_s: SlotsParams): SlotVisibility[] {
  return []
}

type ContentsParams = {
  eyebrow: string
  headline: string
  setEyebrow: (v: string) => void
  setHeadline: (v: string) => void
}

export function getEmailProductReleaseContents(s: ContentsParams): SlotContent[] {
  return [
    { path: 'email-product-release.eyebrow',  format: 'plain', value: s.eyebrow,  set: s.setEyebrow },
    { path: 'email-product-release.headline', format: 'plain', value: s.headline, set: s.setHeadline },
  ]
}
