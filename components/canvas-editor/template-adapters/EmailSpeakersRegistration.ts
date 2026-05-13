/**
 * Stage & Bench registration for email-speakers.
 *
 * The React adapter (`EmailSpeakersStageBench`) stays hand-rolled (568
 * LOC, multi-image speakers + `renderSpeakerField` per-piece editing
 * don't fit the standard factory slot model). This file only owns the
 * server-safe metadata: renderProps, renderSchema, exportBuilder.
 */

import { parseSpeakerParams } from '@/lib/render-params'
import type { SearchParams } from '@/lib/render-params'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const emailSpeakersRegistration: StageBenchRegistrationData = {
  templateId: 'email-speakers',
  Template: EmailSpeakers,
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
  exportBuilder: (s) => ({
    ctaText: s.ctaText,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
    showSolutionSet: s.showSolutionSet,
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
    grayscale: s.grayscale,
    theme: s.theme,
  }),
}
