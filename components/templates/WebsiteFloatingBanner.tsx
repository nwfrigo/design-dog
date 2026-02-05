'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility
const CorityLogo = ({ fill = '#FFFFFF', height = 30 }: { fill?: string; height?: number }) => {
  const width = Math.round(height * 3.1)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill={fill}
    >
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z"/>
      <rect x="217.71" width="19.92" height="16.98"/>
      <path d="M379,35.66a4.65,4.65,0,0,1-1.88-.38,4.73,4.73,0,0,1-1.54-1,4.82,4.82,0,0,1-1-1.54,4.91,4.91,0,0,1-.38-1.89,4.82,4.82,0,0,1,.38-1.88,4.88,4.88,0,0,1,2.58-2.58A4.82,4.82,0,0,1,379,26a4.91,4.91,0,0,1,1.89.38,4.67,4.67,0,0,1,1.53,1,4.82,4.82,0,0,1,1.42,3.42,4.73,4.73,0,0,1-.38,1.89,4.85,4.85,0,0,1-2.57,2.57A4.73,4.73,0,0,1,379,35.66Zm0-8.76a3.92,3.92,0,1,0,3.92,3.92A3.93,3.93,0,0,0,379,26.9Z"/>
      <path d="M380.66,32.86a7.57,7.57,0,0,0-.6-1.4A1.87,1.87,0,0,0,379,28H377v5.62h1.12V31.76h.79a4.21,4.21,0,0,1,.73,1.47,3.73,3.73,0,0,0,.14.4H381A5.08,5.08,0,0,1,380.66,32.86ZM379,30.64h-1v-1.5h1a.75.75,0,0,1,0,1.5Z"/>
    </svg>
  )
}

// Arrow icon for CTA
const ArrowIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
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
  variant: FloatingBannerVariant
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
  variant,
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
          <div style={{
            textAlign: 'center',
            color: styles.textColor,
            fontSize: 32.73,
            fontWeight: 350,
            lineHeight: '32.73px',
            textShadow: textShadowStyle,
          }}>
            {headline || 'Headline'}
          </div>
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
          <ArrowIcon color={styles.ctaArrowColor} size={22} />
        </div>
      </div>
    </div>
  )
}
