'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot image registry — sibling of CategoryRegistry / ContentRegistry.
 *
 * Exposes the action handlers a selected `image` slot wants the contextual
 * toolbar to fire. Adapters own the modal state (image library, crop) and
 * provide bound handlers per slot. EditbarImage reads handlers via
 * `useSlotImage(path)` and hides any button whose handler is absent.
 */

export type SlotImage = {
  path: string
  /** Open the change-image flow (library / file picker). */
  onChange: () => void
  /** Open the crop / position+zoom flow. Omit to hide the edit button. */
  onEdit?: () => void
  /** Open the AI-generate flow. Omit to hide the generate button. */
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
