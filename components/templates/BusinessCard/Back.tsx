'use client'

import { businessCardPixels } from '@/config/print-config'

/**
 * Business Card Back Template (Placeholder)
 *
 * The back is static - same for all cards.
 * Will display a brand image/artwork once provided.
 *
 * Dimensions: 3.5" x 2" + 0.125" bleed = 3.75" x 2.25"
 * At 96 DPI (browser): 360 x 216 px
 * At 600 DPI (export): 2250 x 1350 px
 */
export function BusinessCardBack() {
  return (
    <div
      style={{
        width: businessCardPixels.baseWidth,
        height: businessCardPixels.baseHeight,
        backgroundColor: '#060015',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

      {/* Placeholder for static brand artwork */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 80,
            height: 28,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          LOGO
        </div>
        <div
          style={{
            fontSize: 8,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Static Back Design
        </div>
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
