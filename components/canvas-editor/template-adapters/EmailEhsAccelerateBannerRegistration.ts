/**
 * Stage & Bench registration for email-ehs-accelerate-banner.
 */

import { EmailEhsAccelerateBanner } from '@/components/templates/EmailEhsAccelerateBanner'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailEhsAccelerateBannerStageBench } from './EmailEhsAccelerateBannerStageBench'

export const emailEhsAccelerateBannerRegistration: StageBenchRegistrationData = {
  templateId: 'email-ehs-accelerate-banner',
  Template: EmailEhsAccelerateBanner,
  Adapter: EmailEhsAccelerateBannerStageBench,
  renderProps: (asset, colors, typography) => ({
    // Render route sends flat params; queue/preview assets carry the
    // per-template map — support both shapes.
    partnerLogoUrl: asset.partnerLogoUrl ?? asset.partnerLogoSettings?.['email-ehs-accelerate-banner']?.url ?? null,
    partnerLogoHeight: asset.partnerLogoHeight ?? asset.partnerLogoSettings?.['email-ehs-accelerate-banner']?.height ?? undefined,
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
      { param: 'partnerLogoUrl', parser: 'stringOrNull' },
      { param: 'partnerLogoHeight', parser: 'numberOrUndefined' },
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
    partnerLogoUrl: s.partnerLogoSettings['email-ehs-accelerate-banner']?.url ?? null,
    partnerLogoHeight: s.partnerLogoSettings['email-ehs-accelerate-banner']?.height ?? undefined,
    headline: s.verbatimCopy.headline || '',
    body: s.verbatimCopy.body || '',
    showBody: s.showBody,
    ctaText: s.ctaText || '',
    headlineFontSize: s.headlineFontSize ?? undefined,
    eventDate: s.eventDate || '',
    eventLocation: s.eventLocation || '',
  }),
}
