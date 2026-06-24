'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * ExportScaleSelect — the export resolution multiplier (1x / 2x / 3x), styled to
 * match ActionButton so it sits inline in the action row beside Export.
 *
 * Single source of truth for the scale picker: render it wherever an export
 * scale applies instead of hand-rolling the dropdown per screen. Controlled —
 * the mounting screen owns `value` (its export-scale state) and `onChange`.
 */

export interface ExportScaleSelectProps {
  value: number
  onChange: (scale: number) => void
  /** Selectable multipliers, low → high. Default 1×/2×/3×. */
  options?: number[]
}

export function ExportScaleSelect({ value, onChange, options = [1, 2, 3] }: ExportScaleSelectProps) {
  const [open, setOpen] = useState(false)

  // Close on any outside click (the toggle stops propagation so its own click
  // doesn't immediately re-close it).
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="Export resolution"
        className={[
          'inline-flex items-center gap-1.5',
          'h-7 px-2',
          'border-[0.5px] border-line-subtle rounded-[4px]',
          'bg-surface-primary text-content-secondary hover:bg-interactive-hover',
          'transition-colors',
        ].join(' ')}
      >
        <span className="font-mono text-[12px] uppercase leading-none">{value}x</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[3rem] z-20
            bg-surface-primary border-[0.5px] border-line-subtle rounded-[4px] shadow-lg overflow-hidden"
        >
          {options.map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(scale); setOpen(false) }}
              className={[
                'block w-full px-3 py-1.5 text-left',
                'font-mono text-[12px] uppercase leading-none',
                'hover:bg-interactive-hover transition-colors',
                value === scale ? 'text-content-primary' : 'text-content-secondary',
              ].join(' ')}
            >
              {scale}x
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
