/**
 * Stage & Bench registration for website-ehs-accelerate-listing.
 */

import type { StackAlign } from '@/types'
import { WebsiteEhsAccelerateListing } from '@/components/templates/WebsiteEhsAccelerateListing'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { WebsiteEhsAccelerateListingStageBench } from './WebsiteEhsAccelerateListingStageBench'

export const websiteEhsAccelerateListingRegistration: StageBenchRegistrationData = {
  templateId: 'website-ehs-accelerate-listing',
  Template: WebsiteEhsAccelerateListing,
  Adapter: WebsiteEhsAccelerateListingStageBench,
  renderProps: (asset, colors, typography) => ({
    eyebrow: asset.eyebrow || '',
    headline: asset.headline || '',
    subhead: asset.subhead,
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
    gaps: asset.templateGaps?.['website-ehs-accelerate-listing'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [],
  renderSchema: {
    width: 800,
    height: 450,
    background: '#FFFFFF',
    fields: [
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
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
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Text: s.gridDetail3Text,
    gridDetail4Text: s.gridDetail4Text,
    showRow3: s.showRow3,
    showRow4: s.showRow4,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['website-ehs-accelerate-listing'] ?? {},
  }),
}
