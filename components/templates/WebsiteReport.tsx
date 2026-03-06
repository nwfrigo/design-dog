'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

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
  showHeadline?: boolean
  showSubhead: boolean
  showCta: boolean
  grayscale?: boolean
  headlineFontSize?: number
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
  showHeadline = true,
  showSubhead,
  showCta,
  grayscale = false,
  headlineFontSize: headlineFontSizeProp,
  colors,
  typography,
  scale = 1,
}: WebsiteReportProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale && variant === 'image')

  // Text sizes change based on variant
  const defaultHeadlineSize = variant === 'none' ? 54 : 35
  const headlineSize = headlineFontSizeProp ?? defaultHeadlineSize
  const defaultLineHeight = variant === 'none' ? 58 : 48.19
  const headlineLineHeight = `${headlineSize * (defaultLineHeight / defaultHeadlineSize)}px`
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
                ? `translate(${imagePosition.x * (imageZoom - 1)}%, ${imagePosition.y * (imageZoom - 1)}%) scale(${imageZoom})`
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
          <CorityLogo fill="#FFFFFF" height={28} />

          {/* Solution Pill */}
          {solution !== 'none' && (
            <SolutionPill
              variant="website-dark"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
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
            {showHeadline && (
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
            )}

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
            <ArrowIcon width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
          </div>
        )}
      </div>
    </div>
  )
}
