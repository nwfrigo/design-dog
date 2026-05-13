import type { QueuedAsset, TemplateType, StackAlign } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { stripHtml } from '@/components/SimpleRichTextEditor'
import { parseSpeakerParams } from '@/lib/render-params'
import type { SearchParams } from '@/lib/render-params'

// Import all template components
import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialEhsAccelerate } from '@/components/templates/SocialEhsAccelerate'

// ---------------------------------------------------------------------------
// Render Schema — declarative field definitions for dynamic render route
// ---------------------------------------------------------------------------

type FieldParser = 'string' | 'boolTrue' | 'boolFalse' | 'number' | 'numberOrUndefined' | 'enum' | 'stringOrNull' | 'int' | 'jsonRecord'

export interface RenderField {
  /** URL param name */
  param: string
  /** Parser type — determines which lib/render-params helper to use */
  parser: FieldParser
  /** Default value passed to parser */
  default?: string | number | boolean | null
}

export interface TemplateRenderSchema {
  /** Template dimensions in pixels */
  width: number
  height: number
  /** Static background color. Null = no background. */
  background: string | null
  /** Dynamic background — function of parsed field values. Takes precedence over static background. */
  dynamicBackground?: (params: Record<string, unknown>) => string
  /** Declarative field definitions for URL param parsing */
  fields: RenderField[]
  /**
   * Custom prop assembly — called AFTER standard field parsing.
   * Use for: image position assembly ({x,y} from flat X/Y params),
   * speaker object assembly, grid detail objects, CTA dual-key fallback.
   * Receives parsed params + raw searchParams. Returns props to merge/override.
   */
  assembleProps?: (
    parsed: Record<string, unknown>,
    raw: { [key: string]: string | string[] | undefined }
  ) => Record<string, unknown>
}

export interface QueueTextField {
  key: string
  label: string
  showKey?: string
  isHtml?: boolean
}

export interface TemplateRegistryEntry {
  component: React.ComponentType<any> // Each template has unique props — typed via renderProps
  renderProps: (asset: QueuedAsset, colors: ColorsConfig, typography: TypographyConfig) => Record<string, unknown>
  queueTextFields: QueueTextField[]
  renderSchema?: TemplateRenderSchema
}

// Legacy-shape entries. Templates that have migrated onto the central
// Stage & Bench registry are removed from here and rejoined via the
// spread below — keeps a single source of truth per template.
const LEGACY_TEMPLATE_REGISTRY: Partial<Record<TemplateType, TemplateRegistryEntry>> = {




  // 'email-ehs-accelerate-invitation' — migrated to stage-bench-registry.
  // Entry now lives in EmailEhsAccelerateInvitationRegistration.ts.

  // 'email-cority-connect-2026' — migrated to stage-bench-registry
  // (Task 2 pilot). Entry now lives in EmailCorityConnect2026Registration.ts.

  // 'social-image' — migrated to stage-bench-registry (Task 2 pilot).
  // Entry now lives in SocialImageRegistration.ts.


  // 'social-ehs-accelerate' — migrated to stage-bench-registry (Task 2 pilot).
  // Entry now lives in SocialEhsAccelerateRegistration.ts.


  // 'newsletter-top-banner' — migrated to stage-bench-registry.
  // Entry now lives in NewsletterTopBannerRegistration.ts.

  // 'customer-library' — migrated to stage-bench-registry.
  // Entry now lives in CustomerLibraryRegistration.ts.

}

// Merge in stage-bench-registry entries last so the central registry's
// values take precedence over any leftover legacy entry for the same
// template id.
import { getStageBenchTemplateRegistryEntries } from './stage-bench-registry'

export const TEMPLATE_REGISTRY: Partial<Record<TemplateType, TemplateRegistryEntry>> = {
  ...LEGACY_TEMPLATE_REGISTRY,
  ...getStageBenchTemplateRegistryEntries(),
}

export function getQueueTextFields(asset: QueuedAsset): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = []

  // Shared fields
  if (asset.eyebrow && asset.showEyebrow) fields.push({ label: 'Eyebrow', value: asset.eyebrow })
  if (asset.headline) fields.push({ label: 'Headline', value: stripHtml(asset.headline) })
  if (asset.subhead && asset.showSubhead) fields.push({ label: 'Subhead', value: stripHtml(asset.subhead) })
  if (asset.subheading && asset.showSubheading) fields.push({ label: 'Subheading', value: asset.subheading })
  if (asset.body && asset.showBody) fields.push({ label: 'Body', value: stripHtml(asset.body) })

  // Template-specific fields from registry
  const entry = TEMPLATE_REGISTRY[asset.templateType]
  if (entry) {
    for (const tf of entry.queueTextFields) {
      const value = (asset as unknown as Record<string, unknown>)[tf.key] as string | undefined
      if (!value) continue
      if (tf.showKey) {
        const show = (asset as unknown as Record<string, unknown>)[tf.showKey]
        if (show === false) continue
      }
      fields.push({ label: tf.label, value: tf.isHtml ? stripHtml(value) : value })
    }
  }

  return fields
}
