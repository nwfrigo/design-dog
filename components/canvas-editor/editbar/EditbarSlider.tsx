'use client'

import { useState } from 'react'
import { EditbarRoot, EDITBAR_TOKENS } from './shell'

/**
 * Slider editbar — popover surface for scalar slot controls (line-height in
 * the first use case). Track is the divider color; thumb is brand blue.
 *
 * If `min`/`max`/`step` are supplied, the slider operates in the consumer's
 * value range and snaps to step. With no range, falls back to 0–1 normalized
 * (the original Figma toolbar_slider behavior).
 *
 * `showValue` adds a monospaced numeric readout to the right of the track.
 */

const TRACK_HEIGHT = 2
const THUMB_SIZE = 12
const TRACK_WIDTH = 72
const THUMB_COLOR = '#0080FF'

export interface EditbarSliderProps {
  value?: number
  onChange?: (next: number) => void
  ariaLabel?: string
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  /** Decimal places to display when `showValue` is on. Default: infer from step. */
  valuePrecision?: number
}

function snap(value: number, min: number, step: number): number {
  return min + Math.round((value - min) / step) * step
}

function inferPrecision(step: number): number {
  const s = step.toString()
  const dot = s.indexOf('.')
  return dot < 0 ? 0 : s.length - dot - 1
}

export function EditbarSlider({
  value: controlled,
  onChange,
  ariaLabel = 'Line spacing',
  min,
  max,
  step,
  showValue = false,
  valuePrecision,
}: EditbarSliderProps) {
  const ranged = min !== undefined && max !== undefined && step !== undefined
  const lo = ranged ? min! : 0
  const hi = ranged ? max! : 1
  const stp = ranged ? step! : 0.01
  const precision = valuePrecision ?? (ranged ? inferPrecision(stp) : 2)

  const [internal, setInternal] = useState(ranged ? (lo + hi) / 2 : 0.5)
  const value = controlled ?? internal
  const setValue = (v: number) => {
    const clamped = Math.min(hi, Math.max(lo, v))
    const snapped = ranged ? Number(snap(clamped, lo, stp).toFixed(8)) : clamped
    if (controlled === undefined) setInternal(snapped)
    onChange?.(snapped)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const track = e.currentTarget
    track.setPointerCapture(e.pointerId)
    const update = (clientX: number) => {
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      setValue(lo + ratio * (hi - lo))
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

  const ratio = (value - lo) / (hi - lo)

  return (
    <EditbarRoot ariaLabel={ariaLabel}>
      <div
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        style={{
          position: 'relative',
          width: TRACK_WIDTH,
          height: THUMB_SIZE + 8,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
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
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `calc(${ratio * 100}% - ${THUMB_SIZE / 2}px)`,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: '50%',
            background: THUMB_COLOR,
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
      {showValue && (
        <span
          aria-hidden
          style={{
            fontFamily: EDITBAR_TOKENS.fontFamily,
            fontSize: EDITBAR_TOKENS.fontSize,
            color: EDITBAR_TOKENS.textPrimary,
            minWidth: 32,
            textAlign: 'right',
          }}
        >
          {value.toFixed(precision)}
        </span>
      )}
    </EditbarRoot>
  )
}
