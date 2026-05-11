'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Lightbox — generic modal shell.
 *
 * Concerns:
 *   - Portals to `document.body` so it escapes template / editor overflow.
 *   - Renders a translucent backdrop scrim (`bg-black/60`) plus a centered
 *     panel; the panel's visual chrome (bg, border, radius, padding) is the
 *     consumer's responsibility — Lightbox only owns the positioning frame
 *     and dismissal affordances.
 *   - Closes on Esc + backdrop click (when `dismissOnBackdrop` is true).
 *   - Locks body scroll while open.
 *
 * Reusable across the app — the image editor is its first consumer.
 *
 * Adding focus-trap / aria-modal:
 *   Today we set `role="dialog"` and `aria-modal="true"` but don't trap focus.
 *   When we add a second non-trivial consumer (or a11y review), promote to a
 *   focus-trap implementation here so all consumers benefit at once.
 */

export interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  /** Accessible label for the dialog. Required for a11y. */
  ariaLabel: string
  /** When true, clicking the backdrop closes the lightbox. Default true. */
  dismissOnBackdrop?: boolean
  children: ReactNode
}

export function Lightbox({
  isOpen,
  onClose,
  ariaLabel,
  dismissOnBackdrop = true,
  children,
}: LightboxProps) {
  // Esc closes. Use capture so we beat any nested handlers.
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [isOpen, onClose])

  // Body scroll lock — preserves previous overflow value so nested lightboxes
  // restore correctly when stacked.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      // z-[1100] sits above the canvas-editor portals (SelectionRing at 999,
      // ContextualToolbar at 1000). Any future portaled overlay should
      // claim its layer relative to these constants.
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60"
      onMouseDown={(e) => {
        // Only close when the click started on the backdrop itself, not on
        // a child that bubbled. Prevents accidental close mid-drag.
        if (dismissOnBackdrop && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
