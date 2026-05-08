'use client'

import { MOTION } from '@/lib/motion'

/**
 * StageScrim — translucent overlay that dims the stage while a bench
 * chip is dragged over it. Designed to render *inside* the template's
 * stacking context (via the template's `renderOverlay` render-prop) so
 * z-index can layer between existing blocks (no z-index, painted at the
 * natural level → covered by scrim) and the previewed block (bumped to
 * z-index 2 by the consumer → pokes through bright on top).
 *
 * Directional transition: fades in over 150ms when entering the
 * preview state, snaps out instantly on commit. Without this asymmetry,
 * the block's z-index drops at commit while the scrim is still fading,
 * which momentarily covers the block ("the wink").
 */
export function StageScrim({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'var(--scrim-overlay)',
        opacity: visible ? 1 : 0,
        transition: visible
          ? `opacity ${MOTION.duration.sm}ms ${MOTION.easing.out}`
          : 'none',
        zIndex: 1,
      }}
    />
  )
}
