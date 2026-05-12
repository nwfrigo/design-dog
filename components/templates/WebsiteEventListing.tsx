'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export type EventListingVariant = 'orange' | 'light' | 'dark-gradient'

/** Track 1 left column + Track-2-style grid panel. Logo lives in the
 *  left column footer position (anchored bottom of the column). */
export type WebsiteEventListingBlockId =
  | 'logo'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'gridDetail1'
  | 'gridDetail2'
  | 'gridDetail3'
  | 'gridDetail4'

type WebsiteEventListingStackId = 'eyebrow' | 'headline' | 'subhead'

export interface WebsiteEventListingProps {
  eyebrow: string
  headline: string
  subhead: string
  variant: EventListingVariant
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  headlineFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: WebsiteEventListingStackId,
    nextId: WebsiteEventListingStackId,
  ) => ReactNode
  renderBlock?: (blockId: WebsiteEventListingBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteEventListingBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_GAP = 25.10

export const EVENT_LISTING_VARIANT_COLORS: Record<EventListingVariant, {
  background: string
  textColor: string
  borderColor: string
  logoFill: string
  gridBackground: string
}> = {
  orange: { background: '#D35F0B', textColor: 'white', borderColor: 'white', logoFill: 'white', gridBackground: '#D35F0B' },
  light: { background: '#F9F9F9', textColor: '#060015', borderColor: '#D9D8D6', logoFill: 'black', gridBackground: '#F9F9F9' },
  'dark-gradient': { background: '#060015', textColor: 'white', borderColor: '#0080FF', logoFill: 'white', gridBackground: '#060015' },
}

export function WebsiteEventListing({
  eyebrow,
  headline,
  subhead,
  variant,
  gridDetail1Text,
  gridDetail2Text,
  gridDetail3Text,
  gridDetail4Text,
  showRow3,
  showRow4,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  headlineFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: WebsiteEventListingProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const v = EVENT_LISTING_VARIANT_COLORS[variant]

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    position: 'relative',
    background: v.background,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 42.67,
    display: 'flex',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const blocks: ContentStackBlock<WebsiteEventListingStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow && !!eyebrow,
      defaultInner: eyebrow,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: v.textColor,
          fontSize: 14,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 1.38,
        }}>{inner}</div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: headline || 'Headline',
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: v.textColor,
          fontSize: headlineFontSize ?? 58,
          fontWeight: 350,
          lineHeight: `${(headlineFontSize ?? 58) * (64 / 58)}px`,
        }}>{inner}</div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead && !!subhead,
      defaultInner: subhead,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: v.textColor,
          fontSize: 24,
          fontWeight: 350,
        }}>{inner}</div>
      ),
    },
  ]

  const renderGridRow = (
    blockId: 'gridDetail1' | 'gridDetail2' | 'gridDetail3' | 'gridDetail4',
    text: string,
    isCta: boolean,
    isFirst: boolean,
  ): ReactNode => {
    const rowStyle: CSSProperties = {
      width: 300,
      flex: '1 1 0',
      padding: 24,
      borderTop: isFirst ? undefined : `1px ${v.borderColor} solid`,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      display: 'inline-flex',
    }

    const inner: ReactNode = isCta ? (
      <div style={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 12,
        display: 'flex',
      }}>
        <div style={{
          textAlign: 'center',
          color: v.textColor,
          fontSize: 20,
          fontWeight: 350,
        }}>
          {text}
        </div>
        <ArrowIcon color={v.textColor} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
      </div>
    ) : (
      <div style={{
        color: v.textColor,
        fontSize: 20,
        fontWeight: 350,
      }}>
        {text}
      </div>
    )

    return wrapBlock(blockId, (
      <div style={rowStyle}>{inner}</div>
    ))
  }

  const gridRows: Array<{ id: 'gridDetail1' | 'gridDetail2' | 'gridDetail3' | 'gridDetail4'; text: string; isCta: boolean }> = [
    { id: 'gridDetail1', text: gridDetail1Text, isCta: false },
    ...(showRow3 ? [{ id: 'gridDetail2' as const, text: gridDetail2Text, isCta: false }] : []),
    ...(showRow4 ? [{ id: 'gridDetail3' as const, text: gridDetail3Text, isCta: false }] : []),
    { id: 'gridDetail4', text: gridDetail4Text, isCta: true },
  ]

  return (
    <div style={containerStyle}>
      {/* Left content area */}
      <div
        style={{
          flex: '1 1 0',
          alignSelf: 'stretch',
          paddingTop: 64,
          paddingBottom: 32,
          paddingLeft: 32,
          paddingRight: 32,
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          display: 'inline-flex',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Text content via ContentStack (top portion). */}
        <div style={{ alignSelf: 'stretch' }}>
          <ContentStack<WebsiteEventListingStackId>
            blocks={blocks}
            gaps={gaps}
            defaultGap={DEFAULT_GAP}
            renderSpacerBetween={renderSpacerBetween}
            renderBlock={renderBlock as (id: WebsiteEventListingStackId, content: ReactNode) => ReactNode}
            renderInlineEditor={renderInlineEditor as (id: WebsiteEventListingStackId, defaultInner: ReactNode) => ReactNode}
            stackAlign={stackAlign}
            alignItems="flex-start"
          />
        </div>

        {/* Logo anchored to bottom of the left column (sibling outside
         *  the ContentStack — preserves the legacy space-between visual
         *  for the column overall: text up top, logo at bottom). */}
        {wrapBlock('logo', (
          <div style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 62.27,
            display: 'inline-flex',
          }}>
            <CorityLogo fill={v.logoFill} height={36} />
          </div>
        ))}
      </div>

      {/* Right grid panel — equal-distribute rows. */}
      <div
        style={{
          alignSelf: 'stretch',
          background: v.gridBackground,
          boxShadow: variant === 'dark-gradient' ? '0px 0px 60px rgba(0, 127.50, 255, 0.30)' : undefined,
          borderLeft: `1px ${v.borderColor} solid`,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          display: 'inline-flex',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {gridRows.map((row, idx) => (
          <div key={row.id} style={{ flex: '1 1 0', display: 'flex' }}>
            {renderGridRow(row.id, row.text, row.isCta, idx === 0)}
          </div>
        ))}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
