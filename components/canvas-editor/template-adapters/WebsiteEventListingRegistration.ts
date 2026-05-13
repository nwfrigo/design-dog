/**
 * Stage & Bench registration for website-event-listing.
 */

import type { StackAlign } from '@/types'
import { WebsiteEventListing } from '@/components/templates/WebsiteEventListing'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteEventListingStageBench } from './WebsiteEventListingStageBench'

export const websiteEventListingRegistration: StageBenchRegistrationData = {
  templateId: 'website-event-listing',
  Template: WebsiteEventListing,
  Adapter: WebsiteEventListingStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    subhead: asset.subhead,
    variant: asset.eventListingVariant,
    gridDetail1Text: asset.gridDetail1Text || '',
    gridDetail2Text: asset.gridDetail2Text || '',
    gridDetail3Text: asset.gridDetail3Text || '',
    gridDetail4Text: asset.gridDetail4Text || '',
    showRow3: asset.showRow3,
    showRow4: asset.showRow4,
    showEyebrow: asset.showEyebrow,
    showSubhead: asset.showSubhead && !!asset.subhead,
    headlineFontSize: asset.headlineFontSize ?? undefined,
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['website-event-listing'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 800,
    height: 450,
    background: null,
    dynamicBackground: (p) => p.variant === 'light' ? '#F9F9F9' : p.variant === 'orange' ? '#D35F0B' : '#060015',
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'variant', parser: 'enum', default: 'orange' },
      { param: 'gridDetail1Text', parser: 'string', default: '' },
      { param: 'gridDetail2Text', parser: 'string', default: '' },
      { param: 'gridDetail3Text', parser: 'string', default: '' },
      { param: 'gridDetail4Text', parser: 'string', default: '' },
      { param: 'showRow3', parser: 'boolTrue' },
      { param: 'showRow4', parser: 'boolTrue' },
      { param: 'showEyebrow', parser: 'boolTrue' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showSubhead', parser: 'boolTrue' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
    ],
  },
  exportBuilder: (s) => ({
    variant: s.eventListingVariant,
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Text: s.gridDetail3Text,
    gridDetail4Text: s.gridDetail4Text,
    showRow3: s.showRow3,
    showRow4: s.showRow4,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['website-event-listing'] ?? {},
  }),
}
