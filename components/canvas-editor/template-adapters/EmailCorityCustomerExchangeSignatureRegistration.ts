/**
 * Stage & Bench registration for email-cority-customer-exchange-signature.
 */

import { EmailCorityCustomerExchangeSignature } from '@/components/templates/EmailCorityCustomerExchangeSignature'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailCorityCustomerExchangeSignatureStageBench } from './EmailCorityCustomerExchangeSignatureStageBench'

export const emailCorityCustomerExchangeSignatureRegistration: StageBenchRegistrationData = {
  templateId: 'email-cority-customer-exchange-signature',
  Template: EmailCorityCustomerExchangeSignature,
  Adapter: EmailCorityCustomerExchangeSignatureStageBench,
  renderProps: (asset, colors, typography) => ({
    eventDate: asset.eventDate || '',
    eventLocation: asset.eventLocation || '',
    eventTime: asset.cceEventTime || '10:00–16:00',
    ctaText: asset.ctaText || '',
    showEventDate: asset.showCceEventDate !== false,
    showEventLocation: asset.showCceEventLocation !== false,
    showEventTime: asset.showCceEventTime !== false,
    showCta: asset.showCta !== false,
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'eventDate', label: 'Date' },
    { key: 'eventLocation', label: 'Location' },
    { key: 'cceEventTime', label: 'Time' },
    { key: 'ctaText', label: 'CTA' },
  ],
  renderSchema: {
    width: 400,
    height: 100,
    background: '#060015',
    fields: [
      { param: 'eventDate', parser: 'string', default: '' },
      { param: 'eventLocation', parser: 'string', default: '' },
      { param: 'eventTime', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'showEventDate', parser: 'boolTrue', default: true },
      { param: 'showEventLocation', parser: 'boolTrue', default: true },
      { param: 'showEventTime', parser: 'boolTrue', default: true },
      { param: 'showCta', parser: 'boolTrue', default: true },
    ],
  },
  exportBuilder: (s) => ({
    eventDate: s.eventDate || '',
    eventLocation: s.eventLocation || '',
    eventTime: s.cceEventTime || '',
    ctaText: s.ctaText || '',
    showEventDate: s.showCceEventDate,
    showEventLocation: s.showCceEventLocation,
    showEventTime: s.showCceEventTime,
    showCta: s.showCta,
  }),
}
