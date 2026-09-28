/**
 * Stage & Bench registration for email-cority-connect-2027 — clone of the
 * 2026 registration with the 2027 template/adapter.
 */

import { EmailCorityConnect2026 } from '@/components/templates/EmailCorityConnect2026'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailCorityConnect2027StageBench } from './EmailCorityConnect2027StageBench'

export const emailCorityConnect2027Registration: StageBenchRegistrationData = {
  templateId: 'email-cority-connect-2027',
  Template: EmailCorityConnect2026,
  Adapter: EmailCorityConnect2027StageBench,
  renderProps: (asset, colors, typography) => ({
    // Same component as 2026 — the pinned year swaps in the 2027 lockup.
    year: '2027' as const,
    headline: asset.headline || '',
    body: asset.body || '',
    ctaText: asset.ctaText || '',
    backgroundVariant: asset.ccBackgroundVariant || 'dark-blue-1',
    showHeadline: asset.showHeadline !== false,
    showBody: asset.showBody,
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
    // The render route assembles Template props from the schema (it does not
    // call renderProps), so the pinned year must be injected here too.
    assembleProps: () => ({ year: '2027' as const }),
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
    showHeadline: s.showHeadline,
    showBody: s.showBody,
    showCta: s.showCta,
  }),
}
