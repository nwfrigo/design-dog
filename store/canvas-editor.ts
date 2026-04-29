import { create } from 'zustand'
import type { Hover, Selection } from '@/components/canvas-editor/types'

interface CanvasEditorState {
  selection: Selection | null
  hover: Hover
  editingPath: string | null
  setSelection: (selection: Selection | null) => void
  setHover: (hover: Hover) => void
  setEditingPath: (path: string | null) => void
  clearSelection: () => void
}

export const useCanvasEditorStore = create<CanvasEditorState>((set) => ({
  selection: null,
  hover: null,
  editingPath: null,
  setSelection: (selection) => set({ selection }),
  setHover: (hover) => set({ hover }),
  setEditingPath: (editingPath) => set({ editingPath }),
  clearSelection: () => set({ selection: null }),
}))
