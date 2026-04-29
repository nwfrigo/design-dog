'use client'

import type { ReactNode } from 'react'
import type { TemplateType } from '@/types'
import { getStageBarControls, type StageBarControl } from './registry'
import { StageBarColorStyle } from './StageBarColorStyle'
import { StageBarAlignment } from './StageBarAlignment'
import { StageBarStackAlign } from './StageBarStackAlign'
import { StageBarGenerate } from './StageBarGenerate'

/**
 * Stage Bar — persistent canvas-wide control surface above the Stage.
 *
 * For each template that's been migrated to Stage & Bench, the registry
 * declares which controls appear here. The bar itself is a thin shell; each
 * control reads/writes its own store state.
 *
 * The `actions` slot on the right is reserved for action buttons (Scale,
 * Preview, Queue, Export) — Phase 4 of the migration moves those out of the
 * preview-frame area into here. For now it's an empty slot.
 *
 * Visual chrome is intentionally neutral and not load-bearing — colorways and
 * exact theming are deferred (decision Q6 in STAGE-LAYOUT-SPEC). Subject to
 * change.
 *
 * Renders nothing if `template` isn't in the registry — non-migrated templates
 * keep their legacy sidebar controls untouched.
 */
export interface StageBarProps {
  template: TemplateType
  /** Handler for the Generate control (sparkles button). Required if the registry includes 'generate'. */
  onGenerate?: () => void
  /** Right-side slot for action buttons. Phase 4 wires this up. */
  actions?: ReactNode
}

export function StageBar({ template, onGenerate, actions }: StageBarProps) {
  const controls = getStageBarControls(template)
  if (!controls) return null

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary px-3 py-1.5">
      <div className="flex items-center gap-4 flex-wrap">
        {controls.map((c) => renderControl(c, { onGenerate }))}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

function renderControl(
  control: StageBarControl,
  ctx: { onGenerate?: () => void },
): ReactNode {
  switch (control) {
    case 'color-style':
      return <StageBarColorStyle key={control} />
    case 'alignment':
      return <StageBarAlignment key={control} />
    case 'stack-alignment':
      return <StageBarStackAlign key={control} />
    case 'generate':
      if (!ctx.onGenerate) return null
      return <StageBarGenerate key={control} onClick={ctx.onGenerate} />
    case 'theme':
      // Phase-7+: theme picker for templates that use light/dark variants.
      return null
  }
}
