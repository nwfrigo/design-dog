import type { QueuedAsset, TemplateType, StackAlign } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { stripHtml } from '@/components/SimpleRichTextEditor'
import { parseSpeakerParams } from '@/lib/render-params'
import type { SearchParams } from '@/lib/render-params'

// Import all template components
import { CustomerLibrary } from '@/components/templates/CustomerLibrary'
import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import { EmailEhsAccelerateInvitation } from '@/components/templates/EmailEhsAccelerateInvitation'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialEhsAccelerate } from '@/components/templates/SocialEhsAccelerate'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { NewsletterTopBanner } from '@/components/templates/NewsletterTopBanner'

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




  'email-ehs-accelerate-invitation': {
    component: EmailEhsAccelerateInvitation,
    renderProps: (asset, colors, typography) => ({
      invitationHeader: asset.invitationHeader || "You're Invited",
      invitationHeadline: asset.invitationHeadline || '',
      invitationEventTitle: asset.invitationEventTitle || '',
      invitationEventDate: asset.invitationEventDate || '',
      invitationEventLocation: asset.invitationEventLocation || '',
      invitationEventTime: asset.invitationEventTime || '',
      invitationEventTimeNote: asset.invitationEventTimeNote || '',
      invitationBody: asset.invitationBody || '',
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'invitationHeader', label: 'Header' },
      { key: 'invitationHeadline', label: 'Headline' },
      { key: 'invitationEventTitle', label: 'Event Title' },
      { key: 'invitationEventDate', label: 'Date' },
      { key: 'invitationEventLocation', label: 'Location' },
      { key: 'invitationEventTime', label: 'Time' },
      { key: 'invitationEventTimeNote', label: 'Time Note' },
      { key: 'invitationBody', label: 'Body (HTML)' },
    ],
    renderSchema: {
      width: 420,
      height: 595,
      background: '#ffffff',
      fields: [
        { param: 'invitationHeader', parser: 'string', default: "You're Invited" },
        { param: 'invitationHeadline', parser: 'string', default: 'Exclusive EHS+ Leader Workshop' },
        { param: 'invitationEventTitle', parser: 'string', default: 'EHS+ Accelerate: Tech Convergence Workshop' },
        { param: 'invitationEventDate', parser: 'string', default: '13 November' },
        { param: 'invitationEventLocation', parser: 'string', default: 'London, England' },
        { param: 'invitationEventTime', parser: 'string', default: '10:00–14:30' },
        { param: 'invitationEventTimeNote', parser: 'string', default: 'Lunch Included' },
        { param: 'invitationBody', parser: 'string', default: '' },
      ],
    },
  },

  // 'email-cority-connect-2026' — migrated to stage-bench-registry
  // (Task 2 pilot). Entry now lives in EmailCorityConnect2026Registration.ts.

  // 'social-image' — migrated to stage-bench-registry (Task 2 pilot).
  // Entry now lives in SocialImageRegistration.ts.


  // 'social-ehs-accelerate' — migrated to stage-bench-registry (Task 2 pilot).
  // Entry now lives in SocialEhsAccelerateRegistration.ts.

  'email-speakers': {
    component: EmailSpeakers,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      eyebrow: asset.eyebrow,
      body: asset.body || '',
      ctaText: asset.ctaText || '',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      speakerCount: asset.speakerCount || 3,
      speaker1: { name: asset.speaker1Name || '', role: asset.speaker1Role || '', imageUrl: asset.speaker1ImageUrl || '', imagePosition: asset.speaker1ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker1ImageZoom || 1 },
      speaker2: { name: asset.speaker2Name || '', role: asset.speaker2Role || '', imageUrl: asset.speaker2ImageUrl || '', imagePosition: asset.speaker2ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker2ImageZoom || 1 },
      speaker3: { name: asset.speaker3Name || '', role: asset.speaker3Role || '', imageUrl: asset.speaker3ImageUrl || '', imagePosition: asset.speaker3ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker3ImageZoom || 1 },
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      theme: asset.theme || 'light',
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#FFFFFF',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'showEyebrow', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'speakerCount', parser: 'int', default: 3 },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
      ],
      assembleProps: (parsed, raw) => {
        const searchParams = raw as SearchParams
        const s1 = parseSpeakerParams(searchParams, 1)
        const s2 = parseSpeakerParams(searchParams, 2)
        const s3 = parseSpeakerParams(searchParams, 3)
        return {
          speaker1: { name: s1.name, role: s1.role, imageUrl: s1.imageUrl, imagePosition: { x: s1.imagePositionX, y: s1.imagePositionY }, imageZoom: s1.imageZoom },
          speaker2: { name: s2.name, role: s2.role, imageUrl: s2.imageUrl, imagePosition: { x: s2.imagePositionX, y: s2.imagePositionY }, imageZoom: s2.imageZoom },
          speaker3: { name: s3.name, role: s3.role, imageUrl: s3.imageUrl, imagePosition: { x: s3.imagePositionX, y: s3.imagePositionY }, imageZoom: s3.imageZoom },
        }
      },
    },
  },

  'newsletter-top-banner': {
    component: NewsletterTopBanner,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      subhead: asset.subhead || '',
      variant: asset.newsletterTopBannerVariant || 'dark',
      showSubhead: asset.showSubhead && !!asset.subhead,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 600,
      height: 240,
      background: null,
      dynamicBackground: (p) => p.variant === 'dark' ? '#060015' : '#FFFFFF',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'variant', parser: 'enum', default: 'dark' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
      ],
    },
  },



  'customer-library': {
    component: CustomerLibrary,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      eyebrow: asset.eyebrow || '',
      body: asset.body || '',
      footerText: asset.subhead || '',
      variant: asset.customerLibraryVariant || 'dark',
      qrCodeUrl: asset.thumbnailImageUrl || undefined,
      showHeadline: asset.showHeadline,
      showEyebrow: asset.showEyebrow,
      showBody: asset.showBody && !!asset.body,
      showFooterText: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 590,
      height: 330,
      background: null,
      dynamicBackground: (p) => p.variant === 'light' ? 'white' : p.variant === 'orange' ? '#D35F0B' : '#060015',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'footerText', parser: 'string', default: 'Lorem ipsum' },
        { param: 'variant', parser: 'enum', default: 'dark' },
        { param: 'qrCodeUrl', parser: 'stringOrNull' },
        { param: 'hasQrCode', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showFooterText', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        qrCodeUrl: (parsed.qrCodeUrl as string) || undefined,
      }),
    },
  },

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
