'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type SlotVisibility = {
  path: string
  label: string
  iconKey?: 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta' | 'generic'
  isHidden: boolean
  hide: () => void
  show: () => void
}

const Ctx = createContext<SlotVisibility[]>([])

export function VisibilityRegistryProvider({
  slots,
  children,
}: {
  slots: SlotVisibility[]
  children: ReactNode
}) {
  const value = useMemo(() => slots, [slots])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useVisibilitySlots(): SlotVisibility[] {
  return useContext(Ctx)
}

export function useSlotVisibility(path: string | null | undefined): SlotVisibility | undefined {
  const slots = useContext(Ctx)
  if (!path) return undefined
  return slots.find((s) => s.path === path)
}

export const SLOT_DRAG_MIME = 'application/x-canvas-slot'
