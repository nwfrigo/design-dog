'use client'

import { useId } from 'react'
import { type LucideIcon } from 'lucide-react'

/**
 * Field — global text/number input primitive (design-system, Figma node 531:3592).
 *
 * A compact 28px-tall input: `surface-primary` fill, hairline `line-subtle`
 * border, radius/sm. Optional leading lucide icon (12px, `content-secondary`).
 * Mono 12px value. Focus raises the border to `line-focus` (the Figma "active"
 * state). Fully controlled.
 *
 * Generic on purpose — width/height entry, or any short labeled value. Numeric
 * parsing/formatting (commas, clamps) belongs to the caller; Field just renders
 * the input and reports raw string changes.
 */

export interface FieldProps {
  value: string
  onChange: (next: string) => void
  /** Leading glyph, e.g. MoveHorizontal for a width field. */
  icon?: LucideIcon
  type?: 'text' | 'number'
  placeholder?: string
  /** Fixed width in px. Omit to size to content/parent. */
  widthPx?: number
  ariaLabel?: string
  /** Commit on blur / Enter (in addition to live onChange). */
  onCommit?: () => void
}

export function Field({
  value,
  onChange,
  icon: Icon,
  type = 'text',
  placeholder,
  widthPx,
  ariaLabel,
  onCommit,
}: FieldProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-2 h-7 px-[6px]',
        'bg-surface-primary border-[0.5px] border-line-subtle rounded-[4px]',
        'overflow-clip cursor-text',
        'focus-within:border-line-focus transition-colors',
      ].join(' ')}
      style={widthPx ? { width: widthPx } : undefined}
    >
      {Icon && <Icon size={12} className="shrink-0 text-content-secondary" />}
      <input
        id={id}
        type={type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onCommit?.()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        className={[
          'min-w-0 flex-1 bg-transparent outline-none border-none p-0 m-0',
          'font-mono text-[12px] uppercase text-content-primary',
          'text-right',
        ].join(' ')}
      />
    </label>
  )
}
