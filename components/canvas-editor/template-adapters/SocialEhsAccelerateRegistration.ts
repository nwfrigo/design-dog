/**
 * Stage & Bench registration for social-ehs-accelerate.
 *
 * Server-safe metadata bundle that the central registry
 * (`lib/stage-bench-registry.ts`) imports and stitches into the four
 * downstream consumers: template-registry (Puppeteer render),
 * export-params (URL builder), migrated-templates (S&B gate), and
 * StageBenchEditor (adapter dispatch). The adapter React component
 * itself lives in `SocialEhsAccelerateStageBench.tsx` — client-only.
 *
 * Single source of truth: change any of these fields here, all four
 * consumers pick it up.
 */

import type { StackAlign } from '@/types'
import { SocialEhsAccelerate } from '@/components/templates/SocialEhsAccelerate'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { SocialEhsAccelerateStageBench } from './SocialEhsAccelerateStageBench'

export const socialEhsAccelerateRegistration: StageBenchRegistrationData = {
  templateId: 'social-ehs-accelerate',
  Template: SocialEhsAccelerate,
  Adapter: SocialEhsAccelerateStageBench,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    subhead: asset.subhead || '',
    ctaText: asset.ctaText || '',
    showHeadline: asset.showHeadline !== false,
    showSubhead: asset.showSubhead && !!asset.subhead,
    showCta: asset.showCta !== false,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    subheadFontSize: asset.subheadFontSize ?? undefined,
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['social-ehs-accelerate'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'headline', label: 'Headline' },
    { key: 'subhead', label: 'Subhead' },
    { key: 'ctaText', label: 'CTA' },
  ],
  renderSchema: {
    width: 1200,
    height: 628,
    background: '#FFFFFF',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'ctaText', parser: 'string', default: '' },
      { param: 'showHeadline', parser: 'boolTrue', default: true },
      { param: 'showSubhead', parser: 'boolTrue', default: true },
      { param: 'showCta', parser: 'boolTrue', default: true },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'subheadFontSize', parser: 'numberOrUndefined' },
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
    ],
  },
  exportBuilder: (s) => ({
    headline: s.verbatimCopy.headline || '',
    subhead: s.verbatimCopy.subhead || '',
    ctaText: s.ctaText || '',
    showHeadline: s.showHeadline,
    showSubhead: s.showSubhead,
    showCta: s.showCta,
    headlineFontSize: s.headlineFontSize ?? undefined,
    subheadFontSize: s.subheadFontSize ?? undefined,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['social-ehs-accelerate'] ?? {},
  }),
}
