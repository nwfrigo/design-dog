'use client'

import { type ReactNode } from 'react'

/**
 * SliderRow — labeled slider composition (Figma `image_editor_slider_label`).
 *
 * Label (mono, uppercase, 12px, content-secondary) on the left; slider on
 * the right. Justified between, full-width inside the parent.
 *
 * Decoupled from ImageEditorSlider so the row can host other right-hand
 * controls in the future (numeric input, dropdown) without forking the
 * composition.
 */

export interface SliderRowProps {
  label: string
  children: ReactNode
}

export function SliderRow({ label, children }: SliderRowProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
        {label}
      </span>
      {children}
    </div>
  )
}
