'use client'

import { ActionRow } from '../action-row/ActionRow'
import { ActionButton } from '../action-row/ActionButton'

/**
 * StageBenchActionRow — preview / queue / export buttons below the stage.
 * Identical for every template; the queue button is hidden when the user
 * is editing from a queued asset (in that case "Save changes" replaces
 * the export — handled outside Stage & Bench for now).
 */

export interface StageBenchActionRowProps {
  isExporting: boolean
  isEditingFromQueue: boolean
  onPreview: () => void
  onAddToQueue: () => void
  onExport: () => void
}

export function StageBenchActionRow({
  isExporting,
  isEditingFromQueue,
  onPreview,
  onAddToQueue,
  onExport,
}: StageBenchActionRowProps) {
  return (
    <ActionRow>
      <ActionButton fn="preview" onClick={onPreview} />
      {!isEditingFromQueue && <ActionButton fn="add-to-queue" onClick={onAddToQueue} />}
      <ActionButton fn="export" loading={isExporting} onClick={onExport} />
    </ActionRow>
  )
}
