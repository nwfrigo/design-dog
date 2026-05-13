/**
 * Stage & Bench registration for email-image. Mirrors SocialImageRegistration
 * but sized for the 640×300 email canvas and without subhead/metadata.
 */

import type { StackAlign } from '@/types'
import { EmailImage } from '@/components/templates/EmailImage'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailImageStageBench } from './EmailImageStageBench'

export const emailImageRegistration: StageBenchRegistrationData = {
  templateId: 'email-image',
  Template: EmailImage,
  Adapter: EmailImageStageBench,
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
      ctaText: s.ctaText,
      layout: s.layout,
      showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
      showCta: s.showCta,
      showSolutionSet: s.showSolutionSet,
      theme: s.theme,
      stackAlign: s.stackAlign,
      gaps: s.templateGaps['email-image'] ?? {},
    }
  },
}
