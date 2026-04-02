'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface EmailEhsAccelerateBannerProps {
  eventDate: string
  eventLocation: string
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailEhsAccelerateBanner({
  eventDate,
  eventLocation,
  typography,
  scale = 1,
}: EmailEhsAccelerateBannerProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Outer container: no padding — padding on outer inflates height in Puppeteer (see LESSONS.md).
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

      {/* Full-bleed background image */}
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

      {/* Logo — top left */}
      <div style={{
        position: 'absolute',
        left: 30,
        top: 39,
        width: 218,
        overflow: 'hidden',
      }}>
        <EhsAccelerateLogo width={218} />
      </div>

      {/* Main headline — "In-Person. Exclusive." */}
      <div style={{
        width: 349,
        position: 'absolute',
        left: 28,
        top: 149,
        color: 'black',
        fontSize: 63.6,
        fontWeight: 350,
        lineHeight: '59.79px',
        wordWrap: 'break-word',
      }}>
        In-Person. Exclusive.
      </div>

      {/* Body copy — right side */}
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
        Join senior EHS+ leaders to modernize how you stay ahead of operating risks.
      </div>

      {/* Bottom info bar */}
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
        {/* Date (editable) */}
        <span style={{
          color: 'black',
          fontSize: 14,
          fontWeight: 350,
          lineHeight: '14px',
          whiteSpace: 'nowrap',
        }}>
          {eventDate || 'Thursday, 13th November'}
        </span>

        {/* Location (editable) */}
        <span style={{
          color: 'black',
          fontSize: 14,
          fontWeight: 350,
          lineHeight: '14px',
          whiteSpace: 'nowrap',
        }}>
          {eventLocation || 'London, UK'}
        </span>

        {/* Join Us CTA — fixed */}
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
        }}>
          <span style={{
            color: 'black',
            fontSize: 14,
            fontWeight: 350,
            lineHeight: '14px',
          }}>
            Join Us
          </span>
          <ArrowIcon color="black" width={14} height={8.75} strokeWidth={1.2} />
        </div>
      </div>

    </div>
  )
}
