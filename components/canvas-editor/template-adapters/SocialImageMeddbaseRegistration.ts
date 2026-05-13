/**
 * Stage & Bench registration for social-image-meddbase. See
 * SocialImageRegistration.ts for the parent shape — meddbase strips the
 * theme prop (always white background).
 */

import type { StackAlign } from '@/types'
import { SocialImageMeddbase } from '@/components/templates/SocialImageMeddbase'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const socialImageMeddbaseRegistration: StageBenchRegistrationData = {
  templateId: 'social-image-meddbase',
  Template: SocialImageMeddbase,
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
    { key: 'metadata', label: 'Small Caption', showKey: 'showMetadata' },
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
  exportBuilder: (s) => {
    const f = s.thumbnailImageFilters
    return {
      imageUrl: s.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePositionX: s.thumbnailImagePosition.x,
      imagePositionY: s.thumbnailImagePosition.y,
      imageZoom: s.thumbnailImageZoom,
      imageFilterExposure: f?.exposure ?? 0,
      imageFilterContrast: f?.contrast ?? 0,
      imageFilterSaturation: f?.saturation ?? 0,
      grayscale: s.grayscale,
      metadata: s.metadata,
      ctaText: s.ctaText,
      layout: s.layout,
      showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
      showMetadata: s.showMetadata,
      showCta: s.showCta,
      showSolutionSet: s.showSolutionSet,
      stackAlign: s.stackAlign,
      gaps: s.templateGaps['social-image-meddbase'] ?? {},
    }
  },
}
