'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { EDITBAR_TOKENS } from './shell'

/**
 * Dropdown primitive — matches Figma node 370:608 (`dropdown`).
 *
 * Rendering:
 *  - Pill: surface-tertiary fill, hairline line-subtle border, 4px radius,
 *    chevron + uppercase mono label, gap 8px, height 28px.
 *  - Popover: same surface-primary card chrome as other editbar popovers
 *    (line-subtle border, elevation-md shadow). One row per option;
 *    rows render the same uppercase mono label. Optional color swatch on
 *    the left when an option carries `color`.
 *
 * Behavior: click-outside / Escape close. Selecting a row commits via
 * `onChange` and closes.
 */

export interface DropdownOption {
  value: string
  label: string
  /** Optional swatch color (e.g. solution category color). */
  color?: string
}

export interface DropdownProps {
  ariaLabel: string
  value: string
  options: DropdownOption[]
  onChange: (next: string) => void
  /** Optional fallback label when value isn't in options. */
  placeholder?: string
}

export function Dropdown({ ariaLabel, value, options, onChange, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Click-outside / Escape close
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const active = options.find((o) => o.value === value)
  const label = (active?.label ?? placeholder ?? value).toUpperCase()

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: EDITBAR_TOKENS.space2,
          height: 28,
          padding: '6px 8px',
          background: 'rgb(var(--surface-tertiary))',
          border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
          borderRadius: 4,
          cursor: 'pointer',
          color: EDITBAR_TOKENS.iconDefault,
          fontFamily: EDITBAR_TOKENS.fontFamily,
          fontSize: 12,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          lineHeight: 'normal',
        }}
      >
        <ChevronDown size={12} />
        <span style={{ color: EDITBAR_TOKENS.textSecondary }}>{label}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            margin: 0,
            padding: 4,
            listStyle: 'none',
            background: EDITBAR_TOKENS.bg,
            border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
            borderRadius: 4,
            boxShadow:
              '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
            minWidth: '100%',
            zIndex: 1,
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <li key={opt.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: EDITBAR_TOKENS.space2,
                    width: '100%',
                    padding: '6px 8px',
                    background: isActive ? 'rgb(var(--surface-tertiary))' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: isActive
                      ? EDITBAR_TOKENS.textPrimary
                      : EDITBAR_TOKENS.textSecondary,
                    fontFamily: EDITBAR_TOKENS.fontFamily,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    lineHeight: 'normal',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgb(var(--surface-secondary))'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {opt.color && (
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: opt.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{opt.label.toUpperCase()}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
