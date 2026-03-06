'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

// Simple zoom/pan image component
function ZoomPanImage({
  src,
  containerWidth,
  containerHeight,
  position,
  zoom,
  grayscale = false,
  grayscaleImageUrl,
}: {
  src: string
  containerWidth: number
  containerHeight: number
  position: { x: number; y: number }
  zoom: number
  grayscale?: boolean
  grayscaleImageUrl?: string | null
}) {
  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        borderRadius: 10,
        border: '1px solid #D9D8D6',
        overflow: 'hidden',
      }}
    >
      <img
        src={grayscale && grayscaleImageUrl ? grayscaleImageUrl : src}
        alt=""
        data-export-image="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // object-position: 0% = left/top edge, 50% = center, 100% = right/bottom edge
          objectPosition: `${50 - position.x}% ${50 - position.y}%`,
          // When zoomed: scale + translate to maintain the same visible content
          // After scale from center, content shifts away from center
          // Translate in SAME direction as position to compensate
          transform: zoom !== 1
            ? `translate(${position.x * (zoom - 1)}%, ${position.y * (zoom - 1)}%) scale(${zoom})`
            : undefined,
          transformOrigin: 'center',
          filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
        }}
      />
    </div>
  )
}

export type EbookVariant = 'image' | 'none'

export interface WebsiteThumbnailProps {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  solution: string
  variant: EbookVariant
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showCta: boolean
  logoColor: 'black' | 'orange'
  grayscale?: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function WebsiteThumbnail({
  eyebrow,
  headline,
  subhead,
  cta,
  solution,
  variant = 'image',
  imageUrl = '/assets/images/safer_is_stronger_sample_page.png',
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showCta,
  logoColor,
  grayscale = false,
  headlineFontSize: headlineFontSizeProp,
  colors,
  typography,
  scale = 1,
}: WebsiteThumbnailProps) {
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Text sizes change based on variant
  const defaultHeadlineSize = variant === 'none' ? 54 : 35
  const headlineSize = headlineFontSizeProp ?? defaultHeadlineSize
  const headlineLineHeight = `${headlineSize * (48.19 / defaultHeadlineSize)}px`
  const headlineSubheadGap = variant === 'none' ? 8 : 4

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 32,
    position: 'relative',
    background: '#F9F9F9',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 20,
  }

  return (
    <div style={containerStyle}>
      {/* Left content area */}
      <div
        style={{
          width: variant === 'image' ? 396 : undefined,
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
            gap: 47.71,
          }}
        >
          <CorityLogo fill={logoFill} height={28} />

          {/* Solution Pill - white fill with subtle border */}
          {solution !== 'none' && (
            <SolutionPill
              variant="website-light"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={colors.ui.textPrimary}
            />
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
                color: colors.ui.textPrimary,
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
            {showHeadline && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: colors.ui.textPrimary,
                  fontSize: headlineSize,
                  fontWeight: 350,
                  lineHeight: headlineLineHeight,
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

      {/* Image - only shown for image variant */}
      {variant === 'image' && (
        <ZoomPanImage
          src={imageUrl}
          containerWidth={320}
          containerHeight={386}
          position={imagePosition}
          zoom={imageZoom}
          grayscale={grayscale}
          grayscaleImageUrl={grayscaleImageUrl}
        />
      )}
    </div>
  )
}
