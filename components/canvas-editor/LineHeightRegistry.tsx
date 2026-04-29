'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot line-height registry — sibling of Visibility / Size / Content.
 *
 * Templates that allow line-height adjustment on individual text slots populate
 * this with one entry per applicable slot. EditbarText reads
 * `useSlotLineHeight(path)` to drive the line-spacing slider.
 *
 * Slots without a registry entry render the line-spacing button disabled.
 */

export type SlotLineHeight = {
  path: string
  /** Current effective value, with template default already resolved. */
  value: number
  min: number
  max: number
  step: number
  set: (next: number) => void
}

const Ctx = createContext<SlotLineHeight[]>([])

export function LineHeightRegistryProvider({
  lineHeights,
  children,
}: {
  lineHeights: SlotLineHeight[]
  children: ReactNode
}) {
  const value = useMemo(() => lineHeights, [lineHeights])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotLineHeight(path: string | null | undefined): SlotLineHeight | undefined {
  const lineHeights = useContext(Ctx)
  if (!path) return undefined
  return lineHeights.find((s) => s.path === path)
}
