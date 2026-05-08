'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot category registry — sibling of ContentRegistry / SizeRegistry.
 *
 * Exposes the category options (e.g. solution categories), the active
 * value, and a setter to a `category`-bound editable slot. EditbarCategory
 * reads from this so the contextual toolbar can render a dropdown without
 * each adapter wiring it up by prop drilling.
 */

export type CategoryOption = {
  value: string
  label: string
  /** Optional hex/CSS color associated with the option (e.g. solution color). */
  color?: string
}

export type SlotCategory = {
  path: string
  options: CategoryOption[]
  value: string
  set: (next: string) => void
}

const Ctx = createContext<SlotCategory[]>([])

export function CategoryRegistryProvider({
  categories,
  children,
}: {
  categories: SlotCategory[]
  children: ReactNode
}) {
  const value = useMemo(() => categories, [categories])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotCategory(path: string | null | undefined): SlotCategory | undefined {
  const categories = useContext(Ctx)
  if (!path) return undefined
  return categories.find((c) => c.path === path)
}
