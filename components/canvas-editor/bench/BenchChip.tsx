'use client'

import { type DragEvent } from 'react'
import {
  BookA, TextCursor, BookType, TextCursorInput, MousePointerClick,
  GripVertical,
  type LucideIcon,
} from 'lucide-react'

/**
 * BenchChip — a parked-slot chip in the Bench rail.
 *
 * Visual contract (matches Figma node 323:1951):
 *   - bg surface/primary, padding spacing/lg (12px), radius/md (6px)
 *   - Elevation/md drop shadow (mode-aware: light = subtle drop, dark = soft glow)
 *   - Icon (12×12) + spacing/md + UPPERCASE label (mono, 12px, content/secondary)
 *   - spacing/3xl gap, then GripVertical (16×16) on the right
 *   - Whole chip is the drag target; grip is just a visual affordance
 *
 * Presentational. Drag wiring (data-transfer, drop-target) lives in the
 * consumer (`Bench`).
 */

const KIND_ICON: Record<BenchChipKind, LucideIcon> = {
  headline: BookA,
  body: TextCursor,
  subheadline: BookType,
  eyebrow: TextCursorInput,
  button: MousePointerClick,
}

export type BenchChipKind = 'headline' | 'body' | 'subheadline' | 'eyebrow' | 'button'

export interface BenchChipProps {
  kind: BenchChipKind
  /** Optional label override. Default: capitalized kind, rendered uppercase via CSS. */
  label?: string
  /** Drag start handler. When set, the chip becomes draggable. */
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void
  /** Click handler — optional secondary affordance (e.g. focus, expand). */
  onClick?: () => void
}

export function BenchChip({ kind, label, onDragStart, onClick }: BenchChipProps) {
  const Icon = KIND_ICON[kind]
  const draggable = !!onDragStart
  const displayLabel = label ?? kind

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        // Inline to bypass Tailwind v3's box-shadow ring composition, which can
        // swallow CSS-variable shadow values. The vars themselves live in
        // globals.css and swap automatically with the dark class.
        boxShadow: '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
      }}
      className={[
        'inline-flex items-center justify-between',
        'gap-8',
        'p-3 rounded-md',
        'bg-surface-primary',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        'select-none',
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={12} className="text-content-secondary shrink-0" />
        <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
          {displayLabel}
        </span>
      </span>
      <GripVertical size={16} className="text-content-secondary shrink-0" />
    </div>
  )
}
