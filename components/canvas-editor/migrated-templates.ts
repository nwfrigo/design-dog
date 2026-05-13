/**
 * Single source of truth for which templates render the Stage & Bench editor
 * vs. the legacy sidebar-form editor. EditorScreen reads this set and
 * dispatches accordingly.
 *
 * Templates registered via the new factory descriptor (Task 2) auto-include
 * themselves via `getRegisteredStageBenchTemplateIds()`. Legacy adapters
 * that haven't been ported yet still live in `LEGACY_STAGE_BENCH_TEMPLATES`
 * below and shrink as Task 1 phase B ports each onto the factory.
 *
 * When this set covers every single-page template AND every adapter has
 * been ported to the factory, the legacy EditorScreen code path becomes
 * unreachable and can be deleted in one cleanup pass.
 */

import type { TemplateType } from '@/types'
import { getRegisteredStageBenchTemplateIds } from '@/lib/stage-bench-registry'

/** Templates whose adapters still use the per-file scaffold. Each entry
 *  here corresponds to a `template-adapters/*StageBench.tsx` file that
 *  hasn't yet been registered via the central registry. As adapters
 *  migrate to the registry, remove them from here. */
const LEGACY_STAGE_BENCH_TEMPLATES: ReadonlyArray<TemplateType> = [
  'email-speakers',
]

export const STAGE_BENCH_TEMPLATES: Set<TemplateType> = new Set<TemplateType>([
  ...LEGACY_STAGE_BENCH_TEMPLATES,
  ...getRegisteredStageBenchTemplateIds(),
])

export function isStageBenchTemplate(template: TemplateType): boolean {
  return STAGE_BENCH_TEMPLATES.has(template)
}
