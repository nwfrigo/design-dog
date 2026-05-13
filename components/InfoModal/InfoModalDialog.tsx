'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Lightbox } from '@/components/lightbox/Lightbox'
import { DesignDogLogotype } from './DesignDogLogotype'
import { INFO_MODAL_FEATURES } from './config'

interface InfoModalDialogProps {
  onClose: () => void
}

/**
 * "What's new in 1.5" modal. Spec: Figma node `399:3711`.
 *
 * Frame is 840×540 with `bg-surface-secondary` + `border-line-subtle` +
 * elevation-md to match the image-editor modal. A vertical hairline
 * splits two 420-wide halves: the left half is static across pages; the
 * right half top (359 image frame, `bg-surface-primary`) swaps per
 * feature, the right-half bottom (180 caption + dots, inherits
 * `bg-surface-secondary`) updates the label + description per page.
 *
 * Navigation: chevrons on the image frame (left/right edges) and dots
 * in the caption — both update `pageIndex`. The X collapses to the
 * toast (the controller writes the localStorage flag).
 */
export function InfoModalDialog({ onClose }: InfoModalDialogProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const feature = INFO_MODAL_FEATURES[pageIndex]
  const isFirst = pageIndex === 0
  const isLast = pageIndex === INFO_MODAL_FEATURES.length - 1

  const goPrev = () => setPageIndex((i) => Math.max(0, i - 1))
  const goNext = () => setPageIndex((i) => Math.min(INFO_MODAL_FEATURES.length - 1, i + 1))

  return (
    <Lightbox isOpen onClose={onClose} ariaLabel="What's new in Design Dog 1.5" dismissOnBackdrop={false}>
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

          {/* "Welcome to Design Dog 1.5" — 36px Roboto Mono at (29, 277), w:305. */}
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
            Welcome to Design&nbsp;Dog 1.5
          </h2>

          {/* Body copy — 12px Roboto Mono at (29, 395), w:308. */}
          <p
            className="absolute font-mono text-content-primary"
            style={{ left: 29, top: 395, width: 308, fontSize: 12, lineHeight: 1.4 }}
          >
            We&rsquo;ve improved how you edit assets, so you can ship faster and have more fun
          </p>
        </div>

        {/* Right half — swappable. Vertical hairline as left-border. */}
        <div
          className="flex flex-col border-l border-line-subtle"
          style={{ width: 420, height: 540 }}
        >
          {/* Image frame (top 360). bg-surface-primary; horizontal hairline
              below as border-bottom. */}
          <div
            className="relative overflow-hidden border-b border-line-subtle bg-surface-primary"
            style={{ height: 360 }}
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
              src={feature.imageSrc}
              alt=""
              className="block h-full w-full object-cover"
              draggable={false}
            />

            {/* Chevrons on the image frame only — hidden at the ends. */}
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              aria-label="Previous feature"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded p-1.5 bg-surface-secondary/90 text-content-primary shadow-sm transition-opacity hover:bg-surface-secondary disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              aria-label="Next feature"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded p-1.5 bg-surface-secondary/90 text-content-primary shadow-sm transition-opacity hover:bg-surface-secondary disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Caption frame (bottom 180). Inherits bg-surface-secondary.
              Content positioned 41px from top with gap-8 between
              caption-block and dots, gap-4 inside caption-block. */}
          <div className="relative" style={{ height: 180 }}>
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ top: 41, gap: 32 }}
            >
              <div
                className="flex flex-col items-center text-center font-mono"
                style={{ gap: 16 }}
              >
                <p className="text-xs uppercase tracking-wider text-content-secondary">
                  {feature.label}
                </p>
                <p
                  className="text-xs text-content-primary"
                  style={{ width: 265, lineHeight: 1.4 }}
                >
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center" style={{ gap: 12 }} role="tablist" aria-label="Feature pages">
                {INFO_MODAL_FEATURES.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={i === pageIndex}
                    aria-label={`Go to ${f.label}`}
                    onClick={() => setPageIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === pageIndex
                        ? 'bg-content-primary'
                        : 'bg-line-subtle hover:bg-content-tertiary'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Lightbox>
  )
}
