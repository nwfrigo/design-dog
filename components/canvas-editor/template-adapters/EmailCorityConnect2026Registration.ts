/**
 * Stage & Bench registration for email-cority-connect-2026. See
 * SocialEhsAccelerateRegistration.ts for the rationale behind the
 * server-safe single-source-of-truth shape.
 */

import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const emailCorityConnect2026Registration: StageBenchRegistrationData = {
  templateId: 'email-cority-connect-2026',
  Template: EmailCorityConnect2026,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    body: asset.body || '',
    ctaText: asset.ctaText || '',
    backgroundVariant: asset.ccBackgroundVariant || 'dark-blue-1',
    showHeadline: asset.showHeadline !== false,
    showBody: asset.showBody && !!asset.body,
    showCta: asset.showCta !== false,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'ctaText', label: 'CTA', showKey: 'showCta' },
  ],
  renderSchema: {
    width: 640,
    height: 370,
    background: '#060015',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'backgroundVariant', parser: 'enum', default: 'dark-blue-1' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showBody', parser: 'boolTrue' },
      { param: 'showCta', parser: 'boolTrue' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
    ],
  },
  exportBuilder: (s) => ({
    backgroundVariant: s.ccBackgroundVariant || 'dark-blue-1',
    ctaText: s.ctaText,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
  }),
}
