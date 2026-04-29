'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Per-slot content registry — sibling of VisibilityRegistry / SizeRegistry.
 *
 * Exposes the current text content of each editable slot plus a setter, and
 * declares whether the slot stores HTML (rich text) or a plain string. The
 * EditbarText toolbar uses this to apply block-level formatting (Bold/Italic)
 * when the user clicks a button without first deep-clicking into text-edit
 * mode — matching the slot-level behavior of font-size and visibility.
 */

export type SlotContent = {
  path: string
  format: 'html' | 'plain'
  value: string
  set: (next: string) => void
}

const Ctx = createContext<SlotContent[]>([])

export function ContentRegistryProvider({
  contents,
  children,
}: {
  contents: SlotContent[]
  children: ReactNode
}) {
  const value = useMemo(() => contents, [contents])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSlotContent(path: string | null | undefined): SlotContent | undefined {
  const contents = useContext(Ctx)
  if (!path) return undefined
  return contents.find((c) => c.path === path)
}
