'use client'

import { X } from 'lucide-react'
import { Lightbox } from '@/components/lightbox/Lightbox'
import { DesignDogLogotype } from './DesignDogLogotype'
import { INFO_MODAL_COPY } from './config'

interface InfoModalDialogProps {
  onClose: () => void
}

/**
 * "Introducing 'My Work'" modal. Spec: Figma node `660:3063` — the exact
 * frame/size/position of the 1.5 launch modal it replaced.
 *
 * Frame is 840×540 with `bg-surface-secondary` + `border-line-subtle` +
 * elevation-md. A vertical hairline splits two 420-wide halves: the left
 * half carries the logotype + copy at the same coordinates as before; the
 * right half is a single full-height `bg-surface-primary` panel holding
 * one screenshot of the My Work rail (458×403, rounded, bleeding off the
 * panel's left edge per the spec) — no carousel this time.
 */
export function InfoModalDialog({ onClose }: InfoModalDialogProps) {
  return (
    <Lightbox isOpen onClose={onClose} ariaLabel="Introducing My Work" dismissOnBackdrop={false}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative flex overflow-hidden rounded-xl border border-line-subtle bg-surface-secondary"
        style={{
          width: 840,
          height: 540,
          boxShadow:
            '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
        }}
      >
        {/* Left half — static. Inherits bg-surface-secondary. */}
        <div className="relative flex-shrink-0" style={{ width: 420, height: 540 }}>
          {/* DESIGNDOG logotype — 87×22 at (29, 113). Inline SVG so its
              fill picks up `text-content-primary` (which auto-flips). */}
          <div className="absolute text-content-primary" style={{ left: 29, top: 113 }}>
            <DesignDogLogotype />
          </div>

          {/* "Introducing 'My Work'" — 36px Roboto Mono at (29, 277), w:305. */}
          <h2
            className="absolute font-mono text-content-primary"
            style={{
              left: 29,
              top: 277,
              width: 305,
              fontSize: 36,
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {INFO_MODAL_COPY.headingLine1}
            <br />
            {INFO_MODAL_COPY.headingLine2}
          </h2>

          {/* Body copy — 12px Roboto Mono at (29, 395), w:308. */}
          <p
            className="absolute font-mono text-content-primary"
            style={{ left: 29, top: 395, width: 308, fontSize: 12, lineHeight: 1.4 }}
          >
            {INFO_MODAL_COPY.body}
          </p>
        </div>

        {/* Right half — full-height image panel. Vertical hairline as
            left-border; screenshot inset per the Figma frame (centered
            vertically, shifted left so it bleeds off the panel edge). */}
        <div
          className="relative overflow-hidden border-l border-line-subtle bg-surface-primary"
          style={{ width: 420, height: 540 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 rounded p-1 text-content-secondary transition-colors hover:bg-black/5 hover:text-content-primary dark:hover:bg-white/10"
          >
            <X size={16} strokeWidth={1.5} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={INFO_MODAL_COPY.imageSrc}
            alt="The My Work rail: search, filters, and a draft card"
            className="absolute max-w-none rounded-[7px] object-cover"
            style={{ left: -68, top: 67, width: 458, height: 403 }}
            draggable={false}
          />
        </div>
      </div>
    </Lightbox>
  )
}
