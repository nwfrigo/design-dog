'use client'

import { useDroppable } from '@/lib/dnd'
import type { SlotVisibility } from '../VisibilityRegistry'
import type { SlotDragData } from './StageBenchBench'

/**
 * useStageBenchDroppables — registers the stage and bench drop targets
 * with the DnD provider, wired to the supplied slot list.
 *
 * Stage accepts bench drags → calls slot.show() and animates the cursor
 * follower into the now-visible block on stage.
 * Bench accepts stage drags → calls slot.hide() and animates the cursor
 * follower into the bench preview chip's position.
 *
 * Both drop callbacks find the matching slot by path and use its
 * `show`/`hide` from the registry — no per-template setShowX wiring
 * needed in the consumer.
 *
 * Returns the two `setNodeRef` callbacks. Spread onto the stage's
 * outermost element and the bench column's `<aside>` (via
 * StageBenchShell's `benchRef` prop).
 */

export const STAGE_DROPPABLE_ID = 'canvas-stage'
export const BENCH_DROPPABLE_ID = 'canvas-bench'

export interface UseStageBenchDroppablesReturn {
  setStageNodeRef: (el: HTMLElement | null) => void
  setBenchNodeRef: (el: HTMLElement | null) => void
}

export function useStageBenchDroppables(
  slots: SlotVisibility[],
): UseStageBenchDroppablesReturn {
  const stage = useDroppable<SlotDragData>({
    id: STAGE_DROPPABLE_ID,
    accept: (data) => data.region === 'bench',
    onDrop: (data) => {
      const slot = slots.find((s) => s.path === data.path)
      slot?.show()
      // The block is already in the DOM at the preview-block's position
      // (rendered as the preview during hover). Settle to it so the chip
      // dives into place.
      const dest = document.querySelector<HTMLElement>(
        `[data-editable-path="${data.path}"]`,
      )
      return { settleTo: dest }
    },
  })

  const bench = useDroppable<SlotDragData>({
    id: BENCH_DROPPABLE_ID,
    accept: (data) => data.region === 'stage',
    onDrop: (data) => {
      // Capture the preview chip's position BEFORE slot.hide() flushes,
      // so the cursor follower can settle to its exact landing spot.
      const dest = document.querySelector<HTMLElement>('[data-canvas-bench-preview]')
      const slot = slots.find((s) => s.path === data.path)
      slot?.hide()
      return { settleTo: dest }
    },
  })

  return {
    setStageNodeRef: stage.setNodeRef,
    setBenchNodeRef: bench.setNodeRef,
  }
}
