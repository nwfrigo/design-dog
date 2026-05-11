'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { EditableKind } from './types'

/**
 * Single ring color across every editable kind. Earlier iterations colored
 * by kind (purple for image, green for pill, etc.) — that turned the canvas
 * into a candy palette and worked against the "this is the active edit"
 * signal the ring is supposed to send. One blue, applied uniformly, reads
 * as a single coherent selection affordance.
 */
const RING_COLOR_BY_KIND: Record<EditableKind, string> = {
  text: '#3B82F6',
  cta: '#3B82F6',
  image: '#3B82F6',
  spacer: '#3B82F6',
  color: '#3B82F6',
  pill: '#3B82F6',
  group: '#3B82F6',
}

const PADDING = 4

function ringStyle(bounds: DOMRect, color: string, opacity: number): CSSProperties {
  return {
    position: 'absolute',
    top: bounds.top + window.scrollY - PADDING,
    left: bounds.left + window.scrollX - PADDING,
    width: bounds.width + PADDING * 2,
    height: bounds.height + PADDING * 2,
    border: `1.5px solid ${color}`,
    borderRadius: 4,
    pointerEvents: 'none',
    opacity,
    transition: 'opacity 80ms ease',
    zIndex: 999,
  }
}

export function SelectionRing() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const hover = useCanvasEditorStore((s) => s.hover)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const showHover = hover && hover.bounds && (!selection || selection.path !== hover.path)
  const showSelection = selection && selection.bounds

  return createPortal(
    <>
      {showHover && (
        <div style={ringStyle(hover!.bounds!, RING_COLOR_BY_KIND[hover!.kind], 0.5)} />
      )}
      {showSelection && (
        <div style={ringStyle(selection!.bounds!, RING_COLOR_BY_KIND[selection!.kind], 1)} />
      )}
    </>,
    document.body,
  )
}
