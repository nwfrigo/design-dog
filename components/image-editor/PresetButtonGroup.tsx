'use client'

/**
 * PresetButtonGroup — small secondary-style chips arranged in a flow.
 *
 * Used by the image editor's "Adjustment Presets" section. The buttons
 * are mono uppercase 12px, padded 8px/10px, surface-secondary background
 * with a hairline line-subtle border.
 *
 * Layout: wraps freely — Figma renders 2×2 today but the chip lengths vary
 * ("Lighten" is much shorter than "Hi-contrast light"), so flex-wrap +
 * baseline gap is robust to label changes without a fixed grid.
 *
 * Reusable for any "small preset / quick action" grid (e.g. typography
 * presets, color-style presets in the future stage bar).
 */

export interface PresetOption {
  id: string
  label: string
  onClick?: () => void
  /** Mark a preset as the currently-applied one. Future: visual highlight. */
  active?: boolean
}

export interface PresetButtonGroupProps {
  presets: PresetOption[]
  /** Optional section header rendered above the chips. */
  title?: string
}

export function PresetButtonGroup({ presets, title }: PresetButtonGroupProps) {
  return (
    <div className="flex flex-col gap-[17px] w-full">
      {title && (
        <span className="font-mono text-[12px] uppercase text-content-primary">
          {title}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={preset.onClick}
            className={[
              'flex items-center justify-center',
              'px-2 py-[10px] rounded-sm',
              'border-[0.5px] border-btn-secondary-border',
              'bg-btn-secondary text-btn-secondary-text',
              'font-mono text-[12px] uppercase whitespace-nowrap leading-none',
              'transition-colors',
              'hover:bg-btn-secondary-hover',
              preset.active ? 'ring-1 ring-content-primary' : '',
            ].join(' ')}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
