'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
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

export type EmailImageBlockId =
  | 'logo'
  | 'solutionPill'
  | 'headline'
  | 'body'
  | 'cta'
  | 'image'

export interface EmailImageProps {
  headline: string
  body: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  layout: LayoutVariant
  solution: string
  showHeadline?: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  headlineFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: EmailImageBlockId,
    nextId: EmailImageBlockId,
  ) => ReactNode
  renderBlock?: (blockId: EmailImageBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailImageBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  theme?: TemplateTheme
}

const TEXT_WIDTHS: Record<LayoutVariant, number> = {
  'even': 330,
  'more-image': 260,
  'more-text': 400,
}

const IMAGE_WIDTHS: Record<LayoutVariant, number> = {
  'even': 250,
  'more-image': 320,
  'more-text': 180,
}

const DEFAULT_GAP = 17
const DEFAULT_FONT_SIZE = 38.15
const LINE_HEIGHT_RATIO = 48.19 / 38.15

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

const RICH_TEXT_STYLES = `
  .email-img-rich-text strong { font-weight: 500; }
  .email-img-rich-text em { font-style: italic; }
  .email-img-rich-text p { margin: 0; }
  .email-img-rich-text p + p { margin-top: 0.3em; }
`

export function EmailImage({
  headline,
  body,
  ctaText,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  layout,
  solution,
  showHeadline = true,
  showBody,
  showCta,
  showSolutionSet,
  grayscale = false,
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
}: EmailImageProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const themeColors = TEMPLATE_THEMES[theme]
  const logoFill = themeColors.logoFill
  const textColor = themeColors.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const textWidth = TEXT_WIDTHS[layout]
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

  const fontSize = headlineFontSize ?? DEFAULT_FONT_SIZE
  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    background: themeColors.backgroundPrimary,
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  // Header — logo + (optional) solution pill in horizontal row. Each is
  // wrapped via its own renderBlock call so the pill surfaces
  // EditbarCategory independently while the logo stays brand-locked.
  const headerNode: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={logoFill} height={23} />
      ))}
      {showSolutionSet && solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="email"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={textColor}
          background={themeColors.bgCategoryChip}
          border={`0.79px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<EmailImageBlockId>[] = [
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="email-img-rich-text"
          style={{
            alignSelf: 'stretch',
            color: textColor,
            fontSize,
            fontWeight: 300,
            lineHeight: `${fontSize * LINE_HEIGHT_RATIO}px`,
          }}
        >{inner}</div>
      ),
    },
    {
      id: 'body',
      visible: showBody,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: body || 'Body copy goes here.' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="email-img-rich-text"
          style={{
            alignSelf: 'stretch',
            color: textColor,
            fontSize: 18.07,
            fontWeight: 300,
          }}
        >{inner}</div>
      ),
    },
    {
      id: 'cta',
      visible: showCta,
      defaultInner: <span>{ctaText || 'Call to Action'}</span>,
      renderChrome: (inner) => (
        <div style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
          color: themeColors.buttonSecondaryText,
          fontSize: 18,
          fontWeight: 500,
          lineHeight: '18px',
        }}>
          {inner}
          <ArrowIcon color={themeColors.buttonSecondaryText} width={16.5} height={16.5 * 0.8} />
        </div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Left content column — header (logo + pill) topAnchor; rest is
       *  ContentStack-distributed by stackAlign with adjustable per-gap
       *  spacing. */}
      <div style={{
        width: textWidth,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <ContentStack<EmailImageBlockId>
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

      {/* Right image — absolute, extends to right edge. */}
      {wrapBlock('image', (
        <div style={{
          width: imageWidth,
          height: 300,
          position: 'absolute',
          right: 0,
          top: 0,
          overflow: 'hidden',
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
