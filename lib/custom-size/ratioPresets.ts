/**
 * Canvas ratio presets — the SINGLE source for both the dimension-row chips and
 * the magnetic snap-to-preset detents (so the chips ARE the ratios you snap to).
 *
 * Ordered portrait → landscape; all real digital/marketing formats.
 */

export interface RatioPreset {
  label: string
  rw: number
  rh: number
}

export const RATIO_PRESETS: RatioPreset[] = [
  { label: '9:16',   rw: 9,    rh: 16 }, // vertical video — Stories/Reels/TikTok
  { label: '3:4',    rw: 3,    rh: 4 },  // tall portrait — display ads
  { label: '4:5',    rw: 4,    rh: 5 },  // social feed portrait — Instagram
  { label: '1:1',    rw: 1,    rh: 1 },  // square — social/avatars
  { label: '4:3',    rw: 4,    rh: 3 },  // gentle landscape — slides
  { label: '3:2',    rw: 3,    rh: 2 },  // classic landscape — photography
  { label: '16:9',   rw: 16,   rh: 9 },  // widescreen — video/hero banners
  { label: '1.91:1', rw: 1.91, rh: 1 },  // social link card — Facebook/LinkedIn
]

/** Bare ratio values (w/h) for the magnetic snap detents. */
export const PRESET_RATIOS: number[] = RATIO_PRESETS.map((p) => p.rw / p.rh)
