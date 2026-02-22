'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon, useGrayscaleImage } from '@/components/shared'

export interface WebsitePressReleaseProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
  logoColor: 'black' | 'orange'
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function WebsitePressRelease({
  eyebrow,
  headline,
  subhead,
  body,
  cta,
  solution,
  imageUrl = '/placeholder-mountain.jpg',
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  showEyebrow,
  showSubhead,
  showBody,
  showCta,
  grayscale = false,
  logoColor,
  colors,
  typography,
  scale = 1,
}: WebsitePressReleaseProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Use shared grayscale hook
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 33.33,
    position: 'relative',
    background: '#F9F9F9',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10.42,
  }

  return (
    <div style={containerStyle}>
      {/* Right side image - extends to right edge */}
      <div
        style={{
          position: 'absolute',
          left: 462,
          top: 0,
          right: 0,
          bottom: 0,
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

      {/* Left content area */}
      <div
        style={{
          width: 396,
          flex: '1 1 0',
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
          <CorityLogo fill={logoFill} height={29} />

          {/* Solution Pill - white fill with border matching other templates */}
          {solution !== 'none' && (
            <div
              style={{
                paddingLeft: 18.84,
                paddingRight: 18.84,
                paddingTop: 15.58,
                paddingBottom: 15.58,
                background: '#FFFFFF',
                borderRadius: 7.79,
                border: '1px solid #D9D8D6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 14.99,
              }}
            >
              <div
                style={{
                  width: 11.39,
                  height: 11.39,
                  background: solutionColor,
                  borderRadius: 2.40,
                }}
              />
              <span
                style={{
                  color: colors.ui.textPrimary,
                  fontSize: 12.50,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.38,
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
            width: 396,
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
                color: colors.ui.textPrimary,
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
              gap: 4.17,
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                color: colors.ui.textPrimary,
                fontSize: 35.42,
                fontWeight: 350,
                lineHeight: '50.20px',
              }}
            >
              {headline || 'Lightweight header.'}
            </div>

            {showSubhead && subhead && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: colors.ui.textPrimary,
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
                color: colors.ui.textPrimary,
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
                color: '#060015',
                fontSize: 18.75,
                fontWeight: 500,
                lineHeight: '18.75px',
              }}
            >
              {cta}
            </span>
            <ArrowIcon color="#060015" />
          </div>
        )}
      </div>
    </div>
  )
}
