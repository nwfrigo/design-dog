'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
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

export type ImageSize = 'none' | 'small' | 'large'

export type NewsletterLightBlockId =
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'cta'
  | 'image'

export interface NewsletterLightProps {
  eyebrow: string
  headline: string
  subhead: string
  ctaText: string
  imageSize: ImageSize
  imageUrl: string | null
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showCta: boolean
  grayscale?: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: NewsletterLightBlockId,
    nextId: NewsletterLightBlockId,
  ) => ReactNode
  renderBlock?: (blockId: NewsletterLightBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: NewsletterLightBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  theme?: TemplateTheme
}

const DEFAULT_GAP = 14

// Text content width based on image size
const TEXT_WIDTHS: Record<ImageSize, number> = {
  'none': 592, // Full width minus padding (640 - 24*2)
  'small': 334,
  'large': 275,
}

// Image widths for each variant
const IMAGE_WIDTHS: Record<ImageSize, number> = {
  'none': 0,
  'small': 234, // flex 1 in the gap layout
  'large': 317,
}

export function NewsletterLight({
  eyebrow,
  headline,
  subhead,
  ctaText,
  imageSize,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showCta,
  grayscale = false,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
  theme = 'light',
}: NewsletterLightProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const themeColors = TEMPLATE_THEMES[theme]
  const textColor = themeColors.textPrimary
  const ctaColor = themeColors.buttonSecondaryText
  const backgroundColor = themeColors.backgroundPrimary

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale && imageSize !== 'none')

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

  const containerStyle: CSSProperties = {
    width: 640,
    height: 179,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    background: backgroundColor,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const contentStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
  }

  const textWidth = TEXT_WIDTHS[imageSize]
  const imageWidth = IMAGE_WIDTHS[imageSize]

  // Text-block stack — eyebrow / headline / subhead with adjustable gaps.
  // CTA renders as a sibling below, anchored bottom by space-between.
  const stackBlocks: ContentStackBlock<NewsletterLightBlockId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || SLOT_PLACEHOLDERS.eyebrow,
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: textColor,
          fontSize: 8,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 0.88,
        }}>{inner}</div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: headline || SLOT_PLACEHOLDERS.headline }} />
      ),
      renderChrome: (inner) => (
        <div className="nl-rich-text" style={{
          alignSelf: 'stretch',
          color: textColor,
          fontSize: headlineFontSize ?? 24,
          fontWeight: 350,
          lineHeight: `${(headlineFontSize ?? 24) * (26 / 24)}px`,
        }}>{inner}</div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: subhead || SLOT_PLACEHOLDERS.subhead }} />
      ),
      renderChrome: (inner) => (
        <div className="nl-rich-text" style={{
          alignSelf: 'stretch',
          color: textColor,
          fontSize: subheadFontSize ?? 12,
          fontWeight: 350,
          lineHeight: '16px',
        }}>{inner}</div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      <style>{`.nl-rich-text p { margin: 0; }`}</style>
      {/* Content */}
      <div style={contentStyle}>
        {/* Text Content Area */}
        <div style={{
          width: imageSize === 'none' ? '100%' : textWidth,
          alignSelf: 'stretch',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <ContentStack<NewsletterLightBlockId>
            blocks={stackBlocks}
            gaps={gaps}
            defaultGap={DEFAULT_GAP}
            renderSpacerBetween={renderSpacerBetween}
            renderBlock={renderBlock}
            renderInlineEditor={renderInlineEditor}
            stackAlign={stackAlign}
            alignItems="flex-start"
          />

          {/* CTA — sibling, anchored bottom by space-between */}
          {showCta && wrapBlock('cta', (
            <div style={{
              display: 'inline-flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                textAlign: 'center',
                color: textColor,
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '12px',
              }}>
                {ctaText || SLOT_PLACEHOLDERS.cta}
              </span>
              <ArrowIcon color={ctaColor} width={11} height={11 * 0.795} viewBox="0 0 11 8.75" pathD="M6.5 0.5L10.5 4.375M10.5 4.375L6.5 8.25M10.5 4.375H0.5" strokeWidth={0.75} />
            </div>
          ))}
        </div>

        {/* Image Area — wrapped for Stage & Bench so it surfaces the
         *  EditbarImage toolbar on selection. */}
        {imageSize === 'small' && wrapBlock('image', (
          <div style={{
            flex: '1 1 0',
            height: 132,
            background: imageUrl ? 'transparent' : '#F1F1F1',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {imageUrl && (
              <img
                src={grayscaleImageUrl || imageUrl}
                alt=""
                data-export-image="true"
                data-newsletter-image="true"
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
            )}
          </div>
        ))}
        {imageSize === 'large' && wrapBlock('image', (
          <div style={{
            width: imageWidth,
            height: 179,
            position: 'absolute',
            right: 0,
            top: 0,
            background: imageUrl ? 'transparent' : backgroundColor,
            borderLeft: '0.5px solid #000000',
            overflow: 'hidden',
          }}>
            {imageUrl && (
              <img
                src={grayscaleImageUrl || imageUrl}
                alt=""
                data-export-image="true"
                data-newsletter-image="true"
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
            )}
          </div>
        ))}
      </div>
      {renderOverlay?.()}
    </div>
  )
}
