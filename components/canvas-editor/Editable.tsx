'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useCanvasMode } from './CanvasEditorProvider'
import { resolveCapabilities } from './capabilities'
import type { CapabilitySet, EditableKind } from './types'

type EditableProps = {
  templateId: string
  slotKey: string
  storeKey: string
  kind: EditableKind
  capabilities?: Partial<CapabilitySet>
  children: ReactNode
}

export function Editable({
  templateId,
  slotKey,
  storeKey,
  kind,
  capabilities,
  children,
}: EditableProps) {
  const mode = useCanvasMode()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const setSelection = useCanvasEditorStore((s) => s.setSelection)
  const setHover = useCanvasEditorStore((s) => s.setHover)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)

  const path = `${templateId}.${slotKey}`

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      const child = wrapperRef.current?.firstElementChild as HTMLElement | null
      const bounds = child?.getBoundingClientRect() ?? null
      setSelection({
        path,
        kind,
        templateId,
        storeKey,
        capabilities: resolveCapabilities(kind, capabilities),
        bounds,
      })
      // If editing a *different* slot, exit that edit mode. Clicks within the currently-edited slot
      // (e.g., positioning the cursor inside the Tiptap editor) must not exit edit mode.
      const currentEditingPath = useCanvasEditorStore.getState().editingPath
      if (currentEditingPath && currentEditingPath !== path) {
        setEditingPath(null)
      }
    },
    [path, kind, templateId, storeKey, capabilities, setSelection, setEditingPath],
  )

  const handleDoubleClick = useCallback(() => {
    if (kind !== 'text') return
    setEditingPath(path)
  }, [path, kind, setEditingPath])

  const handleEnter = useCallback(() => {
    const child = wrapperRef.current?.firstElementChild as HTMLElement | null
    setHover({ path, kind, bounds: child?.getBoundingClientRect() ?? null })
  }, [path, kind, setHover])
  const handleLeave = useCallback(() => setHover(null), [setHover])

  if (mode === 'export') {
    return <>{children}</>
  }

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-editable-path={path}
      data-editable-kind={kind}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  )
}
