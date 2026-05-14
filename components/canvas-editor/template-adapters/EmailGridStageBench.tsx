'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { TemplateTheme } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailGrid,
  type EmailGridBlockId,
  type GridDetail,
} from '../../templates/EmailGrid'

/**
 * Stage & Bench adapter for email-grid (factory-driven).
 *
 * Track 2. 640×300 email-grid card. Top half: logo+solutionPill +
 * eyebrow/headline/subheading/body stack. Bottom half: 3 grid-detail
 * rows. Rows 1+2 are always 'data' type; row 3 is configurable
 * ('cta' or 'data'). `showGridDetail2` toggles the middle detail.
 */

export const EmailGridStageBench = defineStageBenchAdapter<EmailGridBlockId>({
  templateId: 'email-grid',
  slots: [
    { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
    { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
    {
      blockId: 'eyebrow',
      label: 'Eyebrow',
      iconKey: 'eyebrow',
      chipKind: 'eyebrow',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: SLOT_PLACEHOLDERS.eyebrow },
    },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.headline },
      size: { default: 38, min: 24, max: 60, step: 2 },
    },
    {
      blockId: 'subheading',
      label: 'Subheading',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: 'Subheading' },
    },
    {
      blockId: 'body',
      label: 'Body',
      iconKey: 'body',
      chipKind: 'body',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.body },
    },
    {
      blockId: 'gridDetail1',
      label: 'Detail 1',
      iconKey: 'small-caption',
      chipKind: 'small-caption',
      kind: 'text',
      benchable: false,
      content: { format: 'plain', singleLine: true, placeholder: 'Detail 1' },
    },
    {
      blockId: 'gridDetail2',
      label: 'Detail 2',
      iconKey: 'small-caption',
      chipKind: 'small-caption',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: 'Detail 2' },
    },
    {
      blockId: 'gridDetail3',
      label: 'Detail 3',
      iconKey: 'small-caption',
      chipKind: 'small-caption',
      kind: 'text',
      benchable: false,
      content: { format: 'plain', singleLine: true, placeholder: 'Detail 3' },
    },
  ],
  stageBar: [
    { id: 'theme', kind: 'theme', label: 'theme' },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
  ],
  category: {
    blockId: 'solutionPill',
    options: (colors) =>
      Object.entries(colors.solutions)
        .filter(([key]) => key !== 'none')
        .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color })),
  },
  contentStack: { templateKey: 'email-grid', maxGap: 96 },
  useStoreBindings: () => {
    const eyebrow = useStore((s) => s.eyebrow)
    const setEyebrow = useStore((s) => s.setEyebrow)
    const verbatimCopy = useStore((s) => s.verbatimCopy)
    const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
    const subheading = useStore((s) => s.subheading)
    const setSubheading = useStore((s) => s.setSubheading)

    const showEyebrow = useStore((s) => s.showEyebrow)
    const setShowEyebrow = useStore((s) => s.setShowEyebrow)
    const showHeadline = useStore((s) => s.showHeadline)
    const showSubheading = useStore((s) => s.showSubheading)
    const setShowSubheading = useStore((s) => s.setShowSubheading)
    const showBody = useStore((s) => s.showBody)
    const setShowBody = useStore((s) => s.setShowBody)
    const showSolutionSet = useStore((s) => s.showSolutionSet)
    const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)
    const showGridDetail2 = useStore((s) => s.showGridDetail2)
    const setShowGridDetail2 = useStore((s) => s.setShowGridDetail2)
    const showLightHeader = useStore((s) => s.showLightHeader)

    const solution = useStore((s) => s.solution)
    const setSolution = useStore((s) => s.setSolution)
    const theme = useStore((s) => s.theme)
    const setTheme = useStore((s) => s.setTheme)

    const gridDetail1Text = useStore((s) => s.gridDetail1Text)
    const setGridDetail1Text = useStore((s) => s.setGridDetail1Text)
    const gridDetail2Text = useStore((s) => s.gridDetail2Text)
    const setGridDetail2Text = useStore((s) => s.setGridDetail2Text)
    const gridDetail3Text = useStore((s) => s.gridDetail3Text)
    const setGridDetail3Text = useStore((s) => s.setGridDetail3Text)
    const gridDetail3Type = useStore((s) => s.gridDetail3Type)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['email-grid'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

    return {
      slotState: {
        logo: {},
        solutionPill: {
          visible: showSolutionSet,
          setVisible: setShowSolutionSet,
        },
        eyebrow: {
          value: eyebrow,
          visible: showEyebrow,
          setValue: setEyebrow,
          setVisible: setShowEyebrow,
        },
        headline: {
          value: verbatimCopy.headline || '',
          visible: showHeadline,
          fontSize: headlineFontSize ?? undefined,
          setValue: (v) => setVerbatimCopy({ headline: v }),
          setFontSize: setHeadlineFontSize,
        },
        subheading: {
          value: subheading,
          visible: showSubheading,
          setValue: setSubheading,
          setVisible: setShowSubheading,
        },
        body: {
          value: verbatimCopy.body || '',
          visible: showBody,
          setValue: (v) => setVerbatimCopy({ body: v }),
          setVisible: setShowBody,
        },
        gridDetail1: {
          value: gridDetail1Text,
          setValue: setGridDetail1Text,
        },
        gridDetail2: {
          value: gridDetail2Text,
          visible: showGridDetail2,
          setValue: setGridDetail2Text,
          setVisible: setShowGridDetail2,
        },
        gridDetail3: {
          value: gridDetail3Text,
          setValue: setGridDetail3Text,
        },
      },
      stageBar: {
        theme: { value: theme, set: (v) => setTheme(v as TemplateTheme) },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      category: {
        value: solution,
        set: setSolution,
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('email-grid', key, value),
      },
      extras: { showLightHeader, gridDetail3Type, solution, theme },
    }
  },
  renderTemplate: (ctx) => {
    const showLightHeader = ctx.extras.showLightHeader as boolean
    const gridDetail3Type = ctx.extras.gridDetail3Type as GridDetail['type']
    const showSolution = ctx.visibilityOf('solutionPill')
    return (
      <EmailGrid
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        subheading={ctx.textOf('subheading')}
        body={ctx.textOf('body')}
        showEyebrow={ctx.visibilityOf('eyebrow')}
        showHeadline={ctx.rawVisibilityOf('headline')}
        showLightHeader={showLightHeader}
        showHeavyHeader={false}
        showSubheading={ctx.visibilityOf('subheading')}
        showBody={ctx.visibilityOf('body')}
        showSolutionSet={showSolution}
        solution={showSolution ? (ctx.extras.solution as string) ?? '' : 'none'}
        showGridDetail2={ctx.visibilityOf('gridDetail2')}
        gridDetail1={{ type: 'data', text: ctx.textOf('gridDetail1') }}
        gridDetail2={{ type: 'data', text: ctx.textOf('gridDetail2') }}
        gridDetail3={{ type: gridDetail3Type, text: ctx.textOf('gridDetail3') }}
        headlineFontSize={ctx.fontSizeOf('headline')}
        stackAlign={ctx.stackAlign}
        gaps={ctx.gaps}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        renderSpacerBetween={ctx.renderSpacerBetween}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
        theme={ctx.extras.theme as TemplateTheme | undefined}
      />
    )
  },
})
