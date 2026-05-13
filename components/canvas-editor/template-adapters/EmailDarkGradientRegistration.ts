/**
 * Stage & Bench registration for email-dark-gradient.
 * See SocialEhsAccelerateRegistration.ts for the registration shape.
 */

import type { StackAlign } from '@/types'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailDarkGradientStageBench } from './EmailDarkGradientStageBench'

export const emailDarkGradientRegistration: StageBenchRegistrationData = {
  templateId: 'email-dark-gradient',
  Template: EmailDarkGradient,
  Adapter: EmailDarkGradientStageBench,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    eyebrow: asset.eyebrow,
    subhead: asset.subhead,
    body: asset.body || '',
    ctaText: asset.ctaText || '',
    colorStyle: asset.colorStyle || '1',
    alignment: asset.alignment || 'left',
    ctaStyle: asset.ctaStyle || 'link',
    showEyebrow: asset.showEyebrow && !!asset.eyebrow,
    showSubhead: asset.showSubhead && !!asset.subhead,
    showBody: asset.showBody && !!asset.body,
    showCta: asset.showCta !== false,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    subheadFontSize: asset.subheadFontSize ?? undefined,
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['email-dark-gradient'] ?? {},
    lineHeights: (asset.lineHeights as Record<string, number>) ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 640,
    height: 300,
    background: '#000000',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'colorStyle', parser: 'enum', default: '1' },
      { param: 'alignment', parser: 'enum', default: 'left' },
      { param: 'ctaStyle', parser: 'enum', default: 'link' },
      { param: 'showEyebrow', parser: 'boolFalse' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showSubhead', parser: 'boolFalse' },
      { param: 'showBody', parser: 'boolTrue' },
      { param: 'showCta', parser: 'boolTrue' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
      { param: 'lineHeights', parser: 'jsonRecord' },
    ],
  },
  exportBuilder: (s) => ({
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    alignment: s.alignment,
    ctaStyle: s.ctaStyle,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['email-dark-gradient'] ?? {},
    lineHeights: s.lineHeights,
  }),
}
