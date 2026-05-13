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
import type { StageBenchEditorProps } from '@/components/canvas-editor/StageBenchEditor'

import { socialEhsAccelerateRegistration } from '@/components/canvas-editor/template-adapters/SocialEhsAccelerateRegistration'
import { socialImageRegistration } from '@/components/canvas-editor/template-adapters/SocialImageRegistration'
import { emailCorityConnect2026Registration } from '@/components/canvas-editor/template-adapters/EmailCorityConnect2026Registration'
import { newsletterBlueGradientRegistration } from '@/components/canvas-editor/template-adapters/NewsletterBlueGradientRegistration'
import { newsletterDarkGradientRegistration } from '@/components/canvas-editor/template-adapters/NewsletterDarkGradientRegistration'
import { newsletterLightRegistration } from '@/components/canvas-editor/template-adapters/NewsletterLightRegistration'
import { socialBlueGradientRegistration } from '@/components/canvas-editor/template-adapters/SocialBlueGradientRegistration'
import { socialDarkGradientRegistration } from '@/components/canvas-editor/template-adapters/SocialDarkGradientRegistration'
import { socialImageMeddbaseRegistration } from '@/components/canvas-editor/template-adapters/SocialImageMeddbaseRegistration'
import { emailImageRegistration } from '@/components/canvas-editor/template-adapters/EmailImageRegistration'
import { emailDarkGradientRegistration } from '@/components/canvas-editor/template-adapters/EmailDarkGradientRegistration'
import { emailCorityCustomerExchangeBannerRegistration } from '@/components/canvas-editor/template-adapters/EmailCorityCustomerExchangeBannerRegistration'
import { emailCorityCustomerExchangeSignatureRegistration } from '@/components/canvas-editor/template-adapters/EmailCorityCustomerExchangeSignatureRegistration'
import { emailEhsAccelerateBannerRegistration } from '@/components/canvas-editor/template-adapters/EmailEhsAccelerateBannerRegistration'
import { emailEhsAccelerateSignatureRegistration } from '@/components/canvas-editor/template-adapters/EmailEhsAccelerateSignatureRegistration'
import { websiteFloatingBannerRegistration } from '@/components/canvas-editor/template-adapters/WebsiteFloatingBannerRegistration'
import { websiteFloatingBannerMobileRegistration } from '@/components/canvas-editor/template-adapters/WebsiteFloatingBannerMobileRegistration'
import { emailProductReleaseRegistration } from '@/components/canvas-editor/template-adapters/EmailProductReleaseRegistration'
import { websitePressReleaseRegistration } from '@/components/canvas-editor/template-adapters/WebsitePressReleaseRegistration'
import { websiteThumbnailRegistration } from '@/components/canvas-editor/template-adapters/WebsiteThumbnailRegistration'
import { websiteReportRegistration } from '@/components/canvas-editor/template-adapters/WebsiteReportRegistration'
import { websiteWebinarRegistration } from '@/components/canvas-editor/template-adapters/WebsiteWebinarRegistration'
import { emailGridRegistration } from '@/components/canvas-editor/template-adapters/EmailGridRegistration'
import { socialGridDetailRegistration } from '@/components/canvas-editor/template-adapters/SocialGridDetailRegistration'
import { websiteEventListingRegistration } from '@/components/canvas-editor/template-adapters/WebsiteEventListingRegistration'
import { websiteEhsAccelerateListingRegistration } from '@/components/canvas-editor/template-adapters/WebsiteEhsAccelerateListingRegistration'
import { emailSpeakersRegistration } from '@/components/canvas-editor/template-adapters/EmailSpeakersRegistration'
import { newsletterTopBannerRegistration } from '@/components/canvas-editor/template-adapters/NewsletterTopBannerRegistration'

// Each template has unique props — kept loose at the registry boundary
// because `renderProps` is the bridge that produces the correctly-shaped
// prop bag from the asset state.
type AnyTemplateComponent = ComponentType<any> // eslint-disable-line

export interface StageBenchRegistrationData {
  templateId: TemplateType
  Template: AnyTemplateComponent
  /** The Stage & Bench editor adapter (React component). Reads store
   *  state, wires up slot config + stage-bar, and renders the template
   *  with editor render-props. Built either via `defineStageBenchAdapter`
   *  or as a hand-rolled component (e.g. EmailSpeakers). */
  Adapter: ComponentType<StageBenchEditorProps>
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
  socialImageMeddbaseRegistration,
  emailImageRegistration,
  emailDarkGradientRegistration,
  emailCorityCustomerExchangeBannerRegistration,
  emailCorityCustomerExchangeSignatureRegistration,
  emailEhsAccelerateBannerRegistration,
  emailEhsAccelerateSignatureRegistration,
  websiteFloatingBannerRegistration,
  websiteFloatingBannerMobileRegistration,
  emailProductReleaseRegistration,
  websitePressReleaseRegistration,
  websiteThumbnailRegistration,
  websiteReportRegistration,
  websiteWebinarRegistration,
  emailGridRegistration,
  socialGridDetailRegistration,
  websiteEventListingRegistration,
  websiteEhsAccelerateListingRegistration,
  emailSpeakersRegistration,
  newsletterTopBannerRegistration,
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

/** Resolve the Stage & Bench React adapter for a template id. Used by
 *  `StageBenchEditor.tsx` to dispatch. */
export function getStageBenchAdapter(
  id: TemplateType,
): ComponentType<StageBenchEditorProps> | undefined {
  return BY_ID.get(id)?.Adapter
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
