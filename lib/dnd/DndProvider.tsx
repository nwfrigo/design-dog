'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { MOTION } from '@/lib/motion'
import type { ActiveDrag, DndContextValue, DroppableRegistration } from './types'

/** Walks through `display: contents` wrappers (which have no box of
 *  their own) to find the first descendant with a real layout box.
 *  Returns both the element (for animations / transforms) and its
 *  rect. Used by the settle animation when the destination element is
 *  an Editable wrapper or any other layout-transparent container. */
function getMeasurableEl(el: HTMLElement): HTMLElement {
  if (typeof window !== 'undefined' && window.getComputedStyle(el).display === 'contents') {
    const child = el.firstElementChild as HTMLElement | null
    if (child) return getMeasurableEl(child)
  }
  return el
}

/** Total duration of the settle animation (chip flying to its
 *  destination on success, or back to its source on a failed drop). */
const SETTLE_MS = 300

/** Chip arrives at the destination scaled down — visually tucks into
 *  the block instead of sitting on top, reinforcing "this thing is
 *  becoming part of that thing". */
const TUCK_SCALE = 0.85

/**
 * DndProvider — root of the pointer-event drag and drop system.
 *
 * Replaces HTML5 native DnD entirely. Why: native HTML5 DnD is a
 * cross-window/external-content API; the browser inserts itself into every
 * gesture with non-disable-able visuals (drag cursor swaps, link-drag
 * indicators, rectangular drop-shadow halos around the captured bitmap,
 * "no-drop" icons, OS-level beeps on some platforms). For an intra-app
 * drag — chip ↔ stage, future reorder, multi-select, etc. — none of that
 * is wanted, but the API offers no clean way to opt out.
 *
 * Pointer events let us own every pixel: zero browser chrome, full visual
 * control, touch + pen support for free, no data-transfer or MIME
 * constraints, no setDragImage/rAF timing dance. Plus, this becomes a
 * shared primitive (`useDraggable` + `useDroppable`) usable for any
 * future drag interaction in the app.
 *
 * Architecture:
 *  - Provider holds two pieces of state: `activeDrag` (set once at start,
 *    cleared at end — referentially stable through the drag) and
 *    `overTargetId` (changes as the cursor crosses droppables).
 *  - Provider also holds a ref-only Map of registered droppables (for
 *    hit-testing) and a ref to the preview element (for transform writes).
 *  - When a drag is active, the provider attaches window-level
 *    pointermove / pointerup / keydown listeners. The pointermove handler
 *    does hit-testing via document.elementFromPoint and updates the
 *    preview's transform directly — no React re-render per move.
 *  - The activeDrag state's identity stays stable, so the listener
 *    useEffect doesn't re-run when overTargetId changes.
 */

const DndContext = createContext<DndContextValue | null>(null)

export function useDndContext(): DndContextValue {
  const ctx = useContext(DndContext)
  if (!ctx) {
    throw new Error('useDraggable / useDroppable must be used inside <DndProvider>')
  }
  return ctx
}

export function DndProvider({ children }: { children: ReactNode }) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [overTargetId, setOverTargetId] = useState<string | null>(null)

  // Registered drop targets. Map for O(1) lookup by id; iteration order
  // is registration order, which is how we resolve overlapping zones
  // (later registrations win unless we change the policy).
  const droppablesRef = useRef<Map<string, DroppableRegistration>>(new Map())

  // Preview element — its transform is mutated imperatively in the
  // pointermove handler so cursor following is at full event-loop rate.
  const previewRef = useRef<HTMLDivElement | null>(null)

  // Synchronous mirror of overTargetId so the pointermove handler can
  // read/write without going through React state. Reactive consumers
  // still get state updates via setOverTargetId.
  const overTargetRef = useRef<string | null>(null)

  const registerDroppable = useCallback((reg: DroppableRegistration) => {
    droppablesRef.current.set(reg.id, reg)
    return () => {
      droppablesRef.current.delete(reg.id)
    }
  }, [])

  const startDrag = useCallback((drag: ActiveDrag) => {
    setActiveDrag(drag)
  }, [])

  // Suppress browser text-selection while a drag is active. Without this
  // the user's drag gesture co-fires the browser's native text-select-
  // and-drag, leaving "highlighted" text/HTML behind the slot they were
  // trying to move. We toggle a `data-dnd-dragging` attribute on <body>
  // and a global CSS rule (`globals.css`) applies `user-select: none`
  // while it's set. Selection that was already in progress when the
  // drag activated gets cleared the same moment.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (activeDrag) {
      document.body.setAttribute('data-dnd-dragging', 'true')
      window.getSelection()?.removeAllRanges()
      return () => {
        document.body.removeAttribute('data-dnd-dragging')
      }
    }
    return undefined
  }, [activeDrag])

  // Attach window listeners only while a drag is active. Effect deps are
  // [activeDrag] (whose identity is stable mid-drag), NOT [overTargetId]
  // — otherwise the listeners would re-attach every time the hover region
  // changed, dropping pending pointer events.
  useEffect(() => {
    if (!activeDrag) return

    function findOverTarget(x: number, y: number): string | null {
      const point = document.elementFromPoint(x, y)
      if (!point) return null
      // Walk registered droppables; the first whose element contains the
      // hit point AND accepts this drag wins. (For overlapping zones the
      // outer-rendered one wins because contains() is true for both.)
      const regs = Array.from(droppablesRef.current.values())
      for (let i = 0; i < regs.length; i++) {
        const reg = regs[i]
        const el = reg.getElement()
        if (!el) continue
        if (el.contains(point) && reg.accept(activeDrag!.data)) {
          return reg.id
        }
      }
      return null
    }

    /** Animate the cursor follower to a destination element's center
     *  with optional opacity fade and scale. Detaches the pointer
     *  listeners (cursor tracking is over) and schedules cleanup at
     *  the end of the animation. */
    function animatePreviewTo(
      destEl: HTMLElement,
      opts: { fade: boolean; scale: number },
    ) {
      if (!previewRef.current) {
        cleanup()
        return
      }
      const previewEl = previewRef.current
      const previewRect = previewEl.getBoundingClientRect()
      const destRect = destEl.getBoundingClientRect()
      // Center of preview lands at center of destination.
      const targetX = destRect.left + destRect.width / 2 - previewRect.width / 2
      const targetY = destRect.top + destRect.height / 2 - previewRect.height / 2

      previewEl.style.transition = `transform ${SETTLE_MS}ms ${MOTION.easing.out}, opacity ${SETTLE_MS}ms ${MOTION.easing.out}`
      previewEl.style.transformOrigin = 'center'
      previewEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${opts.scale})`
      if (opts.fade) previewEl.style.opacity = '0'

      // Detach pointer listeners — the drag is committed, no more
      // cursor tracking. (The useEffect cleanup also removes them when
      // activeDrag clears, but we drop them now so a stray pointermove
      // mid-settle can't yank the preview off-track.)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)

      window.setTimeout(cleanup, SETTLE_MS)
    }

    function handlePointerMove(e: PointerEvent) {
      // Update preview position imperatively — no React state churn.
      if (previewRef.current && activeDrag) {
        const x = e.clientX - activeDrag.offsetX
        const y = e.clientY - activeDrag.offsetY
        previewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      // Hit-test droppables.
      const next = findOverTarget(e.clientX, e.clientY)
      const prev = overTargetRef.current
      if (next !== prev) {
        if (prev) {
          droppablesRef.current.get(prev)?.onDragLeave?.(activeDrag!.data)
        }
        if (next) {
          droppablesRef.current.get(next)?.onDragEnter?.(activeDrag!.data)
        }
        overTargetRef.current = next
        setOverTargetId(next)
      }
    }

    function handlePointerUp() {
      const target = overTargetRef.current
      let settleEl: HTMLElement | null = null
      if (target) {
        const result = droppablesRef.current.get(target)?.onDrop(activeDrag!.data)
        settleEl = result?.settleTo ?? null
      }

      // ---- success: chip dives into destination ----
      if (settleEl) {
        const measurableDest = getMeasurableEl(settleEl)
        animatePreviewTo(measurableDest, { fade: true, scale: TUCK_SCALE })
        return
      }

      // ---- failed drop: chip flies back to source ----
      // No droppable accepted (released over empty space). Animate the
      // cursor follower back to where the source lives so the user
      // sees "your drop didn't land — here's the original." No fade:
      // chip arrives at full opacity exactly where the (still-ghosted)
      // source is, and at the end of the animation cleanup un-ghosts
      // the source — visually a clean swap.
      const sourceEl = activeDrag?.sourceEl
      if (sourceEl) {
        const measurableSource = getMeasurableEl(sourceEl)
        animatePreviewTo(measurableSource, { fade: false, scale: 1 })
        return
      }

      // No drop, no source we can find — just clean up immediately.
      cleanup()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Cancel — fire onDragLeave on the current target (if any) but no drop.
        const target = overTargetRef.current
        if (target) {
          droppablesRef.current.get(target)?.onDragLeave?.(activeDrag!.data)
        }
        cleanup()
      }
    }

    function cleanup() {
      overTargetRef.current = null
      setOverTargetId(null)
      setActiveDrag(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeDrag])

  const value = useMemo<DndContextValue>(
    () => ({
      activeDrag,
      overTargetId,
      registerDroppable,
      startDrag,
      previewRef,
    }),
    [activeDrag, overTargetId, registerDroppable, startDrag],
  )

  return (
    <DndContext.Provider value={value}>
      {children}
      {/* Drag preview — anchored at the cursor at drag start, then updated
       * imperatively via previewRef as the pointer moves. Pointer-events:
       * none so it doesn't capture the pointer (which would prevent
       * elementFromPoint hit-testing of underlying drop targets). */}
      {activeDrag && (
        <div
          ref={previewRef}
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: `translate3d(${activeDrag.initialCursorX - activeDrag.offsetX}px, ${activeDrag.initialCursorY - activeDrag.offsetY}px, 0)`,
          }}
        >
          {activeDrag.preview}
        </div>
      )}
    </DndContext.Provider>
  )
}
