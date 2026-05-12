'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

/** Track 2 (fixed-composition) editable block ids. eventDate and
 *  eventLocation are independent <Editable> slots so each text field
 *  can be selected and edited on its own, even though they share the
 *  `showEventDetails` visibility flag in the bench. */
export type EmailEhsAccelerateSignatureBlockId =
  | 'logo'
  | 'eventDate'
  | 'eventLocation'
  | 'workshopName'
  | 'cta'

export interface EmailEhsAccelerateSignatureProps {
  eventDate: string
  eventLocation: string
  workshopName: string
  ctaText: string
  showWorkshopName: boolean
  showEventDetails: boolean
  showCta: boolean
  renderBlock?: (blockId: EmailEhsAccelerateSignatureBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: EmailEhsAccelerateSignatureBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
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
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: EmailEhsAccelerateSignatureProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

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

  const eventDetailsLineStyle: CSSProperties = {
    textAlign: 'right',
    color: 'black',
    fontSize: 11,
    fontWeight: 350,
    lineHeight: '13.20px',
    wordWrap: 'break-word',
  }

  const eventDateNode: ReactNode = wrapBlock('eventDate', wrapInline('eventDate', (
    <div style={eventDetailsLineStyle}>
      {eventDate || 'Thursday,  13th November'}
    </div>
  )))

  const eventLocationNode: ReactNode = wrapBlock('eventLocation', wrapInline('eventLocation', (
    <div style={eventDetailsLineStyle}>
      {eventLocation || 'London, UK'}
    </div>
  )))

  const workshopNode: ReactNode = wrapBlock('workshopName', wrapInline('workshopName', (
    <div style={{
      width: 237,
      color: '#060015',
      fontSize: 15,
      fontWeight: 350,
      lineHeight: '15.60px',
      wordWrap: 'break-word',
    }}>
      {workshopName || 'Exclusive EHS+ Leader Workshop'}
    </div>
  )))

  const ctaNode: ReactNode = wrapBlock('cta', wrapInline('cta', (
    <div style={{
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
  )))

  return (
    <div style={containerStyle}>
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

      {wrapBlock('logo', (
        <div style={{
          position: 'absolute',
          left: 16,
          top: 20,
          overflow: 'hidden',
        }}>
          <EhsAccelerateLogo width={113} />
        </div>
      ))}

      {showEventDetails && (
        <div style={{
          width: 126,
          position: 'absolute',
          left: 252,
          top: 20,
        }}>
          {eventDateNode}
          {eventLocationNode}
        </div>
      )}

      {showWorkshopName && (
        <div style={{
          position: 'absolute',
          left: 15,
          top: 71,
        }}>
          {workshopNode}
        </div>
      )}

      {showCta && (
        <div style={{
          position: 'absolute',
          left: 252,
          width: 126,
          top: 75,
        }}>
          {ctaNode}
        </div>
      )}

      {renderOverlay?.()}
    </div>
  )
}
