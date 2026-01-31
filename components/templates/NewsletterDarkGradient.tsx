'use client'

import { CSSProperties, useState, useEffect } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Arrow icon for CTA link - cobalt blue
const ArrowIcon = ({ color = '#0080FF', size = 11 }: { color?: string; size?: number }) => (
  <svg width={size} height={size * 0.795} viewBox="0 0 11 8.75" fill="none">
    <path
      d="M6.5 0.5L10.5 4.375M10.5 4.375L6.5 8.25M10.5 4.375H0.5"
      stroke={color}
      strokeWidth={0.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export type ColorStyle = '1' | '2' | '3' | '4'
export type ImageSize = 'none' | 'small' | 'large'

export interface NewsletterDarkGradientProps {
  eyebrow: string
  headline: string
  body: string
  ctaText: string
  colorStyle: ColorStyle
  imageSize: ImageSize
  imageUrl: string | null
  showEyebrow: boolean
  showBody: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGES: Record<ColorStyle, string> = {
  '1': '/assets/backgrounds/newsletter-dark-gradient-1.png',
  '2': '/assets/backgrounds/newsletter-dark-gradient-2.png',
  '3': '/assets/backgrounds/newsletter-dark-gradient-3.png',
  '4': '/assets/backgrounds/newsletter-dark-gradient-4.png',
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

export function NewsletterDarkGradient({
  eyebrow,
  headline,
  body,
  ctaText,
  colorStyle,
  imageSize,
  imageUrl,
  showEyebrow,
  showBody,
  showCta,
  colors,
  typography,
  scale = 1,
}: NewsletterDarkGradientProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#FFFFFF'
  const ctaColor = '#0080FF' // Cobalt blue for arrow

  // State for grayscale image
  const [grayscaleImageUrl, setGrayscaleImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl || imageSize === 'none') return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        ctx.globalCompositeOperation = 'saturation'
        ctx.fillStyle = 'hsl(0, 0%, 50%)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setGrayscaleImageUrl(canvas.toDataURL('image/jpeg', 0.9))
      }
    }
    img.onerror = () => setGrayscaleImageUrl(null)
    img.src = imageUrl
  }, [imageUrl, imageSize])

  const containerStyle: CSSProperties = {
    width: 640,
    height: 179,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
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
      {/* Background Image */}
      <img
        src={BACKGROUND_IMAGES[colorStyle]}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content Overlay */}
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
            <div style={{
              alignSelf: 'stretch',
              color: textColor,
              fontSize: 24,
              fontWeight: 350,
              lineHeight: '26px',
            }}>
              {headline || 'Headline'}
            </div>

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
              <ArrowIcon color={ctaColor} size={11} />
            </div>
          )}
        </div>

        {/* Image Area - only show for small and large variants */}
        {imageSize !== 'none' && (
          <div style={{
            flex: imageSize === 'small' ? '1 1 0' : undefined,
            width: imageSize === 'large' ? imageWidth : undefined,
            height: imageSize === 'small' ? 132 : 179,
            position: imageSize === 'large' ? 'absolute' : 'relative',
            right: imageSize === 'large' ? 0 : undefined,
            top: imageSize === 'large' ? 0 : undefined,
            background: imageUrl ? 'transparent' : '#FFFFFF',
            borderRadius: imageSize === 'small' ? 6 : 0,
            overflow: 'hidden',
          }}>
            {imageUrl && (
              <img
                src={grayscaleImageUrl || imageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: grayscaleImageUrl ? 'none' : 'grayscale(100%)',
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
