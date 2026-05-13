/**
 * Stage & Bench registration for website-webinar.
 *
 * Speaker fields ride through as 3×6 scalar params (name/role/url +
 * positionXY/zoom), reassembled by `assembleProps` into the
 * `speaker1/2/3` prop shape the template expects.
 */

import type { StackAlign } from '@/types'
import { parseSpeakerParams } from '@/lib/render-params'
import type { SearchParams } from '@/lib/render-params'
import { WebsiteWebinar } from '@/components/templates/WebsiteWebinar'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteWebinarStageBench } from './WebsiteWebinarStageBench'

export const websiteWebinarRegistration: StageBenchRegistrationData = {
  templateId: 'website-webinar',
  Template: WebsiteWebinar,
  Adapter: WebsiteWebinarStageBench,
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
  exportBuilder: (s) => {
    const f = s.thumbnailImageFilters
    return {
      variant: s.webinarVariant,
      imageUrl: s.thumbnailImageUrl,
      imagePositionX: s.thumbnailImagePosition.x,
      imagePositionY: s.thumbnailImagePosition.y,
      imageZoom: s.thumbnailImageZoom,
      grayscale: s.grayscale,
      imageFilterExposure: f?.exposure ?? 0,
      imageFilterContrast: f?.contrast ?? 0,
      imageFilterSaturation: f?.saturation ?? 0,
      showEyebrow: s.showEyebrow && !!s.eyebrow,
      showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
      showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
      showCta: s.showCta,
      ctaText: s.ctaText,
      speakerCount: s.speakerCount,
      speaker1Name: s.speaker1Name,
      speaker1Role: s.speaker1Role,
      speaker1ImageUrl: s.speaker1ImageUrl,
      speaker1ImagePositionX: s.speaker1ImagePosition.x,
      speaker1ImagePositionY: s.speaker1ImagePosition.y,
      speaker1ImageZoom: s.speaker1ImageZoom,
      speaker2Name: s.speaker2Name,
      speaker2Role: s.speaker2Role,
      speaker2ImageUrl: s.speaker2ImageUrl,
      speaker2ImagePositionX: s.speaker2ImagePosition.x,
      speaker2ImagePositionY: s.speaker2ImagePosition.y,
      speaker2ImageZoom: s.speaker2ImageZoom,
      speaker3Name: s.speaker3Name,
      speaker3Role: s.speaker3Role,
      speaker3ImageUrl: s.speaker3ImageUrl,
      speaker3ImagePositionX: s.speaker3ImagePosition.x,
      speaker3ImagePositionY: s.speaker3ImagePosition.y,
      speaker3ImageZoom: s.speaker3ImageZoom,
      showSpeaker1: s.showSpeaker1,
      showSpeaker2: s.showSpeaker2,
      showSpeaker3: s.showSpeaker3,
      theme: s.theme,
      stackAlign: s.stackAlign,
      gaps: s.templateGaps['website-webinar'] ?? {},
    }
  },
}
