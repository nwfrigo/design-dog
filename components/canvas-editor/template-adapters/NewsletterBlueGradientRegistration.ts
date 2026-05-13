/**
 * Stage & Bench registration for newsletter-blue-gradient.
 * See SocialEhsAccelerateRegistration.ts for the registration shape.
 */

import type { ColorStyle, StackAlign } from '@/types'
import { NewsletterBlueGradient } from '@/components/templates/NewsletterBlueGradient'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { NewsletterBlueGradientStageBench } from './NewsletterBlueGradientStageBench'

export const newsletterBlueGradientRegistration: StageBenchRegistrationData = {
  templateId: 'newsletter-blue-gradient',
  Template: NewsletterBlueGradient,
  Adapter: NewsletterBlueGradientStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow,
    headline: asset.headline || '',
    subhead: asset.subhead || '',
    ctaText: asset.ctaText || '',
    colorStyle: (asset.colorStyle as ColorStyle) || '1',
    imageSize: asset.newsletterImageSize || 'none',
    imageUrl: asset.thumbnailImageUrl || null,
    imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
    imageZoom: asset.thumbnailImageZoom || 1,
    imageFilters: asset.thumbnailImageFilters,
    showEyebrow: asset.showEyebrow && !!asset.eyebrow,
    showHeadline: asset.showHeadline !== false,
    showSubhead: asset.showSubhead && !!asset.subhead,
    showCta: asset.showCta !== false,
    grayscale: asset.grayscale,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    subheadFontSize: asset.subheadFontSize ?? undefined,
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['newsletter-blue-gradient'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 640,
    height: 179,
    background: '#000000',
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'colorStyle', parser: 'enum', default: '1' },
      { param: 'imageSize', parser: 'enum', default: 'none' },
      { param: 'imageUrl', parser: 'stringOrNull' },
      { param: 'imagePositionX', parser: 'number', default: 0 },
      { param: 'imagePositionY', parser: 'number', default: 0 },
      { param: 'imageZoom', parser: 'number', default: 1 },
      { param: 'imageFilterExposure', parser: 'number', default: 0 },
      { param: 'imageFilterContrast', parser: 'number', default: 0 },
      { param: 'imageFilterSaturation', parser: 'number', default: 0 },
      { param: 'showEyebrow', parser: 'boolTrue' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showSubhead', parser: 'boolTrue' },
      { param: 'showCta', parser: 'boolTrue' },
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
  exportBuilder: (s) => {
    const f = s.thumbnailImageFilters
    return {
      imageUrl: s.thumbnailImageUrl,
      imagePositionX: s.thumbnailImagePosition.x,
      imagePositionY: s.thumbnailImagePosition.y,
      imageZoom: s.thumbnailImageZoom,
      imageFilterExposure: f?.exposure ?? 0,
      imageFilterContrast: f?.contrast ?? 0,
      imageFilterSaturation: f?.saturation ?? 0,
      ctaText: s.ctaText,
      colorStyle: s.colorStyle,
      imageSize: s.newsletterImageSize,
      showEyebrow: s.showEyebrow && !!s.eyebrow,
      showHeadline: s.showHeadline,
      showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
      showCta: s.showCta,
      grayscale: s.grayscale,
      stackAlign: s.stackAlign,
      gaps: s.templateGaps['newsletter-blue-gradient'] ?? {},
    }
  },
}
