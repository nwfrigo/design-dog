'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

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
  showHeadline?: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
  logoColor: 'black' | 'orange'
  headlineFontSize?: number
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
  showHeadline = true,
  showSubhead,
  showBody,
  showCta,
  grayscale = false,
  logoColor,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: WebsitePressReleaseProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

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
            <SolutionPill
              variant="website-press-release"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={colors.ui.textPrimary}
            />
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
            {showHeadline && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: colors.ui.textPrimary,
                  fontSize: headlineFontSize ?? 35.42,
                  fontWeight: 350,
                  lineHeight: `${(headlineFontSize ?? 35.42) * (50.20 / 35.42)}px`,
                }}
              >
                {headline || 'Lightweight header.'}
              </div>
            )}

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
            <ArrowIcon color="#060015" width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
          </div>
        )}
      </div>
    </div>
  )
}
