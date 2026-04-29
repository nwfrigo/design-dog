'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot font-size registry — sibling of VisibilityRegistry.
 *
 * Templates that allow font-size adjustment on individual text slots populate
 * this with one entry per sizable slot. EditbarText reads `useSlotSize(path)`
 * to wire its A↑ / A↓ buttons.
 *
 * Slots without a registry entry render the buttons disabled (template doesn't
 * support font-size adjustment for that slot).
 */

export type SlotSize = {
  path: string
  /** Current effective value, with template default already resolved if user hasn't overridden. */
  value: number
  min: number
  max: number
  step: number
  set: (next: number) => void
}

const Ctx = createContext<SlotSize[]>([])

export function SizeRegistryProvider({
  sizes,
  children,
}: {
  sizes: SlotSize[]
  children: ReactNode
}) {
  const value = useMemo(() => sizes, [sizes])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotSize(path: string | null | undefined): SlotSize | undefined {
  const sizes = useContext(Ctx)
  if (!path) return undefined
  return sizes.find((s) => s.path === path)
}
