'use client'

import { type ReactNode } from 'react'

/**
 * ActionRow — horizontal cluster of ActionButtons below the Stage.
 *
 * Visual contract (matches Figma node 323:2333):
 *   - Horizontal flex, gap spacing/md (8px)
 *   - Slot-based: consumer composes whichever ActionButtons it wants
 *
 * Note: the new design removed the prototype's 1x/2x/3x scale dropdown.
 * If scale needs to live somewhere, that's a separate decision — this row
 * stays focused on action buttons.
 */

export function ActionRow({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-2">{children}</div>
}
