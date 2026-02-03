'use client'

import { CSSProperties, useState, useEffect } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility (white only)
const CorityLogo = ({ height = 29 }: { height?: number }) => {
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

// Arrow icon for CTA (blue)
const ArrowIcon = () => (
  <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L16 7M16 7L10 13M16 7H1" stroke="#0080FF" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export interface WebinarSpeakerInfo {
  name: string
  role: string
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
}

export type WebinarVariant = 'none' | 'image' | 'speakers'

export interface WebsiteWebinarProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  variant: WebinarVariant
  imageUrl?: string
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  speakerCount: 1 | 2 | 3
  speaker1: WebinarSpeakerInfo
  speaker2: WebinarSpeakerInfo
  speaker3: WebinarSpeakerInfo
  showSpeaker1?: boolean
  showSpeaker2?: boolean
  showSpeaker3?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Component to render a circular speaker avatar with grayscale
function SpeakerAvatar({
  imageUrl,
  position,
  zoom,
  size = 48
}: {
  imageUrl: string
  position: { x: number; y: number }
  zoom: number
  size?: number
}) {
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
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
    backgroundColor: '#333',
  }

  const imageStyle: CSSProperties = {
    position: 'absolute',
    width: `${100 * zoom}%`,
    height: `${100 * zoom}%`,
    objectFit: 'cover',
    left: `${50 + position.x}%`,
    top: `${50 + position.y}%`,
    transform: 'translate(-50%, -50%)',
    filter: grayscaleImageUrl ? 'none' : 'grayscale(100%)',
  }

  if (!imageUrl) {
    return <div style={containerStyle} />
  }

  return (
    <div style={containerStyle}>
      <img
        src={grayscaleImageUrl || imageUrl}
        alt=""
        style={imageStyle}
      />
    </div>
  )
}

export function WebsiteWebinar({
  eyebrow,
  headline,
  subhead,
  body,
  cta,
  solution,
  variant = 'image',
  imageUrl = '/placeholder-mountain.jpg',
  showEyebrow,
  showSubhead,
  showBody,
  showCta,
  speakerCount = 3,
  speaker1,
  speaker2,
  speaker3,
  showSpeaker1 = true,
  showSpeaker2 = true,
  showSpeaker3 = true,
  colors,
  typography,
  scale = 1,
}: WebsiteWebinarProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.safety
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // State for grayscale image (for export compatibility)
  const [grayscaleImageUrl, setGrayscaleImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl || variant !== 'image') return

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
  }, [imageUrl, variant])

  // Font sizes differ based on variant
  const headlineFontSize = variant === 'none' ? 54 : 35.42
  const contentWidth = variant === 'none' ? 574 : 401.04
  const headlineLineHeight = variant === 'none' ? '50.20px' : '50.20px'
  const headlineGap = variant === 'none' ? 8 : 4.17

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 33.33,
    paddingRight: variant === 'image' ? 0 : 33.33, // No right padding for image variant so image goes to edge
    position: 'relative',
    background: '#060015',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: variant === 'none' ? 28 : (variant === 'speakers' ? 28 : 10.42),
  }

  // Build speakers array based on visibility
  const speakers: WebinarSpeakerInfo[] = []
  if (showSpeaker1) speakers.push(speaker1)
  if (showSpeaker2) speakers.push(speaker2)
  if (showSpeaker3) speakers.push(speaker3)

  return (
    <div style={containerStyle}>
      {/* Image on right side (only for image variant) */}
      {variant === 'image' && (
        <div
          style={{
            position: 'absolute',
            left: 467, // Start after text content area (33.33 padding + 401 content + ~32 gap)
            top: 0,
            right: 0, // Extend to right edge
            bottom: 0, // Full height
            overflow: 'hidden',
          }}
        >
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
        </div>
      )}

      {/* Left content area */}
      <div
        style={{
          width: variant === 'none' ? undefined : 401,
          flex: variant === 'none' ? '1 1 0' : undefined,
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
          <CorityLogo height={29} />

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
                outline: '0.79px #0080FF solid',
                outlineOffset: '-0.79px',
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
            width: contentWidth,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 25.10,
          }}
        >
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div
              style={{
                alignSelf: 'stretch',
                color: 'white',
                fontSize: 12.50,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.38,
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
              gap: headlineGap,
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                color: 'white',
                fontSize: headlineFontSize,
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
                  fontSize: 22,
                  fontWeight: 350,
                }}
              >
                {subhead}
              </div>
            )}
          </div>

          {/* Body */}
          {showBody && body && (
            <div
              style={{
                alignSelf: 'stretch',
                color: 'white',
                fontSize: 14.58,
                fontWeight: 350,
              }}
            >
              {body}
            </div>
          )}
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

      {/* Speakers panel (only for speakers variant) */}
      {variant === 'speakers' && (
        <div
          style={{
            flex: '1 1 0',
            alignSelf: 'stretch',
            paddingLeft: 20,
            paddingRight: 20,
            background: '#060621',
            overflow: 'hidden',
            borderRadius: 7,
            outline: '0.75px #0080FF solid',
            outlineOffset: '-0.75px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {speakers.map((speaker, index) => (
            <div
              key={index}
              style={{
                alignSelf: 'stretch',
                flex: '1 1 0',
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <SpeakerAvatar
                imageUrl={speaker.imageUrl}
                position={speaker.imagePosition}
                zoom={speaker.imageZoom}
                size={48}
              />
              <div
                style={{
                  flex: '1 1 0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 350,
                  }}
                >
                  {speaker.name}
                </div>
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 350,
                    lineHeight: '16px',
                  }}
                >
                  {speaker.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
