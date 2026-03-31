import type { QueuedAsset, TemplateType } from '@/types'
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
import { CustomerLibrary } from '@/components/templates/CustomerLibrary'
import { WebsiteFloatingBanner } from '@/components/templates/WebsiteFloatingBanner'
import { WebsiteFloatingBannerMobile } from '@/components/templates/WebsiteFloatingBannerMobile'
import { EmailGrid, type GridDetail } from '@/components/templates/EmailGrid'
import { EmailImage } from '@/components/templates/EmailImage'
import { EmailProductRelease } from '@/components/templates/EmailProductRelease'
import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import { SocialBlueGradient } from '@/components/templates/SocialBlueGradient'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialImageMeddbase } from '@/components/templates/SocialImageMeddbase'
import { SocialGridDetail, type GridDetailRow } from '@/components/templates/SocialGridDetail'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { NewsletterDarkGradient } from '@/components/templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from '@/components/templates/NewsletterBlueGradient'
import { NewsletterLight } from '@/components/templates/NewsletterLight'
import { NewsletterTopBanner } from '@/components/templates/NewsletterTopBanner'

// ---------------------------------------------------------------------------
// Render Schema — declarative field definitions for dynamic render route
// ---------------------------------------------------------------------------

type FieldParser = 'string' | 'boolTrue' | 'boolFalse' | 'number' | 'numberOrUndefined' | 'enum' | 'stringOrNull' | 'int'

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

interface QueueTextField {
  key: string
  label: string
  showKey?: string
  isHtml?: boolean
}

interface TemplateRegistryEntry {
  component: React.ComponentType<any> // Each template has unique props — typed via renderProps
  renderProps: (asset: QueuedAsset, colors: ColorsConfig, typography: TypographyConfig) => Record<string, unknown>
  queueTextFields: QueueTextField[]
  renderSchema?: TemplateRenderSchema
}

export const TEMPLATE_REGISTRY: Partial<Record<TemplateType, TemplateRegistryEntry>> = {
  'website-thumbnail': {
    component: WebsiteThumbnail,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.ebookVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'EBOOK' },
        { param: 'headline', parser: 'string', default: 'Lightweight header.' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/safer_is_stronger_sample_page.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || 'Responsive',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'website-press-release': {
    component: WebsitePressRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'NEWS' },
        { param: 'headline', parser: 'string', default: 'Lightweight header.' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'health' },
        { param: 'imageUrl', parser: 'string', default: '/placeholder-mountain.jpg' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || 'Responsive',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'website-webinar': {
    component: WebsiteWebinar,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Webinar',
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      body: asset.body,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.webinarVariant,
      imageUrl: asset.thumbnailImageUrl || undefined,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta,
      speakerCount: asset.speakerCount,
      speaker1: { name: asset.speaker1Name, role: asset.speaker1Role, imageUrl: asset.speaker1ImageUrl, imagePosition: asset.speaker1ImagePosition, imageZoom: asset.speaker1ImageZoom },
      speaker2: { name: asset.speaker2Name, role: asset.speaker2Role, imageUrl: asset.speaker2ImageUrl, imagePosition: asset.speaker2ImagePosition, imageZoom: asset.speaker2ImageZoom },
      speaker3: { name: asset.speaker3Name, role: asset.speaker3Role, imageUrl: asset.speaker3ImageUrl, imagePosition: asset.speaker3ImagePosition, imageZoom: asset.speaker3ImageZoom },
      showSpeaker1: asset.showSpeaker1,
      showSpeaker2: asset.showSpeaker2,
      showSpeaker3: asset.showSpeaker3,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'Webinar' },
        { param: 'headline', parser: 'string', default: 'Lightweight header.' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'safety' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showBody', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'speakerCount', parser: 'int', default: 3 },
        { param: 'showSpeaker1', parser: 'boolTrue' },
        { param: 'showSpeaker2', parser: 'boolTrue' },
        { param: 'showSpeaker3', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => {
        const searchParams = raw as SearchParams
        const s1 = parseSpeakerParams(searchParams, 1)
        const s2 = parseSpeakerParams(searchParams, 2)
        const s3 = parseSpeakerParams(searchParams, 3)
        return {
          cta: (raw.ctaText as string) || (raw.cta as string) || 'Responsive',
          imageUrl: (raw.imageUrl as string) || undefined,
          imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
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
        headline: asset.headline || 'Headline',
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
        logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
        showGridDetail2: asset.showGridDetail2,
        gridDetail1, gridDetail2, gridDetail3,
        headlineFontSize: asset.headlineFontSize ?? undefined,
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'body', parser: 'string', default: 'This is your body copy. Lorem ipsum dolor sit am' },
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
        { param: 'gridDetail1Text', parser: 'string', default: 'Date: January 1st, 2026' },
        { param: 'gridDetail2Type', parser: 'enum', default: 'data' },
        { param: 'gridDetail2Text', parser: 'string', default: 'Date: January 1st, 2026' },
        { param: 'gridDetail3Type', parser: 'enum', default: 'cta' },
        { param: 'gridDetail3Text', parser: 'string', default: 'Responsive' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
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
      headline: asset.headline || 'Headline',
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'body', parser: 'string', default: 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'layout', parser: 'enum', default: 'even' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'email-product-release': {
    component: EmailProductRelease,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Product Release',
      headline: asset.headline || 'GX2 2026.1',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 164,
      background: '#F9F9F9',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'Product Release' },
        { param: 'headline', parser: 'string', default: 'GX2 2026.1' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'grayscale', parser: 'boolFalse' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'email-cority-connect-2026': {
    component: EmailCorityConnect2026,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Lightweight header.',
      body: asset.body || '',
      ctaText: asset.ctaText || 'Register Now',
      backgroundVariant: asset.ccBackgroundVariant || 'dark-blue-1',
      showHeadline: asset.showHeadline !== false,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
    renderSchema: {
      width: 640,
      height: 370,
      background: '#060015',
      fields: [
        { param: 'headline', parser: 'string', default: 'Lightweight header.' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Register Now' },
        { param: 'backgroundVariant', parser: 'enum', default: 'dark-blue-1' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
    },
  },

  'social-dark-gradient': {
    component: SocialDarkGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      body: asset.body,
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      logoColor: asset.logoColor === 'black' ? 'white' : asset.logoColor,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
    renderSchema: {
      width: 1200,
      height: 628,
      background: '#000000',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'Eyebrow' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'metadata', parser: 'string', default: 'Day / Month | 00:00' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'headingSize', parser: 'enum', default: 'L' },
        { param: 'alignment', parser: 'enum', default: 'left' },
        { param: 'ctaStyle', parser: 'enum', default: 'link' },
        { param: 'logoColor', parser: 'enum', default: 'white' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showMetadata', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
    },
  },

  'social-blue-gradient': {
    component: SocialBlueGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      body: asset.body,
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [
      { key: 'metadata', label: 'Metadata', showKey: 'showMetadata' },
      { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
    ],
    renderSchema: {
      width: 1200,
      height: 628,
      background: '#0080FF',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'Eyebrow' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'metadata', parser: 'string', default: 'Day / Month | 00:00' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'headingSize', parser: 'enum', default: 'L' },
        { param: 'alignment', parser: 'enum', default: 'left' },
        { param: 'ctaStyle', parser: 'enum', default: 'link' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showBody', parser: 'boolTrue' },
        { param: 'showMetadata', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
    },
  },

  'social-image': {
    component: SocialImage,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      metadata: asset.metadata || 'Day / Month | 00:00',
      ctaText: asset.ctaText || 'Learn More',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showMetadata: asset.showMetadata !== false,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'metadata', parser: 'string', default: 'Day / Month | 00:00' },
        { param: 'ctaText', parser: 'string', default: 'Learn More' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'layout', parser: 'enum', default: 'even' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showMetadata', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'social-image-meddbase': {
    component: SocialImageMeddbase,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      metadata: asset.metadata || 'Day / Month | 00:00',
      ctaText: asset.ctaText || 'Learn More',
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      layout: asset.layout || 'even',
      solution: asset.solution,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showMetadata: asset.showMetadata !== false,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'metadata', parser: 'string', default: 'Day / Month | 00:00' },
        { param: 'ctaText', parser: 'string', default: 'Learn More' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_1.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
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
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'social-grid-detail': {
    component: SocialGridDetail,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || 'This is your subheader or description text.',
      eyebrow: asset.eyebrow || "Don't miss this.",
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showSolutionSet: asset.showSolutionSet !== false,
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showRow3: asset.showRow3 !== false,
      showRow4: asset.showRow4 !== false,
      gridDetail1: { type: 'data' as const, text: asset.gridDetail1Text || 'Date: January 1st, 2026' },
      gridDetail2: { type: 'data' as const, text: asset.gridDetail2Text || 'Time: Midnight, EST' },
      gridDetail3: { type: (asset.gridDetail3Type || 'data') as GridDetailRow['type'], text: asset.gridDetail3Text || 'Place: Wherever' },
      gridDetail4: { type: (asset.gridDetail4Type || 'cta') as GridDetailRow['type'], text: asset.gridDetail4Text || 'Join the event' },
      headlineFontSize: asset.headlineFontSize ?? undefined,
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: 'This is your subheader or description text. Keep it to two lines if you can.' },
        { param: 'eyebrow', parser: 'string', default: "Don't miss this." },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showSolutionSet', parser: 'boolTrue' },
        { param: 'solution', parser: 'string', default: 'environmental' },
        { param: 'logoColor', parser: 'enum', default: 'black' },
        { param: 'showRow3', parser: 'boolTrue' },
        { param: 'showRow4', parser: 'boolTrue' },
        { param: 'gridDetail1Text', parser: 'string', default: 'Date: January 1st, 2026' },
        { param: 'gridDetail2Text', parser: 'string', default: 'Time: Midnight, EST' },
        { param: 'gridDetail3Text', parser: 'string', default: 'Place: Wherever' },
        { param: 'gridDetail3Type', parser: 'enum', default: 'data' },
        { param: 'gridDetail4Text', parser: 'string', default: 'Join the event' },
        { param: 'gridDetail4Type', parser: 'enum', default: 'cta' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        gridDetail1: { type: 'data', text: parsed.gridDetail1Text },
        gridDetail2: { type: 'data', text: parsed.gridDetail2Text },
        gridDetail3: { type: parsed.gridDetail3Type, text: parsed.gridDetail3Text },
        gridDetail4: { type: parsed.gridDetail4Type, text: parsed.gridDetail4Text },
      }),
    },
  },

  'email-dark-gradient': {
    component: EmailDarkGradient,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      eyebrow: asset.eyebrow,
      subhead: asset.subhead,
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      alignment: asset.alignment || 'left',
      ctaStyle: asset.ctaStyle || 'link',
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      bottomSpacing: (asset.showCta !== false) ? 0 : (asset.bottomSpacing ?? 0),
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#000000',
      fields: [
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
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
        { param: 'bottomSpacing', parser: 'numberOrUndefined' },
      ],
    },
  },

  'email-speakers': {
    component: EmailSpeakers,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Headline',
      eyebrow: asset.eyebrow,
      body: asset.body || 'This is your body copy.',
      ctaText: asset.ctaText || 'Responsive',
      solution: asset.solution,
      logoColor: asset.logoColor === 'white' ? 'black' : asset.logoColor,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showBody: asset.showBody && !!asset.body,
      showCta: asset.showCta !== false,
      showSolutionSet: asset.showSolutionSet !== false,
      speakerCount: asset.speakerCount || 3,
      speaker1: { name: asset.speaker1Name || 'Firstname Lastname', role: asset.speaker1Role || 'Role, Company', imageUrl: asset.speaker1ImageUrl || '', imagePosition: asset.speaker1ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker1ImageZoom || 1 },
      speaker2: { name: asset.speaker2Name || 'Firstname Lastname', role: asset.speaker2Role || 'Role, Company', imageUrl: asset.speaker2ImageUrl || '', imagePosition: asset.speaker2ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker2ImageZoom || 1 },
      speaker3: { name: asset.speaker3Name || 'Firstname Lastname', role: asset.speaker3Role || 'Role, Company', imageUrl: asset.speaker3ImageUrl || '', imagePosition: asset.speaker3ImagePosition || { x: 0, y: 0 }, imageZoom: asset.speaker3ImageZoom || 1 },
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 300,
      background: '#FFFFFF',
      fields: [
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'eyebrow', parser: 'string', default: '' },
        { param: 'body', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
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

  'newsletter-dark-gradient': {
    component: NewsletterDarkGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 179,
      background: '#000000',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'EYEBROW' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'imageSize', parser: 'enum', default: 'none' },
        { param: 'imageUrl', parser: 'stringOrNull' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'newsletter-blue-gradient': {
    component: NewsletterBlueGradient,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      ctaText: asset.ctaText || 'Responsive',
      colorStyle: asset.colorStyle || '1',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 179,
      background: '#000000',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'EYEBROW' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'colorStyle', parser: 'enum', default: '1' },
        { param: 'imageSize', parser: 'enum', default: 'none' },
        { param: 'imageUrl', parser: 'stringOrNull' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'newsletter-light': {
    component: NewsletterLight,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow,
      headline: asset.headline || 'Headline',
      subhead: asset.subhead || '',
      ctaText: asset.ctaText || 'Responsive',
      imageSize: asset.newsletterImageSize || 'none',
      imageUrl: asset.newsletterImageUrl || null,
      imagePosition: asset.newsletterImagePosition || { x: 0, y: 0 },
      imageZoom: asset.newsletterImageZoom || 1,
      showEyebrow: asset.showEyebrow && !!asset.eyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta !== false,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 640,
      height: 179,
      background: '#FFFFFF',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'EYEBROW' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'ctaText', parser: 'string', default: 'Responsive' },
        { param: 'imageSize', parser: 'enum', default: 'none' },
        { param: 'imageUrl', parser: 'stringOrNull' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed) => ({
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'newsletter-top-banner': {
    component: NewsletterTopBanner,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'Month | Year',
      headline: asset.headline || 'EHS+ Newsletter',
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
        { param: 'eyebrow', parser: 'string', default: 'Month | Year' },
        { param: 'headline', parser: 'string', default: 'EHS+ Newsletter' },
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
      eyebrow: asset.eyebrow || 'REPORT',
      headline: asset.headline || 'Lightweight header.',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      solution: asset.solution,
      variant: asset.reportVariant,
      imageUrl: asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_report.png',
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      showCta: asset.showCta,
      grayscale: asset.grayscale,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      subheadFontSize: asset.subheadFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'REPORT' },
        { param: 'headline', parser: 'string', default: 'Lightweight header.' },
        { param: 'subhead', parser: 'string', default: '' },
        { param: 'solution', parser: 'string', default: 'safety' },
        { param: 'variant', parser: 'enum', default: 'image' },
        { param: 'imageUrl', parser: 'string', default: '/assets/images/default_placeholder_image_report.png' },
        { param: 'imagePositionX', parser: 'number', default: 0 },
        { param: 'imagePositionY', parser: 'number', default: 0 },
        { param: 'imageZoom', parser: 'number', default: 1 },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolFalse' },
        { param: 'showCta', parser: 'boolTrue' },
        { param: 'grayscale', parser: 'boolFalse' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
        { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || 'Responsive',
        imagePosition: { x: parsed.imagePositionX as number, y: parsed.imagePositionY as number },
      }),
    },
  },

  'website-event-listing': {
    component: WebsiteEventListing,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'LIVE EVENT',
      headline: asset.headline || 'Headline',
      subhead: asset.subhead,
      cta: asset.ctaText || 'Responsive',
      variant: asset.eventListingVariant,
      gridDetail1Text: asset.gridDetail1Text || 'Add Details or Hide Me',
      gridDetail2Text: asset.gridDetail2Text || 'Add Details or Hide Me',
      gridDetail3Text: asset.gridDetail3Text || 'Add Details or Hide Me',
      gridDetail4Text: asset.gridDetail4Text || 'Add Details or Hide Me',
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead && !!asset.subhead,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
    renderSchema: {
      width: 800,
      height: 450,
      background: null,
      dynamicBackground: (p) => p.variant === 'light' ? '#F9F9F9' : p.variant === 'orange' ? '#D35F0B' : '#060015',
      fields: [
        { param: 'eyebrow', parser: 'string', default: 'LIVE EVENT' },
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'subhead', parser: 'string', default: 'This is your subheader or description text. Keep it to two lines if you can.' },
        { param: 'variant', parser: 'enum', default: 'orange' },
        { param: 'gridDetail1Text', parser: 'string', default: 'Add Details or Hide Me' },
        { param: 'gridDetail2Text', parser: 'string', default: 'Add Details or Hide Me' },
        { param: 'gridDetail3Text', parser: 'string', default: 'Add Details or Hide Me' },
        { param: 'gridDetail4Text', parser: 'string', default: 'Add Details or Hide Me' },
        { param: 'showRow3', parser: 'boolTrue' },
        { param: 'showRow4', parser: 'boolTrue' },
        { param: 'showEyebrow', parser: 'boolTrue' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'showSubhead', parser: 'boolTrue' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.ctaText as string) || (raw.cta as string) || 'Responsive',
      }),
    },
  },

  'customer-library': {
    component: CustomerLibrary,
    renderProps: (asset, colors, typography) => ({
      headline: asset.headline || 'Chemical Library',
      eyebrow: asset.eyebrow || 'Chemical Safety Data Sheet Library',
      body: asset.body || 'Lorem ipsum',
      footerText: asset.subhead || 'Lorem ipsum',
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
        { param: 'headline', parser: 'string', default: 'Chemical Library' },
        { param: 'eyebrow', parser: 'string', default: 'Chemical Safety Data Sheet Library' },
        { param: 'body', parser: 'string', default: 'Lorem ipsum' },
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
      eyebrow: asset.eyebrow || 'EYEBROW',
      headline: asset.headline || 'Headline',
      cta: asset.ctaText || 'Learn More',
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
        { param: 'headline', parser: 'string', default: 'Headline' },
        { param: 'showEyebrow', parser: 'boolFalse' },
        { param: 'showHeadline', parser: 'boolTrue' },
        { param: 'variant', parser: 'enum', default: 'dark' },
        { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      ],
      assembleProps: (parsed, raw) => ({
        cta: (raw.cta as string) || (raw.ctaText as string) || 'Learn More',
      }),
    },
  },

  'website-floating-banner-mobile': {
    component: WebsiteFloatingBannerMobile,
    renderProps: (asset, colors, typography) => ({
      eyebrow: asset.eyebrow || 'EYEBROW',
      headline: asset.headline || 'Headline',
      cta: asset.ctaText || 'Learn More',
      showEyebrow: asset.showEyebrow,
      variant: asset.floatingBannerMobileVariant || 'light',
      arrowType: asset.floatingBannerMobileArrowType || 'text',
      headlineFontSize: asset.headlineFontSize ?? undefined,
      colors, typography, scale: 1,
    }),
    queueTextFields: [],
  },
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
