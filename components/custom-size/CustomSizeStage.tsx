'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { CustomSizeResizeHandles } from './CustomSizeResizeHandles'
import { STAGE_EDGE_SHADOW } from '@/lib/canvas-stage-style'

/**
 * CustomSizeStage — the custom-size canvas stage (ports the lab's resize feel,
 * `app/custom-size-lab/resize`). Replaces ScaledStage for custom-size only.
 *
 * Why a bespoke stage: ScaledStage is TOP-anchored, re-fits every frame, and
 * caps the canvas at the column width — so dragging an edge reflows content but
 * the box never grows past the column, and corner drags feel off. This stage
 * instead:
 *   - CENTER-anchors the canvas (translate(-50%,-50%)) in the available area,
 *   - FREEZES the fit-scale for the duration of a drag, so the box grows past
 *     the area and the dragged edge tracks the cursor (direct manipulation),
 *   - pairs with 2× drag sensitivity in the handles (correct for centre-anchor).
 *
 * It owns the bench drop-target / FLIP node (`setStageNodeRef`) and publishes
 * `--cs-scale` for the counter-scaled resize chrome + spacing pills.
 */

const PAD = 80 // breathing room around the centred canvas

export interface CustomSizeStageProps {
  width: number
  height: number
  snapToPresets: boolean
  /** Lock the aspect ratio while edge/corner dragging (free transform when off). */
  lockAspect?: boolean
  onResizeStart: () => void
  onResize: (width: number, height: number) => void
  /** Publishes the live fit-scale so the top bar can show "shown at X%". */
  onScaleChange?: (scale: number) => void
  /** Renders the canvas (CustomSizeCanvas + overlays) at the given visual scale. */
  renderCanvas: (scale: number) => ReactNode
  /** Wires the stage box as the bench drop target + FLIP reflow node. */
  setStageNodeRef: (el: HTMLDivElement | null) => void
  /** Which axis the zone image flips on: `horizontal` (row → left/right) or
   *  `vertical` (hero-top → top/bottom). Undefined when there's no flippable
   *  zone image; the gesture is then inert. */
  imageAxis?: 'horizontal' | 'vertical'
  /** Live flip while dragging the zone image within the canvas. */
  onFlipImage?: (pos: 'left' | 'right' | 'top' | 'bottom') => void
  /** Drag the zone image OFF the canvas → hide it (back to the bench). */
  onHideImage?: () => void
  /** Opens the image editor — called on a clean click of the zone image.
   *  Editable's mousedown-select is suppressed so a drag doesn't open the
   *  editor; this re-opens it for clicks. */
  onImageClick?: () => void
}

export function CustomSizeStage({
  width,
  height,
  snapToPresets,
  lockAspect,
  onResizeStart,
  onResize,
  onScaleChange,
  renderCanvas,
  setStageNodeRef,
  imageAxis,
  onFlipImage,
  onHideImage,
  onImageClick,
}: CustomSizeStageProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [area, setArea] = useState({ w: 800, h: 600 })
  const [dragging, setDragging] = useState(false)
  const frozenScale = useRef(1)

  // Zone-image gesture. Editable selects on mousedown (which opens the editor),
  // so we intercept the image's mousedown in capture and own the interaction:
  // a clean click opens the editor; a drag WITHIN the canvas flips the image
  // (live, on its axis); a drag OFF the canvas hides it to the bench. We also
  // suppress the trailing click after a drag (otherwise a click-select can still
  // re-open the editor).
  const dragged = useRef(false)
  const onBoxMouseDownCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageAxis || !(e.target as HTMLElement).closest('[data-cs-image]')) return
    e.stopPropagation()
    e.preventDefault()
    const box = e.currentTarget
    const startX = e.clientX
    const startY = e.clientY
    const state = { dragged: false, toBench: false }
    dragged.current = false
    const onMove = (ev: MouseEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) <= 12) return
      state.dragged = true
      dragged.current = true
      const r = box.getBoundingClientRect()
      const outside =
        ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom
      if (outside) {
        state.toBench = true
      } else {
        state.toBench = false
        if (imageAxis === 'horizontal') onFlipImage?.(ev.clientX < r.left + r.width / 2 ? 'left' : 'right')
        else onFlipImage?.(ev.clientY < r.top + r.height / 2 ? 'top' : 'bottom')
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (state.toBench) onHideImage?.()
      else if (!state.dragged) onImageClick?.()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const onBoxClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragged.current) {
      e.stopPropagation()
      e.preventDefault()
      dragged.current = false
    }
  }

  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setArea({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  // Fit the canvas inside the area (never upscale past 1). Frozen during a drag
  // so the canvas can grow past the area and edges track the cursor.
  const fitScale = Math.min(1, (area.w - PAD) / width, (area.h - PAD) / height) || 1
  const scale = dragging ? frozenScale.current : fitScale
  const renderedW = width * scale
  const renderedH = height * scale

  // Publish the live fit-scale so the dimension row can render "shown at X%".
  useEffect(() => onScaleChange?.(scale), [scale, onScaleChange])

  return (
    <div ref={areaRef} className="flex-1 w-full self-stretch relative overflow-hidden">
      <div
        ref={setStageNodeRef}
        data-canvas-stage
        data-canvas-preview-pad
        className="group absolute"
        onMouseDownCapture={onBoxMouseDownCapture}
        onClickCapture={onBoxClickCapture}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: renderedW,
          height: renderedH,
          // Same hairline edge as ScaledStage (standard templates) so the
          // custom canvas reads as a canvas too.
          boxShadow: STAGE_EDGE_SHADOW,
          ['--cs-scale' as string]: scale,
        }}
      >
        {renderCanvas(scale)}
        <CustomSizeResizeHandles
          width={width}
          height={height}
          scale={scale}
          snapToPresets={snapToPresets}
          lockAspect={lockAspect}
          onResizeStart={() => {
            frozenScale.current = fitScale
            setDragging(true)
            onResizeStart()
          }}
          onResize={onResize}
          onResizeEnd={() => setDragging(false)}
        />
      </div>
    </div>
  )
}
