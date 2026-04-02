'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface EmailEhsAccelerateSignatureProps {
  eventDate: string
  eventLocation: string
  workshopName: string
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailEhsAccelerateSignature({
  eventDate,
  eventLocation,
  workshopName,
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

      {/* Orange radial gradient orb — bottom-left */}
      <div style={{
        width: 297,
        height: 297,
        left: -104,
        top: -44,
        position: 'absolute',
        opacity: 0.50,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #F78534 14%, rgba(252,196,119,0.87) 35%, rgba(252,196,119,0.64) 60%, rgba(252,196,119,0.36) 76%, rgba(252,196,119,0) 100%)',
        borderRadius: 9999,
        filter: 'blur(12.37px)',
        pointerEvents: 'none',
      }} />

      {/* Blue radial gradient orb — top-right */}
      <div style={{
        width: 320,
        height: 320,
        left: 229,
        top: -204,
        position: 'absolute',
        opacity: 0.50,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0022FF 0%, rgba(0,34,255,0.30) 58%, rgba(0,34,255,0.10) 80%, rgba(0,34,255,0) 100%)',
        borderRadius: 9999,
        filter: 'blur(0.91px)',
        pointerEvents: 'none',
      }} />

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

      {/* Workshop name — bottom left (editable) */}
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

      {/* Join Us CTA — bottom right (fixed) */}
      <div style={{
        position: 'absolute',
        left: 328,
        top: 75,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{
          color: '#060015',
          fontSize: 11,
          fontWeight: 350,
          lineHeight: '11px',
        }}>
          Join Us
        </span>
        <ArrowIcon color="#060015" width={10} height={6} strokeWidth={1.2} />
      </div>

    </div>
  )
}
