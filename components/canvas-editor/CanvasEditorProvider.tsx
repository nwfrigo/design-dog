'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { EditorMode } from './types'

const ModeContext = createContext<EditorMode>('export')

export function CanvasEditorProvider({
  mode,
  children,
}: {
  mode: EditorMode
  children: ReactNode
}) {
  useEffect(() => {
    if (mode !== 'edit') return
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-editable-path]')) return
      if (target.closest('[data-canvas-toolbar]')) return
      const store = useCanvasEditorStore.getState()
      store.clearSelection()
      store.setEditingPath(null)
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useCanvasEditorStore.getState().setEditingPath(null)
      }
    }
    window.addEventListener('mousedown', clickHandler)
    window.addEventListener('keydown', keyHandler)
    return () => {
      window.removeEventListener('mousedown', clickHandler)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [mode])

  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>
}

export function useCanvasMode(): EditorMode {
  return useContext(ModeContext)
}
