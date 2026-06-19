/**
 * Stage & Bench registration for custom-size.
 *
 * Adapter dispatch + queue-thumbnail renderProps. Export uses the dedicated
 * /render/custom-size route + customSizeConfig param (see app/api/export +
 * app/render/custom-size); the exportBuilder below produces those params.
 * No renderSchema — custom-size has its own static render route, not the
 * dynamic [slug] route.
 */

import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import { CustomSizeStageBench } from './CustomSizeStageBench'
import {
  customSizeToProps,
  defaultCustomSizeDocument,
  type ReusedContent,
} from '@/lib/custom-size/document'

export const customSizeRegistration: StageBenchRegistrationData = {
  templateId: 'custom-size',
  Template: CustomSizeCanvas,
  Adapter: CustomSizeStageBench,
  renderProps: (asset, colors, typography) => {
    const doc = asset.customSizeDocument ?? defaultCustomSizeDocument()
    const reused: ReusedContent = {
      eyebrow: asset.eyebrow,
      headline: asset.headline || '',
      subhead: asset.subhead || '',
      body: asset.body || '',
      cta: asset.ctaText || '',
      solution: asset.solution,
      showSolutionSet: asset.showSolutionSet,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead,
      showBody: asset.showBody,
      showCta: asset.showCta,
      theme: asset.theme || 'dark',
      grayscale: asset.grayscale,
      imagePosition: asset.thumbnailImagePosition || { x: 0, y: 0 },
      imageZoom: asset.thumbnailImageZoom || 1,
    }
    const m = customSizeToProps(doc, reused)
    return {
      content: m.content,
      width: doc.width,
      height: doc.height,
      theme: m.theme,
      overrides: m.overrides,
      colors,
      typography,
      scale: 1,
    }
  },
  queueTextFields: [],
  exportBuilder: (s) => {
    const doc = s.customSizeDocument ?? defaultCustomSizeDocument()
    return {
      customSizeConfig: doc,
      eyebrow: s.eyebrow,
      headline: s.verbatimCopy.headline || '',
      subhead: s.verbatimCopy.subhead || '',
      body: s.verbatimCopy.body || '',
      ctaText: s.ctaText || '',
      solution: s.solution,
      showSolutionSet: s.showSolutionSet,
      showEyebrow: s.showEyebrow,
      showSubhead: s.showSubhead,
      showBody: s.showBody,
      showCta: s.showCta,
      theme: s.theme || 'dark',
      grayscale: s.grayscale,
      imagePositionX: s.thumbnailImagePosition?.x ?? 0,
      imagePositionY: s.thumbnailImagePosition?.y ?? 0,
      imageZoom: s.thumbnailImageZoom ?? 1,
    }
  },
}
