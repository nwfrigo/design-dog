'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type SlotVisibility = {
  path: string
  label: string
  /** Hint that determines which BenchChip variant the bench rail renders
   *  for this slot. Open-ended string so templates can introduce their own
   *  vocabulary (e.g. 'speaker', 'category', 'image') without changing
   *  this primitive. The bench's iconKey→chipKind resolver decides how to
   *  render unknown values (falls back to the 'headline' chip). */
  iconKey?: string
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

/**
 * Legacy MIME constant for native HTML5 DnD slot transfer. The new
 * pointer-events DnD primitive (`lib/dnd`) doesn't use this — it's kept
 * around only for the legacy `<Bench />` portal and the inert
 * email-dark-gradient block in EditorScreen, both of which are dead code
 * for stage-bench templates but still compile.
 */
export const SLOT_DRAG_MIME = 'application/x-canvas-slot'
