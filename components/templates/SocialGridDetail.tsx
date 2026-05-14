'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

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

export interface GridDetailRow {
  type: 'data' | 'cta'
  text: string
}

/** Logical IDs for editable blocks. Left column is a ContentStack
 *  (logo+pill topAnchor + text blocks). Right grid panel is the
 *  rows-as-blocks pattern from EmailGrid — equal-flex distribute
 *  preserved as design identity. */
export type SocialGridDetailBlockId =
  | 'logo'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'gridDetail1'
  | 'gridDetail2'
  | 'gridDetail3'
  | 'gridDetail4'

type SocialGridDetailStackId = 'logo' | 'eyebrow' | 'headline' | 'subhead'

export interface SocialGridDetailProps {
  headline: string
  subhead: string
  eyebrow: string
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showSolutionSet: boolean
  solution: string
  showGridDetail2: boolean
  showGridDetail3: boolean
  gridDetail1: GridDetailRow
  gridDetail2: GridDetailRow
  gridDetail3: GridDetailRow
  gridDetail4: GridDetailRow
  theme?: TemplateTheme
  headlineFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: SocialGridDetailStackId,
    nextId: SocialGridDetailStackId,
  ) => ReactNode
  renderBlock?: (blockId: SocialGridDetailBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: SocialGridDetailBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_GAP = 36

export function SocialGridDetail({
  headline,
  subhead,
  eyebrow,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showSolutionSet,
  solution,
  showGridDetail2,
  showGridDetail3,
  gridDetail1,
  gridDetail2,
  gridDetail3,
  gridDetail4,
  theme = 'light',
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
}: SocialGridDetailProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = themeColors.logoFill
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const borderColor = themeColors.borderFocus
  const textColor = themeColors.textPrimary

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    background: themeColors.backgroundPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: 64,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    overflow: 'hidden',
  }

  const headerNode: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 64, flexShrink: 0 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={logoFill} height={37} />
      ))}
      {showSolutionSet && solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="social"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={themeColors.textPrimary}
          background={themeColors.bgCategoryChip}
          border={`1.25px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<SocialGridDetailStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || SLOT_PLACEHOLDERS.eyebrow,
      renderChrome: (inner) => (
        <div style={{
          color: textColor,
          fontSize: 14,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1.54px',
        }}>{inner}</div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: headline || SLOT_PLACEHOLDERS.headline,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: textColor,
          fontSize: headlineFontSize ?? 84,
          fontWeight: 300,
          lineHeight: `${(headlineFontSize ?? 84) * (96 / 84)}px`,
        }}>{inner}</div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead,
      defaultInner: subhead || SLOT_PLACEHOLDERS.subhead,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: textColor,
          fontSize: 36,
          fontWeight: 300,
          lineHeight: 1.3,
        }}>{inner}</div>
      ),
    },
  ]

  const GRID_DETAIL_PLACEHOLDERS: Record<'gridDetail1' | 'gridDetail2' | 'gridDetail3' | 'gridDetail4', string> = {
    gridDetail1: 'Grid detail 1',
    gridDetail2: 'Grid detail 2',
    gridDetail3: 'Grid detail 3',
    gridDetail4: 'Grid detail 4',
  }

  const renderGridRow = (
    blockId: 'gridDetail1' | 'gridDetail2' | 'gridDetail3' | 'gridDetail4',
    detail: GridDetailRow,
  ): ReactNode => {
    const rowStyle: CSSProperties = {
      width: 360,
      flex: '1 1 0',
      padding: 24,
      borderBottom: `1px solid ${borderColor}`,
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
          gap: 16,
          color: themeColors.buttonSecondaryText,
          fontSize: 24,
          fontWeight: 500,
          lineHeight: '24px',
          textAlign: 'center',
        }}>
          {wrapInline(blockId, <span>{text}</span>)}
          <ArrowIcon color={themeColors.buttonSecondaryText} width={22} height={18} viewBox="0 0 22 18" pathD="M13 1L21 9M21 9L13 17M21 9H1" />
        </div>
      ) : (
        <span style={{
          color: textColor,
          fontSize: 24,
          fontWeight: 300,
        }}>
          {wrapInline(blockId, <span>{text}</span>)}
        </span>
      )

    return wrapBlock(blockId, (
      <div style={rowStyle}>{inner}</div>
    ))
  }

  const gridRows: Array<{ id: 'gridDetail1' | 'gridDetail2' | 'gridDetail3' | 'gridDetail4'; detail: GridDetailRow }> = [
    { id: 'gridDetail1', detail: gridDetail1 },
    { id: 'gridDetail2', detail: gridDetail2 },
    ...(showGridDetail2 ? [{ id: 'gridDetail3' as const, detail: gridDetail3 }] : []),
    ...(showGridDetail3 ? [{ id: 'gridDetail4' as const, detail: gridDetail4 }] : []),
  ]

  return (
    <div style={containerStyle}>
      {/* Left content column */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        paddingTop: 64,
        paddingBottom: 64,
        paddingLeft: 64,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ContentStack<SocialGridDetailStackId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: SocialGridDetailStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: SocialGridDetailStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Right grid panel — equal-distribute rows preserve design identity. */}
      <div style={{
        alignSelf: 'stretch',
        borderLeft: `1px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        {gridRows.map((row) => (
          <div key={row.id} style={{ flex: '1 1 0', display: 'flex' }}>
            {renderGridRow(row.id, row.detail)}
          </div>
        ))}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
