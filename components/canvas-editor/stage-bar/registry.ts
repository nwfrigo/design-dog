import type { TemplateType } from '@/types'

/**
 * Stage Bar registry — declares which canvas-wide controls each migrated
 * template surfaces above its design.
 *
 * Adding a new template to Stage & Bench = adding an entry here. Each control
 * key resolves to a component in `<StageBar />` that reads its own store state.
 *
 * Order in the array is render order (left to right).
 */

export type StageBarControl =
  | 'color-style'
  | 'alignment'
  | 'stack-alignment'
  | 'theme'
  | 'generate'

export const STAGE_BAR_REGISTRY: Partial<Record<TemplateType, readonly StageBarControl[]>> = {
  'email-dark-gradient': ['color-style', 'alignment', 'stack-alignment', 'generate'],
  // future templates: add their canvas-wide control sets here
}

export function getStageBarControls(template: TemplateType): readonly StageBarControl[] | null {
  return STAGE_BAR_REGISTRY[template] ?? null
}
