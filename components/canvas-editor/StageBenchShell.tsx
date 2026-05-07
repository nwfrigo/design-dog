'use client'

import { type ReactNode } from 'react'

/**
 * StageBenchShell — pure layout primitive for the new editor screen.
 *
 * Three-column body (matches Figma node 322:119):
 *   [ Bench (200px) | Stage + ActionRow (flex-1) | StageBar (240px) ]
 *
 * Above the body: a header strip (breadcrumb + add-asset button) followed by
 * a full-bleed divider line.
 *
 * Below the Stage in the center column: the ActionRow.
 *
 * 40px gutters between columns and around the Stage match the design rhythm.
 *
 * Slot-based to keep the shell agnostic. Consumers compose Bench/StageBar/
 * ActionRow content separately so the shell stays small and reusable across
 * templates.
 */

export interface StageBenchShellProps {
  header: ReactNode
  bench: ReactNode
  stageBar: ReactNode
  actionRow: ReactNode
  /** The Stage itself — the design preview + drop-zone. */
  children: ReactNode
}

export function StageBenchShell({
  header,
  bench,
  stageBar,
  actionRow,
  children,
}: StageBenchShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-primary">
      {/* Header — single horizontal divider runs across the bottom of this
       * row. Consumer renders <StageBenchTab> instances which "sit on" the
       * divider via -mb-px + matching bg, visually interrupting the line.
       * Same pattern the legacy editor uses. */}
      <div className="flex items-end px-12 pt-6 border-b border-line-subtle">
        {header}
      </div>

      {/* Body — 3-column cluster centered in the viewport. The columns
       * hug the stage at 48px on either side rather than pinning to the
       * viewport edges, so the visual rhythm stays tight regardless of
       * window width.
       *
       * Bench column has a fixed width so the layout doesn't reflow when
       * chips drain in/out of the rail. Stage Bar's content is fixed-width
       * by nature (selectors), so it doesn't need explicit sizing. */}
      <div className="flex-1 flex justify-center items-start py-12">
        <div className="flex items-start gap-12">
          <aside className="w-[200px] flex flex-col items-end gap-3">
            {bench}
          </aside>

          <main className="flex flex-col items-center gap-12">
            <div className="flex justify-center">{children}</div>
            <div>{actionRow}</div>
          </main>

          <aside className="flex flex-col gap-4">
            {stageBar}
          </aside>
        </div>
      </div>
    </div>
  )
}
