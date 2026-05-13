/**
 * Stage & Bench registration for website-press-release.
 */

import { WebsitePressRelease } from '@/components/templates/WebsitePressRelease'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsitePressReleaseStageBench } from './WebsitePressReleaseStageBench'

export const websitePressReleaseRegistration: StageBenchRegistrationData = {
  templateId: 'website-press-release',
  Template: WebsitePressRelease,
  Adapter: WebsitePressReleaseStageBench,
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
      grayscale: s.grayscale,
      imageFilterExposure: f?.exposure ?? 0,
      imageFilterContrast: f?.contrast ?? 0,
      imageFilterSaturation: f?.saturation ?? 0,
      showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
      showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
      showCta: s.showCta,
      ctaText: s.ctaText,
      theme: s.theme,
    }
  },
}
