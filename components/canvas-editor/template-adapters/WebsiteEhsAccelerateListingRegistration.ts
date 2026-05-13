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
    showGridDetail2: asset.showGridDetail2,
    showGridDetail3: asset.showGridDetail3,
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
      { param: 'showGridDetail2', parser: 'boolTrue' },
      { param: 'showGridDetail3', parser: 'boolTrue' },
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
    showGridDetail2: s.showGridDetail2,
    showGridDetail3: s.showGridDetail3,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['website-ehs-accelerate-listing'] ?? {},
  }),
}
