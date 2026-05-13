'use client'

import type { TemplateType } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { DndProvider } from '@/lib/dnd'
import { getStageBenchAdapter } from '@/lib/stage-bench-registry'

/**
 * StageBenchEditor — thin dispatcher for the Stage & Bench editor screen.
 *
 * Reads the React adapter for the current template id from the central
 * registry (`lib/stage-bench-registry.ts`). Each adapter owns its store
 * subscriptions, slot config, stage-bar selectors, and template wiring.
 *
 * Adding a new template = one *Registration.ts file with both the
 * server-safe metadata AND the React adapter. The central registry
 * stitches it into all four downstream registries automatically.
 */

export interface StageBenchEditorProps {
  currentTemplate: TemplateType
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  isExporting: boolean
  isEditingFromQueue: boolean
  colorsConfig: ColorsConfig
  typographyConfig: TypographyConfig
  onExport: () => void
  onAddToQueue: () => void
  onSaveToQueue: () => void
  onPreview: () => void
  onAddAsset: () => void
  onGoToAsset: (idx: number) => void
  onDeleteAsset: (idx: number) => void
  getAssetLabel: (assetType: TemplateType, index: number) => string
}

export function StageBenchEditor(props: StageBenchEditorProps) {
  const Adapter = getStageBenchAdapter(props.currentTemplate)
  if (!Adapter) {
    // Shouldn't happen in practice — EditorScreen gates on
    // isStageBenchTemplate(currentTemplate) before rendering this. Belt
    // and suspenders.
    return null
  }
  return (
    <DndProvider>
      <Adapter {...props} />
    </DndProvider>
  )
}
