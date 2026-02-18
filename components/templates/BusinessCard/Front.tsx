'use client'

import { businessCardPixels } from '@/config/print-config'

export interface BusinessCardFrontProps {
  name: string
  title: string
  email: string
  phone: string
}

/**
 * Business Card Front Template (Placeholder)
 *
 * Dimensions: 3.5" x 2" + 0.125" bleed = 3.75" x 2.25"
 * At 96 DPI (browser): 360 x 216 px
 * At 600 DPI (export): 2250 x 1350 px
 *
 * This is a placeholder component. The actual design will be
 * implemented once Figma specs are provided.
 */
export function BusinessCardFront({
  name,
  title,
  email,
  phone,
}: BusinessCardFrontProps) {
  return (
    <div
      style={{
        width: businessCardPixels.baseWidth,
        height: businessCardPixels.baseHeight,
        backgroundColor: '#060015',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Fakt Pro, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bleed indicator (will be trimmed) */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          bottom: 12,
          border: '1px dashed rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}
      />

      {/* Placeholder content */}
      <div>
        <div
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 12,
          }}
        >
          {title}
        </div>
      </div>

      <div>
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 10,
            marginBottom: 2,
          }}
        >
          {email}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 10,
          }}
        >
          {phone}
        </div>
      </div>

      {/* Placeholder logo area */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 60,
          height: 20,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        LOGO
      </div>

      {/* Design placeholder notice */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          right: 8,
          fontSize: 6,
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Placeholder - Awaiting Figma
      </div>
    </div>
  )
}
