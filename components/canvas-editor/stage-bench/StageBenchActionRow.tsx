'use client'

import { ActionRow } from '../action-row/ActionRow'
import { ActionButton } from '@/components/ui/ActionButton'
import { ExportScaleSelect } from '@/components/ui/ExportScaleSelect'

/**
 * StageBenchActionRow — preview / queue / scale / export controls below the
 * stage. Identical for every template. When editing from a queued asset,
 * "Add to Queue" is replaced by "Save & Return to Queue" in the middle
 * slot — both use secondary button style, so the row visually stays
 * the same shape across modes.
 *
 * The export resolution selector (1x/2x/3x) sits just before Export; it's the
 * shared ExportScaleSelect, so every Stage & Bench template gets it from here
 * with no per-template wiring.
 */

export interface StageBenchActionRowProps {
  isExporting: boolean
  isEditingFromQueue: boolean
  /** Current export resolution multiplier (drives ExportScaleSelect). */
  exportScale: number
  onSetExportScale: (scale: number) => void
  onPreview: () => void
  onAddToQueue: () => void
  /** Fired when the user clicks Save & Return to Queue. Only invoked
   *  when isEditingFromQueue is true; safe to pass a no-op otherwise. */
  onSaveToQueue: () => void
  onExport: () => void
}

export function StageBenchActionRow({
  isExporting,
  isEditingFromQueue,
  exportScale,
  onSetExportScale,
  onPreview,
  onAddToQueue,
  onSaveToQueue,
  onExport,
}: StageBenchActionRowProps) {
  return (
    <ActionRow>
      <ActionButton fn="preview" onClick={onPreview} />
      {isEditingFromQueue ? (
        <ActionButton fn="save-to-queue" onClick={onSaveToQueue} />
      ) : (
        <ActionButton fn="add-to-queue" onClick={onAddToQueue} />
      )}
      <ExportScaleSelect value={exportScale} onChange={onSetExportScale} />
      <ActionButton fn="export" loading={isExporting} onClick={onExport} />
    </ActionRow>
  )
}
