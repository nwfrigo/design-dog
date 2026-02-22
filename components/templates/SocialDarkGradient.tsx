'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon } from '@/components/shared'

export type ColorStyle = '1' | '2' | '3' | '4'
export type HeadingSize = 'S' | 'M' | 'L'
export type Alignment = 'left' | 'center'
export type CtaStyle = 'link' | 'button'

export interface SocialDarkGradientProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  metadata: string
  ctaText: string
  colorStyle: ColorStyle
  headingSize: HeadingSize
  alignment: Alignment
  ctaStyle: CtaStyle
  logoColor: 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showMetadata: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGES: Record<ColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

const HEADING_SIZES: Record<HeadingSize, number> = {
  'S': 60,
  'M': 84,
  'L': 112,
}

const SUBHEAD_SIZES: Record<HeadingSize, number> = {
  'S': 30,
  'M': 33,
  'L': 36,
}

const BODY_SIZES: Record<HeadingSize, number> = {
  'S': 18,
  'M': 22,
  'L': 26,
}

export function SocialDarkGradient({
  eyebrow,
  headline,
  subhead,
  body,
  metadata,
  ctaText,
  colorStyle,
  headingSize,
  alignment,
  ctaStyle,
  logoColor,
  showEyebrow,
  showSubhead,
  showBody,
  showMetadata,
  showCta,
  colors,
  typography,
  scale = 1,
}: SocialDarkGradientProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : '#FFFFFF'
  const textColor = '#FFFFFF'
  const ctaColor = '#FFFFFF' // CTA is always white on dark backgrounds

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const contentStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: alignment === 'center' ? 'center' : 'flex-start',
  }

  const textBlockStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignment === 'center' ? 'center' : 'flex-start',
    gap: 24,
    textAlign: alignment === 'center' ? 'center' : 'left',
    maxWidth: alignment === 'center' ? 900 : undefined,
  }

  return (
    <div style={containerStyle}>
      {/* Background Image */}
      <img
        src={BACKGROUND_IMAGES[colorStyle]}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content Overlay */}
      <div style={contentStyle}>
        {/* Logo */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: alignment === 'center' ? 'center' : 'flex-start'
        }}>
          <CorityLogo fill={logoFill} height={37} />
        </div>

        {/* Text Content */}
        <div style={textBlockStyle}>
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div
              style={{
                color: textColor,
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.54,
              }}
            >
              {eyebrow}
            </div>
          )}

          {/* Headline + Subhead Group */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
            alignItems: alignment === 'center' ? 'center' : 'flex-start',
          }}>
            {/* Headline */}
            <div
              style={{
                color: textColor,
                fontSize: HEADING_SIZES[headingSize],
                fontWeight: 300,
                lineHeight: 1.1,
              }}
            >
              {headline || 'Headline'}
            </div>

            {/* Subhead */}
            {showSubhead && subhead && (
              <div
                style={{
                  color: textColor,
                  fontSize: SUBHEAD_SIZES[headingSize],
                  fontWeight: 300,
                  lineHeight: 1.3,
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
                color: textColor,
                fontSize: BODY_SIZES[headingSize],
                fontWeight: 300,
                lineHeight: 1.4,
              }}
            >
              {body}
            </div>
          )}

          {/* Metadata */}
          {showMetadata && metadata && (
            <div
              style={{
                color: textColor,
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.54,
              }}
            >
              {metadata}
            </div>
          )}
        </div>

        {/* CTA */}
        {showCta && ctaText && (
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: alignment === 'center' ? 'center' : 'flex-start'
          }}>
            {ctaStyle === 'link' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    color: ctaColor,
                    fontSize: 24,
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  {ctaText}
                </span>
                <ArrowIcon color={ctaColor} width={22} height={17.5} strokeWidth={1.5} />
              </div>
            ) : (
              <div
                style={{
                  padding: '16px 32px',
                  background: '#FFFFFF',
                  borderRadius: 100,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: '#000000',
                    fontSize: 18,
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  {ctaText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
