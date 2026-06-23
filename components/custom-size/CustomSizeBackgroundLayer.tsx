'use client'

import { useState } from 'react'
import { ImageUp } from 'lucide-react'
import { BackgroundImageModal } from './BackgroundImageModal'
import type { ImageSlotSettings } from '@/lib/image-filters'
import type { CustomSizeOverlay } from '@/lib/custom-size/document'

/**
 * CustomSizeBackgroundLayer — the image-led entry point.
 *
 * Rendered over the canvas only in background (image-led) mode. Shows a
 * canvas-level contextual editbar at the top-left on hover (via the parent's
 * `group`), with a single "Change background" button that opens the
 * BackgroundImageModal. Every other control (change/create image, filters,
 * overlay) lives inside that modal, so this bar stays a one-button entry point.
 *
 * Lives outside the factory so the shared editor stays untouched; it owns its
 * own modal-open state and is handed the doc-backed bindings via props.
 */

export interface CustomSizeBackgroundLayerProps {
  imageSrc: string
  frameWidth: number
  frameHeight: number
  settings: ImageSlotSettings
  onSettingsChange: (settings: ImageSlotSettings) => void
  onImageChange: (url: string) => void
  overlay: CustomSizeOverlay
  onOverlayChange: (next: CustomSizeOverlay) => void
}

export function CustomSizeBackgroundLayer({
  imageSrc,
  frameWidth,
  frameHeight,
  settings,
  onSettingsChange,
  onImageChange,
  overlay,
  onOverlayChange,
}: CustomSizeBackgroundLayerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          'absolute top-3 left-3 z-10',
          'inline-flex items-center gap-2 h-9 px-3',
          'bg-surface-primary border-[0.5px] border-line-subtle rounded-md',
          'shadow-[0_var(--elevation-md-y)_var(--elevation-md-blur)_var(--elevation-md-color)]',
          'font-mono text-[12px] uppercase text-content-primary whitespace-nowrap',
          // Hidden until the canvas (parent `group`) is hovered.
          'opacity-0 pointer-events-none transition-opacity',
          'group-hover:opacity-100 group-hover:pointer-events-auto',
          'hover:bg-interactive-hover',
        ].join(' ')}
      >
        <ImageUp size={14} className="shrink-0" />
        Change background
      </button>

      <BackgroundImageModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageSrc={imageSrc}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        initialSettings={settings}
        onSettingsChange={onSettingsChange}
        onImageChange={onImageChange}
        overlay={overlay}
        onOverlayChange={onOverlayChange}
      />
    </>
  )
}
