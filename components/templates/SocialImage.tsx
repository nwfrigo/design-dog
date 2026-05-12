'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
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

/** Logical IDs for editable blocks + the `logo` topAnchor (brand-locked
 *  baked-in Cority logo; the solutionPill is rendered alongside it in
 *  the anchor node but wrapped via its own renderBlock call, so it
 *  surfaces the EditbarCategory toolbar independently). */
export type SocialImageBlockId =
  | 'logo'
  | 'solutionPill'
  | 'headline'
  | 'subhead'
  | 'metadata'
  | 'cta'
  | 'image'

export interface SocialImageProps {
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
  theme?: TemplateTheme
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: SocialImageBlockId,
    nextId: SocialImageBlockId,
  ) => ReactNode
  renderBlock?: (blockId: SocialImageBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: SocialImageBlockId, defaultInner: ReactNode) => ReactNode
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
  .social-img-rich-text strong { font-weight: 500; }
  .social-img-rich-text em { font-style: italic; }
  .social-img-rich-text p { margin: 0; }
  .social-img-rich-text p + p { margin-top: 0.3em; }
`

export function SocialImage({
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
  theme = 'light',
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
}: SocialImageProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const themeColors = TEMPLATE_THEMES[theme]
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = themeColors.logoFill
  const textColor = themeColors.textPrimary
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
    background: themeColors.backgroundPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: 64,
    padding: '64px 0 64px 64px',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  // Header node — logo + (optional) solution pill in a horizontal row.
  // Each is wrapped via renderBlock independently so the pill can surface
  // EditbarCategory on selection while the logo stays brand-locked.
  const headerNode: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
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

  const blocks: ContentStackBlock<SocialImageBlockId>[] = [
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="social-img-rich-text"
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
          className="social-img-rich-text"
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
      defaultInner: <span>{ctaText}</span>,
      renderChrome: (inner) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: textColor,
          fontSize: 24,
          fontWeight: 300,
          lineHeight: 1,
        }}>
          {inner}
          <ArrowIcon color={themeColors.buttonSecondaryText} width={22} height={22 * 0.8} />
        </div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Left content column — header (logo + pill) at top via ContentStack
       *  topAnchor; rest of the column is ContentStack-distributed by
       *  stackAlign with adjustable per-gap spacing. */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ContentStack<SocialImageBlockId>
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
            // No renderBlock — the header sub-elements (logo, pill) are
            // wrapped independently inside `headerNode` via wrapBlock.
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Right image column — fixed-presence image slot. */}
      {wrapBlock('image', (
        <div style={{
          width: imageWidth,
          height: 628,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          background: themeColors.backgroundPrimary,
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
