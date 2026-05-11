'use client'

import { type ReactNode } from 'react'

/**
 * ImageEditButton — dashed-border action tile.
 *
 * Used for "Change Image" / "Create Image" pairs in the image editor, and
 * potentially for any other "upload / select" affordance in the app
 * (asset placeholder slots, empty-state cards, etc.).
 *
 * Visual: 129×80, dashed border, surface-tertiary background, icon
 * centered above an UPPERCASE mono label. Disabled state ghosts the whole
 * tile.
 *
 * Sizing is fixed by default to match the Figma component (image_edit_button,
 * Figma 373:400). Future overrides can extend via a `size` prop if needed.
 */

export interface ImageEditButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  /** Override the default tile dimensions. The button's internal content
   *  (icon centered above label) is layout-agnostic — any sizing classes
   *  work. Default 'h-20 w-[129px]' matches the image editor's
   *  Change/Create row. */
  className?: string
  /** Forward additional props onto the underlying <button> — used for
   *  drag-and-drop receivers (onDrop / onDragOver) when the tile doubles
   *  as a file-drop target. */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export function ImageEditButton({
  icon,
  label,
  onClick,
  disabled = false,
  className = 'h-20 w-[129px]',
  buttonProps,
}: ImageEditButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
      className={[
        className,
        'flex-shrink-0',
        'flex flex-col items-center justify-center gap-1',
        'rounded-md border border-dashed border-line-subtle',
        'bg-surface-tertiary',
        'transition-colors',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-surface-primary cursor-pointer',
      ].join(' ')}
    >
      <span className="block w-[18px] h-[18px] text-content-primary">
        {icon}
      </span>
      <span className="font-mono text-[12px] uppercase text-content-primary leading-none">
        {label}
      </span>
    </button>
  )
}
