'use client'

/**
 * PageSelector — the multi-page substrate primitive.
 *
 * A segmented pager rendered in the stage column (via the shell's
 * `aboveStage` seam) for templates that declare `pages` in their adapter
 * descriptor. One page is "on stage" at a time, so every single-canvas
 * substrate assumption still holds: one active stage, one bench reflecting
 * the current page's slots, single-element selection.
 *
 * Distinct from the header's asset tabs (which switch between separate
 * assets) — this switches between pages WITHIN one multi-page asset.
 *
 * Pure presentation: the factory owns the `currentStagePage` state and
 * clears selection / inline-edit on change (see `setCurrentStagePage`).
 */

export interface PageSelectorProps {
  /** 1-based active page. */
  value: number
  /** Number of pages. Segments render 1..count. */
  count: number
  /** Per-page labels (length === count). Falls back to "Page N". */
  labels?: string[]
  onChange: (page: number) => void
}

export function PageSelector({ value, count, labels, onChange }: PageSelectorProps) {
  return (
    <div role="tablist" aria-label="Pages" className="inline-flex items-center gap-2">
      {Array.from({ length: count }, (_, i) => {
        const page = i + 1
        const isActive = page === value
        const label = labels?.[i] ?? `Page ${page}`
        return (
          <button
            key={page}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(page)}
            // Matches the small secondary chips on /custom-size (PresetChip):
            // hairline border, secondary fill, font-mono uppercase, active ring.
            className={[
              'inline-flex items-center gap-1.5 rounded-sm px-2 py-[6px] text-[12px] leading-none',
              'border-[0.5px] border-btn-secondary-border bg-btn-secondary',
              'font-mono uppercase whitespace-nowrap transition-colors hover:bg-btn-secondary-hover',
              isActive ? 'ring-1 ring-content-primary' : '',
            ].join(' ')}
          >
            <span className="text-content-tertiary">{page}</span>
            <span className={isActive ? 'text-content-primary' : 'text-content-secondary'}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
