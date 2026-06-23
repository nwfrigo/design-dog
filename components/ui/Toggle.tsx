'use client'

/**
 * Toggle — global boolean on/off switch (design-system primitive, Figma 367:355).
 *
 * Two size tiers: `md` (32×18, knob 14, radius sm/xs) and `lg` (42×24, knob 18,
 * radius md/sm — the legacy size). The track is dark (`surface-inverse`) when on
 * and light (`surface-primary`) when off; the knob (`surface-secondary`) slides
 * left→right and carries a hairline border in the off state. Hairline
 * `line-subtle` border on the track always.
 *
 * Controlled boolean API. For a two-VALUE choice (e.g. Button/Link), map the
 * value to a boolean at the call site and render the labels alongside.
 */

export interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  /** `md` (default, 32×18) or `lg` (legacy, 42×24). */
  size?: 'md' | 'lg'
  ariaLabel?: string
}

const SIZES = {
  md: { track: 'w-8 h-[18px] rounded-[4px]', knob: 14, inset: 1.5, knobRadius: 'rounded-[2px]' },
  lg: { track: 'w-[42px] h-6 rounded-[6px]', knob: 18, inset: 2.5, knobRadius: 'rounded-[4px]' },
} as const

export function Toggle({ checked, onChange, disabled, size = 'md', ariaLabel }: ToggleProps) {
  const s = SIZES[size]
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onChange(!checked)}
      className={[
        'relative shrink-0 p-0 m-0 border-[0.5px] border-line-subtle transition-colors',
        s.track,
        checked ? 'bg-surface-inverse' : 'bg-surface-primary',
        'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'absolute bg-surface-secondary',
          s.knobRadius,
          checked ? '' : 'border-[0.5px] border-line-subtle',
        ].join(' ')}
        style={{
          width: s.knob,
          height: s.knob,
          top: s.inset,
          left: checked ? 'auto' : s.inset,
          right: checked ? s.inset : 'auto',
          transition: 'left 140ms cubic-bezier(0.2, 0.8, 0.2, 1), right 140ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
    </button>
  )
}
