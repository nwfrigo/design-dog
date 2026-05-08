'use client'

import { EDITBAR_TOKENS } from './shell'

/**
 * Toggle — small two-state switch (Figma node 367:355).
 *
 * 48×24 surface with a 24×24 thumb that slides left or right. Built for
 * inline use inside toolbars (e.g. EditbarCta's Button/Link choice) but
 * generic — accepts any pair of values via `options` and a `value` /
 * `onChange` controlled API.
 *
 * Visuals are theme-aware via shell tokens. The track uses a softer
 * `content-tertiary` so it reads as background; the thumb uses
 * `line-focus` for clear contrast against either theme.
 */

export interface ToggleOption<T extends string> {
  value: T
  label: string
}

export interface ToggleProps<T extends string> {
  value: T
  onChange: (next: T) => void
  /** Two options. The first is the "left" position; the second the "right". */
  options: readonly [ToggleOption<T>, ToggleOption<T>]
  ariaLabel?: string
}

const TRACK_WIDTH = 48
const TRACK_HEIGHT = 24
const THUMB_SIZE = 24

export function Toggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: ToggleProps<T>) {
  const [left, right] = options
  const isRight = value === right.value

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isRight}
      aria-label={ariaLabel ?? `${left.label} or ${right.label}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onChange(isRight ? left.value : right.value)}
      style={{
        position: 'relative',
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        background: 'rgb(var(--content-tertiary))',
        border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
        borderRadius: EDITBAR_TOKENS.radius,
        padding: 0,
        cursor: 'pointer',
        flexShrink: 0,
        // Squash any default button styles
        margin: 0,
        font: 'inherit',
        // Smooth thumb slide
        transition: 'background 120ms',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: -EDITBAR_TOKENS.borderThin,
          // Thumb sits flush with the track edges (1px overlap on the
          // active side, matching Figma's hairline pattern).
          [isRight ? 'right' : 'left']: -EDITBAR_TOKENS.borderThin,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          background: 'rgb(var(--line-focus))',
          borderRadius: EDITBAR_TOKENS.radius,
          transition: 'left 140ms cubic-bezier(0.2, 0.8, 0.2, 1), right 140ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
    </button>
  )
}
