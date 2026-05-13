/**
 * Stage & Bench registration for email-product-release.
 */

import { EmailProductRelease } from '@/components/templates/EmailProductRelease'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const emailProductReleaseRegistration: StageBenchRegistrationData = {
  templateId: 'email-product-release',
  Template: EmailProductRelease,
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
  exportBuilder: (s) => {
    const f = s.thumbnailImageFilters
    return {
      imageUrl: s.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
      imagePositionX: s.thumbnailImagePosition.x,
      imagePositionY: s.thumbnailImagePosition.y,
      imageZoom: s.thumbnailImageZoom,
      grayscale: s.grayscale,
      imageFilterExposure: f?.exposure ?? 0,
      imageFilterContrast: f?.contrast ?? 0,
      imageFilterSaturation: f?.saturation ?? 0,
      eyebrow: s.eyebrow || 'Product Release',
      headline: s.verbatimCopy.headline || 'GX2 2026.1',
    }
  },
}
