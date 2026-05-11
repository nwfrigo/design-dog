'use client'

import { ActionRow } from '../action-row/ActionRow'
import { ActionButton } from '../action-row/ActionButton'

/**
 * StageBenchActionRow — preview / queue / export buttons below the stage.
 * Identical for every template. When editing from a queued asset,
 * "Add to Queue" is replaced by "Save & Return to Queue" in the middle
 * slot — both use secondary button style, so the row visually stays
 * the same shape across modes.
 */

export interface StageBenchActionRowProps {
  isExporting: boolean
  isEditingFromQueue: boolean
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
      <ActionButton fn="export" loading={isExporting} onClick={onExport} />
    </ActionRow>
  )
}
