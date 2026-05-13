'use client'

import { useStore } from '@/store'
import type { TemplateTheme } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  SocialGridDetail,
  type SocialGridDetailBlockId,
  type GridDetailRow,
} from '../../templates/SocialGridDetail'

/**
 * Stage & Bench adapter for social-grid-detail (factory-driven).
 *
 * Track 2 fixed-composition. Top half: logo+solutionPill + eyebrow /
 * headline / subhead stack. Bottom half: 4 grid-detail rows.
 *
 * Off-by-one warning: `showRow3` toggles `gridDetail2`, `showRow4`
 * toggles `gridDetail3`. Rows 1+4 are always visible. The names date
 * back to legacy code (see SUBSTRATE-DEBT §3.1 rename).
 */

export const SocialGridDetailStageBench =
  defineStageBenchAdapter<SocialGridDetailBlockId>({
    templateId: 'social-grid-detail',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: "Don't miss this." },
      },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'html', placeholder: 'Headline' },
        size: { default: 84, min: 40, max: 140, step: 4 },
      },
      {
        blockId: 'subhead',
        label: 'Subhead',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'html', placeholder: 'Subheadline' },
      },
      {
        blockId: 'gridDetail1',
        label: 'Row 1',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Row 1' },
      },
      {
        blockId: 'gridDetail2',
        label: 'Row 2',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Row 2' },
      },
      {
        blockId: 'gridDetail3',
        label: 'Row 3',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Row 3' },
      },
      {
        blockId: 'gridDetail4',
        label: 'Row 4',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Row 4' },
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
    contentStack: { templateKey: 'social-grid-detail', maxGap: 96 },
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)

      const showEyebrow = useStore((s) => s.showEyebrow)
      const setShowEyebrow = useStore((s) => s.setShowEyebrow)
      const showHeadline = useStore((s) => s.showHeadline)
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)
      const showSolutionSet = useStore((s) => s.showSolutionSet)
      const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)
      const showRow3 = useStore((s) => s.showRow3)
      const setShowRow3 = useStore((s) => s.setShowRow3)
      const showRow4 = useStore((s) => s.showRow4)
      const setShowRow4 = useStore((s) => s.setShowRow4)

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
      const gridDetail4Text = useStore((s) => s.gridDetail4Text)
      const setGridDetail4Text = useStore((s) => s.setGridDetail4Text)
      const gridDetail4Type = useStore((s) => s.gridDetail4Type)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

      const stackAlign = useStore((s) => s.stackAlign)
      const setStackAlign = useStore((s) => s.setStackAlign)
      const gaps = useStore((s) => s.templateGaps['social-grid-detail'] ?? {})
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
          subhead: {
            value: verbatimCopy.subhead || '',
            visible: showSubhead,
            setValue: (v) => setVerbatimCopy({ subhead: v }),
            setVisible: setShowSubhead,
          },
          gridDetail1: {
            value: gridDetail1Text,
            setValue: setGridDetail1Text,
          },
          gridDetail2: {
            value: gridDetail2Text,
            visible: showRow3,
            setValue: setGridDetail2Text,
            setVisible: setShowRow3,
          },
          gridDetail3: {
            value: gridDetail3Text,
            visible: showRow4,
            setValue: setGridDetail3Text,
            setVisible: setShowRow4,
          },
          gridDetail4: {
            value: gridDetail4Text,
            setValue: setGridDetail4Text,
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
          setGap: (key, value) => setTemplateGap('social-grid-detail', key, value),
        },
        extras: {
          gridDetail3Type,
          gridDetail4Type,
          solution,
          theme,
        },
      }
    },
    renderTemplate: (ctx) => {
      const gridDetail3Type = ctx.extras.gridDetail3Type as GridDetailRow['type']
      const gridDetail4Type = ctx.extras.gridDetail4Type as GridDetailRow['type']
      const showSolution = ctx.visibilityOf('solutionPill')
      return (
        <SocialGridDetail
          headline={ctx.textOf('headline')}
          subhead={ctx.textOf('subhead')}
          eyebrow={ctx.textOf('eyebrow')}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showSubhead={ctx.visibilityOf('subhead')}
          showSolutionSet={showSolution}
          solution={showSolution ? (ctx.extras.solution as string) ?? '' : 'none'}
          showRow3={ctx.visibilityOf('gridDetail2')}
          showRow4={ctx.visibilityOf('gridDetail3')}
          gridDetail1={{ type: 'data', text: ctx.textOf('gridDetail1') }}
          gridDetail2={{ type: 'data', text: ctx.textOf('gridDetail2') }}
          gridDetail3={{ type: gridDetail3Type, text: ctx.textOf('gridDetail3') }}
          gridDetail4={{ type: gridDetail4Type, text: ctx.textOf('gridDetail4') }}
          headlineFontSize={ctx.fontSizeOf('headline')}
          theme={ctx.extras.theme as TemplateTheme | undefined}
          stackAlign={ctx.stackAlign}
          gaps={ctx.gaps}
          renderBlock={ctx.renderBlock}
          renderInlineEditor={ctx.renderInlineEditor}
          renderOverlay={ctx.renderOverlay}
          renderSpacerBetween={ctx.renderSpacerBetween}
          colors={ctx.colors}
          typography={ctx.typography}
          scale={ctx.scale}
        />
      )
    },
  })
