'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

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

export type EbookVariant = 'image' | 'none'

export type WebsiteThumbnailBlockId =
  | 'logo'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'cta'
  | 'image'

type WebsiteThumbnailStackId = Exclude<WebsiteThumbnailBlockId, 'image' | 'solutionPill'>

export interface WebsiteThumbnailProps {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  solution: string
  variant: EbookVariant
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showCta: boolean
  grayscale?: boolean
  theme?: TemplateTheme
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: WebsiteThumbnailStackId,
    nextId: WebsiteThumbnailStackId,
  ) => ReactNode
  renderBlock?: (blockId: WebsiteThumbnailBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteThumbnailBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_GAP = 24.09

export function WebsiteThumbnail({
  eyebrow,
  headline,
  subhead,
  cta,
  solution,
  variant = 'image',
  imageUrl = '/assets/images/safer_is_stronger_sample_page.png',
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showCta,
  grayscale = false,
  theme = 'light',
  headlineFontSize: headlineFontSizeProp,
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
}: WebsiteThumbnailProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = themeColors.logoFill

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

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

  const defaultHeadlineSize = variant === 'none' ? 54 : 35
  const headlineSize = headlineFontSizeProp ?? defaultHeadlineSize
  const headlineLineHeight = `${headlineSize * (48.19 / defaultHeadlineSize)}px`

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 32,
    position: 'relative',
    background: themeColors.backgroundPrimary,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 20,
  }

  const headerNode: ReactNode = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 47.71, flexShrink: 0 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={logoFill} height={28} />
      ))}
      {solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="website-light"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={themeColors.textPrimary}
          background={themeColors.bgCategoryChip}
          border={`1px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<WebsiteThumbnailStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || SLOT_PLACEHOLDERS.eyebrow,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: themeColors.textPrimary,
          fontSize: 14,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 1.32,
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
          color: themeColors.textPrimary,
          fontSize: headlineSize,
          fontWeight: 350,
          lineHeight: headlineLineHeight,
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
          color: themeColors.textPrimary,
          fontSize: subheadFontSize ?? 20,
          fontWeight: 350,
        }}>{inner}</div>
      ),
    },
    {
      id: 'cta',
      visible: showCta,
      defaultInner: cta || SLOT_PLACEHOLDERS.cta,
      renderChrome: (inner) => (
        <div style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 12.50,
        }}>
          <span style={{
            textAlign: 'center',
            color: themeColors.buttonSecondaryText,
            fontSize: 18.75,
            fontWeight: 500,
            lineHeight: '18.75px',
          }}>{inner}</span>
          <ArrowIcon color={themeColors.buttonSecondaryText} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
        </div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      {/* Left content column */}
      <div style={{
        width: variant === 'image' ? 396 : undefined,
        flex: variant === 'none' ? '1 1 0' : undefined,
        alignSelf: 'stretch',
        overflow: 'hidden',
      }}>
        <ContentStack<WebsiteThumbnailStackId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: WebsiteThumbnailStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: WebsiteThumbnailStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Right image — only for image variant */}
      {variant === 'image' && wrapBlock('image', (
        <div style={{
          width: 320,
          height: 386,
          borderRadius: 10,
          border: '1px solid #D9D8D6',
          overflow: 'hidden',
          flexShrink: 0,
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
