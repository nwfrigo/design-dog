'use client'

import { type ReactNode } from 'react'

/**
 * StageBenchTab — single asset tab in the editor header.
 *
 * Visual integration trick (matches the legacy editor's tab pattern):
 *   - Container row has `border-b` providing the divider line
 *   - Active tab has top/left/right borders + rounded-t + `-mb-px` to push
 *     itself down 1px so its bottom edge lands on the divider
 *   - Tab bg matches the body bg (surface-primary), which "covers" the 1px
 *     slice of the divider line underneath the tab — making it look like
 *     the divider is interrupted by a smoothly integrated tab
 *   - Inactive tabs have no border, so the divider passes cleanly behind them
 *
 * Use inside a flex container that has `border-b border-line-subtle`.
 */

export interface StageBenchTabProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

export function StageBenchTab({ active = true, onClick, children }: StageBenchTabProps) {
  const cls = active
    ? 'border-t border-l border-r border-line-subtle rounded-t-md bg-surface-primary text-content-primary -mb-px'
    : 'border-transparent text-content-secondary hover:text-content-primary'

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2.5',
        'text-sm font-medium',
        'transition-colors',
        cls,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
