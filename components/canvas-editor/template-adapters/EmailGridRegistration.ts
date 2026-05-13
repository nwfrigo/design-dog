/**
 * Stage & Bench registration for email-grid.
 */

import type { StackAlign } from '@/types'
import { EmailGrid, type GridDetail } from '@/components/templates/EmailGrid'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'

export const emailGridRegistration: StageBenchRegistrationData = {
  templateId: 'email-grid',
  Template: EmailGrid,
  renderProps: (asset, colors, typography) => {
    const gridDetail1: GridDetail = { type: 'data', text: asset.gridDetail1Text }
    const gridDetail2: GridDetail = { type: 'data', text: asset.gridDetail2Text }
    const gridDetail3: GridDetail = { type: asset.gridDetail3Type, text: asset.gridDetail3Text }
    return {
      headline: asset.headline || '',
      body: asset.body,
      eyebrow: asset.eyebrow,
      subheading: asset.subheading,
      showEyebrow: asset.showEyebrow,
      showLightHeader: asset.showLightHeader,
      showHeavyHeader: false,
      showSubheading: asset.showSubheading,
      showBody: asset.showBody,
      showSolutionSet: asset.showSolutionSet,
      solution: asset.solution,
      showGridDetail2: asset.showGridDetail2,
      gridDetail1, gridDetail2, gridDetail3,
      headlineFontSize: asset.headlineFontSize ?? undefined,
      theme: asset.theme || 'light',
      stackAlign: (asset.stackAlign as StackAlign) ?? 'top',
      gaps: asset.templateGaps?.['email-grid'] ?? {},
      colors, typography, scale: 1,
    }
  },
  queueTextFields: [
    { key: 'gridDetail1Text', label: 'Detail 1' },
    { key: 'gridDetail2Text', label: 'Detail 2', showKey: 'showGridDetail2' },
    { key: 'gridDetail3Text', label: 'Detail 3' },
  ],
  renderSchema: {
    width: 640,
    height: 300,
    background: '#ffffff',
    fields: [
      { param: 'headline', parser: 'string', default: '' },
      { param: 'body', parser: 'string', default: '' },
      { param: 'eyebrow', parser: 'string', default: '' },
      { param: 'subheading', parser: 'string', default: '' },
      { param: 'solution', parser: 'string', default: 'environmental' },
      { param: 'logoColor', parser: 'enum', default: 'black' },
      { param: 'showEyebrow', parser: 'boolFalse' },
      { param: 'showHeadline', parser: 'boolTrue' },
      { param: 'showLightHeader', parser: 'boolTrue' },
      { param: 'showHeavyHeader', parser: 'boolFalse' },
      { param: 'showSubheading', parser: 'boolFalse' },
      { param: 'showBody', parser: 'boolTrue' },
      { param: 'showSolutionSet', parser: 'boolTrue' },
      { param: 'showGridDetail2', parser: 'boolTrue' },
      { param: 'gridDetail1Type', parser: 'enum', default: 'data' },
      { param: 'gridDetail1Text', parser: 'string', default: '' },
      { param: 'gridDetail2Type', parser: 'enum', default: 'data' },
      { param: 'gridDetail2Text', parser: 'string', default: '' },
      { param: 'gridDetail3Type', parser: 'enum', default: 'cta' },
      { param: 'gridDetail3Text', parser: 'string', default: '' },
      { param: 'headlineFontSize', parser: 'numberOrUndefined' },
      { param: 'theme', parser: 'enum', default: 'light' },
      { param: 'stackAlign', parser: 'enum', default: 'top' },
      { param: 'gaps', parser: 'jsonRecord' },
    ],
    assembleProps: (parsed) => ({
      gridDetail1: { type: parsed.gridDetail1Type, text: parsed.gridDetail1Text },
      gridDetail2: { type: parsed.gridDetail2Type, text: parsed.gridDetail2Text },
      gridDetail3: { type: parsed.gridDetail3Type, text: parsed.gridDetail3Text },
    }),
  },
  exportBuilder: (s) => ({
    subheading: s.subheading,
    showLightHeader: s.showLightHeader,
    showHeavyHeader: false,
    showSubheading: s.showSubheading,
    showBody: s.showBody,
    showSolutionSet: s.showSolutionSet,
    showGridDetail2: s.showGridDetail2,
    gridDetail1Type: 'data',
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Type: 'data',
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Type: s.gridDetail3Type,
    gridDetail3Text: s.gridDetail3Text,
    theme: s.theme,
    stackAlign: s.stackAlign,
    gaps: s.templateGaps['email-grid'] ?? {},
  }),
}
