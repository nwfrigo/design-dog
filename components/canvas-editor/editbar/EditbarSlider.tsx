'use client'

import { useState } from 'react'
import { EditbarRoot, EDITBAR_TOKENS } from './shell'

/**
 * Slider editbar — additional popover surface (Figma: toolbar_slider, node 277:2853).
 *
 * Currently used as the line-height adjustment surface that pops up when the
 * user clicks the line-spacing icon in `<EditbarText>`. Placeholder UI only;
 * the slider value is local state and not yet wired to any store field.
 *
 * Visual: a horizontal track with a draggable circular thumb. Track is the
 * same border color as editbar dividers; thumb is brand blue (matching
 * existing canvas affordances).
 */

const TRACK_HEIGHT = 2
const THUMB_SIZE = 12
const TRACK_WIDTH = 72   // matches Figma toolbar_slider width approximation
const THUMB_COLOR = '#0080FF'  // Cority cobalt — matches the link-CTA arrow

export interface EditbarSliderProps {
  /** 0–1 normalized value. Default 0.5 (center). */
  value?: number
  onChange?: (next: number) => void
  ariaLabel?: string
}

export function EditbarSlider({
  value: controlled,
  onChange,
  ariaLabel = 'Line spacing',
}: EditbarSliderProps) {
  const [internal, setInternal] = useState(0.5)
  const value = controlled ?? internal
  const setValue = (v: number) => {
    if (controlled === undefined) setInternal(v)
    onChange?.(v)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const track = e.currentTarget
    track.setPointerCapture(e.pointerId)
    const update = (clientX: number) => {
      const rect = track.getBoundingClientRect()
      const v = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      setValue(v)
    }
    update(e.clientX)
    const move = (ev: PointerEvent) => update(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <EditbarRoot ariaLabel={ariaLabel}>
      <div
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        style={{
          position: 'relative',
          width: TRACK_WIDTH,
          height: THUMB_SIZE + 8,    // hit-area padding around the thumb
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        {/* Track */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            background: EDITBAR_TOKENS.border,
          }}
        />
        {/* Thumb */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `calc(${value * 100}% - ${THUMB_SIZE / 2}px)`,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: '50%',
            background: THUMB_COLOR,
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </EditbarRoot>
  )
}
