/**
 * Stage & Bench registration for social-blue-gradient.
 * See SocialEhsAccelerateRegistration.ts for the registration shape.
 */

import type { StackAlign } from '@/types'
import { SocialBlueGradient } from '@/components/templates/SocialBlueGradient'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { SocialBlueGradientStageBench } from './SocialBlueGradientStageBench'

export const socialBlueGradientRegistration: StageBenchRegistrationData = {
  templateId: 'social-blue-gradient',
  Template: SocialBlueGradient,
  Adapter: SocialBlueGradientStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow,
    headline: asset.headline || '',
    subhead: asset.subhead,
    body: asset.body,
    metadata: asset.metadata,
    ctaText: asset.ctaText,
    colorStyle: asset.colorStyle,
    headingSize: asset.headingSize,
    alignment: asset.alignment,
    ctaStyle: asset.ctaStyle,
    showEyebrow: asset.showEyebrow,
    showHeadline: asset.showHeadline !== false,
    showSubhead: asset.showSubhead && !!asset.subhead,
    showBody: asset.showBody && !!asset.body,
    showMetadata: asset.showMetadata,
    showCta: asset.showCta,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    subheadFontSize: asset.subheadFontSize ?? undefined,
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['social-blue-gradient'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'metadata', label: 'Small Caption', showKey: 'showMetadata' },
    { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
  ],
  renderSchema: {
    width: 1200,
    height: 628,
    background: '#0080FF',
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'metadata', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
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
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
    ],
  },
  exportBuilder: (s) => ({
    metadata: s.metadata,
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    headingSize: s.headingSize,
    alignment: s.alignment,
    ctaStyle: s.ctaStyle,
    showEyebrow: s.showEyebrow,
    showHeadline: s.showHeadline,
    showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showMetadata: s.showMetadata,
    showCta: s.showCta,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['social-blue-gradient'] ?? {},
  }),
}
