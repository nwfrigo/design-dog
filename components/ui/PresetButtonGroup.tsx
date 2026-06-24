'use client'

import { type LucideIcon } from 'lucide-react'

/**
 * PresetChip — small secondary-style chip button (design-system atom).
 *
 * Mono uppercase 12px, hairline `btn-secondary-border`, `btn-secondary` fill,
 * radius/sm. Optional leading lucide icon (12px) and disabled state, so it
 * covers both quick-apply chips (e.g. "1:1") and small labeled actions (e.g.
 * an UNDO button). `active` rings the currently-applied preset.
 */

export interface PresetChipProps {
  label: string
  onClick?: () => void
  icon?: LucideIcon
  active?: boolean
  disabled?: boolean
  /** `md` (default): 12px text, 8/10px padding. `sm`: the Figma `secondary-small`
   *  tier — 8px text, 6px padding, 8px icon (used in the image modal). */
  size?: 'md' | 'sm'
}

export function PresetChip({ label, onClick, icon: Icon, active, disabled, size = 'md' }: PresetChipProps) {
  const sm = size === 'sm'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-sm',
        sm ? 'p-[6px] text-[8px]' : 'px-2 py-[10px] text-[12px]',
        'border-[0.5px] border-btn-secondary-border',
        // Text uses content-secondary to match the action-bar buttons (Preview /
        // Add to Queue / Export), not the darker btn-secondary-text.
        'bg-btn-secondary text-content-secondary',
        'font-mono uppercase whitespace-nowrap leading-none',
        'transition-colors hover:bg-btn-secondary-hover',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active ? 'ring-1 ring-content-primary' : '',
      ].join(' ')}
    >
      {Icon && <Icon size={sm ? 8 : 12} className="shrink-0" />}
      {label}
    </button>
  )
}

/**
 * PresetButtonGroup — small secondary-style chips arranged in a flow.
 *
 * Used by the image editor's "Adjustment Presets" section. Composes PresetChip.
 * Layout wraps freely — chip lengths vary, so flex-wrap + baseline gap is robust
 * to label changes without a fixed grid.
 */

export interface PresetOption {
  id: string
  label: string
  onClick?: () => void
  /** Mark a preset as the currently-applied one. */
  active?: boolean
}

export interface PresetButtonGroupProps {
  presets: PresetOption[]
  /** Optional section header rendered above the chips. */
  title?: string
  /** Chip size tier — forwarded to each PresetChip. */
  size?: 'md' | 'sm'
}

export function PresetButtonGroup({ presets, title, size = 'md' }: PresetButtonGroupProps) {
  return (
    <div className="flex flex-col gap-[17px] w-full">
      {title && (
        <span className="font-mono text-[12px] uppercase text-content-primary">
          {title}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <PresetChip
            key={preset.id}
            label={preset.label}
            onClick={preset.onClick}
            active={preset.active}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}
