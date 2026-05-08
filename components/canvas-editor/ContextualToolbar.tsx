'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { EditableKind } from './types'
import { EditbarText, EditbarCta, EditbarColor, EditbarImage, EditbarCategory } from './editbar'

const EDITBAR_BY_KIND: Record<EditableKind, () => ReactNode> = {
  text: () => <EditbarText />,
  cta: () => <EditbarCta />,
  // Spacers have their own drag-pill affordance on canvas — no toolbar needed.
  spacer: () => null,
  color: () => <EditbarColor />,
  image: () => <EditbarImage />,
  // Pill = category chip (solution selector). Eye-off + dropdown.
  pill: () => <EditbarCategory />,
  group: () => null,
}

const TOOLBAR_GAP = 12

export function ContextualToolbar() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || !selection || !selection.bounds) return null

  const fragment = EDITBAR_BY_KIND[selection.kind]?.()
  if (!fragment) return null

  // Position above the selection by default. Toolbar height isn't measured here
  // (kept simple); ~48px overshoot is intentional so it doesn't clip the ring.
  const top = selection.bounds.top + window.scrollY - TOOLBAR_GAP - 48
  const left = selection.bounds.left + window.scrollX

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
