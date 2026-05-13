/**
 * Stage & Bench template registry — single source of truth.
 *
 * Each Stage & Bench template ships a registration object that bundles
 * every piece of metadata the four downstream registries need:
 *
 *   - `Template` + `renderProps`   → consumed by `lib/template-registry.tsx`
 *     for Puppeteer renders of queued assets.
 *   - `renderSchema`                → consumed by `lib/template-registry.tsx`
 *     for the URL-param-driven dynamic render route.
 *   - `queueTextFields`             → consumed by the export-queue UI.
 *   - `exportBuilder`               → consumed by `lib/export-params.ts`
 *     when serializing editor state to render-route URL params.
 *   - `templateId` (implied)        → consumed by
 *     `components/canvas-editor/migrated-templates.ts` (the S&B routing
 *     gate) and the client-only adapter dispatch in
 *     `components/canvas-editor/StageBenchEditor.tsx`.
 *
 * Adding a new Stage & Bench template:
 *   1. Build the React adapter in `template-adapters/<Name>StageBench.tsx`
 *      using `defineStageBenchAdapter`.
 *   2. Author a server-safe registration in
 *      `template-adapters/<Name>Registration.ts` (this file).
 *   3. Import the registration here and append to `REGISTRATIONS`.
 *
 * That's the whole story — no separate touches to template-registry,
 * export-params, or migrated-templates. Pilot scope: the three pilots
 * below. The 24 remaining adapters port onto this same pattern as
 * Task 1 phase B mass-ports them.
 */

import type { ComponentType } from 'react'
import type { TemplateType, QueuedAsset } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type {
  TemplateRenderSchema,
  QueueTextField,
  TemplateRegistryEntry,
} from './template-registry'
import type { ExportParamBuilder } from './export-params'

import { socialEhsAccelerateRegistration } from '@/components/canvas-editor/template-adapters/SocialEhsAccelerateRegistration'
import { socialImageRegistration } from '@/components/canvas-editor/template-adapters/SocialImageRegistration'
import { emailCorityConnect2026Registration } from '@/components/canvas-editor/template-adapters/EmailCorityConnect2026Registration'
import { newsletterBlueGradientRegistration } from '@/components/canvas-editor/template-adapters/NewsletterBlueGradientRegistration'
import { newsletterDarkGradientRegistration } from '@/components/canvas-editor/template-adapters/NewsletterDarkGradientRegistration'
import { newsletterLightRegistration } from '@/components/canvas-editor/template-adapters/NewsletterLightRegistration'
import { socialBlueGradientRegistration } from '@/components/canvas-editor/template-adapters/SocialBlueGradientRegistration'
import { socialDarkGradientRegistration } from '@/components/canvas-editor/template-adapters/SocialDarkGradientRegistration'

// Each template has unique props — kept loose at the registry boundary
// because `renderProps` is the bridge that produces the correctly-shaped
// prop bag from the asset state.
type AnyTemplateComponent = ComponentType<any> // eslint-disable-line

export interface StageBenchRegistrationData {
  templateId: TemplateType
  Template: AnyTemplateComponent
  renderProps: (
    asset: QueuedAsset,
    colors: ColorsConfig,
    typography: TypographyConfig,
  ) => Record<string, unknown>
  renderSchema?: TemplateRenderSchema
  queueTextFields?: QueueTextField[]
  exportBuilder: ExportParamBuilder
}

const REGISTRATIONS: ReadonlyArray<StageBenchRegistrationData> = [
  socialEhsAccelerateRegistration,
  socialImageRegistration,
  emailCorityConnect2026Registration,
  newsletterBlueGradientRegistration,
  newsletterDarkGradientRegistration,
  newsletterLightRegistration,
  socialBlueGradientRegistration,
  socialDarkGradientRegistration,
]

const BY_ID = new Map<TemplateType, StageBenchRegistrationData>(
  REGISTRATIONS.map((r) => [r.templateId, r]),
)

/** Look up a Stage & Bench registration by template id. */
export function getStageBenchRegistration(
  id: TemplateType,
): StageBenchRegistrationData | undefined {
  return BY_ID.get(id)
}

/** Set of template ids registered as Stage & Bench. Used by the routing
 *  gate (`migrated-templates.ts`) and the adapter dispatch
 *  (`StageBenchEditor.tsx`). */
export function getRegisteredStageBenchTemplateIds(): readonly TemplateType[] {
  return REGISTRATIONS.map((r) => r.templateId)
}

/** Build a TemplateRegistryEntry from a registration. Lets
 *  `template-registry.tsx` merge these in without duplicating the
 *  shape. */
export function toTemplateRegistryEntry(
  reg: StageBenchRegistrationData,
): TemplateRegistryEntry {
  return {
    component: reg.Template,
    renderProps: reg.renderProps,
    queueTextFields: reg.queueTextFields ?? [],
    renderSchema: reg.renderSchema,
  }
}

/** All Stage & Bench template-registry entries keyed by template id —
 *  for `template-registry.tsx` to spread into TEMPLATE_REGISTRY. */
export function getStageBenchTemplateRegistryEntries(): Partial<
  Record<TemplateType, TemplateRegistryEntry>
> {
  const out: Partial<Record<TemplateType, TemplateRegistryEntry>> = {}
  for (const reg of REGISTRATIONS) {
    out[reg.templateId] = toTemplateRegistryEntry(reg)
  }
  return out
}

/** All Stage & Bench export builders keyed by template id — for
 *  `export-params.ts` to spread into BUILDERS. */
export function getStageBenchExportBuilders(): Record<string, ExportParamBuilder> {
  const out: Record<string, ExportParamBuilder> = {}
  for (const reg of REGISTRATIONS) {
    out[reg.templateId] = reg.exportBuilder
  }
  return out
}
