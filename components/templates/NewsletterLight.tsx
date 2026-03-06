'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'

export type ImageSize = 'none' | 'small' | 'large'

export interface NewsletterLightProps {
  eyebrow: string
  headline: string
  body: string
  ctaText: string
  imageSize: ImageSize
  imageUrl: string | null
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showHeadline?: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

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
  body,
  ctaText,
  imageSize,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  showEyebrow,
  showHeadline = true,
  showBody,
  showCta,
  grayscale = false,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: NewsletterLightProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#060015' // Dark text on light background
  const ctaColor = '#0080FF' // Cobalt blue for arrow
  const backgroundColor = '#FFFFFF'

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale && imageSize !== 'none')

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

  return (
    <div style={containerStyle}>
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
          {/* Text Block */}
          <div style={{
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 14,
          }}>
            {/* Eyebrow */}
            {showEyebrow && eyebrow && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 8,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.88,
              }}>
                {eyebrow}
              </div>
            )}

            {/* Headline */}
            {showHeadline && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: headlineFontSize ?? 24,
                fontWeight: 350,
                lineHeight: `${(headlineFontSize ?? 24) * (26 / 24)}px`,
              }}>
                {headline || 'Headline'}
              </div>
            )}

            {/* Body */}
            {showBody && body && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 12,
                fontWeight: 350,
                lineHeight: '16px',
              }}>
                {body}
              </div>
            )}
          </div>

          {/* CTA */}
          {showCta && ctaText && (
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
                {ctaText}
              </span>
              <ArrowIcon color={ctaColor} width={11} height={11 * 0.795} viewBox="0 0 11 8.75" pathD="M6.5 0.5L10.5 4.375M10.5 4.375L6.5 8.25M10.5 4.375H0.5" strokeWidth={0.75} />
            </div>
          )}
        </div>

        {/* Image Area - only show for small and large variants */}
        {imageSize !== 'none' && (
          <>
            {imageSize === 'small' && (
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
                      filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
                    }}
                  />
                )}
              </div>
            )}
            {imageSize === 'large' && (
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
                      filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
