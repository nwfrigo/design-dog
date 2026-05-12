'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityCustomerExchangeStackedLogo } from '@/components/shared/CorityCustomerExchangeStackedLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type CCEBannerColorStyle = '1' | '2' | '3' | '4'

/** Track 2 (fixed-composition) editable block ids. Logo is brand-locked
 *  (stacked lockup inside the left translucent panel). */
export type EmailCorityCustomerExchangeBannerBlockId =
  | 'logo'
  | 'headline'
  | 'body'
  | 'cta'

export interface EmailCorityCustomerExchangeBannerProps {
  headline: string
  body: string
  ctaText: string
  colorStyle: CCEBannerColorStyle
  showHeadline: boolean
  showBody: boolean
  showCta: boolean
  headlineFontSize?: number
  renderBlock?: (blockId: EmailCorityCustomerExchangeBannerBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailCorityCustomerExchangeBannerBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export const CCE_BANNER_BACKGROUND_IMAGES: Record<CCEBannerColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

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
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: EmailCorityCustomerExchangeBannerProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
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

  const headlineNode: ReactNode = wrapBlock('headline', (
    <div
      className="cce-rich-text"
      style={{
        color: '#FFFFFF',
        fontSize: headlineFontSize ?? HEADLINE_DEFAULT,
        fontWeight: 350,
        lineHeight: 1.26,
      }}
    >
      {wrapInline('headline', (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ))}
    </div>
  ))

  const bodyNode: ReactNode = wrapBlock('body', (
    <div
      className="cce-rich-text"
      style={{
        color: '#969899',
        fontSize: 18,
        fontWeight: 350,
        lineHeight: 1.4,
      }}
    >
      {wrapInline('body', (
        <div dangerouslySetInnerHTML={{ __html: body || 'Body copy goes here.' }} />
      ))}
    </div>
  ))

  const ctaNode: ReactNode = wrapBlock('cta', (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 500,
      lineHeight: 1,
    }}>
      {wrapInline('cta', <span>{ctaText || 'Call to Action'}</span>)}
      <ArrowIcon
        color="#FFFFFF"
        width={16.5}
        height={16.5 * 0.795}
        viewBox="0 0 16.5 13.12"
        pathD="M9.75 0.75L15.75 6.56M15.75 6.56L9.75 12.37M15.75 6.56H0.75"
        strokeWidth={1.12}
      />
    </div>
  ))

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      <img
        src={CCE_BANNER_BACKGROUND_IMAGES[colorStyle]}
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

      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: PANEL_WIDTH,
        height: 300,
        background: 'rgba(6, 0, 21, 0.70)',
      }}>
        {wrapBlock('logo', (
          <div style={{
            position: 'absolute',
            left: Math.round((PANEL_WIDTH - LOGO_WIDTH) / 2),
            top: Math.round((300 - LOGO_HEIGHT) / 2),
          }}>
            <CorityCustomerExchangeStackedLogo width={LOGO_WIDTH} />
          </div>
        ))}
      </div>

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
        {(showHeadline || showBody) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {showHeadline && headlineNode}
            {showBody && bodyNode}
          </div>
        )}

        {showCta && ctaNode}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
