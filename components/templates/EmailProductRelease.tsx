'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
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

  const headlineNode: ReactNode = wrapBlock('headline', (
    <div style={{
      color: textColor,
      fontSize: 36.88,
      fontWeight: 300,
      lineHeight: '46.10px',
    }}>
      {wrapInline('headline', <div>{headline || 'GX2 2026.1'}</div>)}
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

        <div style={{
          position: 'absolute',
          left: 27,
          top: 96,
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
