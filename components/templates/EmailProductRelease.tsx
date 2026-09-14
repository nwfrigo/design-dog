'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { RichText } from '@/components/shared/RichText'
import {
  NEUTRAL_FILTERS,
  applyGrayscaleBoolean,
  filtersToCss,
  type ImageFilters,
} from '@/lib/image-filters'

/** Track 2 (fixed-composition) editable block ids. Logo is brand-
 *  locked (orange Cority mark top-left). Decorative chrome (vertical
 *  divider at 33% + horizontal rule under header + image border) is
 *  not editable; it's part of the visual lockup. */
export type EmailProductReleaseBlockId =
  | 'logo'
  | 'eyebrow'
  | 'headline'
  | 'image'

export interface EmailProductReleaseProps {
  eyebrow: string
  headline: string
  headlineFontSize?: number
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  grayscale?: boolean
  renderBlock?: (blockId: EmailProductReleaseBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailProductReleaseBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const IMAGE_START = 320
const DIVIDER_X = Math.round(IMAGE_START * 0.33)
const HEADER_HEIGHT = 55

export function EmailProductRelease({
  eyebrow,
  headline,
  headlineFontSize,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  grayscale = false,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
}: EmailProductReleaseProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = colors.brand.black
  const borderColor = '#000000'

  const effectiveFilters = applyGrayscaleBoolean(imageFilters, grayscale)
  const filterCss = filtersToCss(effectiveFilters)
  const imageFilterStyle =
    filterCss ? filterCss :
    grayscale ? 'grayscale(100%)' : 'none'

  const containerStyle: CSSProperties = {
    width: 640,
    height: 164,
    background: '#F9F9F9',
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const eyebrowNode: ReactNode = wrapBlock('eyebrow', (
    <span style={{
      color: textColor,
      fontSize: 8,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 0.88,
    }}>
      {wrapInline('eyebrow', <span>{eyebrow || 'Product Release'}</span>)}
    </span>
  ))

  // Size-adjustable so long product names ("Advanced Carbon Management") can
  // shrink to fit the fixed 640×184 banner. Line-height keeps the native
  // 46.10/36.88 = 1.25 ratio at every size.
  const hlSize = headlineFontSize ?? 36.88
  // maxHeight + overflow keep the BLOCK's measured bounds inside the canvas:
  // the editor stage frames itself around block bounds, so an unclamped
  // multi-line headline used to inflate the stage frame (header shoved up,
  // image short of full bleed, phantom bottom padding).
  const headlineNode: ReactNode = wrapBlock('headline', (
    <div style={{
      color: textColor,
      fontSize: hlSize,
      fontWeight: 300,
      lineHeight: `${(hlSize * 1.25).toFixed(2)}px`,
      maxHeight: '100%',
      overflow: 'hidden',
    }}>
      {wrapInline('headline', <RichText html={headline || 'GX2 2026.1'} />)}
    </div>
  ))

  return (
    <div style={containerStyle}>
      <div style={{
        width: IMAGE_START,
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
      }}>
        {wrapBlock('logo', (
          <div style={{
            position: 'absolute',
            left: 27,
            top: 18,
          }}>
            <CorityLogo fill="#D65F00" height={18} />
          </div>
        ))}

        <div style={{
          position: 'absolute',
          left: DIVIDER_X,
          top: 0,
          width: 0,
          height: HEADER_HEIGHT,
          borderLeft: `0.5px solid ${borderColor}`,
        }} />

        <div style={{
          position: 'absolute',
          left: 0,
          top: HEADER_HEIGHT,
          width: IMAGE_START,
          height: 0,
          borderTop: `0.5px solid ${borderColor}`,
        }} />

        <div style={{
          position: 'absolute',
          left: DIVIDER_X,
          top: 0,
          width: IMAGE_START - DIVIDER_X,
          height: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {eyebrowNode}
        </div>

        {/* Headline cell — spans the full text zone under the header rule
            and vertically centers its content, so the headline sits balanced
            in the gray space at every size/line count, and clips INSIDE the
            canvas instead of breaking the stage frame. */}
        <div style={{
          position: 'absolute',
          left: 27,
          right: 0,
          top: HEADER_HEIGHT,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {headlineNode}
        </div>
      </div>

      {wrapBlock('image', (
        <div style={{
          width: 331,
          height: 184,
          position: 'absolute',
          left: IMAGE_START,
          top: -10,
          overflow: 'hidden',
          borderRadius: 6,
          borderLeft: `0.5px solid ${borderColor}`,
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
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
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 14,
            }}>
              Upload Image
            </div>
          )}
        </div>
      ))}

      {renderOverlay?.()}
    </div>
  )
}
