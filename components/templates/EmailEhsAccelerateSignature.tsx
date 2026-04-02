'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface EmailEhsAccelerateSignatureProps {
  eventDate: string
  eventLocation: string
  workshopName: string
  ctaText: string
  showWorkshopName: boolean
  showEventDetails: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailEhsAccelerateSignature({
  eventDate,
  eventLocation,
  workshopName,
  ctaText,
  showWorkshopName,
  showEventDetails,
  showCta,
  typography,
  scale = 1,
}: EmailEhsAccelerateSignatureProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Outer container: no padding — padding on outer inflates height in Puppeteer (see LESSONS.md).
  const containerStyle: CSSProperties = {
    width: 400,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>

      {/* Full-bleed background image */}
      <img
        src="/assets/backgrounds/ehs_accelerate_email_signature_banner_background.png"
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

      {/* Logo — top left */}
      <div style={{
        position: 'absolute',
        left: 16,
        top: 20,
        overflow: 'hidden',
      }}>
        <EhsAccelerateLogo width={113} />
      </div>

      {/* Event date + location — top right */}
      {showEventDetails && (
        <div style={{
          width: 126,
          position: 'absolute',
          left: 252,
          top: 20,
          textAlign: 'right',
          color: 'black',
          fontSize: 11,
          fontWeight: 350,
          lineHeight: '13.20px',
          wordWrap: 'break-word',
        }}>
          {eventDate || 'Thursday,  13th November'}<br />
          {eventLocation || 'London, UK'}
        </div>
      )}

      {/* Workshop name — bottom left */}
      {showWorkshopName && (
        <div style={{
          width: 237,
          position: 'absolute',
          left: 15,
          top: 71,
          color: '#060015',
          fontSize: 15,
          fontWeight: 350,
          lineHeight: '15.60px',
          wordWrap: 'break-word',
        }}>
          {workshopName || 'Exclusive EHS+ Leader Workshop'}
        </div>
      )}

      {/* CTA — bottom right, right-aligned with event details block above */}
      {showCta && (
        <div style={{
          position: 'absolute',
          left: 252,
          width: 126,
          top: 75,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{
            color: '#060015',
            fontSize: 11,
            fontWeight: 350,
            lineHeight: '11px',
          }}>
            {ctaText || 'Join Us'}
          </span>
          <ArrowIcon color="#060015" width={10} height={6} strokeWidth={1.2} />
        </div>
      )}

    </div>
  )
}
