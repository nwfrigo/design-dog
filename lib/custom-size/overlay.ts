/**
 * Custom-size overlay scrim — the SINGLE source of truth for the gradient that
 * sits over a full-bleed background image. Used by the canvas renderer, the
 * image-modal crop preview (so the user sees the scrim live), and the scrim lab
 * spike. Keeping it here means the preview and the export can never drift.
 *
 * The look (where the scrim concentrates + how far it fades) is a fixed design
 * choice, not user state — `coverage` picks direction, a SCRIM_PROFILE picks the
 * stop curve. Tune by changing DEFAULT_SCRIM (calibrated in the scrim lab).
 */

import type { CustomSizeOverlay } from './document'

/** Self-contained tiling noise (no asset needed) — shared by the canvas overlay
 *  and the modal preview so the texture matches. */
export const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
export function rgba(hex: string, a: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** A gradient stop: position (0-100% along the fade) × opacity multiplier
 *  (× the overlay's base opacity). Position 0 = the dark/anchored edge. */
type Stop = [pos: number, mult: number]

export interface ScrimProfile {
  key: string
  label: string
  /** Stops from the anchored (dark) edge outward. Last stop's mult sets the
   *  floor at the far edge — non-zero = the scrim never fully clears. */
  fade: Stop[]
}

/** Candidate scrim curves (compare in /custom-size-lab/scrim). */
export const SCRIM_PROFILES: ScrimProfile[] = [
  { key: 'current', label: 'Current', fade: [[0, 1], [32, 0.45], [72, 0]] },
  { key: 'later',   label: 'Later fade', fade: [[0, 1], [45, 1], [95, 0]] },
  { key: 'eased',   label: 'Eased tail', fade: [[0, 1], [30, 0.85], [60, 0.5], [85, 0.15], [100, 0]] },
  { key: 'floor30', label: 'Floor 30% (never clears)', fade: [[0, 1], [55, 0.62], [100, 0.3]] },
  { key: 'floor30-tease', label: 'Floor 30%, teased stops', fade: [[0, 1], [40, 0.78], [78, 0.42], [100, 0.3]] },
]

/** The shipped curve (picked in the scrim lab): floor-30 with teased stops —
 *  holds fill behind content and never fully clears at the far edge. */
export const DEFAULT_SCRIM = 'floor30-tease'

function profileFor(key: string): ScrimProfile {
  return SCRIM_PROFILES.find((p) => p.key === key) ?? SCRIM_PROFILES[0]
}

/** Build the CSS `background` value for an overlay. `full` = even wash; the two
 *  directional coverages use the chosen profile's stop curve. */
export function overlayBackground(o: CustomSizeOverlay, profileKey: string = DEFAULT_SCRIM): string {
  if (o.coverage === 'full') return rgba(o.color, o.opacity)
  const dir = o.coverage === 'fade-up' ? 'to top' : 'to bottom'
  const stops = profileFor(profileKey).fade
    .map(([p, m]) => `${rgba(o.color, o.opacity * m)} ${p}%`)
    .join(', ')
  return `linear-gradient(${dir}, ${stops})`
}
