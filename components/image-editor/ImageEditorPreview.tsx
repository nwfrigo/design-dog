'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { filtersToCss, NEUTRAL_FILTERS, type ImageFilters } from '@/lib/image-filters'

/**
 * ImageEditorPreview — the 490×490 image preview with crop overlay.
 *
 * Visual structure (Figma 371:816 / 371:808):
 *   - 490×490 outer container with hairline border, line-subtle, radius-md.
 *   - Inner image area: image rendered at its cover-fit scale × zoom,
 *     overflowing the outer container as needed (clipped by the outer
 *     border). Pan moves the image inside this clipping window.
 *   - Scrim overlay outside a centered dashed-rectangle "frame" that
 *     represents the exported visible region. The frame's aspect comes
 *     from `frameWidth / frameHeight` props (template-specific).
 *
 * Math notes:
 *   - Pan units are -50..+50 in each axis, matching the existing
 *     ImageCropModal contract so this component is a drop-in replacement
 *     for that logic. Templates already serialize position in these units
 *     via `objectPosition: '${50 - x}% ${50 - y}%'`.
 *   - Cover-fit scale = max(frame.w / img.naturalW, frame.h / img.naturalH).
 *     Image displays at coverScale × zoom × displayScale, where displayScale
 *     fits the (image-at-zoom) into the 490×490 viewport with margin.
 *
 * Drag behavior is identical to current ImageCropModal: drag the image to
 * indicate the part you want to keep visible. position.x decreases as you
 * drag right (visually the dashed frame moves right; the underlying image
 * stays centered in the viewport). Preserved verbatim from current app.
 */

const PREVIEW_SIZE = 490
const PREVIEW_PADDING = 60 // breathing room so the frame doesn't kiss the outer edge

export interface ImageEditorPreviewProps {
  imageSrc: string
  /** Template's export frame width — drives the dashed crop rect aspect. */
  frameWidth: number
  /** Template's export frame height. */
  frameHeight: number
  position: { x: number; y: number }
  zoom: number
  onPositionChange: (next: { x: number; y: number }) => void
  /** Exposure / Contrast / Saturation filter values. Defaults to neutral
   *  (no-op CSS filter) when omitted. */
  filters?: ImageFilters
}

export function ImageEditorPreview({
  imageSrc,
  frameWidth,
  frameHeight,
  position,
  zoom,
  onPositionChange,
  filters = NEUTRAL_FILTERS,
}: ImageEditorPreviewProps) {
  const filterCss = filtersToCss(filters)
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  // Load natural image dimensions.
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageSrc
  }, [imageSrc])

  // Compute display geometry. Image scales to cover-fit the frame at zoom=1,
  // then by `zoom` on top of that; then everything scales to fit the 490
  // viewport with PREVIEW_PADDING of margin around the framed area.
  const display = (() => {
    if (!imageDims) return null
    const coverScale = Math.max(frameWidth / imageDims.w, frameHeight / imageDims.h)
    const imgAtZoomW = imageDims.w * coverScale * zoom
    const imgAtZoomH = imageDims.h * coverScale * zoom
    const displayScale = Math.min(
      (PREVIEW_SIZE - PREVIEW_PADDING) / imgAtZoomW,
      (PREVIEW_SIZE - PREVIEW_PADDING) / imgAtZoomH,
      1,
    )
    return {
      imageW: imgAtZoomW * displayScale,
      imageH: imgAtZoomH * displayScale,
      frameW: frameWidth * displayScale,
      frameH: frameHeight * displayScale,
    }
  })()

  // Pixel overflow each side of the frame — used both for scrim sizing and
  // for translating pan units (-50..+50) into pixel offsets.
  const overflow = display
    ? {
        x: Math.max(0, (display.imageW - display.frameW) / 2),
        y: Math.max(0, (display.imageH - display.frameH) / 2),
      }
    : { x: 0, y: 0 }

  const maxPan = { x: overflow.x > 0 ? 50 : 0, y: overflow.y > 0 ? 50 : 0 }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !display) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      // pixel → position-unit conversion (50 units == full overflow).
      const dPosX = overflow.x > 0 ? (dx / overflow.x) * 50 : 0
      const dPosY = overflow.y > 0 ? (dy / overflow.y) * 50 : 0
      const nextX = Math.max(-maxPan.x, Math.min(maxPan.x, position.x - dPosX))
      const nextY = Math.max(-maxPan.y, Math.min(maxPan.y, position.y - dPosY))
      onPositionChange({ x: nextX, y: nextY })
      dragStart.current = { x: e.clientX, y: e.clientY }
    },
    [isDragging, display, overflow.x, overflow.y, maxPan.x, maxPan.y, position.x, position.y, onPositionChange],
  )

  const stopDrag = useCallback(() => setIsDragging(false), [])

  // Frame translation in display pixels — the image stays centered; the
  // frame slides over it. Matches existing ImageCropModal visual semantics.
  const frameOffset = display
    ? {
        x: (position.x / 50) * overflow.x,
        y: (position.y / 50) * overflow.y,
      }
    : { x: 0, y: 0 }

  const containerStyle: CSSProperties = {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      className="relative flex-shrink-0 rounded-md border-[0.5px] border-line-subtle overflow-hidden bg-surface-tertiary"
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {display && imageDims ? (
        <>
          {/* Image — centered, dragged by mouse. */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute left-1/2 top-1/2"
            style={{
              width: display.imageW,
              height: display.imageH,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none"
              style={filterCss ? { filter: filterCss } : undefined}
            />
          </div>

          {/* Scrim — 4 panels around the dashed frame so the frame's
           *  interior stays bright while everything outside dims. */}
          <Scrim
            previewSize={PREVIEW_SIZE}
            frameW={display.frameW}
            frameH={display.frameH}
            offsetX={-frameOffset.x}
            offsetY={-frameOffset.y}
          />

          {/* Dashed frame border. */}
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none border border-dashed border-content-primary"
            style={{
              width: display.frameW,
              height: display.frameH,
              transform: `translate(calc(-50% - ${frameOffset.x}px), calc(-50% - ${frameOffset.y}px))`,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-content-secondary font-mono text-[12px] uppercase">
          loading…
        </div>
      )}
    </div>
  )
}

/**
 * Four-panel scrim around the dashed crop frame. The frame center is
 * offset by (offsetX, offsetY) in display pixels from the preview center.
 */
function Scrim({
  previewSize,
  frameW,
  frameH,
  offsetX,
  offsetY,
}: {
  previewSize: number
  frameW: number
  frameH: number
  offsetX: number
  offsetY: number
}) {
  const frameLeft = (previewSize - frameW) / 2 + offsetX
  const frameTop = (previewSize - frameH) / 2 + offsetY
  const frameRight = frameLeft + frameW
  const frameBottom = frameTop + frameH
  const scrim = 'absolute pointer-events-none bg-black/55'
  return (
    <>
      <div className={scrim} style={{ left: 0, top: 0, right: 0, height: Math.max(0, frameTop) }} />
      <div
        className={scrim}
        style={{ left: 0, bottom: 0, right: 0, height: Math.max(0, previewSize - frameBottom) }}
      />
      <div
        className={scrim}
        style={{ left: 0, top: frameTop, width: Math.max(0, frameLeft), height: frameH }}
      />
      <div
        className={scrim}
        style={{ right: 0, top: frameTop, width: Math.max(0, previewSize - frameRight), height: frameH }}
      />
    </>
  )
}
