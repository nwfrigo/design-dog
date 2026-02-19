'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility - orange only
const CorityLogo = ({ height = 18 }: { height?: number }) => {
  const width = Math.round(height * 2.988)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill="#D65F00"
    >
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z"/>
      <rect x="217.71" width="19.92" height="16.98"/>
      <path d="M379,35.66a4.65,4.65,0,0,1-1.88-.38,4.73,4.73,0,0,1-1.54-1,4.82,4.82,0,0,1-1-1.54,4.91,4.91,0,0,1-.38-1.89,4.82,4.82,0,0,1,.38-1.88,4.88,4.88,0,0,1,2.58-2.58A4.82,4.82,0,0,1,379,26a4.91,4.91,0,0,1,1.89.38,4.67,4.67,0,0,1,1.53,1,4.82,4.82,0,0,1,1.42,3.42,4.73,4.73,0,0,1-.38,1.89,4.85,4.85,0,0,1-2.57,2.57A4.73,4.73,0,0,1,379,35.66Zm0-8.76a3.92,3.92,0,1,0,3.92,3.92A3.93,3.93,0,0,0,379,26.9Z"/>
      <path d="M380.66,32.86a7.57,7.57,0,0,0-.6-1.4A1.87,1.87,0,0,0,379,28H377v5.62h1.12V31.76h.79a4.21,4.21,0,0,1,.73,1.47,3.73,3.73,0,0,0,.14.4H381A5.08,5.08,0,0,1,380.66,32.86ZM379,30.64h-1v-1.5h1a.75.75,0,0,1,0,1.5Z"/>
    </svg>
  )
}

export interface EmailProductReleaseProps {
  eyebrow: string
  headline: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
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
    background: '#F1F3F4',
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
          <CorityLogo height={18} />
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
