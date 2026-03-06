'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'

export interface EmailProductReleaseProps {
  eyebrow: string
  headline: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Layout constants
const IMAGE_START = 320 // Where the image area begins
const DIVIDER_X = Math.round(IMAGE_START * 0.33) // 33% of the way = ~106px
const HEADER_HEIGHT = 55

export function EmailProductRelease({
  eyebrow,
  headline,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  grayscale = false,
  colors,
  typography,
  scale = 1,
}: EmailProductReleaseProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = colors.brand.black
  const borderColor = '#000000'

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

  return (
    <div style={containerStyle}>
      {/* Left content area */}
      <div style={{
        width: IMAGE_START,
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
      }}>
        {/* Logo area */}
        <div style={{
          position: 'absolute',
          left: 27,
          top: 18,
        }}>
          <CorityLogo fill="#D65F00" height={18} />
        </div>

        {/* Vertical divider - 33% of the way from left to image */}
        <div style={{
          position: 'absolute',
          left: DIVIDER_X,
          top: 0,
          width: 0,
          height: HEADER_HEIGHT,
          borderLeft: `0.5px solid ${borderColor}`,
        }} />

        {/* Horizontal line under header - extends to image edge */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: HEADER_HEIGHT,
          width: IMAGE_START,
          height: 0,
          borderTop: `0.5px solid ${borderColor}`,
        }} />

        {/* Eyebrow text - centered in the box between divider and image */}
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
          <span style={{
            color: textColor,
            fontSize: 8,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.88,
          }}>
            {eyebrow || 'Product Release'}
          </span>
        </div>

        {/* Headline area */}
        <div style={{
          position: 'absolute',
          left: 27,
          top: 96,
        }}>
          <div style={{
            color: textColor,
            fontSize: 36.88,
            fontWeight: 300,
            lineHeight: '46.10px',
          }}>
            {headline || 'GX2 2026.1'}
          </div>
        </div>
      </div>

      {/* Right image area */}
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
              filter: grayscale ? 'grayscale(100%)' : undefined,
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
    </div>
  )
}
