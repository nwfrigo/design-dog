'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { EditableKind } from './types'

const RING_COLOR_BY_KIND: Record<EditableKind, string> = {
  text: '#3B82F6',
  cta: '#3B82F6',
  image: '#8B5CF6',
  spacer: '#EC4899',
  color: '#F59E0B',
  pill: '#10B981',
  group: '#6B7280',
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
