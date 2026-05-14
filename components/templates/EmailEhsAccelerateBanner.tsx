'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

/** Track 2 (fixed-composition) editable block ids. Logo is brand-
 *  locked. Date/location/cta live inside the bottom info bar; each
 *  is wrapped as an independent <Editable>. */
export type EmailEhsAccelerateBannerBlockId =
  | 'logo'
  | 'headline'
  | 'body'
  | 'eventDate'
  | 'eventLocation'
  | 'cta'

export interface EmailEhsAccelerateBannerProps {
  headline?: string
  body?: string
  showBody?: boolean
  ctaText?: string
  headlineFontSize?: number
  eventDate: string
  eventLocation: string
  renderBlock?: (blockId: EmailEhsAccelerateBannerBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailEhsAccelerateBannerBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailEhsAccelerateBanner({
  headline,
  body,
  showBody = true,
  ctaText,
  headlineFontSize,
  eventDate,
  eventLocation,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: EmailEhsAccelerateBannerProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const headlineText = headline || 'In-Person. Exclusive.'
  const bodyText = body || 'Join senior EHS+ leaders to modernize how you stay ahead of operating risks.'
  const ctaLabel = ctaText || 'Join Us'
  const hlSize = headlineFontSize ?? 63.6
  const hlLineHeight = hlSize * 0.94
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const containerStyle: CSSProperties = {
    width: 600,
    height: 373,
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      <img
        src="/assets/backgrounds/ehs_accelerate_email_banner_background.png"
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

      {wrapBlock('logo', (
        <div style={{
          position: 'absolute',
          left: 30,
          top: 39,
          width: 218,
          overflow: 'hidden',
        }}>
          <EhsAccelerateLogo width={218} />
        </div>
      ))}

      {wrapBlock('headline', (
        <div style={{
          width: 300,
          position: 'absolute',
          left: 28,
          top: 149,
          color: 'black',
          fontSize: hlSize,
          fontWeight: 350,
          lineHeight: `${hlLineHeight}px`,
          wordWrap: 'break-word',
        }}>
          {wrapInline('headline', <div dangerouslySetInnerHTML={{ __html: headlineText }} />)}
        </div>
      ))}

      {showBody && wrapBlock('body', (
        <div style={{
          width: 204,
          position: 'absolute',
          left: 350,
          top: 194,
          color: 'black',
          fontSize: 17,
          fontWeight: 350,
          lineHeight: '21.76px',
          wordWrap: 'break-word',
        }}>
          {wrapInline('body', <div dangerouslySetInnerHTML={{ __html: bodyText }} />)}
        </div>
      ))}

      <div style={{
        width: 547,
        height: 43,
        position: 'absolute',
        left: 27,
        top: 309,
        background: 'white',
        boxShadow: '0px 0px 5px rgba(0,0,0,0.10)',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 8,
        boxSizing: 'border-box',
      }}>
        {wrapBlock('eventDate', (
          <span style={{
            color: 'black',
            fontSize: 14,
            fontWeight: 350,
            lineHeight: '14px',
            whiteSpace: 'nowrap',
          }}>
            {wrapInline('eventDate', <span>{eventDate || 'Thursday, 13th November'}</span>)}
          </span>
        ))}

        {wrapBlock('eventLocation', (
          <span style={{
            color: 'black',
            fontSize: 14,
            fontWeight: 350,
            lineHeight: '14px',
            whiteSpace: 'nowrap',
          }}>
            {wrapInline('eventLocation', <span>{eventLocation || 'London, UK'}</span>)}
          </span>
        ))}

        {wrapBlock('cta', (
          <div style={{
            paddingLeft: 17,
            paddingRight: 17,
            paddingTop: 10,
            paddingBottom: 10,
            background: '#F1F3F4',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            color: 'black',
            fontSize: 14,
            fontWeight: 350,
            lineHeight: '14px',
            whiteSpace: 'nowrap',
          }}>
            {wrapInline('cta', <span>{ctaLabel}</span>)}
            <ArrowIcon color="black" width={14} height={8.75} strokeWidth={1.2} />
          </div>
        ))}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
