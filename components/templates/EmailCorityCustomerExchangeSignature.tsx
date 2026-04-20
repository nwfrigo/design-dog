'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityCustomerExchangeLogo } from '@/components/shared/CorityCustomerExchangeLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface EmailCorityCustomerExchangeSignatureProps {
  eventDate: string
  eventLocation: string
  eventTime: string
  ctaText: string
  showEventDate: boolean
  showEventLocation: boolean
  showEventTime: boolean
  showCta: boolean
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
  typography,
  scale = 1,
}: EmailCorityCustomerExchangeSignatureProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Panel positioned on the right; logo lockup lives in the remaining left area.
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

  return (
    <div style={containerStyle}>

      {/* Full-bleed background image (gradients are baked in) */}
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

      {/* Logo lockup — left side, vertically centered */}
      <div style={{
        position: 'absolute',
        left: 16,
        top: Math.round((100 - LOGO_HEIGHT) / 2),
      }}>
        <CorityCustomerExchangeLogo width={LOGO_WIDTH} />
      </div>

      {/* Dark translucent right panel */}
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

        {/* Event details block — date on top, location + time below */}
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
          {showEventDate && (
            <div style={{
              color: 'white',
              fontSize: 10,
              fontWeight: 350,
              lineHeight: '12px',
              textAlign: 'center',
            }}>
              {eventDate || 'Thursday, May 7th'}
            </div>
          )}
          {(showEventLocation || showEventTime) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 4,
            }}>
              {showEventLocation && (
                <div style={{
                  color: 'white',
                  fontSize: 7,
                  fontWeight: 350,
                  lineHeight: '8.4px',
                }}>
                  {eventLocation || 'Brussels, Belgium'}
                </div>
              )}
              {showEventTime && (
                <div style={{
                  color: 'white',
                  fontSize: 7,
                  fontWeight: 350,
                  lineHeight: '8.4px',
                }}>
                  {eventTime || '10:00–16:00'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA — bottom of panel, centered */}
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
        )}

      </div>

    </div>
  )
}
