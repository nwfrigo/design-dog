/**
 * Stage & Bench registration for email-ehs-accelerate-banner.
 */

import { EmailEhsAccelerateBanner } from '@/components/templates/EmailEhsAccelerateBanner'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const emailEhsAccelerateBannerRegistration: StageBenchRegistrationData = {
  templateId: 'email-ehs-accelerate-banner',
  Template: EmailEhsAccelerateBanner,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    body: asset.body || '',
    showBody: asset.showBody !== false,
    ctaText: asset.ctaText || '',
    headlineFontSize: asset.headlineFontSize ?? undefined,
    eventDate: asset.eventDate || '',
    eventLocation: asset.eventLocation || '',
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Body' },
    { key: 'ctaText', label: 'CTA' },
    { key: 'eventDate', label: 'Date' },
    { key: 'eventLocation', label: 'Location' },
  ],
  renderSchema: {
    width: 600,
    height: 373,
    background: '#ffffff',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'showBody', parser: 'boolTrue', default: true },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'eventDate', parser: 'string', default: '' },
      { param: 'eventLocation', parser: 'string', default: '' },
    ],
  },
  exportBuilder: (s) => ({
    headline: s.verbatimCopy.headline || '',
    body: s.verbatimCopy.body || '',
    showBody: s.showBody,
    ctaText: s.ctaText || '',
    headlineFontSize: s.headlineFontSize ?? undefined,
    eventDate: s.eventDate || '',
    eventLocation: s.eventLocation || '',
  }),
}
