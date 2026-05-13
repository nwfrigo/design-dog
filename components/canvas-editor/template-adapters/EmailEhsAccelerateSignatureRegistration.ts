/**
 * Stage & Bench registration for email-ehs-accelerate-signature.
 */

import { EmailEhsAccelerateSignature } from '@/components/templates/EmailEhsAccelerateSignature'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailEhsAccelerateSignatureStageBench } from './EmailEhsAccelerateSignatureStageBench'

export const emailEhsAccelerateSignatureRegistration: StageBenchRegistrationData = {
  templateId: 'email-ehs-accelerate-signature',
  Template: EmailEhsAccelerateSignature,
  Adapter: EmailEhsAccelerateSignatureStageBench,
  renderProps: (asset, colors, typography) => ({
    workshopName: asset.signatureWorkshopName || '',
    eventDate: asset.eventDate || '',
    eventLocation: asset.eventLocation || '',
    ctaText: asset.ctaText || '',
    showWorkshopName: asset.showSignatureWorkshopName !== false,
    showEventDetails: asset.showSignatureEventDetails !== false,
    showCta: asset.showCta !== false,
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'signatureWorkshopName', label: 'Workshop' },
    { key: 'eventDate', label: 'Date' },
    { key: 'eventLocation', label: 'Location' },
    { key: 'ctaText', label: 'CTA' },
  ],
  renderSchema: {
    width: 400,
    height: 100,
    background: '#ffffff',
    fields: [
      { param: 'workshopName', parser: 'string', default: '' },
      { param: 'eventDate', parser: 'string', default: '' },
      { param: 'eventLocation', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'showWorkshopName', parser: 'boolTrue', default: true },
      { param: 'showEventDetails', parser: 'boolTrue', default: true },
      { param: 'showCta', parser: 'boolTrue', default: true },
    ],
  },
  exportBuilder: (s) => ({
    workshopName: s.signatureWorkshopName || '',
    eventDate: s.eventDate || '',
    eventLocation: s.eventLocation || '',
    ctaText: s.ctaText || '',
    showWorkshopName: s.showSignatureWorkshopName,
    showEventDetails: s.showSignatureEventDetails,
    showCta: s.showCta,
  }),
}
