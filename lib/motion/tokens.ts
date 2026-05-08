/**
 * Motion design tokens — shared timing + easing curves for app animations.
 *
 * Use these instead of hardcoding ms/cubic-bezier strings inline. Picking from
 * a small set keeps the app's motion language coherent and makes global
 * adjustments (e.g., respecting `prefers-reduced-motion`) a one-line change.
 *
 * Duration scale:
 *   xs (80ms)  — instant feedback (hover, active press)
 *   sm (150ms) — UI transitions (scrim fade, opacity swap)
 *   md (200ms) — layout reflow (FLIP, panel slide)
 *   lg (300ms) — content transitions (page-level changes)
 */
export const MOTION = {
  duration: {
    xs: 80,
    sm: 150,
    md: 200,
    lg: 300,
  },
  easing: {
    /** Standard easing for things entering / settling. Most common. */
    out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    /** Symmetric ease — for things that move A→B with no clear direction. */
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

export type MotionDuration = keyof typeof MOTION.duration
export type MotionEasing = keyof typeof MOTION.easing
