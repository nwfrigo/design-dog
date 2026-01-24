'use client'

import { CSSProperties, useState, useEffect } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility - scaled for email size
const CorityLogo = ({ fill = '#000000', height = 23 }: { fill?: string; height?: number }) => {
  const width = Math.round(height * 2.988)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill={fill}
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

// Arrow icon for CTA - scaled for email
const ArrowIcon = ({ color = '#060015', size = 16.5 }: { color?: string; size?: number }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 22 17.5" fill="none">
    <path
      d="M13 1L21 8.75M21 8.75L13 16.5M21 8.75H1"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export type LayoutVariant = 'even' | 'more-image' | 'more-text'

export interface EmailImageProps {
  headline: string
  body: string
  ctaText: string
  imageUrl: string
  layout: LayoutVariant
  solution: string
  logoColor: 'black' | 'orange'
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Text area widths for each layout variant (image fills the rest)
const TEXT_WIDTHS: Record<LayoutVariant, number> = {
  'even': 330,
  'more-image': 260,
  'more-text': 400,
}

// Image widths for each layout variant
const IMAGE_WIDTHS: Record<LayoutVariant, number> = {
  'even': 250,
  'more-image': 320,
  'more-text': 180,
}

export function EmailImage({
  headline,
  body,
  ctaText,
  imageUrl,
  layout,
  solution,
  logoColor,
  showBody,
  showCta,
  showSolutionSet,
  colors,
  typography,
  scale = 1,
}: EmailImageProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const textColor = colors.ui.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const textWidth = TEXT_WIDTHS[layout]
  const imageWidth = IMAGE_WIDTHS[layout]

  // State for grayscale image
  const [grayscaleImageUrl, setGrayscaleImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) return

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
  }, [imageUrl])

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    background: colors.ui.surface,
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      {/* Left content area */}
      <div style={{
        width: textWidth,
        alignSelf: 'stretch',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>
        {/* Header: Logo + Solution Pill */}
        <div style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 40,
        }}>
          <CorityLogo fill={logoFill} height={23} />

          {showSolutionSet && solution !== 'none' && (
            <div style={{
              paddingLeft: 15,
              paddingRight: 15,
              paddingTop: 12.5,
              paddingBottom: 12.5,
              background: colors.ui.surface,
              borderRadius: 6.25,
              border: `0.79px solid ${colors.ui.border}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 9,
                height: 9,
                background: solutionColor,
                borderRadius: 2,
              }} />
              <span style={{
                color: textColor,
                fontSize: 8.85,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.97,
              }}>
                {solutionLabel}
              </span>
            </div>
          )}
        </div>

        {/* Text content block */}
        <div style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 24,
        }}>
          {/* Headline */}
          <div style={{
            alignSelf: 'stretch',
            color: textColor,
            fontSize: 38.15,
            fontWeight: 300,
            lineHeight: '48.19px',
          }}>
            {headline || 'Lightweight header.'}
          </div>

          {/* Body */}
          {showBody && body && (
            <div style={{
              alignSelf: 'stretch',
              color: textColor,
              fontSize: 18.07,
              fontWeight: 300,
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
            gap: 12,
          }}>
            <span style={{
              textAlign: 'center',
              color: '#060015',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: '18px',
            }}>
              {ctaText}
            </span>
            <ArrowIcon color="#060015" size={16.5} />
          </div>
        )}
      </div>

      {/* Right image area - absolutely positioned */}
      <div style={{
        width: imageWidth,
        height: 300,
        position: 'absolute',
        right: 0,
        top: 0,
        overflow: 'hidden',
      }}>
        {/* Image - slightly oversized to allow overflow effect */}
        <img
          src={grayscaleImageUrl || imageUrl}
          alt=""
          style={{
            width: imageWidth + 60,
            height: 330,
            position: 'absolute',
            left: -30,
            top: 12,
            objectFit: 'cover',
            filter: grayscaleImageUrl ? 'none' : 'grayscale(100%)',
          }}
        />

      </div>
    </div>
  )
}
