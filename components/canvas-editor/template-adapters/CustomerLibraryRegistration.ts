/**
 * Stage & Bench registration for customer-library.
 */

import { CustomerLibrary } from '@/components/templates/CustomerLibrary'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import { CustomerLibraryStageBench } from './CustomerLibraryStageBench'

export const customerLibraryRegistration: StageBenchRegistrationData = {
  templateId: 'customer-library',
  Template: CustomerLibrary,
  Adapter: CustomerLibraryStageBench,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    eyebrow: asset.eyebrow || '',
    body: asset.body || '',
    footerText: asset.subhead || '',
    variant: asset.customerLibraryVariant || 'dark',
    qrCodeUrl: asset.thumbnailImageUrl || undefined,
    hasQrCode: !!asset.thumbnailImageUrl,
    showHeadline: asset.showHeadline,
    showEyebrow: asset.showEyebrow,
    showBody: asset.showBody && !!asset.body,
    showFooterText: asset.showSubhead && !!asset.subhead,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 590,
    height: 330,
    background: null,
    dynamicBackground: (p) =>
      p.variant === 'light' ? 'white' : p.variant === 'orange' ? '#D35F0B' : '#060015',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'footerText', parser: 'string', default: 'Lorem ipsum' },
      { param: 'variant', parser: 'enum', default: 'dark' },
      { param: 'qrCodeUrl', parser: 'stringOrNull' },
      { param: 'hasQrCode', parser: 'boolFalse' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showEyebrow', parser: 'boolTrue' },
      { param: 'showBody', parser: 'boolTrue' },
      { param: 'showFooterText', parser: 'boolTrue' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
    ],
    assembleProps: (parsed) => ({
      qrCodeUrl: (parsed.qrCodeUrl as string) || undefined,
    }),
  },
  exportBuilder: (s) => ({
    variant: s.customerLibraryVariant,
    footerText: s.verbatimCopy.subhead,
    qrCodeUrl: s.thumbnailImageUrl,
    hasQrCode: !!s.thumbnailImageUrl,
    showHeadline: s.showHeadline,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showFooterText: s.showSubhead && !!s.verbatimCopy.subhead,
  }),
}
