'use client'

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { PRESET_RATIOS } from '@/lib/custom-size/ratioPresets'

/**
 * CustomSizeResizeHandles — drag any edge/corner to resize the asset (live
 * re-resolve). 8 handles: 4 edges + 4 corners.
 *
 * The chrome is plain px (constant UI size): the stage box is screen-space and
 * only the canvas inside it is transform-scaled, so the chrome must NOT scale
 * with the design. Edge/corner POSITIONS are inset-anchored to the box edges.
 *
 * Accent = Stacker blue, GREEN only when the canvas is *actually* at a preset
 * ratio — exact at rest (tight epsilon), and live-engaged while a magnet detent
 * holds during a drag. We do NOT colour green merely for being "near" a preset.
 *
 * Magnetic snap (`snapToPresets`): a fixed SCREEN-PIXEL detent, not a ratio
 * percentage. A percentage band balloons at large canvases (4% of 1920 ≈ 77px),
 * which is the "keep dragging and it stays pinned past the preset" drift. A
 * pixel detent feels identical at any size and snaps to the EXACT preset, then
 * releases cleanly once the cursor pulls ~SNAP_PX past it. One undo checkpoint
 * per drag (start); moves stream live.
 */

const MIN_DIM = 1
const MAX_DIM = 9999
/** Magnet half-width, in screen px of the dragged dimension's delta. Constant
 *  feel regardless of canvas scale (the detent grabs the same on-screen pull). */
const SNAP_PX = 22
/** At-rest "is this an exact preset" epsilon, as a fraction of the ratio.
 *  Tight on purpose — green must mean *at* a preset, not merely near one. */
const AT_PRESET_EPS = 0.006

const BLUE = '#3B82F6'
const GREEN = '#22C55E'

export interface CustomSizeResizeHandlesProps {
  width: number
  height: number
  /** The stage's current (frozen-during-drag) scale — used to convert screen
   *  delta → canvas delta. */
  scale: number
  snapToPresets: boolean
  /** Lock the aspect ratio to its value at drag start (free transform when off). */
  lockAspect?: boolean
  onResizeStart: () => void
  onResize: (width: number, height: number) => void
  onResizeEnd: () => void
}

const clamp = (n: number) => Math.min(MAX_DIM, Math.max(MIN_DIM, Math.round(n)))

type Drag = { sx: number; sy: number; startX: number; startY: number; startW: number; startH: number }

const EDGES = [
  { id: 'n', side: 'top', orient: 'h', sx: 0, sy: -1, cursor: 'ns-resize' },
  { id: 's', side: 'bottom', orient: 'h', sx: 0, sy: 1, cursor: 'ns-resize' },
  { id: 'w', side: 'left', orient: 'v', sx: -1, sy: 0, cursor: 'ew-resize' },
  { id: 'e', side: 'right', orient: 'v', sx: 1, sy: 0, cursor: 'ew-resize' },
] as const

const CORNERS = [
  { id: 'nw', v: 'top', h: 'left', sx: -1, sy: -1, cursor: 'nwse-resize' },
  { id: 'ne', v: 'top', h: 'right', sx: 1, sy: -1, cursor: 'nesw-resize' },
  { id: 'sw', v: 'bottom', h: 'left', sx: -1, sy: 1, cursor: 'nesw-resize' },
  { id: 'se', v: 'bottom', h: 'right', sx: 1, sy: 1, cursor: 'nwse-resize' },
] as const

export function CustomSizeResizeHandles({
  width,
  height,
  scale,
  snapToPresets,
  lockAspect,
  onResizeStart,
  onResize,
  onResizeEnd,
}: CustomSizeResizeHandlesProps) {
  const drag = useRef<Drag | null>(null)
  const dragging = useRef(false)
  const [dragSnapped, setDragSnapped] = useState(false)

  // GREEN means *truly* at a preset: while dragging, only when a detent is
  // engaged; at rest, only when the ratio is exact (tight epsilon). Never green
  // for merely being "near" a preset — that was the source of the false reads.
  const atRestPreset = PRESET_RATIOS.some((r) => Math.abs(width / height - r) <= AT_PRESET_EPS * r)
  const accent = (dragging.current ? dragSnapped : atRestPreset) ? GREEN : BLUE

  // Window-level listeners (per-element pointer capture is flaky on thin zones).
  // The canvas is CENTER-anchored, so a dragged edge follows the cursor only
  // when the dimension changes by 2× the cursor delta (the other edge moves the
  // opposite way to keep the centre fixed). `scale` is frozen by the stage for
  // the duration of the drag, so the closure value stays correct.
  const begin = (sx: number, sy: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    drag.current = { sx, sy, startX: e.clientX, startY: e.clientY, startW: width, startH: height }
    dragging.current = true
    setDragSnapped(false)
    onResizeStart()

    const onMove = (ev: globalThis.PointerEvent) => {
      const d = drag.current
      if (!d) return
      let w = clamp(d.startW + (d.sx * 2 * (ev.clientX - d.startX)) / scale)
      let h = clamp(d.startH + (d.sy * 2 * (ev.clientY - d.startY)) / scale)
      let engaged = false
      if (lockAspect) {
        // Ratio fixed to drag-start. The dragged axis drives; the other follows.
        // (Lock wins over snap — snapping to a different preset ratio would fight
        //  the lock.) Pure-vertical drags drive height; edges/corners drive width.
        const aspect = d.startW / d.startH
        if (d.sx === 0) w = clamp(h * aspect)
        else h = clamp(w / aspect)
      } else if (snapToPresets) {
        // Fixed screen-pixel detent on the dragged axis. Snap that axis to the
        // value that makes the ratio EXACT, but only while the cursor is within
        // SNAP_PX (screen) of it — so the magnet grabs the same on-screen pull
        // at any canvas size and releases cleanly instead of dragging past.
        // Pure-vertical drags adjust height; edges/corners adjust width.
        if (d.sx === 0) {
          let bestTarget: number | null = null
          let bestPx = SNAP_PX
          for (const r of PRESET_RATIOS) {
            const targetH = w / r
            const px = Math.abs(h - targetH) * scale
            if (px < bestPx) { bestPx = px; bestTarget = targetH }
          }
          if (bestTarget != null) { h = clamp(bestTarget); engaged = true }
        } else {
          let bestTarget: number | null = null
          let bestPx = SNAP_PX
          for (const r of PRESET_RATIOS) {
            const targetW = h * r
            const px = Math.abs(w - targetW) * scale
            if (px < bestPx) { bestPx = px; bestTarget = targetW }
          }
          if (bestTarget != null) { w = clamp(bestTarget); engaged = true }
        }
      }
      setDragSnapped(engaged)
      onResize(w, h)
    }
    const onUp = () => {
      drag.current = null
      dragging.current = false
      setDragSnapped(false)
      onResizeEnd()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const reveal = 'opacity-0 group-hover:opacity-100 transition-opacity'

  return (
    <>
      {/* Bounding box. Plain px = constant UI size: the stage box is screen-space
       *  (only the canvas inside it is transform-scaled), so the chrome must NOT
       *  scale with the design. */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none ${reveal}`}
        style={{ borderStyle: 'solid', borderWidth: 1, borderColor: accent }}
      />

      {/* Edge handles — full-length bar straddling each edge. */}
      {EDGES.map((ed) => {
        const horizontal = ed.orient === 'h'
        const zone: CSSProperties = horizontal
          ? { left: 0, right: 0, [ed.side]: -5, height: 10 }
          : { top: 0, bottom: 0, [ed.side]: -5, width: 10 }
        const bar: CSSProperties = horizontal
          ? { width: '100%', height: 3, background: accent }
          : { height: '100%', width: 3, background: accent }
        return (
          <div
            key={ed.id}
            onPointerDown={begin(ed.sx, ed.sy)}
            className="absolute z-20 flex items-center justify-center"
            style={{ ...zone, cursor: ed.cursor }}
          >
            <div className={reveal} style={bar} />
          </div>
        )
      })}

      {/* Corner handles — white dot with accent ring. */}
      {CORNERS.map((c) => (
        <div
          key={c.id}
          onPointerDown={begin(c.sx, c.sy)}
          className="absolute z-30 flex items-center justify-center"
          style={{ [c.v]: -6, [c.h]: -6, width: 12, height: 12, cursor: c.cursor }}
        >
          <div
            className={reveal}
            style={{ width: 9, height: 9, borderRadius: 2, background: '#fff', border: `1.5px solid ${accent}` }}
          />
        </div>
      ))}
    </>
  )
}
