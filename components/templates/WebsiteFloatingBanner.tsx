'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type FloatingBannerVariant =
  | 'white'
  | 'orange'
  | 'dark'
  | 'blue-gradient-1'
  | 'blue-gradient-2'
  | 'dark-gradient-1'
  | 'dark-gradient-2'

export interface WebsiteFloatingBannerProps {
  eyebrow: string
  headline: string
  cta: string
  showEyebrow: boolean
  showHeadline?: boolean
  variant: FloatingBannerVariant
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Background images for gradient variants
const BACKGROUND_IMAGES: Partial<Record<FloatingBannerVariant, string>> = {
  'blue-gradient-1': '/assets/backgrounds/Template_Website_Floater_Desktop_Blue_gradient_background_1.png',
  'blue-gradient-2': '/assets/backgrounds/Template_Website_Floater_Desktop_Blue_gradient_background_2.png',
  'dark-gradient-1': '/assets/backgrounds/Template_Website_Floater_Desktop_Dark_gradient_background_1.png',
  'dark-gradient-2': '/assets/backgrounds/Template_Website_Floater_Desktop_Dark_gradient_background_2.png',
}

// Variant styling configurations
const VARIANT_STYLES: Record<FloatingBannerVariant, {
  background: string
  logoColor: string
  textColor: string
  ctaTextColor: string
  ctaArrowColor: string
  hasTextShadow: boolean
  isGradient: boolean
}> = {
  'white': {
    background: '#FFFFFF',
    logoColor: '#D65F00', // Orange
    textColor: '#060015', // Black/midnight
    ctaTextColor: '#060015',
    ctaArrowColor: '#D35F0B',
    hasTextShadow: false,
    isGradient: false,
  },
  'orange': {
    background: '#D35F0B',
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#FFFFFF',
    hasTextShadow: false,
    isGradient: false,
  },
  'dark': {
    background: '#060015',
    logoColor: '#D65F00', // Orange
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B',
    hasTextShadow: false,
    isGradient: false,
  },
  'blue-gradient-1': {
    background: '#0080FF', // Fallback
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#060015', // Black/midnight
    ctaArrowColor: '#060015',
    hasTextShadow: true,
    isGradient: true,
  },
  'blue-gradient-2': {
    background: '#0080FF', // Fallback
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#FFFFFF',
    hasTextShadow: true,
    isGradient: true,
  },
  'dark-gradient-1': {
    background: '#000000', // Fallback
    logoColor: '#D65F00', // Orange
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#0080FF', // Cobalt
    hasTextShadow: false,
    isGradient: true,
  },
  'dark-gradient-2': {
    background: '#000000', // Fallback
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B', // Orange
    hasTextShadow: false,
    isGradient: true,
  },
}

export function WebsiteFloatingBanner({
  eyebrow,
  headline,
  cta,
  showEyebrow,
  showHeadline = true,
  variant,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: WebsiteFloatingBannerProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const styles = VARIANT_STYLES[variant]
  const backgroundImage = BACKGROUND_IMAGES[variant]

  const containerStyle: CSSProperties = {
    width: 2256,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    background: styles.isGradient ? styles.background : styles.background,
  }

  const textShadowStyle = styles.hasTextShadow
    ? '0px 0px 7px rgba(0, 0, 0, 0.25)'
    : undefined

  return (
    <div style={containerStyle}>
      {/* Background image for gradient variants */}
      {styles.isGradient && backgroundImage && (
        <img
          src={backgroundImage}
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
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingLeft: 80,
        paddingRight: 80,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <CorityLogo fill={styles.logoColor} height={30} />

        {/* Center content: Eyebrow + Headline */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 43,
        }}>
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div style={{
              color: styles.textColor,
              fontSize: 16,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 1.76,
              textShadow: textShadowStyle,
            }}>
              {eyebrow}
            </div>
          )}

          {/* Headline */}
          {showHeadline && (
            <div style={{
              textAlign: 'center',
              color: styles.textColor,
              fontSize: headlineFontSize ?? 32.73,
              fontWeight: 350,
              lineHeight: `${headlineFontSize ?? 32.73}px`,
              textShadow: textShadowStyle,
            }}>
              {headline || 'Headline'}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            textAlign: 'center',
            color: styles.ctaTextColor,
            fontSize: 24,
            fontWeight: 500,
            lineHeight: '24px',
          }}>
            {cta || 'Learn More'}
          </div>
          <ArrowIcon color={styles.ctaArrowColor} width={22} height={22 * 0.795} />
        </div>
      </div>
    </div>
  )
}
