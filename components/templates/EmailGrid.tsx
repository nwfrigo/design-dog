'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export interface GridDetail {
  type: 'data' | 'cta'
  text: string
}

/** Logical IDs for editable blocks. Left column uses ContentStack
 *  (logo+pill as topAnchor); right grid panel has independently
 *  editable rows that preserve the legacy equal-distribute layout. */
export type EmailGridBlockId =
  | 'logo'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subheading'
  | 'body'
  | 'gridDetail1'
  | 'gridDetail2'
  | 'gridDetail3'

type EmailGridStackId = 'logo' | 'eyebrow' | 'headline' | 'subheading' | 'body'

export interface EmailGridProps {
  headline: string
  body: string
  showEyebrow: boolean
  eyebrow?: string
  showHeadline?: boolean
  showLightHeader: boolean
  showHeavyHeader: boolean
  showSubheading: boolean
  subheading?: string
  showBody: boolean
  showSolutionSet: boolean
  solution: string
  showGridDetail2: boolean
  gridDetail1: GridDetail
  gridDetail2: GridDetail
  gridDetail3: GridDetail
  headlineFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: EmailGridStackId,
    nextId: EmailGridStackId,
  ) => ReactNode
  renderBlock?: (blockId: EmailGridBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailGridBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  theme?: TemplateTheme
}

const DEFAULT_GAP = 24

export function EmailGrid({
  headline,
  body,
  showEyebrow,
  eyebrow = '',
  showHeadline = true,
  showLightHeader,
  showSubheading,
  subheading = '',
  showBody,
  showSolutionSet,
  solution,
  showGridDetail2,
  gridDetail1,
  gridDetail2,
  gridDetail3,
  headlineFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
  theme = 'light',
}: EmailGridProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = themeColors.logoFill
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const borderColor = themeColors.borderFocus

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    background: themeColors.backgroundPrimary,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  // Header node = logo + (optional) solution pill in a horizontal row.
  // Pill is wrapped via renderBlock so it surfaces EditbarCategory
  // independently while the logo stays brand-locked.
  const headerNode: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexShrink: 0 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={logoFill} height={23} />
      ))}
      {showSolutionSet && solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="email-grid"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={themeColors.textPrimary}
          background={themeColors.bgCategoryChip}
          border={`0.79px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<EmailGridStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || 'Eyebrow',
      renderChrome: (inner) => (
        <div style={{
          color: themeColors.textPrimary,
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1.1px',
        }}>{inner}</div>
      ),
    },
    {
      id: 'headline',
      visible: !!(showLightHeader && showHeadline),
      defaultInner: headline || 'Headline',
      renderChrome: (inner) => (
        <div style={{
          color: themeColors.textPrimary,
          fontSize: headlineFontSize ?? 38,
          fontWeight: 300,
          lineHeight: `${(headlineFontSize ?? 38) * (48 / 38)}px`,
        }}>{inner}</div>
      ),
    },
    {
      id: 'subheading',
      visible: showSubheading,
      defaultInner: subheading || 'Subheadline',
      renderChrome: (inner) => (
        <div style={{
          color: themeColors.textPrimary,
          fontSize: 20,
          fontWeight: 300,
          lineHeight: 1.3,
        }}>{inner}</div>
      ),
    },
    {
      id: 'body',
      visible: !!showBody,
      defaultInner: body || 'Body copy goes here.',
      renderChrome: (inner) => (
        <div style={{
          color: themeColors.textPrimary,
          fontSize: 18,
          fontWeight: 300,
        }}>{inner}</div>
      ),
    },
  ]

  const GRID_DETAIL_PLACEHOLDERS: Record<'gridDetail1' | 'gridDetail2' | 'gridDetail3', string> = {
    gridDetail1: 'Grid detail 1',
    gridDetail2: 'Grid detail 2',
    gridDetail3: 'Grid detail 3',
  }

  const renderGridRow = (
    blockId: 'gridDetail1' | 'gridDetail2' | 'gridDetail3',
    detail: GridDetail,
    isLast: boolean,
  ): ReactNode => {
    const rowStyle: CSSProperties = {
      flex: '1 1 0',
      alignSelf: 'stretch',
      padding: 24,
      borderBottom: isLast ? 'none' : `0.75px solid ${borderColor}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    }

    const text = detail.text || GRID_DETAIL_PLACEHOLDERS[blockId]

    const inner: ReactNode =
      detail.type === 'cta' ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: themeColors.buttonSecondaryText,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '18px',
        }}>
          {wrapInline(blockId, <span>{text}</span>)}
          <ArrowIcon color={themeColors.buttonSecondaryText} width={17} height={13} viewBox="0 0 17 13" pathD="M10 1L16 6.5M16 6.5L10 12M16 6.5H0" strokeLinecap="butt" strokeLinejoin="miter" />
        </div>
      ) : (
        <span style={{
          color: themeColors.textPrimary,
          fontSize: 18,
          fontWeight: 300,
        }}>
          {wrapInline(blockId, <span>{text}</span>)}
        </span>
      )

    return wrapBlock(blockId, (
      <div style={rowStyle}>{inner}</div>
    ))
  }

  // Visible row blockIds — drives the equal-flex distribution. The right
  // panel keeps its legacy "rows divide the panel evenly" identity; only
  // row VISIBILITY changes (no per-gap spacing controls).
  const gridRows: Array<{ id: 'gridDetail1' | 'gridDetail2' | 'gridDetail3'; detail: GridDetail }> =
    showGridDetail2
      ? [
          { id: 'gridDetail1', detail: gridDetail1 },
          { id: 'gridDetail2', detail: gridDetail2 },
          { id: 'gridDetail3', detail: gridDetail3 },
        ]
      : [
          { id: 'gridDetail1', detail: gridDetail1 },
          { id: 'gridDetail3', detail: gridDetail3 },
        ]

  return (
    <div style={containerStyle}>
      {/* Left content column — ContentStack with logo+pill topAnchor. */}
      <div style={{
        width: 360,
        alignSelf: 'stretch',
        padding: 32,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ContentStack<EmailGridStackId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: EmailGridStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: EmailGridStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Right grid panel — equal-distribute rows (preserve legacy
       *  identity). Each row is an independently editable block. */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        overflow: 'hidden',
        borderLeft: `0.75px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {gridRows.map((row, idx) => (
          <div key={row.id} style={{ flex: '1 1 0', display: 'flex' }}>
            {renderGridRow(row.id, row.detail, idx === gridRows.length - 1)}
          </div>
        ))}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
