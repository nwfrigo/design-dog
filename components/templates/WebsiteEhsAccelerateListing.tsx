'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

/** Track 1 left column + Track-2-style grid panel. EHS Accelerate
 *  lockup lives at the left-column footer (anchored bottom of the
 *  column). */
export type WebsiteEhsAccelerateListingBlockId =
  | 'logo'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'gridDetail1'
  | 'gridDetail2'
  | 'gridDetail3'
  | 'gridDetail4'

type WebsiteEhsAccelerateListingStackId = 'eyebrow' | 'headline' | 'subhead'

export interface WebsiteEhsAccelerateListingProps {
  eyebrow: string
  headline: string
  subhead: string
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
    prevId: WebsiteEhsAccelerateListingStackId,
    nextId: WebsiteEhsAccelerateListingStackId,
  ) => ReactNode
  renderBlock?: (blockId: WebsiteEhsAccelerateListingBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteEhsAccelerateListingBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGE = '/assets/backgrounds/Template_Website_EHS-Accelerate_Listing_background.png'
const TEXT_COLOR = '#060015'
const BORDER_COLOR = '#969899'
const PANEL_BG = '#FFFFFF'
const DEFAULT_GAP = 25.10

export function WebsiteEhsAccelerateListing({
  eyebrow,
  headline,
  subhead,
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
}: WebsiteEhsAccelerateListingProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    position: 'relative',
    background: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 42.67,
    display: 'flex',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const blocks: ContentStackBlock<WebsiteEhsAccelerateListingStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow && !!eyebrow,
      defaultInner: eyebrow,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: TEXT_COLOR,
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
          color: TEXT_COLOR,
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
          color: TEXT_COLOR,
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
      borderTop: isFirst ? undefined : `1px ${BORDER_COLOR} solid`,
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
          color: TEXT_COLOR,
          fontSize: 20,
          fontWeight: 350,
        }}>
          {text}
        </div>
        <ArrowIcon color={TEXT_COLOR} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
      </div>
    ) : (
      <div style={{
        color: TEXT_COLOR,
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
      {/* Full-canvas baked background image. Right white panel sits
       *  on top and covers the right ~300px. */}
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

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
        <div style={{ alignSelf: 'stretch' }}>
          <ContentStack<WebsiteEhsAccelerateListingStackId>
            blocks={blocks}
            gaps={gaps}
            defaultGap={DEFAULT_GAP}
            renderSpacerBetween={renderSpacerBetween}
            renderBlock={renderBlock as (id: WebsiteEhsAccelerateListingStackId, content: ReactNode) => ReactNode}
            renderInlineEditor={renderInlineEditor as (id: WebsiteEhsAccelerateListingStackId, defaultInner: ReactNode) => ReactNode}
            stackAlign={stackAlign}
            alignItems="flex-start"
          />
        </div>

        {/* EHS+ Accelerate lockup pinned to bottom of left column */}
        {wrapBlock('logo', (
          <div style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'inline-flex',
          }}>
            <EhsAccelerateLogo width={254} />
          </div>
        ))}
      </div>

      {/* Right opaque grid panel (covers right ~300px of bg). */}
      <div
        style={{
          alignSelf: 'stretch',
          background: PANEL_BG,
          borderLeft: `1px ${BORDER_COLOR} solid`,
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
