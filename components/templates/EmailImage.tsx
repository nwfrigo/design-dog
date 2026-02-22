'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon, useGrayscaleImage } from '@/components/shared'

export type LayoutVariant = 'even' | 'more-image' | 'more-text'

export interface EmailImageProps {
  headline: string
  body: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  layout: LayoutVariant
  solution: string
  logoColor: 'black' | 'orange'
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
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
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  layout,
  solution,
  logoColor,
  showBody,
  showCta,
  showSolutionSet,
  grayscale = false,
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
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

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
          gap: 17,
        }}>
          {/* Headline */}
          <div style={{
            alignSelf: 'stretch',
            color: textColor,
            fontSize: 38.15,
            fontWeight: 300,
            lineHeight: '48.19px',
          }}>
            {headline || 'Headline'}
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
            <ArrowIcon color="#060015" width={16.5} height={13.12} strokeWidth={1.12} />
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
    </div>
  )
}
