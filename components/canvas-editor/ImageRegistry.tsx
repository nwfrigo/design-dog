'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useCanvasEditorStore } from '@/store/canvas-editor'

/**
 * Per-slot image registry — sibling of CategoryRegistry / ContentRegistry.
 *
 * Exposes the action handlers a selected `image` slot wants to surface.
 * Adapters own the modal state (image editor lightbox) and provide bound
 * handlers per slot.
 *
 * Selection model: image-kind slots open ImageEditorModal *directly* on
 * select — no toolbar layer. `onSelect` is wired here for the adapter, and
 * `useImageSelectionEffect()` (mounted once per adapter, inside the
 * provider) watches selection and fires the matching slot's `onSelect`.
 *
 * `onChange` / `onEdit` / `onGenerate` remain on the type for any future
 * surface that wants direct action invocation (e.g. a keyboard command
 * palette). The lightbox itself receives library / generate handlers as
 * props, not via this registry.
 */

export type SlotImage = {
  path: string
  /** Fired when this slot becomes the selected slot. Adapter opens its
   *  image-editor modal here. */
  onSelect?: () => void
  /** Direct invocation of the change-image flow (library / file picker).
   *  Optional — the lightbox typically wires this internally now. */
  onChange?: () => void
  /** Direct invocation of the crop / position+zoom flow. Legacy. */
  onEdit?: () => void
  /** Direct invocation of the AI-generate flow. Legacy. */
  onGenerate?: () => void
}

const Ctx = createContext<SlotImage[]>([])

export function ImageRegistryProvider({
  images,
  children,
}: {
  images: SlotImage[]
  children: ReactNode
}) {
  const value = useMemo(() => images, [images])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotImage(path: string | null | undefined): SlotImage | undefined {
  const images = useContext(Ctx)
  if (!path) return undefined
  return images.find((i) => i.path === path)
}

/**
 * Foundation hook — mount once per adapter, inside ImageRegistryProvider.
 *
 * Watches the canvas-editor selection. When an `image`-kind selection
 * matches a slot in this provider, fires that slot's `onSelect()` and
 * then clears the underlying store selection.
 *
 * Why clear: once the lightbox opens, the modal IS the visible selection
 * state. Leaving the selection in place would also leave SelectionRing /
 * ContextualToolbar portals layered on top of the modal (they live at
 * higher z-index than the template). Clearing keeps the modal as the
 * unambiguous focus surface. The user re-clicks the image to reopen
 * after dismissing the modal — natural and matches "close = done."
 */
export function useImageSelectionEffect(): void {
  const selection = useCanvasEditorStore((s) => s.selection)
  const images = useContext(Ctx)

  useEffect(() => {
    if (!selection || selection.kind !== 'image') return
    const slot = images.find((i) => i.path === selection.path)
    if (slot?.onSelect) {
      slot.onSelect()
      // Clear AFTER onSelect so adapters that read selection.path in their
      // open handler see the right value first.
      useCanvasEditorStore.getState().clearSelection()
    }
  }, [selection, images])
}
