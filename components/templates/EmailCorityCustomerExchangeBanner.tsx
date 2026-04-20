'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityCustomerExchangeStackedLogo } from '@/components/shared/CorityCustomerExchangeStackedLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type CCEBannerColorStyle = '1' | '2' | '3' | '4'

export interface EmailCorityCustomerExchangeBannerProps {
  headline: string
  body: string
  ctaText: string
  colorStyle: CCEBannerColorStyle
  showHeadline: boolean
  showBody: boolean
  showCta: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Reuses social-dark-gradient backgrounds (shared with EmailDarkGradient)
const BACKGROUND_IMAGES: Record<CCEBannerColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

// Strip HTML for empty checks
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

const RICH_TEXT_STYLES = `
  .cce-rich-text strong { font-weight: 500; }
  .cce-rich-text em { font-style: italic; }
  .cce-rich-text p { margin: 0; }
  .cce-rich-text p + p { margin-top: 0.3em; }
  .cce-rich-text ul { list-style-type: disc; padding-left: 16px; margin: 0; }
  .cce-rich-text ol { list-style-type: decimal; padding-left: 16px; margin: 0; }
  .cce-rich-text a { color: #D35F0B; text-decoration: none; }
`

const PANEL_WIDTH = 233
const LOGO_WIDTH = 125
const LOGO_HEIGHT = Math.round(LOGO_WIDTH * (244 / 125))
const HEADLINE_DEFAULT = 38

export function EmailCorityCustomerExchangeBanner({
  headline,
  body,
  ctaText,
  colorStyle,
  showHeadline,
  showBody,
  showCta,
  headlineFontSize,
  typography,
  scale = 1,
}: EmailCorityCustomerExchangeBannerProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    position: 'relative',
    overflow: 'hidden',
    background: '#060015',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Background image (gradients baked in) */}
      <img
        src={BACKGROUND_IMAGES[colorStyle]}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* Left dark translucent panel */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: PANEL_WIDTH,
        height: 300,
        background: 'rgba(6, 0, 21, 0.70)',
      }}>
        {/* Stacked logo lockup, centered */}
        <div style={{
          position: 'absolute',
          left: Math.round((PANEL_WIDTH - LOGO_WIDTH) / 2),
          top: Math.round((300 - LOGO_HEIGHT) / 2),
        }}>
          <CorityCustomerExchangeStackedLogo width={LOGO_WIDTH} />
        </div>
      </div>

      {/* Right content block — anchored top:32 / bottom:32, content stacks bottom-up
          so the CTA is always at the bottom and headline/body snap up from there. */}
      <div style={{
        position: 'absolute',
        left: 265,
        top: 32,
        bottom: 32,
        width: 349,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 36,
      }}>
        {/* Text block (headline + body) — only renders if at least one is visible */}
        {(showHeadline || (showBody && hasBody)) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {showHeadline && (
              <div
                className="cce-rich-text"
                style={{
                  color: '#FFFFFF',
                  fontSize: headlineFontSize ?? HEADLINE_DEFAULT,
                  fontWeight: 350,
                  lineHeight: 1.26,
                }}
                dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }}
              />
            )}
            {showBody && hasBody && (
              <div
                className="cce-rich-text"
                style={{
                  color: '#969899',
                  fontSize: 18,
                  fontWeight: 350,
                  lineHeight: 1.4,
                }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
          </div>
        )}

        {/* CTA — link style with arrow, always pinned at the bottom */}
        {showCta && ctaText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1,
            }}>
              {ctaText}
            </span>
            <ArrowIcon
              color="#FFFFFF"
              width={16.5}
              height={16.5 * 0.795}
              viewBox="0 0 16.5 13.12"
              pathD="M9.75 0.75L15.75 6.56M15.75 6.56L9.75 12.37M15.75 6.56H0.75"
              strokeWidth={1.12}
            />
          </div>
        )}
      </div>

    </div>
  )
}
