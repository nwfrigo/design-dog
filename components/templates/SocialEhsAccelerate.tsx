'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface SocialEhsAccelerateProps {
  headline: string
  subhead: string
  ctaText: string
  showHeadline: boolean
  showSubhead: boolean
  showCta: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGE = '/assets/backgrounds/Template_Social_EHS-Accelerate-background.png'

const HEADLINE_DEFAULT = 84
const SUBHEAD_DEFAULT = 36

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

// Scoped styles for rich text on light background (black text)
const RICH_TEXT_STYLES = `
  .social-ehs-rich-text strong { font-weight: 500; }
  .social-ehs-rich-text em { font-style: italic; }
  .social-ehs-rich-text p { margin: 0; }
  .social-ehs-rich-text p + p { margin-top: 0.3em; }
`

export function SocialEhsAccelerate({
  headline,
  subhead,
  ctaText,
  showHeadline,
  showSubhead,
  showCta,
  headlineFontSize,
  subheadFontSize,
  typography,
  scale = 1,
}: SocialEhsAccelerateProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#060015'

  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    position: 'relative',
    overflow: 'hidden',
    background: '#FFFFFF',
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
    alignItems: 'flex-start',
  }

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Background image (gradients baked in) */}
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content overlay */}
      <div style={contentStyle}>
        {/* Logo lockup (cority + EHS+ ACCELERATE + TECH CONVERGENCE WORKSHOP, all baked in) */}
        <EhsAccelerateLogo width={400} />

        {/* Text block (headline + subhead) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 36,
        }}>
          {showHeadline && (
            <div
              className="social-ehs-rich-text"
              style={{
                color: textColor,
                fontSize: headlineFontSize ?? HEADLINE_DEFAULT,
                fontWeight: 350,
                lineHeight: 1.14,
              }}
              dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }}
            />
          )}
          {showSubhead && hasSubhead && (
            <div
              className="social-ehs-rich-text"
              style={{
                color: textColor,
                fontSize: subheadFontSize ?? SUBHEAD_DEFAULT,
                fontWeight: 350,
                lineHeight: 1.3,
              }}
              dangerouslySetInnerHTML={{ __html: subhead }}
            />
          )}
        </div>

        {/* CTA — link style with arrow (always link, always black) */}
        {showCta && ctaText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{
              color: textColor,
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1,
            }}>
              {ctaText}
            </span>
            <ArrowIcon color={textColor} width={22} height={22 * 0.8} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  )
}
