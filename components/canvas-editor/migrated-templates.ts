/**
 * Stage & Bench template gate. EditorScreen reads this to decide
 * whether to render StageBenchEditor or fall back to the legacy
 * sidebar-form editor. Every registered template (see
 * `lib/stage-bench-registry.ts`) is automatically Stage & Bench —
 * there is no separate legacy list anymore.
 *
 * When the legacy sidebar-form editor itself is deleted, this whole
 * file (and its consumers) can fold into a `true` constant.
 */

import type { TemplateType } from '@/types'
import { getRegisteredStageBenchTemplateIds } from '@/lib/stage-bench-registry'

export const STAGE_BENCH_TEMPLATES: Set<TemplateType> = new Set<TemplateType>(
  getRegisteredStageBenchTemplateIds(),
)

export function isStageBenchTemplate(template: TemplateType): boolean {
  return STAGE_BENCH_TEMPLATES.has(template)
}
