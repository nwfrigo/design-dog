'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot icon registry — sibling of ContentRegistry / CategoryRegistry.
 *
 * Exposes the current Lucide icon id + a setter for each `chip`-kind slot.
 * EditbarChip reads from this so its Replace button can open the icon
 * library and write the picked icon back, without adapters prop-drilling.
 */

export type SlotIcon = {
  path: string
  /** Current Lucide icon id (kebab-case), e.g. 'building'. */
  icon: string
  set: (next: string) => void
}

const Ctx = createContext<SlotIcon[]>([])

export function IconRegistryProvider({
  icons,
  children,
}: {
  icons: SlotIcon[]
  children: ReactNode
}) {
  const value = useMemo(() => icons, [icons])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotIcon(path: string | null | undefined): SlotIcon | undefined {
  const icons = useContext(Ctx)
  if (!path) return undefined
  return icons.find((i) => i.path === path)
}
