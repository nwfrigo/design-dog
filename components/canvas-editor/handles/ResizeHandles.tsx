'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotSize } from '../SizeRegistry'

/**
 * ResizeHandles — corner drag-to-scale for the selected slot.
 *
 * Portal sibling of `SelectionRing` / `ContextualToolbar`, driven by the same
 * `selection.bounds`. Renders only when the selected slot has a `SizeRegistry`
 * entry (i.e. the adapter declared `size` on its descriptor), so slots that
 * aren't resizable are unaffected.
 *
 * **Aspect is locked by construction.** The registry carries a single scalar
 * (the slot's height), and the element it drives is authored `width: auto`
 * against its intrinsic aspect — so there is no second axis to get out of
 * sync. Corner drags therefore map to one value; there is deliberately no
 * free-transform mode.
 *
 * Screen → design conversion: the stage is transform-scaled by `ScaledStage`
 * to fit the viewport, so a 10px cursor move is not 10 design px. We read the
 * live factor off the stage node (`getBoundingClientRect().width /
 * offsetWidth` — offsetWidth ignores transforms) at drag start and hold it for
 * the drag, matching how CustomSizeResizeHandles freezes its scale.
 *
 * Drag math uses the diagonal projection so both axes of a corner drag feel
 * natural: pulling out from the element grows it, pushing in shrinks it, and
 * the handle that was grabbed determines the sign.
 */

const ACCENT = '#3B82F6'
const HANDLE = 9

/** Corner sign vectors: which way is "bigger" when dragging this corner. */
const CORNERS = [
  { id: 'nw', top: true, left: true, dx: -1, dy: -1, cursor: 'nwse-resize' },
  { id: 'ne', top: true, left: false, dx: 1, dy: -1, cursor: 'nesw-resize' },
  { id: 'sw', top: false, left: true, dx: -1, dy: 1, cursor: 'nesw-resize' },
  { id: 'se', top: false, left: false, dx: 1, dy: 1, cursor: 'nwse-resize' },
] as const

function stageScale(): number {
  if (typeof document === 'undefined') return 1
  const stage = document.querySelector('[data-canvas-stage]') as HTMLElement | null
  if (!stage) return 1
  const rect = stage.getBoundingClientRect()
  // offsetWidth is the un-transformed intrinsic width, so the ratio is the
  // live visual scale. Guard against a 0 measurement during mount.
  if (!stage.offsetWidth || !rect.width) return 1
  return rect.width / stage.offsetWidth
}

export function ResizeHandles() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const size = useSlotSize(selection?.path)
  const [mounted, setMounted] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startX: number; startValue: number; scale: number; dx: number; dy: number } | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted || !selection?.bounds || !size) return null

  const bounds = selection.bounds

  const begin = (dx: number, dy: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startValue: size.value,
      scale: stageScale(),
      dx,
      dy,
    }
    setDragging(true)

    const onMove = (ev: globalThis.PointerEvent) => {
      const d = drag.current
      if (!d) return
      // Project the cursor delta onto the corner's outward diagonal, then
      // convert screen px → design px. The element's rendered height is the
      // value being driven, so the vertical component dominates; including
      // the horizontal component makes diagonal drags feel proportional
      // rather than ignoring half the gesture.
      const moved = ((ev.clientX - d.startX) * d.dx + (ev.clientY - d.startY) * d.dy) / 2
      const next = d.startValue + moved / d.scale
      const clamped = Math.min(size.max, Math.max(size.min, Math.round(next / size.step) * size.step))
      size.set(clamped)
    }
    const onUp = () => {
      drag.current = null
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const dot = (c: (typeof CORNERS)[number]): CSSProperties => ({
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: '50%',
    background: '#FFFFFF',
    border: `1.5px solid ${ACCENT}`,
    cursor: c.cursor,
    pointerEvents: 'auto',
    top: (c.top ? bounds.top : bounds.bottom) + window.scrollY - HANDLE / 2,
    left: (c.left ? bounds.left : bounds.right) + window.scrollX - HANDLE / 2,
    zIndex: 1001,
    touchAction: 'none',
  })

  return createPortal(
    <>
      {CORNERS.map((c) => (
        <div key={c.id} style={dot(c)} onPointerDown={begin(c.dx, c.dy)} />
      ))}
      {dragging && (
        <div
          style={{
            position: 'absolute',
            top: bounds.top + window.scrollY - 26,
            left: bounds.left + window.scrollX,
            padding: '2px 6px',
            borderRadius: 3,
            background: ACCENT,
            color: '#FFFFFF',
            font: '500 11px ui-monospace, monospace',
            pointerEvents: 'none',
            zIndex: 1001,
          }}
        >
          {Math.round(size.value)}px
        </div>
      )}
    </>,
    document.body,
  )
}
