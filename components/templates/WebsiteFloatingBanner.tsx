'use client'

import { CSSProperties, type ReactNode } from 'react'
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

/** Track 2 (fixed-composition) editable block ids. Logo is a brand-
 *  locked anchor — colored per variant. */
export type WebsiteFloatingBannerBlockId =
  | 'logo'
  | 'eyebrow'
  | 'headline'
  | 'cta'

export interface WebsiteFloatingBannerProps {
  eyebrow: string
  headline: string
  cta: string
  showEyebrow: boolean
  showHeadline?: boolean
  showCta?: boolean
  variant: FloatingBannerVariant
  headlineFontSize?: number
  renderBlock?: (blockId: WebsiteFloatingBannerBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteFloatingBannerBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGES: Partial<Record<FloatingBannerVariant, string>> = {
  'blue-gradient-1': '/assets/backgrounds/Template_Website_Floater_Desktop_Blue_gradient_background_1.png',
  'blue-gradient-2': '/assets/backgrounds/Template_Website_Floater_Desktop_Blue_gradient_background_2.png',
  'dark-gradient-1': '/assets/backgrounds/Template_Website_Floater_Desktop_Dark_gradient_background_1.png',
  'dark-gradient-2': '/assets/backgrounds/Template_Website_Floater_Desktop_Dark_gradient_background_2.png',
}

export const FLOATING_BANNER_VARIANT_STYLES: Record<FloatingBannerVariant, {
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
    logoColor: '#D65F00',
    textColor: '#060015',
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
    logoColor: '#D65F00',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B',
    hasTextShadow: false,
    isGradient: false,
  },
  'blue-gradient-1': {
    background: '#0080FF',
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#060015',
    ctaArrowColor: '#060015',
    hasTextShadow: true,
    isGradient: true,
  },
  'blue-gradient-2': {
    background: '#0080FF',
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#FFFFFF',
    hasTextShadow: true,
    isGradient: true,
  },
  'dark-gradient-1': {
    background: '#000000',
    logoColor: '#D65F00',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#0080FF',
    hasTextShadow: false,
    isGradient: true,
  },
  'dark-gradient-2': {
    background: '#000000',
    logoColor: '#FFFFFF',
    textColor: '#FFFFFF',
    ctaTextColor: '#FFFFFF',
    ctaArrowColor: '#D35F0B',
    hasTextShadow: false,
    isGradient: true,
  },
}

/** Background-thumb URL for a variant — solid-color variants return a
 *  CSS color string; gradient variants return the gradient image URL. */
export function floatingBannerVariantSwatch(variant: FloatingBannerVariant): {
  backgroundColor?: string
  backgroundImage?: string
} {
  const img = BACKGROUND_IMAGES[variant]
  if (img) return { backgroundImage: `url(${img})` }
  return { backgroundColor: FLOATING_BANNER_VARIANT_STYLES[variant].background }
}

export function WebsiteFloatingBanner({
  eyebrow,
  headline,
  cta,
  showEyebrow,
  showHeadline = true,
  showCta = true,
  variant,
  headlineFontSize,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: WebsiteFloatingBannerProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const styles = FLOATING_BANNER_VARIANT_STYLES[variant]
  const backgroundImage = BACKGROUND_IMAGES[variant]

  const containerStyle: CSSProperties = {
    width: 2256,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    background: styles.background,
  }

  const textShadowStyle = styles.hasTextShadow
    ? '0px 0px 7px rgba(0, 0, 0, 0.25)'
    : undefined

  const eyebrowNode: ReactNode = wrapBlock('eyebrow', (
    <div style={{
      color: styles.textColor,
      fontSize: 16,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 1.76,
      textShadow: textShadowStyle,
    }}>
      {wrapInline('eyebrow', <div>{eyebrow || 'Eyebrow'}</div>)}
    </div>
  ))

  const headlineNode: ReactNode = wrapBlock('headline', (
    <div style={{
      textAlign: 'center',
      color: styles.textColor,
      fontSize: headlineFontSize ?? 32.73,
      fontWeight: 350,
      lineHeight: `${headlineFontSize ?? 32.73}px`,
      textShadow: textShadowStyle,
    }}>
      {wrapInline('headline', <div>{headline || 'Headline'}</div>)}
    </div>
  ))

  const ctaNode: ReactNode = wrapBlock('cta', (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      color: styles.ctaTextColor,
      fontSize: 24,
      fontWeight: 500,
      lineHeight: '24px',
    }}>
      {wrapInline('cta', <div>{cta || 'Learn More'}</div>)}
      <ArrowIcon color={styles.ctaArrowColor} width={22} height={22 * 0.795} />
    </div>
  ))

  return (
    <div style={containerStyle}>
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
        {wrapBlock('logo', (
          <CorityLogo fill={styles.logoColor} height={30} />
        ))}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 43,
        }}>
          {showEyebrow && eyebrowNode}
          {showHeadline && headlineNode}
        </div>

        {showCta && ctaNode}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
