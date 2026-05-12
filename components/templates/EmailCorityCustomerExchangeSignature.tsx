'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityCustomerExchangeLogo } from '@/components/shared/CorityCustomerExchangeLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

/** Track 2 (fixed-composition) editable block ids. Logo is brand-locked
 *  on the left. Event details + cta live inside the right translucent
 *  panel. */
export type EmailCorityCustomerExchangeSignatureBlockId =
  | 'logo'
  | 'eventDate'
  | 'eventLocation'
  | 'eventTime'
  | 'cta'

export interface EmailCorityCustomerExchangeSignatureProps {
  eventDate: string
  eventLocation: string
  eventTime: string
  ctaText: string
  showEventDate: boolean
  showEventLocation: boolean
  showEventTime: boolean
  showCta: boolean
  renderBlock?: (blockId: EmailCorityCustomerExchangeSignatureBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailCorityCustomerExchangeSignatureBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailCorityCustomerExchangeSignature({
  eventDate,
  eventLocation,
  eventTime,
  ctaText,
  showEventDate,
  showEventLocation,
  showEventTime,
  showCta,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: EmailCorityCustomerExchangeSignatureProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const PANEL_WIDTH = 157
  const LOGO_WIDTH = 220
  const LOGO_HEIGHT = Math.round(LOGO_WIDTH * (74 / 210))

  const containerStyle: CSSProperties = {
    width: 400,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
    background: '#060015',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const eventDateNode: ReactNode = wrapBlock('eventDate', wrapInline('eventDate', (
    <div style={{
      color: 'white',
      fontSize: 10,
      fontWeight: 350,
      lineHeight: '12px',
      textAlign: 'center',
    }}>
      {eventDate || 'Thursday, May 7th'}
    </div>
  )))

  const eventLocationNode: ReactNode = wrapBlock('eventLocation', wrapInline('eventLocation', (
    <div style={{
      color: 'white',
      fontSize: 7,
      fontWeight: 350,
      lineHeight: '8.4px',
    }}>
      {eventLocation || 'Brussels, Belgium'}
    </div>
  )))

  const eventTimeNode: ReactNode = wrapBlock('eventTime', wrapInline('eventTime', (
    <div style={{
      color: 'white',
      fontSize: 7,
      fontWeight: 350,
      lineHeight: '8.4px',
    }}>
      {eventTime || '10:00–16:00'}
    </div>
  )))

  const ctaNode: ReactNode = wrapBlock('cta', wrapInline('cta', (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    }}>
      <span style={{
        color: 'white',
        fontSize: 11,
        fontWeight: 350,
        lineHeight: '11px',
        textAlign: 'center',
      }}>
        {ctaText || 'Join Us'}
      </span>
      <ArrowIcon color="white" width={10} height={6} strokeWidth={1.2} />
    </div>
  )))

  return (
    <div style={containerStyle}>
      <img
        src="/assets/backgrounds/cority_customer_exchange_email_signature_background.png"
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
          left: 16,
          top: Math.round((100 - LOGO_HEIGHT) / 2),
        }}>
          <CorityCustomerExchangeLogo width={LOGO_WIDTH} />
        </div>
      ))}

      <div style={{
        position: 'absolute',
        left: 400 - PANEL_WIDTH,
        top: 0,
        width: PANEL_WIDTH,
        height: 100,
        background: 'rgba(6, 0, 21, 0.70)',
        backdropFilter: 'blur(6.4px)',
        WebkitBackdropFilter: 'blur(6.4px)',
      }}>
        <div style={{
          position: 'absolute',
          top: 24,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          {showEventDate && eventDateNode}
          {(showEventLocation || showEventTime) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 4,
            }}>
              {showEventLocation && eventLocationNode}
              {showEventTime && eventTimeNode}
            </div>
          )}
        </div>

        {showCta && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}>
            {ctaNode}
          </div>
        )}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
