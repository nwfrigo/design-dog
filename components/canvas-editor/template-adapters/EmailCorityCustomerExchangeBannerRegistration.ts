/**
 * Stage & Bench registration for email-cority-customer-exchange-banner.
 */

import { EmailCorityCustomerExchangeBanner } from '@/components/templates/EmailCorityCustomerExchangeBanner'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailCorityCustomerExchangeBannerStageBench } from './EmailCorityCustomerExchangeBannerStageBench'

export const emailCorityCustomerExchangeBannerRegistration: StageBenchRegistrationData = {
  templateId: 'email-cority-customer-exchange-banner',
  Template: EmailCorityCustomerExchangeBanner,
  Adapter: EmailCorityCustomerExchangeBannerStageBench,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    body: asset.body || '',
    ctaText: asset.ctaText || '',
    colorStyle: (asset.colorStyle || '1') as '1' | '2' | '3' | '4',
    showHeadline: asset.showHeadline !== false,
    showBody: asset.showBody && !!asset.body,
    showCta: asset.showCta !== false,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Body', isHtml: true },
    { key: 'ctaText', label: 'CTA' },
  ],
  renderSchema: {
    width: 640,
    height: 300,
    background: '#060015',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'colorStyle', parser: 'enum', default: '1' },
      { param: 'showHeadline', parser: 'boolTrue', default: true },
      { param: 'showBody', parser: 'boolTrue', default: true },
      { param: 'showCta', parser: 'boolTrue', default: true },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
    ],
  },
  exportBuilder: (s) => ({
    headline: s.verbatimCopy.headline || '',
    body: s.verbatimCopy.body || '',
    ctaText: s.ctaText || '',
    colorStyle: s.colorStyle,
    showHeadline: s.showHeadline,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
    headlineFontSize: s.headlineFontSize ?? undefined,
  }),
}
