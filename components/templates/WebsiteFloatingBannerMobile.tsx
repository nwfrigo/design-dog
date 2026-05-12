'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type FloatingBannerMobileVariant =
  | 'light'
  | 'orange'
  | 'dark'
  | 'blue-gradient-1'
  | 'blue-gradient-2'
  | 'dark-gradient-1'
  | 'dark-gradient-2'

export type FloatingBannerMobileArrowType = 'text' | 'arrow'

/** Track 2 (fixed-composition) editable block ids. */
export type WebsiteFloatingBannerMobileBlockId =
  | 'eyebrow'
  | 'headline'
  | 'cta'

export interface WebsiteFloatingBannerMobileProps {
  eyebrow: string
  headline: string
  cta: string
  showEyebrow: boolean
  showHeadline?: boolean
  showCta?: boolean
  variant: FloatingBannerMobileVariant
  arrowType: FloatingBannerMobileArrowType
  headlineFontSize?: number
  renderBlock?: (blockId: WebsiteFloatingBannerMobileBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteFloatingBannerMobileBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGES: Partial<Record<FloatingBannerMobileVariant, string>> = {
  'blue-gradient-1': '/assets/backgrounds/Template_Website_Floater_Mobile_Blue_Gradient_1.png',
  'blue-gradient-2': '/assets/backgrounds/Template_Website_Floater_Mobile_Blue_Gradient_2.png',
  'dark-gradient-1': '/assets/backgrounds/Template_Website_Floater_Mobile_Dark_Gradient_1.png',
  'dark-gradient-2': '/assets/backgrounds/Template_Website_Floater_Mobile_Dark_Gradient_2.png',
}

export const FLOATING_BANNER_MOBILE_VARIANT_STYLES: Record<FloatingBannerMobileVariant, {
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

/** Background-thumb URL for a variant — solid-color variants return a
 *  CSS color string; gradient variants return the gradient image URL.
 *  Adapter consumes this to render swatches in the stage bar. */
export function floatingBannerMobileVariantSwatch(variant: FloatingBannerMobileVariant): {
  backgroundColor?: string
  backgroundImage?: string
} {
  const img = BACKGROUND_IMAGES[variant]
  if (img) return { backgroundImage: `url(${img})` }
  return { backgroundColor: FLOATING_BANNER_MOBILE_VARIANT_STYLES[variant].background }
}

export function WebsiteFloatingBannerMobile({
  eyebrow,
  headline,
  cta,
  showEyebrow,
  showHeadline = true,
  showCta = true,
  variant,
  arrowType,
  headlineFontSize,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: WebsiteFloatingBannerMobileProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const styles = FLOATING_BANNER_MOBILE_VARIANT_STYLES[variant]
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

  const eyebrowNode: ReactNode = wrapBlock('eyebrow', (
    <div style={{
      color: styles.textColor,
      fontSize: 14,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 1.32,
      whiteSpace: 'nowrap',
    }}>
      {wrapInline('eyebrow', <div>{eyebrow || 'Eyebrow'}</div>)}
    </div>
  ))

  const headlineNode: ReactNode = wrapBlock('headline', (
    <div style={{
      flex: 1,
      color: styles.textColor,
      fontSize: headlineFontSize ?? 14,
      fontWeight: 350,
      lineHeight: `${(headlineFontSize ?? 14) * (15.40 / 14)}px`,
    }}>
      {wrapInline('headline', <div>{headline || 'Headline'}</div>)}
    </div>
  ))

  const ctaNode: ReactNode = wrapBlock('cta', (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 10.67,
      flexShrink: 0,
      textAlign: 'center',
      color: styles.ctaTextColor,
      fontSize: 16,
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
    }}>
      {arrowType === 'text' && wrapInline('cta', <div>{cta || 'Learn More'}</div>)}
      <ArrowIcon color={styles.ctaArrowColor} width={14.67} height={14.67 * 0.795} />
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
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 25,
        paddingBottom: 25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 30,
          marginRight: 20,
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
