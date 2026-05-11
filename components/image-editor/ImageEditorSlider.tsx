'use client'

import { useId } from 'react'

/**
 * ImageEditorSlider — image-editor's slider primitive.
 *
 * Two visual variants (Figma 371:964 / 371:869):
 *   - 'bordered' — slider sits inside a surface-tertiary chip with a
 *     line-subtle hairline border. Used for the Zoom slider (which is the
 *     primary control, visually distinguished from the filter row).
 *   - 'bare'     — slider line + thumb directly inline, no chip. Used for
 *     Exposure / Contrast / Saturation (and any future filter sliders).
 *
 * Both render the same underlying <input type="range">; the variant only
 * affects the surrounding chrome. Width is 184px to match the Figma
 * `image_editor_slider` width.
 *
 * Track + thumb styling lives in app/globals.css (the .image-editor-slider
 * class chain) so we don't fight Tailwind on -webkit-slider-thumb / etc.
 * across browsers.
 */

export interface ImageEditorSliderProps {
  value: number
  onChange: (next: number) => void
  min: number
  max: number
  step: number
  /** Default 'bare'. */
  variant?: 'bordered' | 'bare'
  ariaLabel: string
  disabled?: boolean
}

export function ImageEditorSlider({
  value,
  onChange,
  min,
  max,
  step,
  variant = 'bare',
  ariaLabel,
  disabled = false,
}: ImageEditorSliderProps) {
  const id = useId()
  const trackClass =
    variant === 'bordered'
      ? 'h-9 w-[184px] flex items-center px-3 rounded-sm border border-line-subtle/50 bg-surface-tertiary'
      : 'h-9 w-[184px] flex items-center px-3'

  return (
    <div className={trackClass}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        aria-label={ariaLabel}
        className="image-editor-slider w-full"
      />
    </div>
  )
}
