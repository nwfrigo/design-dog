'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'

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
  /** Optional ref on the bench column's <aside>. Lets the consumer wire
   *  the bench as a drop target (useDroppable.setNodeRef) without the
   *  shell needing to know about DnD. */
  benchRef?: Ref<HTMLElement>
}

export function StageBenchShell({
  header,
  bench,
  stageBar,
  actionRow,
  children,
  benchRef,
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
      <div className="flex-1 flex items-start py-12 px-12">
        {/* The cluster fills the viewport's available width with `w-full`
         * so `<main>` (flex-1) has a real parent width to flex against.
         * Bench + stageBar stay fixed-width via flex-shrink-0; main
         * uses min-w-0 so flex can actually shrink it below its
         * intrinsic content width — that shrinkage is what gives the
         * ScaledStage's parent.clientWidth a value smaller than the
         * template's intrinsic dims, which is what drives the scale. */}
        <div className="flex items-start gap-12 w-full">
          {/* self-stretch so the bench column matches the height of the
           * tallest sibling (main column = stage + action row). Without
           * stretch, an empty bench has 0 height — fine visually, but
           * drag-and-drop hit-testing via elementFromPoint would never
           * land on it, so a stage→bench drop would silently fail. */}
          <aside ref={benchRef} className="self-stretch w-[200px] flex-shrink-0 flex flex-col items-end gap-3">
            {bench}
          </aside>

          <main className="flex-1 min-w-0 flex flex-col items-center gap-12">
            <ScaledStage>{children}</ScaledStage>
            <div>{actionRow}</div>
          </main>

          <aside className="w-[240px] flex-shrink-0 flex flex-col gap-4">
            {stageBar}
          </aside>
        </div>
      </div>
    </div>
  )
}

/**
 * ScaledStage — keeps the template within the viewport.
 *
 * Templates render at intrinsic pixel dimensions (1200×628 for socials,
 * 800×450 for press-release, etc). On a small laptop viewport the
 * larger ones overflow the stage column and push the bench + stage-bar
 * off-screen.
 *
 * Strategy:
 *  - Wrap the stage child in an outer measurement box.
 *  - On mount and every viewport resize, read the available width from
 *    the box's parent (the centered <main>'s available width) and the
 *    stage's intrinsic width from its DOM node (offsetWidth ignores
 *    transforms, so it returns the un-scaled value).
 *  - Compute scale = min(1, available / intrinsic). 1 means "fits";
 *    anything less is the shrink factor.
 *  - Apply `transform: scale(scale)` to a positioned inner wrapper, and
 *    set the outer wrapper's width/height to the SCALED dims so the
 *    surrounding flex layout reflects the shrunken footprint.
 *
 * The export render route is unaffected — it bypasses this shell and
 * renders the template directly at scale=1 for true-pixel output.
 */
function ScaledStage({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [stageSize, setStageSize] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const stageEl = stageRef.current?.firstElementChild as HTMLElement | null
    if (!stageEl) return
    // offsetWidth/Height read the un-transformed intrinsic size, so the
    // ratio is stable across re-renders even after we've applied a scale.
    const w = stageEl.offsetWidth
    const h = stageEl.offsetHeight
    if (!w || !h) return
    // Bail out when the measured size hasn't changed — otherwise this
    // layout effect (no deps → fires every render) churns state on
    // every render and triggers the React infinite-loop guard.
    setStageSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }))
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container || !stageSize) return
    const compute = () => {
      const parent = container.parentElement
      if (!parent) return
      const available = parent.clientWidth
      const next = Math.min(1, available / stageSize.w)
      // Round to 3 decimals so tiny sub-pixel ResizeObserver jitter
      // doesn't churn the scale.
      setScale(Math.round(next * 1000) / 1000)
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (container.parentElement) ro.observe(container.parentElement)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [stageSize])

  // Outer wrapper: takes layout space equal to the SCALED dims (so the
  // surrounding flex column knows how much room the stage uses).
  // Inner wrapper: rendered at intrinsic size, scaled visually.
  //
  // boxShadow is a hairline at the visual edge of the stage. Applied to
  // the outer (which has the post-scale dims, not transform-scaled) so
  // it renders crisp at 1 device pixel. Subtle enough to disappear
  // against dark templates; provides separation on light ones.
  const outerStyle: React.CSSProperties = stageSize
    ? {
        width: stageSize.w * scale,
        height: stageSize.h * scale,
        position: 'relative',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
      }
    : { display: 'flex', justifyContent: 'center' }

  const innerStyle: React.CSSProperties = stageSize
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: stageSize.w,
        height: stageSize.h,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }
    : {}

  return (
    <div ref={containerRef} style={outerStyle}>
      <div ref={stageRef} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
