'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { EditableKind } from './types'
import { EditbarText, EditbarCta, EditbarColor, EditbarCategory } from './editbar'

const EDITBAR_BY_KIND: Record<EditableKind, () => ReactNode> = {
  text: () => <EditbarText />,
  cta: () => <EditbarCta />,
  // Spacers have their own drag-pill affordance on canvas — no toolbar needed.
  spacer: () => null,
  color: () => <EditbarColor />,
  // Image selections open ImageEditorModal directly (wired by the adapter
  // via SlotImage.onSelect). No toolbar layer — the modal IS the editor.
  // The selection ring still renders so there's a visible "you're here"
  // cue before/after the modal mounts.
  image: () => null,
  // Pill = category chip (solution selector). Eye-off + dropdown.
  pill: () => <EditbarCategory />,
  group: () => null,
}

const TOOLBAR_GAP = 12
/** Approximate toolbar height — used to offset above-the-bounds anchoring. */
const TOOLBAR_HEIGHT = 48
/** Inset for image-kind toolbars that float inside the top-left of the
 *  selection (image fills typically extend to a canvas edge, leaving no
 *  room above for a Notion/Figma-style above-anchored toolbar). */
const TOOLBAR_INSET = 12

/**
 * Toolbars anchor in one of two ways:
 *  - 'above'  → 12px above the bounds (text, cta, pill, color, spacer).
 *  - 'inside' → 12px inside the bounds' top-left (image fills, full-bleed
 *               content that hugs a canvas edge).
 *
 * Adding a new EditableKind? Pick the anchor that makes sense for the
 * expected layout. Both modes use viewport coordinates so they survive
 * page scroll.
 */
const ANCHOR_BY_KIND: Record<EditableKind, 'above' | 'inside'> = {
  text: 'above',
  cta: 'above',
  spacer: 'above',
  color: 'above',
  pill: 'above',
  group: 'above',
  image: 'inside',
}

export function ContextualToolbar() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || !selection || !selection.bounds) return null

  const fragment = EDITBAR_BY_KIND[selection.kind]?.()
  if (!fragment) return null

  const anchor = ANCHOR_BY_KIND[selection.kind] ?? 'above'
  const { top: bTop, left: bLeft } = selection.bounds
  const top =
    anchor === 'inside'
      ? bTop + window.scrollY + TOOLBAR_INSET
      : bTop + window.scrollY - TOOLBAR_GAP - TOOLBAR_HEIGHT
  const left =
    anchor === 'inside'
      ? bLeft + window.scrollX + TOOLBAR_INSET
      : bLeft + window.scrollX

  return createPortal(
    <div
      data-canvas-toolbar=""
      style={{
        position: 'absolute',
        top,
        left,
        zIndex: 1000,
      }}
    >
      {fragment}
    </div>,
    document.body,
  )
}
