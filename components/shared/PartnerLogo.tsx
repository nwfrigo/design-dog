import React from 'react'

/**
 * Partner-logo slot mark — shared by the executive-overview cover and the
 * EHS+ Accelerate templates. Behavior contract (established on exec):
 *
 * - Unset + non-interactive (export/preview): renders NOTHING, so an empty
 *   slot never prints.
 * - Unset + interactive (editor): a subtle dashed placeholder box sized off
 *   `height` so the slot is discoverable and selectable.
 * - Set: `height` is the only size driver — `width: auto` keeps the image's
 *   intrinsic aspect, so corner-handle resizing stays ratio-locked.
 */
export function PartnerLogo({
  url,
  height,
  interactive,
  maxWidth,
  borderColor = '#BDBEC0',
  labelColor = '#75767A',
}: {
  url?: string | null
  height: number
  interactive?: boolean
  /** Absolute width ceiling for very wide marks; defaults to ~13.4× height
   *  (exec's original 18px→241px proportion) so it scales with the handle. */
  maxWidth?: number
  borderColor?: string
  labelColor?: string
}) {
  if (!url) {
    if (!interactive) return null
    return (
      <div
        style={{
          width: height * (78 / 18),
          height,
          flexShrink: 0,
          border: `1px dashed ${borderColor}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.min(16, Math.max(6, Math.round(height / 3))),
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: labelColor,
          whiteSpace: 'nowrap',
        }}
      >
        Partner logo
      </div>
    )
  }
  return (
    <img
      src={url}
      alt=""
      data-export-image="true"
      style={{
        height,
        width: 'auto',
        flexShrink: 0,
        maxWidth: maxWidth ?? Math.round(height * (241 / 18)),
        objectFit: 'contain',
        display: 'block',
      }}
    />
  )
}
