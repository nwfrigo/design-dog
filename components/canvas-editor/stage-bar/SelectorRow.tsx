'use client'

import { type ReactNode } from 'react'

/**
 * SelectorRow — labeled wrapper for a SelectorPrimitive (or any small atom)
 * in the Stage Bar's vertical control rail.
 *
 * Visual contract (matches Figma node 323:2185):
 *   - Horizontal flex, gap spacing/xl (16px)
 *   - Label: Roboto Mono 12px UPPERCASE, content/secondary
 *   - Slot on the right for the primitive
 *
 * Label-column alignment across stacked rows is the parent's concern (Stage Bar
 * uses a grid). This component just lays out one row.
 */

export interface SelectorRowProps {
  label: string
  children: ReactNode
}

export function SelectorRow({ label, children }: SelectorRowProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
        {label}
      </span>
      {children}
    </div>
  )
}
