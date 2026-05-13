import type { QueuedAsset, TemplateType, StackAlign } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { stripHtml } from '@/components/SimpleRichTextEditor'
import { parseSpeakerParams } from '@/lib/render-params'
import type { SearchParams } from '@/lib/render-params'

// Import all template components
import { WebsiteThumbnail } from '@/components/templates/WebsiteThumbnail'
import { WebsitePressRelease } from '@/components/templates/WebsitePressRelease'
import { WebsiteWebinar } from '@/components/templates/WebsiteWebinar'
import { WebsiteReport } from '@/components/templates/WebsiteReport'
import { WebsiteEventListing } from '@/components/templates/WebsiteEventListing'
import { WebsiteEhsAccelerateListing } from '@/components/templates/WebsiteEhsAccelerateListing'
import { CustomerLibrary } from '@/components/templates/CustomerLibrary'
import { WebsiteFloatingBanner } from '@/components/templates/WebsiteFloatingBanner'
import { WebsiteFloatingBannerMobile } from '@/components/templates/WebsiteFloatingBannerMobile'
import { EmailGrid, type GridDetail } from '@/components/templates/EmailGrid'
import { EmailImage } from '@/components/templates/EmailImage'
import { EmailProductRelease } from '@/components/templates/EmailProductRelease'
import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import { EmailEhsAccelerateBanner } from '@/components/templates/EmailEhsAccelerateBanner'
import { EmailEhsAccelerateInvitation } from '@/components/templates/EmailEhsAccelerateInvitation'
import { EmailEhsAccelerateSignature } from '@/components/templates/EmailEhsAccelerateSignature'
import { EmailCorityCustomerExchangeSignature } from '@/components/templates/EmailCorityCustomerExchangeSignature'
import { EmailCorityCustomerExchangeBanner } from '@/components/templates/EmailCorityCustomerExchangeBanner'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialImageMeddbase } from '@/components/templates/SocialImageMeddbase'
import { SocialGridDetail, type GridDetailRow } from '@/components/templates/SocialGridDetail'
import { SocialEhsAccelerate } from '@/components/templates/SocialEhsAccelerate'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
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
  'website-thumbnail': {
    component: WebsiteThumbnail,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || '',
      subhead: asset.subhead,
      cta: asset.ctaText || '',
      solution: asset.solution,
      variant: asset.ebookVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      theme: asset.theme || 'light',
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['website-thumbnail'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/safer_is_stronger_sample_page.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || '',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'website-press-release': {
    component: WebsitePressRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || '',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || '',
      solution: asset.solution,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      theme: asset.theme || 'light',
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'health' },
        { param: 'imageUrl', parser: 'string', default: '/placeholder-mountain.jpg' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        // Per-image filter values emitted by `buildImageParams` as 3 scalars.
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || '',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        // Reassemble the 3 scalar filter params into the ImageFilters
        // shape WebsitePressRelease expects.
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'website-webinar': {
    component: WebsiteWebinar,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || '',
      solution: asset.solution,
      variant: asset.webinarVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['website-webinar'] ?? {},
      speaker1: { name: asset.speaker1Name, role: asset.speaker1Role, imageUrl: asset.speaker1ImageUrl, imagePosition: asset.speaker1ImagePosition, imageZoom: asset.speaker1ImageZoom },
      speaker2: { name: asset.speaker2Name, role: asset.speaker2Role, imageUrl: asset.speaker2ImageUrl, imagePosition: asset.speaker2ImagePosition, imageZoom: asset.speaker2ImageZoom },
      speaker3: { name: asset.speaker3Name, role: asset.speaker3Role, imageUrl: asset.speaker3ImageUrl, imagePosition: asset.speaker3ImagePosition, imageZoom: asset.speaker3ImageZoom },
      showSpeaker1: asset.showSpeaker1,
      showSpeaker2: asset.showSpeaker2,
      showSpeaker3: asset.showSpeaker3,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      theme: asset.theme || 'dark',
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'safety' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSpeaker1', parser: 'boolTrue' },
        { param: 'showSpeaker2', parser: 'boolTrue' },
        { param: 'showSpeaker3', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'dark' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed, raw) => {
        const searchParams = raw as SearchParams
        const s1 = parseSpeakerParams(searchParams, 1)
        const s2 = parseSpeakerParams(searchParams, 2)
        const s3 = parseSpeakerParams(searchParams, 3)
        return {
          cta: (raw.ctaText as string) || (raw.cta as string) || '',
          imageUrl: (raw.imageUrl as string) || undefined,
          imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
          imageFilters: {
            exposure: parsed.imageFilterExposure as number,
            contrast: parsed.imageFilterContrast as number,
            saturation: parsed.imageFilterSaturation as number,
          },
          speaker1: { name: s1.name, role: s1.role, imageUrl: s1.imageUrl, imagePosition: { x: s1.imagePositionX, y: s1.imagePositionY }, imageZoom: s1.imageZoom },
          speaker2: { name: s2.name, role: s2.role, imageUrl: s2.imageUrl, imagePosition: { x: s2.imagePositionX, y: s2.imagePositionY }, imageZoom: s2.imageZoom },
          speaker3: { name: s3.name, role: s3.role, imageUrl: s3.imageUrl, imagePosition: { x: s3.imagePositionX, y: s3.imagePositionY }, imageZoom: s3.imageZoom },
        }
      },
    },
  },

  'email-grid': {
    component: EmailGrid,
    renderProps: (asset, colors, typography) => {
      const gridDetail1: GridDetail = { type: 'data', text: asset.gridDetail1Text }
      const gridDetail2: GridDetail = { type: 'data', text: asset.gridDetail2Text }
      const gridDetail3: GridDetail = { type: asset.gridDetail3Type, text: asset.gridDetail3Text }
      return {
        headline: asset.headline || '',
        body: asset.body,
        eyebrow: asset.eyebrow,
        subheading: asset.subheading,
        showEyebrow: asset.showEyebrow,
        showLightHeader: asset.showLightHeader,
        showHeavyHeader: false,
        showSubheading: asset.showSubheading,
        showBody: asset.showBody,
        showSolutionSet: asset.showSolutionSet,
        solution: asset.solution,
        showGridDetail2: asset.showGridDetail2,
        gridDetail1, gridDetail2, gridDetail3,
        headlineFontSize: asset.headlineFontSize ?? undefined,
        theme: asset.theme || 'light',
        stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
        gaps: asset.templateGaps?.['email-grid'] ?? {},
        colors, typography, scale: 1,
      }
    },
    queueTextFields: [
      { key: 'gridDetail1Text', label: 'Detail 1' },
      { key: 'gridDetail2Text', label: 'Detail 2', showKey: 'showGridDetail2' },
      { key: 'gridDetail3Text', label: 'Detail 3' },
    ],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#ffffff',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'subheading', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'showEyebrow', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showLightHeader', parser: 'boolTrue' },
        { param: 'showHeavyHeader', parser: 'boolFalse' },
        { param: 'showSubheading', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'showGridDetail2', parser: 'boolTrue' },
        { param: 'gridDetail1Type', parser: 'enum', default: 'data' },
        { param: 'gridDetail1Text', parser: 'string', default: '' },
        { param: 'gridDetail2Type', parser: 'enum', default: 'data' },
        { param: 'gridDetail2Text', parser: 'string', default: '' },
        { param: 'gridDetail3Type', parser: 'enum', default: 'cta' },
        { param: 'gridDetail3Text', parser: 'string', default: '' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed) => ({
        gridDetail1: { type: parsed.gridDetail1Type, text: parsed.gridDetail1Text },
        gridDetail2: { type: parsed.gridDetail2Type, text: parsed.gridDetail2Text },
        gridDetail3: { type: parsed.gridDetail3Type, text: parsed.gridDetail3Text },
      }),
    },
  },

  'email-image': {
    component: EmailImage,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      body: asset.body || '',
      ctaText: asset.ctaText || '',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      layout: asset.layout || 'even',
      solution: asset.solution,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      theme: asset.theme || 'light',
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['email-image'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#ffffff',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'layout', parser: 'enum', default: 'even' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'email-product-release': {
    component: EmailProductRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      grayscale: asset.grayscale,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 164,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'grayscale', parser: 'boolFalse' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'email-ehs-accelerate-banner': {
    component: EmailEhsAccelerateBanner,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      body: asset.body || '',
      showBody: asset.showBody !== false,
      ctaText: asset.ctaText || '',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      eventDate: asset.eventDate || '',
      eventLocation: asset.eventLocation || '',
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'body', label: 'Body' },
      { key: 'ctaText', label: 'CTA' },
      { key: 'eventDate', label: 'Date' },
      { key: 'eventLocation', label: 'Location' },
    ],
    renderSchema: {
      width: 600,
      height: 373,
      background: '#ffffff',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'showBody', parser: 'boolTrue', default: true },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'eventDate', parser: 'string', default: '' },
        { param: 'eventLocation', parser: 'string', default: '' },
      ],
    },
  },

  'email-ehs-accelerate-signature': {
    component: EmailEhsAccelerateSignature,
    renderProps: (asset, colors, typography) => ({
      workshopName: asset.signatureWorkshopName || '',
      eventDate: asset.eventDate || '',
      eventLocation: asset.eventLocation || '',
      ctaText: asset.ctaText || '',
      showWorkshopName: asset.showSignatureWorkshopName !== false,
      showEventDetails: asset.showSignatureEventDetails !== false,
      showCta: asset.showCta !== false,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'signatureWorkshopName', label: 'Workshop' },
      { key: 'eventDate', label: 'Date' },
      { key: 'eventLocation', label: 'Location' },
      { key: 'ctaText', label: 'CTA' },
    ],
    renderSchema: {
      width: 400,
      height: 100,
      background: '#ffffff',
      fields: [
        { param: 'workshopName', parser: 'string', default: '' },
        { param: 'eventDate', parser: 'string', default: '' },
        { param: 'eventLocation', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'showWorkshopName', parser: 'boolTrue', default: true },
        { param: 'showEventDetails', parser: 'boolTrue', default: true },
        { param: 'showCta', parser: 'boolTrue', default: true },
      ],
    },
  },

  'email-cority-customer-exchange-banner': {
    component: EmailCorityCustomerExchangeBanner,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      body: asset.body || '',
      ctaText: asset.ctaText || '',
      colorStyle: (asset.colorStyle || '1') as '1' | '2' | '3' | '4',
      showHeadline: asset.showHeadline !== false,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'body', label: 'Body', isHtml: true },
      { key: 'ctaText', label: 'CTA' },
    ],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#060015',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'showHeadline', parser: 'boolTrue', default: true },
        { param: 'showBody', parser: 'boolTrue', default: true },
        { param: 'showCta', parser: 'boolTrue', default: true },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
    },
  },

  'email-cority-customer-exchange-signature': {
    component: EmailCorityCustomerExchangeSignature,
    renderProps: (asset, colors, typography) => ({
      eventDate: asset.eventDate || '',
      eventLocation: asset.eventLocation || '',
      eventTime: asset.cceEventTime || '10:00–16:00',
      ctaText: asset.ctaText || '',
      showEventDate: asset.showCceEventDate !== false,
      showEventLocation: asset.showCceEventLocation !== false,
      showEventTime: asset.showCceEventTime !== false,
      showCta: asset.showCta !== false,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'eventDate', label: 'Date' },
      { key: 'eventLocation', label: 'Location' },
      { key: 'cceEventTime', label: 'Time' },
      { key: 'ctaText', label: 'CTA' },
    ],
    renderSchema: {
      width: 400,
      height: 100,
      background: '#060015',
      fields: [
        { param: 'eventDate', parser: 'string', default: '' },
        { param: 'eventLocation', parser: 'string', default: '' },
        { param: 'eventTime', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'showEventDate', parser: 'boolTrue', default: true },
        { param: 'showEventLocation', parser: 'boolTrue', default: true },
        { param: 'showEventTime', parser: 'boolTrue', default: true },
        { param: 'showCta', parser: 'boolTrue', default: true },
      ],
    },
  },

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

  'social-image-meddbase': {
    component: SocialImageMeddbase,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      subhead: asset.subhead || '',
      metadata: asset.metadata || '',
      ctaText: asset.ctaText || '',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      layout: asset.layout || 'even',
      solution: asset.solution,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showMetadata: asset.showMetadata !== false,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['social-image-meddbase'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
    renderSchema: {
      width: 1200,
      height: 628,
      background: '#ffffff',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'metadata', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'layout', parser: 'enum', default: 'even' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showMetadata', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'social-grid-detail': {
    component: SocialGridDetail,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      subhead: asset.subhead || '',
      eyebrow: asset.eyebrow || "Don't miss this.",
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showSolutionSet: asset.showSolutionSet !== false,
      solution: asset.solution,
      showRow3: asset.showRow3 !== false,
      showRow4: asset.showRow4 !== false,
      gridDetail1: { type: 'data' as const, text: asset.gridDetail1Text || '' },
      gridDetail2: { type: 'data' as const, text: asset.gridDetail2Text || '' },
      gridDetail3: { type: (asset.gridDetail3Type || 'data') as GridDetailRow['type'], text: asset.gridDetail3Text || '' },
      gridDetail4: { type: (asset.gridDetail4Type || 'cta') as GridDetailRow['type'], text: asset.gridDetail4Text || '' },
      headlineFontSize: asset.headlineFontSize ?? undefined,
      theme: asset.theme || 'light',
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['social-grid-detail'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'gridDetail1Text', label: 'Row 1' },
      { key: 'gridDetail2Text', label: 'Row 2' },
      { key: 'gridDetail3Text', label: 'Row 3', showKey: 'showRow3' },
      { key: 'gridDetail4Text', label: 'Row 4', showKey: 'showRow4' },
    ],
    renderSchema: {
      width: 1200,
      height: 628,
      background: '#ffffff',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'eyebrow', parser: 'string', default: "Don't miss this." },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'showRow3', parser: 'boolTrue' },
        { param: 'showRow4', parser: 'boolTrue' },
        { param: 'gridDetail1Text', parser: 'string', default: '' },
        { param: 'gridDetail2Text', parser: 'string', default: '' },
        { param: 'gridDetail3Text', parser: 'string', default: '' },
        { param: 'gridDetail3Type', parser: 'enum', default: 'data' },
        { param: 'gridDetail4Text', parser: 'string', default: '' },
        { param: 'gridDetail4Type', parser: 'enum', default: 'cta' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'light' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed) => ({
        gridDetail1: { type: 'data', text: parsed.gridDetail1Text },
        gridDetail2: { type: 'data', text: parsed.gridDetail2Text },
        gridDetail3: { type: parsed.gridDetail3Type, text: parsed.gridDetail3Text },
        gridDetail4: { type: parsed.gridDetail4Type, text: parsed.gridDetail4Text },
      }),
    },
  },

  // 'social-ehs-accelerate' — migrated to stage-bench-registry (Task 2 pilot).
  // Entry now lives in SocialEhsAccelerateRegistration.ts.

  'email-dark-gradient': {
    component: EmailDarkGradient,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || '',
      eyebrow: asset.eyebrow,
      subhead: asset.subhead,
      body: asset.body || '',
      ctaText: asset.ctaText || '',
      colorStyle: asset.colorStyle || '1',
      alignment: asset.alignment || 'left',
      ctaStyle: asset.ctaStyle || 'link',
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      stackAlign: (asset.stackAlign as 'top' | 'center' | 'bottom') ?? 'top',
      gaps: asset.templateGaps?.['email-dark-gradient'] ?? {},
      lineHeights: (asset.lineHeights as Record<string, number>) ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#000000',
      fields: [
        { param: 'headline', parser: 'string', default: '' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: '' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'alignment', parser: 'enum', default: 'left' },
        { param: 'ctaStyle', parser: 'enum', default: 'link' },
        { param: 'showEyebrow', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
        { param: 'lineHeights', parser: 'jsonRecord' },
      ],
    },
  },

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

  'website-report': {
    component: WebsiteReport,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      subhead: asset.subhead,
      cta: asset.ctaText || '',
      solution: asset.solution,
      variant: asset.reportVariant,
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_report.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      imageFilters: asset.thumbnailImageFilters,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      theme: asset.theme || 'dark',
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['website-report'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'safety' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_report.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'imageFilterExposure', parser: 'number', default: 0 },
        { param: 'imageFilterContrast', parser: 'number', default: 0 },
        { param: 'imageFilterSaturation', parser: 'number', default: 0 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
        { param: 'theme', parser: 'enum', default: 'dark' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || '',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
        imageFilters: {
          exposure: parsed.imageFilterExposure as number,
          contrast: parsed.imageFilterContrast as number,
          saturation: parsed.imageFilterSaturation as number,
        },
      }),
    },
  },

  'website-event-listing': {
    component: WebsiteEventListing,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      subhead: asset.subhead,
      variant: asset.eventListingVariant,
      gridDetail1Text: asset.gridDetail1Text || '',
      gridDetail2Text: asset.gridDetail2Text || '',
      gridDetail3Text: asset.gridDetail3Text || '',
      gridDetail4Text: asset.gridDetail4Text || '',
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['website-event-listing'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: null,
      dynamicBackground: (p) => p.variant === 'light' ? '#F9F9F9' : p.variant === 'orange' ? '#D35F0B' : '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'variant', parser: 'enum', default: 'orange' },
        { param: 'gridDetail1Text', parser: 'string', default: '' },
        { param: 'gridDetail2Text', parser: 'string', default: '' },
        { param: 'gridDetail3Text', parser: 'string', default: '' },
        { param: 'gridDetail4Text', parser: 'string', default: '' },
        { param: 'showRow3', parser: 'boolTrue' },
        { param: 'showRow4', parser: 'boolTrue' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
      ],
    },
  },

  'website-ehs-accelerate-listing': {
    component: WebsiteEhsAccelerateListing,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      subhead: asset.subhead,
      gridDetail1Text: asset.gridDetail1Text || '',
      gridDetail2Text: asset.gridDetail2Text || '',
      gridDetail3Text: asset.gridDetail3Text || '',
      gridDetail4Text: asset.gridDetail4Text || '',
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['website-ehs-accelerate-listing'] ?? {},
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#FFFFFF',
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'gridDetail1Text', parser: 'string', default: '' },
        { param: 'gridDetail2Text', parser: 'string', default: '' },
        { param: 'gridDetail3Text', parser: 'string', default: '' },
        { param: 'gridDetail4Text', parser: 'string', default: '' },
        { param: 'showRow3', parser: 'boolTrue' },
        { param: 'showRow4', parser: 'boolTrue' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'stackAlign', parser: 'enum', default: 'top' },
        { param: 'gaps', parser: 'jsonRecord' },
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

  'website-floating-banner': {
    component: WebsiteFloatingBanner,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      cta: asset.ctaText || '',
      showEyebrow: asset.showEyebrow,
      variant: asset.floatingBannerVariant || 'dark',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 2256,
      height: 100,
      background: null,
      fields: [
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'headline', parser: 'string', default: '' },
        { param: 'showEyebrow', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'variant', parser: 'enum', default: 'dark' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.cta as string) || (raw.ctaText as string) || '',
      }),
    },
  },

  'website-floating-banner-mobile': {
    component: WebsiteFloatingBannerMobile,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || '',
      headline: asset.headline || '',
      cta: asset.ctaText || '',
      showEyebrow: asset.showEyebrow,
      variant: asset.floatingBannerMobileVariant || 'light',
      arrowType: asset.floatingBannerMobileArrowType || 'text',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
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
