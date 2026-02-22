'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon } from '@/components/shared'

export type ColorStyle = '1' | '2' | '3' | '4'
export type Alignment = 'left' | 'center'
export type CtaStyle = 'link' | 'button'

export interface EmailDarkGradientProps {
  headline: string
  eyebrow?: string
  subheading?: string
  body: string
  ctaText: string
  colorStyle: ColorStyle
  alignment: Alignment
  ctaStyle: CtaStyle
  showEyebrow?: boolean
  showSubheading?: boolean
  showBody: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Using same background images as social-dark-gradient
const BACKGROUND_IMAGES: Record<ColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

export function EmailDarkGradient({
  headline,
  eyebrow,
  subheading,
  body,
  ctaText,
  colorStyle,
  alignment,
  ctaStyle,
  showEyebrow = false,
  showSubheading = false,
  showBody,
  showCta,
  colors,
  typography,
  scale = 1,
}: EmailDarkGradientProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#FFFFFF'
  const ctaColor = '#0080FF' // Cobalt blue for arrow

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
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
    padding: 32,
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
    maxWidth: alignment === 'center' ? 460 : 480,
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
          <CorityLogo fill="#FFFFFF" height={23} />
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
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
          )}

          {/* Headline */}
          <div
            style={{
              color: textColor,
              fontSize: 38,
              fontWeight: 350,
              lineHeight: 1.26,
            }}
          >
            {headline || 'Headline'}
          </div>

          {/* Subheading */}
          {showSubheading && subheading && (
            <div
              style={{
                color: textColor,
                fontSize: 24,
                fontWeight: 350,
                lineHeight: 1.4,
              }}
            >
              {subheading}
            </div>
          )}

          {/* Body */}
          {showBody && body && (
            <div
              style={{
                color: textColor,
                fontSize: 18,
                fontWeight: 350,
                lineHeight: 1.4,
              }}
            >
              {body}
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
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: textColor,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {ctaText}
                </span>
                <ArrowIcon color={ctaColor} width={16.5} height={13.12} strokeWidth={1.12} />
              </div>
            ) : (
              <div
                style={{
                  height: 45,
                  paddingLeft: 30,
                  paddingRight: 30,
                  paddingTop: 17,
                  paddingBottom: 17,
                  background: '#FFFFFF',
                  borderRadius: 22.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: '#060015',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.33,
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
