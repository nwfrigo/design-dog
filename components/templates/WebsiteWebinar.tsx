'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon, useGrayscaleImage } from '@/components/shared'

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
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
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

// Component to render a circular speaker avatar with optional grayscale
function SpeakerAvatar({
  imageUrl,
  position,
  zoom,
  size = 48,
  speakerIndex,
  grayscale = false,
}: {
  imageUrl: string
  position: { x: number; y: number }
  zoom: number
  size?: number
  speakerIndex: number
  grayscale?: boolean
}) {
  // Use shared grayscale hook
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

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
    filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
  }

  if (!imageUrl) {
    return <div style={containerStyle} />
  }

  return (
    <div style={containerStyle}>
      <img
        src={grayscaleImageUrl || imageUrl}
        alt=""
        data-export-image="true"
        data-speaker={speakerIndex}
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
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  showEyebrow,
  showSubhead,
  showBody,
  showCta,
  grayscale = false,
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

  // Use shared grayscale hook (only when variant is 'image')
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, variant === 'image' && grayscale)

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
  const speakers: (WebinarSpeakerInfo & { speakerIndex: number })[] = []
  if (showSpeaker1) speakers.push({ ...speaker1, speakerIndex: 1 })
  if (showSpeaker2) speakers.push({ ...speaker2, speakerIndex: 2 })
  if (showSpeaker3) speakers.push({ ...speaker3, speakerIndex: 3 })

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
              filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
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
          <CorityLogo fill="white" height={29} />

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
            <ArrowIcon color="#0080FF" />
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
            border: '0.75px solid #0080FF',
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
                speakerIndex={speaker.speakerIndex}
                grayscale={grayscale}
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
