/**
 * Stage & Bench registration for website-report.
 */

import type { StackAlign } from '@/types'
import { WebsiteReport } from '@/components/templates/WebsiteReport'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteReportStageBench } from './WebsiteReportStageBench'

export const websiteReportRegistration: StageBenchRegistrationData = {
  templateId: 'website-report',
  Template: WebsiteReport,
  Adapter: WebsiteReportStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow,
    headline: asset.headline || '',
    subhead: asset.subhead,
    cta: asset.ctaText || '',
    // Template gates the solution pill via `solution !== 'none'`; collapse
    // when user has hidden it so export respects the toggle.
    solution: asset.showSolutionSet === false ? 'none' : asset.solution,
    variant: asset.reportVariant,
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
      variant: s.reportVariant,
      showEyebrow: s.showEyebrow,
      showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
      showCta: s.showCta,
      ctaText: s.ctaText,
      theme: s.theme,
      // Solution pill is gated via the 'none' sentinel — template has no
      // showSolutionSet prop; collapse when hidden.
      solution: s.showSolutionSet === false ? 'none' : s.solution,
      stackAlign: s.stackAlign,
      gaps: s.templateGaps['website-report'] ?? {},
    }
  },
}
