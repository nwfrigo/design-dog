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

export type ReportVariant = 'image' | 'none'

export type WebsiteReportBlockId =
  | 'logo'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'cta'
  | 'image'

type WebsiteReportStackId = Exclude<WebsiteReportBlockId, 'image' | 'solutionPill'>

export interface WebsiteReportProps {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  solution: string
  variant: ReportVariant
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
    prevId: WebsiteReportStackId,
    nextId: WebsiteReportStackId,
  ) => ReactNode
  renderBlock?: (blockId: WebsiteReportBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteReportBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_GAP = 24.09

export function WebsiteReport({
  eyebrow,
  headline,
  subhead,
  cta,
  solution,
  variant = 'image',
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showCta,
  grayscale = false,
  theme = 'dark',
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
}: WebsiteReportProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale && variant === 'image')

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
  const defaultLineHeight = variant === 'none' ? 58 : 48.19
  const headlineLineHeight = `${headlineSize * (defaultLineHeight / defaultHeadlineSize)}px`

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
    gap: 40,
  }

  const headerNode: ReactNode = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 49.70, flexShrink: 0 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={themeColors.logoFill} height={28} />
      ))}
      {solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="website-dark"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={themeColors.textPrimary}
          background={themeColors.bgCategoryChip}
          border={`0.79px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<WebsiteReportStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || 'Eyebrow',
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
      defaultInner: headline || 'Headline',
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
      defaultInner: subhead || 'Subheadline',
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
      defaultInner: cta || 'Call to Action',
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
      {/* Image on left — only for image variant */}
      {variant === 'image' && wrapBlock('image', (
        <div style={{
          width: 320,
          height: 386,
          borderRadius: 10,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img
            src={grayscaleImageUrl || imageUrl || '/assets/images/default_placeholder_image_report.png'}
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

      {/* Right content column (left when variant='none') */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        overflow: 'hidden',
      }}>
        <ContentStack<WebsiteReportStackId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: WebsiteReportStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: WebsiteReportStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {renderOverlay?.()}
    </div>
  )
}
