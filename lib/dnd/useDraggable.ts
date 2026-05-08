'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { useDndContext } from './DndProvider'

/**
 * useDraggable — make any element draggable.
 *
 * Returns a `setNodeRef` (attach to the source element), a `listeners` blob
 * to spread onto the same element, and `isDragging` (true while *this*
 * draggable is the active drag).
 *
 * Activation threshold: a drag doesn't start until the pointer moves
 * more than `activationDistance` pixels from the press point. This keeps
 * single clicks behaving like clicks (not micro-drags) and feels right
 * across mouse / touch / pen.
 *
 * Drag preview: caller passes a `preview` ReactNode — what should follow
 * the cursor. Captured at activation time and held by the provider for
 * the duration of the drag. (Static for the drag — if you need a live
 * preview that updates with state changes, render conditionally on
 * `isDragging` instead.)
 *
 * The hook owns its pointer event lifecycle entirely:
 *  - pointerdown on the source element starts tracking
 *  - window-level pointermove watches for activation
 *  - on activation, control transfers to the provider's pointer loop
 *  - pointerup ends both phases (drag if active, otherwise nothing —
 *    click handlers fire normally)
 */

export interface UseDraggableOptions<T = unknown> {
  /** Stable id for this draggable. Used for the `isDragging` check
   *  (`activeDrag.id === id`). */
  id: string
  /** Caller-defined payload passed to droppables on accept/drop. */
  data: T
  /** What to render at the cursor while the drag is active. */
  preview: ReactNode
  /**
   * Fixed cursor-to-preview offset in pixels. When set, the cursor sits
   * `(x, y)` from the preview's top-left for the duration of the drag.
   *
   * Use this when the source element is larger than the preview — e.g.,
   * a wide stage block being dragged as a small chip — so the preview
   * stays right under the cursor instead of being anchored to the
   * source's top-left (which would place the preview far from the cursor
   * if the user pressed in the source's interior).
   *
   * Default: undefined → cursor keeps its position relative to where in
   * the source it was pressed. Right for same-sized sources/previews
   * like dragging a chip out of the bench.
   */
  previewOffset?: { x: number; y: number }
  /** Pixels of pointer movement before a drag activates. Default 5. */
  activationDistance?: number
  /** Optional — fired once when the drag activates. */
  onDragStart?: (data: T) => void
  /** Optional — fired when the drag ends, dropped or cancelled.
   *  `committed` is true if the drag landed on a droppable. */
  onDragEnd?: (data: T, committed: boolean) => void
}

export interface UseDraggableReturn {
  /** Attach to the source element via `ref={setNodeRef}` (or directly,
   *  if you have a stable element reference). */
  setNodeRef: (el: HTMLElement | null) => void
  /** Spread onto the source element to wire pointer tracking. */
  listeners: { onPointerDown: (e: PointerEvent<HTMLElement>) => void }
  /** True while this draggable is the one being dragged. */
  isDragging: boolean
}

const DEFAULT_ACTIVATION_DISTANCE = 5

/**
 * Walk through any chain of `display: contents` wrappers (which have no
 * box of their own) to find the first descendant with a real rect. Mirrors
 * the same logic used by SelectionRing / useFlipReflow so the source
 * element's offset can be measured correctly when consumers wrap drag
 * sources in layout-transparent containers (notably <Editable>).
 */
function getMeasurableRect(el: HTMLElement): DOMRect {
  if (typeof window === 'undefined') return el.getBoundingClientRect()
  if (window.getComputedStyle(el).display === 'contents') {
    const child = el.firstElementChild as HTMLElement | null
    if (child) return getMeasurableRect(child)
  }
  return el.getBoundingClientRect()
}

export function useDraggable<T = unknown>(opts: UseDraggableOptions<T>): UseDraggableReturn {
  const ctx = useDndContext()
  const elementRef = useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Live opts in a ref so handlers don't capture stale closures.
  const optsRef = useRef(opts)
  optsRef.current = opts

  // Per-press tracking state — null when no press is in progress.
  const pressRef = useRef<{
    startX: number
    startY: number
    elementLeft: number
    elementTop: number
    activated: boolean
    cleanup: () => void
  } | null>(null)

  // True if THIS hook owns the active drag — needed for the onDragEnd
  // callback to fire only when this draggable's drag ends.
  const isOwnerRef = useRef(false)

  // When the global activeDrag clears, sync our local isDragging if we
  // were the owner. Covers cancel via Escape (which clears activeDrag
  // through the provider, not through our pointerup handler).
  useEffect(() => {
    if (!ctx.activeDrag && isOwnerRef.current) {
      isOwnerRef.current = false
      setIsDragging(false)
    }
  }, [ctx.activeDrag])

  const setNodeRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el
  }, [])

  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    // Left button only (mouse) — touch / pen always pass.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!elementRef.current) return

    const rect = getMeasurableRect(elementRef.current)
    const startX = e.clientX
    const startY = e.clientY
    const elementLeft = rect.left
    const elementTop = rect.top

    const onMove = (ev: globalThis.PointerEvent) => {
      const press = pressRef.current
      if (!press) return

      if (!press.activated) {
        const dx = ev.clientX - press.startX
        const dy = ev.clientY - press.startY
        const threshold = optsRef.current.activationDistance ?? DEFAULT_ACTIVATION_DISTANCE
        if (Math.hypot(dx, dy) >= threshold) {
          // Activate — hand off to the provider's pointer loop. If a
          // fixed previewOffset is set, the cursor sits at that point
          // within the preview from now on; otherwise the cursor keeps
          // its source-relative position.
          press.activated = true
          isOwnerRef.current = true
          setIsDragging(true)
          const fixed = optsRef.current.previewOffset
          ctx.startDrag({
            id: optsRef.current.id,
            data: optsRef.current.data,
            preview: optsRef.current.preview,
            offsetX: fixed ? fixed.x : press.startX - press.elementLeft,
            offsetY: fixed ? fixed.y : press.startY - press.elementTop,
            initialCursorX: ev.clientX,
            initialCursorY: ev.clientY,
            sourceEl: elementRef.current,
          })
          optsRef.current.onDragStart?.(optsRef.current.data)
        }
      }
      // Once activated, the provider's pointermove listener takes over
      // for hit-testing and preview position. We don't need to do
      // anything more here.
    }

    const onUp = () => {
      const press = pressRef.current
      if (press?.activated) {
        // The provider's own pointerup handler fires drop + cleanup.
        // We just clean up our own click-vs-drag tracking.
        const committed = !!ctx.overTargetId
        optsRef.current.onDragEnd?.(optsRef.current.data, committed)
      }
      press?.cleanup()
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      pressRef.current = null
    }

    pressRef.current = {
      startX,
      startY,
      elementLeft,
      elementTop,
      activated: false,
      cleanup,
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }, [ctx])

  return {
    setNodeRef,
    listeners: { onPointerDown },
    isDragging,
  }
}
