'use client'

import { CSSProperties, useState, useEffect } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility (white only)
const CorityLogo = ({ height = 28 }: { height?: number }) => {
  const width = Math.round(height * 3.062)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill="white"
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

// Arrow icon for CTA (white)
const ArrowIcon = () => (
  <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L16 7M16 7L10 13M16 7H1" stroke="white" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export type ReportVariant = 'image' | 'none'

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
  showEyebrow: boolean
  showSubhead: boolean
  showCta: boolean
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

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
  showEyebrow,
  showSubhead,
  showCta,
  grayscale = false,
  colors,
  typography,
  scale = 1,
}: WebsiteReportProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // State for grayscale image (only used when grayscale is enabled)
  const [grayscaleImageUrl, setGrayscaleImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl || variant !== 'image' || !grayscale) {
      setGrayscaleImageUrl(null)
      return
    }

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
  }, [imageUrl, variant, grayscale])

  // Text sizes change based on variant
  const headlineSize = variant === 'none' ? 54 : 35
  const headlineLineHeight = variant === 'none' ? '58px' : '48.19px'
  const headlineSubheadGap = variant === 'none' ? 8 : 4

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 32,
    position: 'relative',
    background: '#060015',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 40,
  }

  return (
    <div style={containerStyle}>
      {/* Image on left side - only shown for image variant */}
      {variant === 'image' && (
        <div
          style={{
            width: 320,
            height: 386,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
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
                ? `scale(${imageZoom}) translate(${imagePosition.x * (imageZoom - 1)}%, ${imagePosition.y * (imageZoom - 1)}%)`
                : undefined,
              transformOrigin: 'center',
              filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
            }}
          />
        </div>
      )}

      {/* Right content area (for image variant) / Full content area (for none variant) */}
      <div
        style={{
          flex: '1 1 0',
          alignSelf: 'stretch',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Header: Logo + Solution Pill */}
        <div
          style={{
            display: 'inline-flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 49.70,
          }}
        >
          <CorityLogo height={28} />

          {/* Solution Pill */}
          {solution !== 'none' && (
            <div
              style={{
                paddingLeft: 19,
                paddingRight: 19,
                paddingTop: 15,
                paddingBottom: 15,
                background: '#060621',
                borderRadius: 6.25,
                border: '0.79px solid #0080FF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12.02,
              }}
            >
              <div
                style={{
                  width: 11.15,
                  height: 11.15,
                  background: solutionColor,
                  borderRadius: 1.92,
                }}
              />
              <span
                style={{
                  color: 'white',
                  fontSize: 10.80,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.19,
                  lineHeight: 1,
                }}
              >
                {solutionLabel}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div
          style={{
            width: variant === 'none' ? 574 : undefined,
            alignSelf: variant === 'image' ? 'stretch' : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 24.09,
          }}
        >
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div
              style={{
                alignSelf: 'stretch',
                color: 'white',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.32,
              }}
            >
              {eyebrow}
            </div>
          )}

          {/* Headline + Subhead */}
          <div
            style={{
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: headlineSubheadGap,
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                color: 'white',
                fontSize: headlineSize,
                fontWeight: 350,
                lineHeight: headlineLineHeight,
              }}
            >
              {headline || 'Lightweight header.'}
            </div>

            {showSubhead && subhead && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 350,
                }}
              >
                {subhead}
              </div>
            )}
          </div>
        </div>

        {/* CTA Link */}
        {showCta && cta && (
          <div
            style={{
              display: 'inline-flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 12.50,
            }}
          >
            <span
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 18.75,
                fontWeight: 500,
                lineHeight: '18.75px',
              }}
            >
              {cta}
            </span>
            <ArrowIcon />
          </div>
        )}
      </div>
    </div>
  )
}
