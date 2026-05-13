/**
 * Stage & Bench registration for social-grid-detail.
 */

import type { StackAlign } from '@/types'
import { SocialGridDetail, type GridDetailRow } from '@/components/templates/SocialGridDetail'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { SocialGridDetailStageBench } from './SocialGridDetailStageBench'

export const socialGridDetailRegistration: StageBenchRegistrationData = {
  templateId: 'social-grid-detail',
  Template: SocialGridDetail,
  Adapter: SocialGridDetailStageBench,
  renderProps: (asset, colors, typography) => ({
    headline: asset.headline || '',
    subhead: asset.subhead || '',
    eyebrow: asset.eyebrow || "Don't miss this.",
    showEyebrow: asset.showEyebrow,
    showSubhead: asset.showSubhead && !!asset.subhead,
    showSolutionSet: asset.showSolutionSet !== false,
    solution: asset.solution,
    showGridDetail2: asset.showGridDetail2 !== false,
    showGridDetail3: asset.showGridDetail3 !== false,
    gridDetail1: { type: 'data' as const, text: asset.gridDetail1Text || '' },
    gridDetail2: { type: 'data' as const, text: asset.gridDetail2Text || '' },
    gridDetail3: { type: (asset.gridDetail3Type || 'data') as GridDetailRow['type'], text: asset.gridDetail3Text || '' },
    gridDetail4: { type: (asset.gridDetail4Type || 'cta') as GridDetailRow['type'], text: asset.gridDetail4Text || '' },
    headlineFontSize: asset.headlineFontSize ?? undefined,
    theme: asset.theme || 'light',
    stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
    gaps: asset.templateGaps?.['social-grid-detail'] ?? {},
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'gridDetail1Text', label: 'Row 1' },
    { key: 'gridDetail2Text', label: 'Row 2' },
    { key: 'gridDetail3Text', label: 'Row 3', showKey: 'showGridDetail2' },
    { key: 'gridDetail4Text', label: 'Row 4', showKey: 'showGridDetail3' },
  ],
  renderSchema: {
    width: 1200,
    height: 628,
    background: '#ffffff',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'subhead', parser: 'string', default: '' },
      { param: 'eyebrow', parser: 'string', default: "Don't miss this." },
      { param: 'showEyebrow', parser: 'boolTrue' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showSubhead', parser: 'boolTrue' },
      { param: 'showSolutionSet', parser: 'boolTrue' },
      { param: 'solution', parser: 'string', default: 'environmental' },
      { param: 'showGridDetail2', parser: 'boolTrue' },
      { param: 'showGridDetail3', parser: 'boolTrue' },
      { param: 'gridDetail1Text', parser: 'string', default: '' },
      { param: 'gridDetail2Text', parser: 'string', default: '' },
      { param: 'gridDetail3Text', parser: 'string', default: '' },
      { param: 'gridDetail3Type', parser: 'enum', default: 'data' },
      { param: 'gridDetail4Text', parser: 'string', default: '' },
      { param: 'gridDetail4Type', parser: 'enum', default: 'cta' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'theme', parser: 'enum', default: 'light' },
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
    ],
    assembleProps: (parsed) => ({
      gridDetail1: { type: 'data', text: parsed.gridDetail1Text },
      gridDetail2: { type: 'data', text: parsed.gridDetail2Text },
      gridDetail3: { type: parsed.gridDetail3Type, text: parsed.gridDetail3Text },
      gridDetail4: { type: parsed.gridDetail4Type, text: parsed.gridDetail4Text },
    }),
  },
  exportBuilder: (s) => ({
    showEyebrow: s.showEyebrow,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showSolutionSet: s.showSolutionSet,
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Type: s.gridDetail3Type,
    gridDetail3Text: s.gridDetail3Text,
    gridDetail4Type: s.gridDetail4Type,
    gridDetail4Text: s.gridDetail4Text,
    showGridDetail2: s.showGridDetail2,
    showGridDetail3: s.showGridDetail3,
    theme: s.theme,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['social-grid-detail'] ?? {},
  }),
}
