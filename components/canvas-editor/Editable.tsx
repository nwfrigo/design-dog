'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useCanvasMode } from './CanvasEditorProvider'
import { resolveCapabilities } from './capabilities'
import { useDraggable } from '@/lib/dnd'
import type { CapabilitySet, EditableKind } from './types'

/**
 * Drag config — when set, the slot becomes pointer-event-draggable via
 * the lib/dnd primitive. The consumer (e.g. StageBenchEditor) provides
 * the data payload droppables will receive on drop, plus the cursor-
 * follower preview ReactNode. Editable doesn't know what the slot drags
 * to (bench, trash, etc.) — that's the consumer's concern.
 */
type EditableDragConfig = {
  data: unknown
  preview: ReactNode
}

type EditableProps = {
  templateId: string
  slotKey: string
  storeKey: string
  kind: EditableKind
  capabilities?: Partial<CapabilitySet>
  /** Optional — when present, this slot can be picked up and dragged
   *  by pointer. Click and double-click still work as before; drag only
   *  activates after the pointer crosses the activation threshold. */
  drag?: EditableDragConfig
  children: ReactNode
}

export function Editable({
  templateId,
  slotKey,
  storeKey,
  kind,
  capabilities,
  drag,
  children,
}: EditableProps) {
  const mode = useCanvasMode()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const setSelection = useCanvasEditorStore((s) => s.setSelection)
  const setHover = useCanvasEditorStore((s) => s.setHover)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)

  const path = `${templateId}.${slotKey}`

  // useDraggable always fires (hooks must be called unconditionally), but
  // its `listeners` are only spread onto the wrapper when `drag` is set —
  // so clicks/double-clicks behave normally on non-draggable slots.
  //
  // previewOffset: stage blocks are typically wider than the chip preview
  // they turn into, so we override the default source-relative offset with
  // a small fixed pickup point. The cursor lands ~12px inside the chip's
  // top-left, matching how OS drag images behave — the chip stays right
  // under the cursor regardless of where in the wide source the user
  // pressed.
  const draggable = useDraggable<unknown>({
    id: path,
    data: drag?.data ?? null,
    preview: drag?.preview ?? null,
    previewOffset: { x: 12, y: 12 },
    onDragStart: () => {
      // Once a drag activates, clear the selection so the SelectionRing
      // doesn't render over the ghosted source for the duration of the drag.
      // Selection is re-set on the next mousedown if the user clicks again.
      clearSelection()
    },
  })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return

      // Deep-click semantics for nested Editables (e.g. text/image inside a
      // group): the FIRST click selects the outermost ancestor; a second
      // click while that ancestor is selected drills into the child. This
      // matches the Figma-style "click once to move, click again to enter".
      //
      // Implementation: walk up the DOM from this wrapper looking for an
      // ancestor with [data-editable-path]. If found:
      //   - ancestor not selected → bail out, let the bubbling event reach
      //     the ancestor's handler so it sets selection on itself.
      //   - ancestor already selected → stop propagation so the ancestor
      //     doesn't reselect itself; fall through to set our own selection.
      const wrapper = wrapperRef.current
      const ancestorEl = wrapper?.parentElement?.closest('[data-editable-path]') as HTMLElement | null
      const ancestorPath = ancestorEl?.getAttribute('data-editable-path') ?? null
      if (ancestorPath) {
        const currentSelection = useCanvasEditorStore.getState().selection
        const ancestorSelected =
          currentSelection?.path === ancestorPath || currentSelection?.path === path
        if (!ancestorSelected) {
          // First click: defer to the ancestor's handler.
          return
        }
        // Drilling into self: prevent the ancestor's handler from also
        // running and clobbering our selection.
        e.stopPropagation()
      }

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
    // CTA is a constrained text variant (capabilities.ts marks it canEditText),
    // so it shares the double-click-to-edit affordance with regular text.
    if (kind !== 'text' && kind !== 'cta') return
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

  // Compose ref: wrapperRef for selection bounds, draggable.setNodeRef for
  // pointer event measurement. Both point at the same DOM element.
  const setRef = (el: HTMLDivElement | null) => {
    wrapperRef.current = el
    if (drag) draggable.setNodeRef(el)
  }

  return (
    <div
      ref={setRef}
      style={{
        display: 'contents',
      }}
      data-editable-path={path}
      data-editable-kind={kind}
      data-editable-dragging={drag && draggable.isDragging ? 'true' : undefined}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...(drag ? draggable.listeners : {})}
    >
      {children}
    </div>
  )
}
