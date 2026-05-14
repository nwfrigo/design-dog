'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import {
  BookA, TextCursor, BookType, TextCursorInput, MousePointerClick,
  SquareLibrary, CircleUserRound, Grid2x2X, SquareDot,
  CalendarDays, Clock,
  GripVertical,
  type LucideIcon,
} from 'lucide-react'
import { MOTION } from '@/lib/motion'

/**
 * BenchChip — a parked-slot chip in the Bench rail.
 *
 * Visual contract (matches Figma node 323:1951):
 *   - bg surface/primary, padding spacing/lg (12px), radius/md (6px)
 *   - Elevation/md drop shadow (mode-aware: light = subtle drop, dark = soft glow)
 *   - Icon (12×12) + spacing/md + UPPERCASE label (mono, 12px, content/secondary)
 *   - spacing/3xl gap, then GripVertical (16×16) on the right
 *
 * State affordances:
 *   - `isGhosting` — opacity:0, instant snap. Used by the source chip
 *     while it's the active drag (the cursor follower replaces it).
 *   - `isPreview` — opacity 0.6 with smooth fade. "Where this would land"
 *     preview at a drop target.
 *   - `isFloating` — apply the picked-up tilt without requiring `:active`.
 *     Used by the cursor-following drag preview.
 *
 * Purely presentational. Drag wiring is the consumer's responsibility —
 * the consumer wraps with `useDraggable` (from `lib/dnd`) and forwards
 * `setNodeRef` + spreads `listeners` here via the standard ref + props.
 */

const KIND_ICON: Record<BenchChipKind, LucideIcon> = {
  headline: BookA,
  body: TextCursor,
  subheadline: BookType,
  eyebrow: TextCursorInput,
  button: MousePointerClick,
  category: SquareLibrary,
  speaker: CircleUserRound,
  'grid-detail': Grid2x2X,
  'small-caption': SquareDot,
  date: CalendarDays,
  time: Clock,
}

export type BenchChipKind =
  | 'headline'
  | 'body'
  | 'subheadline'
  | 'eyebrow'
  | 'button'
  | 'category'
  | 'speaker'
  | 'grid-detail'
  | 'small-caption'
  | 'date'
  | 'time'

export interface BenchChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  kind: BenchChipKind
  /** Optional label override. Default: capitalized kind, rendered uppercase via CSS. */
  label?: string
  /** Source chip is the active drag — render invisible, layout-stable. */
  isGhosting?: boolean
  /** Render at reduced opacity as a "this is where it would land" preview. */
  isPreview?: boolean
  /** Apply the picked-up tilt without a `:active` press — used by the
   *  cursor-following drag preview. */
  isFloating?: boolean
  /** Whether the chip is interactive — when true, shows a grab cursor.
   *  When false (e.g., the floating drag preview), no cursor change. */
  draggable?: boolean
}

export const BenchChip = forwardRef<HTMLDivElement, BenchChipProps>(function BenchChip(
  {
    kind,
    label,
    isGhosting,
    isPreview,
    isFloating,
    draggable = true,
    className = '',
    style,
    ...rest
  },
  ref,
) {
  const Icon = KIND_ICON[kind]
  // Default label = kind with hyphens replaced by spaces, so 'grid-detail'
  // renders as "GRID DETAIL" (matching Figma) rather than "GRID-DETAIL".
  // Single-word kinds are unaffected.
  const displayLabel = label ?? kind.replace(/-/g, ' ')

  // Ghost: instant snap to invisible (synchronizes with the cursor follower
  // taking over). Preview: 60% opacity, soft fade. Otherwise: fully visible.
  const opacity = isGhosting ? 0 : isPreview ? 0.6 : 1
  // Compose transform (pickup tilt — see globals.css) with opacity so both
  // animate cleanly. Ghosting suppresses the opacity transition for an
  // instant snap; transform transition stays so the chip un-tilts smoothly
  // on release.
  const transition = isGhosting
    ? `transform 100ms ${MOTION.easing.out}`
    : `transform 100ms ${MOTION.easing.out}, opacity ${MOTION.duration.sm}ms ${MOTION.easing.out}`

  return (
    // Outer wrapper is the pointer target — its bounds stay stable (no
    // transform). Visual tilt lives on `.bench-chip-inner` so rotating
    // doesn't jitter the hit area mid-drag.
    <div
      ref={ref}
      className={[
        'bench-chip',
        'inline-block',
        isFloating ? 'bench-chip--floating' : '',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        'select-none',
        // Disable native browser drag of any descendant (images, links, etc.)
        // since we own drag entirely via pointer events.
        '[&_*]:pointer-events-none',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        pointerEvents: isGhosting ? 'none' : undefined,
        // Disable the browser's default touch panning while pressing the
        // chip — so a drag gesture isn't fighting page scroll.
        touchAction: draggable ? 'none' : undefined,
        ...style,
      }}
      {...rest}
    >
      <div
        className="bench-chip-inner inline-flex items-center justify-between gap-8 p-3 rounded-md bg-surface-primary"
        style={{
          opacity,
          transition,
        }}
      >
        <span className="inline-flex items-center gap-2">
          <Icon size={12} className="text-content-secondary shrink-0" />
          <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
            {displayLabel}
          </span>
        </span>
        <GripVertical size={16} className="text-content-secondary shrink-0" />
      </div>
    </div>
  )
})
