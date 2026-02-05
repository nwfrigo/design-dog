'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Arrow icon for CTA
const ArrowIcon = ({ color = '#D35F0B', size = 14.67 }: { color?: string; size?: number }) => (
  <svg width={size} height={size * 0.795} viewBox="0 0 22 17.5" fill="none">
    <path
      d="M13 1L21 8.75M21 8.75L13 16.5M21 8.75H1"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export type FloatingBannerMobileVariant =
  | 'light'
  | 'orange'
  | 'dark'
  | 'blue-gradient-1'
  | 'blue-gradient-2'
  | 'dark-gradient-1'
  | 'dark-gradient-2'

export type FloatingBannerMobileArrowType = 'text' | 'arrow'

export interface WebsiteFloatingBannerMobileProps {
  eyebrow: string
  headline: string
  cta: string
  showEyebrow: boolean
  variant: FloatingBannerMobileVariant
  arrowType: FloatingBannerMobileArrowType
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Background images for gradient variants
const BACKGROUND_IMAGES: Partial<Record<FloatingBannerMobileVariant, string>> = {
  'blue-gradient-1': '/assets/backgrounds/Template_Website_Floater_Mobile_Blue_Gradient_1.png',
  'blue-gradient-2': '/assets/backgrounds/Template_Website_Floater_Mobile_Blue_Gradient_2.png',
  'dark-gradient-1': '/assets/backgrounds/Template_Website_Floater_Mobile_Dark_Gradient_1.png',
  'dark-gradient-2': '/assets/backgrounds/Template_Website_Floater_Mobile_Dark_Gradient_2.png',
}

// Variant styling configurations
const VARIANT_STYLES: Record<FloatingBannerMobileVariant, {
  background: string
  textColor: string
  ctaTextColor: string
  ctaArrowColor: string
  isGradient: boolean
}> = {
  'light': {
    background: '#FFFFFF',
    textColor: '#000000',
    ctaTextColor: '#060015',
    ctaArrowColor: '#D35F0B',
    isGradient: false,
  },
  'orange': {
    background: '#D35F0B',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#FFFFFF',
    isGradient: false,
  },
  'dark': {
    background: '#060015',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B',
    isGradient: false,
  },
  'blue-gradient-1': {
    background: '#0080FF',
    textColor: '#FFFFFF',
    ctaTextColor: '#060015',
    ctaArrowColor: '#060015',
    isGradient: true,
  },
  'blue-gradient-2': {
    background: '#0080FF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#FFFFFF',
    isGradient: true,
  },
  'dark-gradient-1': {
    background: '#000000',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#0080FF',
    isGradient: true,
  },
  'dark-gradient-2': {
    background: '#000000',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B',
    isGradient: true,
  },
}

export function WebsiteFloatingBannerMobile({
  eyebrow,
  headline,
  cta,
  showEyebrow,
  variant,
  arrowType,
  colors,
  typography,
  scale = 1,
}: WebsiteFloatingBannerMobileProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const styles = VARIANT_STYLES[variant]
  const backgroundImage = BACKGROUND_IMAGES[variant]

  const containerStyle: CSSProperties = {
    width: 580,
    height: 80,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    background: styles.background,
  }

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
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 25,
        paddingBottom: 25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left content: Eyebrow + Headline */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 30,
          marginRight: 20,
        }}>
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div style={{
              color: styles.textColor,
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 1.32,
              whiteSpace: 'nowrap',
            }}>
              {eyebrow}
            </div>
          )}

          {/* Headline */}
          <div style={{
            flex: 1,
            color: styles.textColor,
            fontSize: 14,
            fontWeight: 350,
            lineHeight: '15.40px',
          }}>
            {headline || 'Headline'}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10.67,
          flexShrink: 0,
        }}>
          {arrowType === 'text' && (
            <div style={{
              textAlign: 'center',
              color: styles.ctaTextColor,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
            }}>
              {cta || 'Learn More'}
            </div>
          )}
          <ArrowIcon color={styles.ctaArrowColor} size={14.67} />
        </div>
      </div>
    </div>
  )
}
