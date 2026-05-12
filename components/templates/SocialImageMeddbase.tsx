'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { MeddbaseLogo } from '@/components/shared/MeddbaseLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'
import {
  NEUTRAL_FILTERS,
  applyGrayscaleBoolean,
  filtersToCss,
  type ImageFilters,
} from '@/lib/image-filters'

export type LayoutVariant = 'even' | 'more-image' | 'more-text'

export type SocialImageMeddbaseBlockId =
  | 'logo'
  | 'solutionPill'
  | 'headline'
  | 'subhead'
  | 'metadata'
  | 'cta'
  | 'image'

export interface SocialImageMeddbaseProps {
  headline: string
  subhead: string
  metadata: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  layout: LayoutVariant
  solution: string
  showHeadline?: boolean
  showSubhead: boolean
  showMetadata: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: SocialImageMeddbaseBlockId,
    nextId: SocialImageMeddbaseBlockId,
  ) => ReactNode
  renderBlock?: (blockId: SocialImageMeddbaseBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: SocialImageMeddbaseBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const IMAGE_WIDTHS: Record<LayoutVariant, number> = {
  'even': 488,
  'more-image': 600,
  'more-text': 376,
}

const DEFAULT_GAP = 24

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

const RICH_TEXT_STYLES = `
  .social-md-rich-text strong { font-weight: 500; }
  .social-md-rich-text em { font-style: italic; }
  .social-md-rich-text p { margin: 0; }
  .social-md-rich-text p + p { margin-top: 0.3em; }
`

export function SocialImageMeddbase({
  headline,
  subhead,
  metadata,
  ctaText,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  layout,
  solution,
  showHeadline = true,
  showSubhead,
  showMetadata,
  showCta,
  showSolutionSet,
  grayscale = false,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
}: SocialImageMeddbaseProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = colors.ui.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const imageWidth = IMAGE_WIDTHS[layout]

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const effectiveFilters = applyGrayscaleBoolean(imageFilters, grayscale)
  const filterCss = filtersToCss(effectiveFilters)
  const filterCssNoSat =
    filterCss && grayscaleImageUrl
      ? filtersToCss({ ...effectiveFilters, saturation: 0 })
      : undefined
  const imageFilterStyle =
    grayscaleImageUrl && filterCssNoSat ? filterCssNoSat :
    grayscaleImageUrl ? 'none' :
    filterCss ? filterCss :
    grayscale ? 'grayscale(100%)' : 'none'

  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: 64,
    padding: '64px 0 64px 64px',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const headerNode: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
      {wrapBlock('logo', (
        <MeddbaseLogo height={60} />
      ))}
      {showSolutionSet && solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="social"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={textColor}
          background={colors.ui.surface}
          border={`1.25px solid ${colors.ui.border}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<SocialImageMeddbaseBlockId>[] = [
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="social-md-rich-text"
          style={{
            color: textColor,
            fontSize: headlineFontSize ?? 84,
            fontWeight: 300,
            lineHeight: `${(headlineFontSize ?? 84) * (96 / 84)}px`,
          }}
        >{inner}</div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead && hasSubhead,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: subhead }} />
      ),
      renderChrome: (inner) => (
        <div
          className="social-md-rich-text"
          style={{
            color: textColor,
            fontSize: subheadFontSize ?? 36,
            fontWeight: 300,
            lineHeight: 1.3,
          }}
        >{inner}</div>
      ),
    },
    {
      id: 'metadata',
      visible: showMetadata && !!metadata,
      defaultInner: metadata,
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
      id: 'cta',
      visible: showCta && !!ctaText,
      defaultInner: (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{
            color: textColor,
            fontSize: 24,
            fontWeight: 300,
            lineHeight: 1,
          }}>
            {ctaText}
          </span>
          <ArrowIcon color={colors.brand.primary} width={22} height={22 * 0.8} />
        </div>
      ),
      renderChrome: (inner) => inner,
    },
  ]

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ContentStack<SocialImageMeddbaseBlockId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock}
          renderInlineEditor={renderInlineEditor}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {wrapBlock('image', (
        <div style={{
          width: imageWidth,
          height: 628,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#ffffff',
        }}>
          <img
            src={grayscaleImageUrl || imageUrl}
            alt=""
            data-export-image="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${50 - imagePosition.x}% ${50 - imagePosition.y}%`,
              transform: imageZoom !== 1
                ? `translate(${imagePosition.x * (imageZoom - 1)}%, ${imagePosition.y * (imageZoom - 1)}%) scale(${imageZoom})`
                : undefined,
              transformOrigin: 'center',
              filter: imageFilterStyle,
            }}
          />
        </div>
      ))}

      {renderOverlay?.()}
    </div>
  )
}
