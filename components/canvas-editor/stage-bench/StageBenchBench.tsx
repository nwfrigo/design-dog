'use client'

import { useDraggable, useActiveDrag } from '@/lib/dnd'
import { useVisibilitySlots, type SlotVisibility } from '../VisibilityRegistry'
import { BenchChip, type BenchChipKind } from '../bench/BenchChip'

/**
 * StageBenchBench — the bench rail's chip rendering. Reads hidden slots
 * from VisibilityRegistry and emits one DraggableChip per slot, plus a
 * translucent ghost-chip preview when a stage block is being dragged
 * toward the bench.
 *
 * Template-agnostic. Each template just provides its slots via
 * VisibilityRegistry; this component handles all the bench presentation
 * and drag wiring.
 *
 * `iconKeyToChipKind` maps the slot's `iconKey` (template-vocabulary)
 * to a BenchChip kind (UI vocabulary). Defined here as a default; new
 * iconKey values can be added without touching the rest of the chain.
 */

/** Default mapping from a slot's `iconKey` (template vocabulary) to a
 *  BenchChip kind (UI vocabulary). New templates can extend this via the
 *  `iconKeyToChipKind` prop — typically not needed since a sensible
 *  default is provided for every existing BenchChip kind. */
const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  body: 'body',
  cta: 'button',
  category: 'category',
  speaker: 'speaker',
  'grid-detail': 'grid-detail',
  'small-caption': 'small-caption',
  date: 'date',
  time: 'time',
  generic: 'headline',
}

/** Drag payload shape — caller-defined, threaded through useDraggable's
 *  `data` to droppables. Open-ended; new regions extend the union. */
export type SlotDragData = {
  region: 'bench' | 'stage'
  path: string
}

/** Stable id for the bench drop target (matches what useStageBenchDroppables registers). */
const BENCH_DROPPABLE_ID = 'canvas-bench'

export interface StageBenchBenchProps {
  /** Optional override map: lets adapters add custom iconKey → chipKind
   *  mappings (e.g., 'speaker' → 'speaker') for new template vocabularies. */
  iconKeyToChipKind?: Partial<Record<string, BenchChipKind>>
}

export function StageBenchBench({ iconKeyToChipKind }: StageBenchBenchProps = {}) {
  const slots = useVisibilitySlots()
  const hidden = slots.filter((s) => s.isHidden)
  const activeDrag = useActiveDrag<SlotDragData>()

  const resolveChipKind = (iconKey: string | undefined): BenchChipKind => {
    if (iconKey && iconKeyToChipKind?.[iconKey]) return iconKeyToChipKind[iconKey] as BenchChipKind
    if (iconKey && iconKey in ICON_KIND_TO_CHIP_KIND) {
      return ICON_KIND_TO_CHIP_KIND[iconKey as keyof typeof ICON_KIND_TO_CHIP_KIND]
    }
    return 'headline'
  }

  // Stage drag hovering over bench → render translucent preview chip at
  // the end of the stack so the user sees where the chip will land. The
  // real chip pops in at this exact position once slot.hide() fires.
  const stageDragOverBench =
    !!activeDrag &&
    activeDrag.data.region === 'stage' &&
    activeDrag.overTargetId === BENCH_DROPPABLE_ID

  const previewSlot = stageDragOverBench
    ? slots.find((s) => s.path === activeDrag.data.path)
    : null

  // During the 150ms settle after a stage→bench drop, slot.isHidden flips
  // to true (real chip appears in the rail) but activeDrag is still set.
  // Suppress the preview chip in that window so we don't show two of the
  // same slot.
  const showPreview = previewSlot && !previewSlot.isHidden

  return (
    <>
      {hidden.map((slot) => (
        <DraggableChip key={slot.path} slot={slot} chipKind={resolveChipKind(slot.iconKey)} />
      ))}
      {showPreview && previewSlot && (
        <BenchChip
          kind={resolveChipKind(previewSlot.iconKey)}
          label={previewSlot.label}
          isPreview
          draggable={false}
          data-canvas-bench-preview
        />
      )}
    </>
  )
}

/**
 * DraggableChip — wraps a single BenchChip with drag wiring. The cursor-
 * following preview is just another BenchChip rendered with `isFloating`
 * (matches the picked-up tilt without needing a `:active` press).
 *
 * The source chip ghosts (`isGhosting`) while it's the active drag, so
 * visually the chip "leaves" the bench rail with the cursor.
 */
function DraggableChip({ slot, chipKind }: { slot: SlotVisibility; chipKind: BenchChipKind }) {
  const { setNodeRef, listeners, isDragging } = useDraggable<SlotDragData>({
    id: slot.path,
    data: { region: 'bench', path: slot.path },
    preview: <BenchChip kind={chipKind} label={slot.label} isFloating draggable={false} />,
  })

  return (
    <BenchChip
      ref={setNodeRef}
      kind={chipKind}
      label={slot.label}
      isGhosting={isDragging}
      {...listeners}
    />
  )
}
