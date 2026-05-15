'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImageUp, WandSparkles, RotateCcw } from 'lucide-react'
import { Lightbox } from '../lightbox/Lightbox'
import { ImageEditorPreview } from './ImageEditorPreview'
import { ImageEditButton } from './ImageEditButton'
import { ImageEditorSlider } from './ImageEditorSlider'
import { SliderRow } from './SliderRow'
import { PresetButtonGroup } from './PresetButtonGroup'
import { ImageLibraryView } from './ImageLibraryView'
import {
  NEUTRAL_SLOT_SETTINGS,
  type ImageFilters,
  type ImageSlotSettings,
} from '@/lib/image-filters'

/**
 * ImageEditorModal — the new image editor lightbox (Figma 374:309).
 *
 * Single-modal, view-switching surface. Inside one 840×538 frame:
 *   - 'editor' view (default): zoom/pan preview + filter sliders + presets
 *   - 'library' view: image library grid + upload + (future) AI generate
 *
 * Click "Change Image" in the editor view → swaps to library view inline,
 * no second modal. User picks an image → URL bubbles via `onImageChange`,
 * view swaps back to editor with new src. Back button in library view
 * returns to the editor without changing the image. Closing the modal
 * always returns to the editor view first on next open.
 *
 * Commit semantics: dismissing the modal (backdrop click, Esc, anywhere
 * that calls `onClose`) AUTO-COMMITS the current zoom/pan via `onSave`
 * before closing. There is no explicit Apply or Cancel button — pre-empt
 * the legacy "click Cancel to discard" mental model with "close = save."
 * Reset wipes local state to neutral but does NOT close the modal.
 *
 * Frame is fixed at 840×538 so swapping views doesn't reflow the modal.
 *
 * Zoom/Pan/Drag mirrors the legacy ImageCropModal contract: position units
 * in −50..+50 per axis, zoom 1..3. Filters persist via `ImageFilters`
 * (exposure / contrast / saturation, −1..+1 per axis); presets just write
 * those same numbers into `settings.filters`. No preset identity rides
 * through the store or export — editor preview and Puppeteer render both
 * read the three numbers via `filtersToCss()`.
 */

export interface ImageEditorModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  frameWidth: number
  frameHeight: number
  /** Bundled image-slot settings: position, zoom, filters. Universal
   *  contract — every adapter maps its bespoke store fields onto this
   *  shape at the modal boundary so the modal stays template-agnostic. */
  initialSettings: ImageSlotSettings
  /** Fired on dismiss (Esc / backdrop) with the current settings. The
   *  modal commits-on-dismiss; there is no explicit Apply. */
  onSettingsChange: (settings: ImageSlotSettings) => void
  /** Called when the user picks a new image from the library view (or
   *  uploads one). Adapter updates its image-URL store field and resets
   *  per-slot settings to neutral. The modal stays open and swaps back
   *  to the editor view. */
  onImageChange: (url: string) => void
}

const ZOOM = { min: 1, max: 3, step: 0.01 } as const

// Filter slider ranges: -1..+1 per axis. Neutral = 0. Mapping to CSS
// brightness/contrast/saturate happens when the data model lands.
const FILTER = { min: -1, max: 1, step: 0.01 } as const

// Adjustment presets. Clicking one writes its `values` directly into
// `settings.filters` — same shape the sliders write, no preset identity
// rides through the store or export. Two surfaces (editor preview +
// Puppeteer export) read the same `exposure / contrast / saturation`
// numbers via `filtersToCss()`, so a preset click is byte-identical to
// dragging the three sliders to those numbers by hand.
type PresetEntry = {
  id: string
  label: string
  values: ImageFilters
}

const PRESETS: PresetEntry[] = [
  { id: 'hi-contrast-light', label: 'Hi-contrast Light', values: { exposure: 0.15, contrast: 0.25, saturation: 0.10 } },
  { id: 'bw-pop',            label: 'B&W Pop',            values: { exposure: 0.10, contrast: 0.40, saturation: -1   } },
  { id: 'bw-subtle',         label: 'B&W Subtle',         values: { exposure: 0.05, contrast: 0.10, saturation: -1   } },
  { id: 'hi-contrast-dark',  label: 'Hi-contrast Dark',   values: { exposure: -0.15, contrast: 0.30, saturation: 0.10 } },
]

type ModalView = 'editor' | 'library'

export function ImageEditorModal({
  isOpen,
  onClose,
  imageSrc,
  frameWidth,
  frameHeight,
  initialSettings,
  onSettingsChange,
  onImageChange,
}: ImageEditorModalProps) {
  // View state. Always reset to 'editor' on (re)open so the user lands on
  // the primary surface, never stuck in a half-finished library state.
  const [view, setView] = useState<ModalView>('editor')

  // Bundled live state — drives the preview. Single useState so the
  // commit-on-dismiss handler sees coherent settings (no half-updated
  // pairs from React batching across multiple useStates).
  const [settings, setSettings] = useState<ImageSlotSettings>(initialSettings)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const setPosition = (next: { x: number; y: number }) =>
    setSettings((s) => ({ ...s, position: next }))

  const setFilter = (key: keyof ImageFilters, value: number) => {
    setSettings((s) => ({ ...s, filters: { ...s.filters, [key]: value } }))
    setActivePreset(null)
  }

  // Reset state on (re)open so cancelling out of a previous session doesn't
  // leak into the next one.
  useEffect(() => {
    if (!isOpen) return
    setView('editor')
    setSettings(initialSettings)
    setActivePreset(null)
  }, [isOpen, initialSettings])

  // When zoom changes, re-clamp position. Overflow at the new zoom may be
  // smaller, in which case prior pan extents would be out of bounds.
  // Conservative clamp: snap to [-50,50] uniformly; ImageEditorPreview's
  // own bounds-check on the next pointer event will further refine.
  const handleZoomChange = (next: number) => {
    setSettings((s) => ({
      ...s,
      zoom: next,
      position: {
        x: Math.max(-50, Math.min(50, s.position.x)),
        y: Math.max(-50, Math.min(50, s.position.y)),
      },
    }))
  }

  // Commit-on-dismiss. Any path that closes the modal (Esc, backdrop click)
  // flows through here so settings persist without an explicit Apply step.
  // No-op cost if the user didn't touch anything — the same bundled
  // settings are rewritten.
  const handleDismiss = useCallback(() => {
    onSettingsChange(settings)
    onClose()
  }, [onSettingsChange, onClose, settings])

  // Wipes EVERYTHING — zoom, pan, exposure, contrast, saturation, preset —
  // back to neutral. Does not close; user can re-modify before dismissing.
  // On dismiss, the wiped state is what commits.
  const handleReset = () => {
    setSettings(NEUTRAL_SLOT_SETTINGS)
    setActivePreset(null)
  }

  return (
    <Lightbox isOpen={isOpen} onClose={handleDismiss} ariaLabel="Edit image">
      <div
        // Stop backdrop-click from closing when interacting with the panel.
        onMouseDown={(e) => e.stopPropagation()}
        // Fixed 840×538 so view-switching doesn't reflow the modal frame.
        // Both views are designed to fit inside these dimensions.
        className="bg-surface-primary border border-line-subtle rounded-xl p-6 w-[840px] h-[538px]"
        style={{ boxShadow: '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)' }}
      >
        {view === 'editor' ? (
          <div className="flex gap-8 items-start h-full">
            <ImageEditorPreview
              imageSrc={imageSrc}
              frameWidth={frameWidth}
              frameHeight={frameHeight}
              position={settings.position}
              zoom={settings.zoom}
              filters={settings.filters}
              onPositionChange={setPosition}
            />

            {/* Right column distributes its four sections via justify-between
             *  across the 490px stage height — matches Figma 374:317. */}
            <div className="flex flex-col justify-between h-[490px] w-[270px]">
              {/* Change / Create */}
              <div className="flex gap-3 w-full">
                <ImageEditButton
                  icon={<ImageUp className="w-full h-full" strokeWidth={1.5} />}
                  label="Change Image"
                  onClick={() => setView('library')}
                />
                <ImageEditButton
                  icon={<WandSparkles className="w-full h-full" strokeWidth={1.5} />}
                  label="Create Image"
                  disabled
                />
              </div>

              {/* Zoom (bordered) + filter sliders (bare, tight gap). */}
              <div className="flex flex-col gap-3 w-full">
                <SliderRow label="Zoom">
                  <ImageEditorSlider
                    variant="bordered"
                    value={settings.zoom}
                    onChange={handleZoomChange}
                    min={ZOOM.min}
                    max={ZOOM.max}
                    step={ZOOM.step}
                    ariaLabel="Zoom"
                  />
                </SliderRow>

                <div className="flex flex-col gap-[2px] w-full">
                  <SliderRow label="Exposure">
                    <ImageEditorSlider
                      variant="bare"
                      value={settings.filters.exposure}
                      onChange={(v) => setFilter('exposure', v)}
                      min={FILTER.min}
                      max={FILTER.max}
                      step={FILTER.step}
                      ariaLabel="Exposure"
                    />
                  </SliderRow>
                  <SliderRow label="Contrast">
                    <ImageEditorSlider
                      variant="bare"
                      value={settings.filters.contrast}
                      onChange={(v) => setFilter('contrast', v)}
                      min={FILTER.min}
                      max={FILTER.max}
                      step={FILTER.step}
                      ariaLabel="Contrast"
                    />
                  </SliderRow>
                  <SliderRow label="Saturation">
                    <ImageEditorSlider
                      variant="bare"
                      value={settings.filters.saturation}
                      onChange={(v) => setFilter('saturation', v)}
                      min={FILTER.min}
                      max={FILTER.max}
                      step={FILTER.step}
                      ariaLabel="Saturation"
                    />
                  </SliderRow>
                </div>
              </div>

              {/* Presets — values TBD; for now each just marks active and waits
               *  for the filter data model to land. */}
              <PresetButtonGroup
                title="Adjustment Presets"
                presets={PRESETS.map((p) => ({
                  id: p.id,
                  label: p.label,
                  active: activePreset === p.id,
                  onClick: () => {
                    setSettings((s) => ({ ...s, filters: p.values }))
                    setActivePreset(p.id)
                  },
                }))}
              />

              {/* Reset only — ghost style. Apply / Cancel are gone; close-
               *  the-modal commits, Reset wipes local state without closing. */}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-2 py-[10px] text-btn-ghost-text font-mono text-[12px] uppercase leading-none hover:text-content-primary transition-colors self-start"
              >
                <RotateCcw size={12} strokeWidth={1.5} />
                Reset
              </button>
            </div>
          </div>
        ) : (
          <ImageLibraryView
            onBack={() => setView('editor')}
            onSelect={(url) => {
              onImageChange(url)
              setView('editor')
            }}
          />
        )}
      </div>
    </Lightbox>
  )
}
