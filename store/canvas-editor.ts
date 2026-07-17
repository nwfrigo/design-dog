import { create } from 'zustand'
import type { Hover, Selection } from '@/components/canvas-editor/types'

interface CanvasEditorState {
  selection: Selection | null
  hover: Hover
  editingPath: string | null
  /** Active page for multi-page templates (1-based). 1 for single-page
   *  templates. Ephemeral editor UI state — which page is currently "on
   *  stage." Content lives in the main store; this only tracks the view. */
  currentStagePage: number
  setSelection: (selection: Selection | null) => void
  setHover: (hover: Hover) => void
  setEditingPath: (path: string | null) => void
  clearSelection: () => void
  /** Switch the active page. Clears selection + inline-edit state so a
   *  stale selection ring / editor doesn't trail across the page swap. */
  setCurrentStagePage: (page: number) => void
}

export const useCanvasEditorStore = create<CanvasEditorState>((set) => ({
  selection: null,
  hover: null,
  editingPath: null,
  currentStagePage: 1,
  setSelection: (selection) => set({ selection }),
  setHover: (hover) => set({ hover }),
  setEditingPath: (editingPath) => set({ editingPath }),
  clearSelection: () => set({ selection: null }),
  setCurrentStagePage: (currentStagePage) =>
    set({ currentStagePage, selection: null, editingPath: null }),
}))
