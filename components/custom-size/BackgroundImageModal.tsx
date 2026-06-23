'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImageUp, WandSparkles, RotateCcw } from 'lucide-react'
import { Lightbox } from '../lightbox/Lightbox'
import { ImageEditorPreview } from '../image-editor/ImageEditorPreview'
import { ImageEditButton } from '../image-editor/ImageEditButton'
import { ImageEditorSlider } from '../image-editor/ImageEditorSlider'
import { SliderRow } from '../image-editor/SliderRow'
import { ImageLibraryView } from '../image-editor/ImageLibraryView'
import { PresetButtonGroup } from '@/components/ui'
import { SelectorPrimitive, type EnumOption } from '@/components/ui'
import { SelectorRow } from '../canvas-editor/stage-bar/SelectorRow'
import {
  NEUTRAL_SLOT_SETTINGS,
  IMAGE_FILTER_PRESETS,
  type ImageFilters,
  type ImageSlotSettings,
} from '@/lib/image-filters'
import type { CustomSizeOverlay } from '@/lib/custom-size/document'

/**
 * BackgroundImageModal — the image-led ("background") variant of the image
 * editor (Figma node 518:3072). A SEPARATE modal from `ImageEditorModal`; the
 * other 28 templates keep using that one. The difference: this variant edits a
 * full-bleed background image AND its overlay scrim (DIR coverage + OVERLAY
 * colour + OPACITY), so users can only scrim backgrounds, never zone images.
 *
 * Reuses the editor's preview/sliders/presets/library wholesale; the overlay
 * block (the two 24px compact selector-rows + the opacity slider) is the only
 * net-new control surface. Image settings commit on dismiss (matching
 * ImageEditorModal); overlay changes commit live so the canvas stays in sync.
 */

const ZOOM = { min: 1, max: 3, step: 0.01 } as const
const FILTER = { min: -1, max: 1, step: 0.01 } as const

// DIR (coverage) swatches — a dark gradient over a neutral base previews where
// the scrim concentrates. fade-up = dark at bottom; full = even; fade-down =
// dark at top. Values map 1:1 to CustomSizeOverlay.coverage.
const DIR_BASE = '#d9d9dc'
const DIR_OPTIONS: EnumOption[] = [
  { value: 'fade-up', ariaLabel: 'Scrim fades up (dark at bottom)', swatch: { backgroundColor: DIR_BASE, backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 31%, rgba(0,0,0,0.45) 100%)' } },
  { value: 'full', ariaLabel: 'Even scrim', swatch: { backgroundColor: DIR_BASE, backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.32), rgba(0,0,0,0.32))' } },
  { value: 'fade-down', ariaLabel: 'Scrim fades down (dark at top)', swatch: { backgroundColor: DIR_BASE, backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 77%)' } },
]

// OVERLAY colour swatches — the four brand options from Figma 530:3200.
const OVERLAY_OPTIONS: EnumOption[] = [
  { value: '#D35F0B', ariaLabel: 'Orange overlay', swatch: { backgroundColor: '#D35F0B' } },
  { value: '#060015', ariaLabel: 'Dark overlay', swatch: { backgroundColor: '#060015' } },
  { value: '#FFFFFF', ariaLabel: 'White overlay', swatch: { backgroundColor: '#FFFFFF' } },
  { value: '#0080FF', ariaLabel: 'Blue overlay', swatch: { backgroundColor: '#0080FF' } },
]

export interface BackgroundImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  frameWidth: number
  frameHeight: number
  initialSettings: ImageSlotSettings
  onSettingsChange: (settings: ImageSlotSettings) => void
  onImageChange: (url: string) => void
  overlay: CustomSizeOverlay
  onOverlayChange: (next: CustomSizeOverlay) => void
}

type ModalView = 'editor' | 'library'

export function BackgroundImageModal({
  isOpen,
  onClose,
  imageSrc,
  frameWidth,
  frameHeight,
  initialSettings,
  onSettingsChange,
  onImageChange,
  overlay,
  onOverlayChange,
}: BackgroundImageModalProps) {
  const [view, setView] = useState<ModalView>('editor')
  const [settings, setSettings] = useState<ImageSlotSettings>(initialSettings)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setView('editor')
    setSettings(initialSettings)
    setActivePreset(null)
  }, [isOpen, initialSettings])

  const setPosition = (next: { x: number; y: number }) =>
    setSettings((s) => ({ ...s, position: next }))
  const setFilter = (key: keyof ImageFilters, value: number) => {
    setSettings((s) => ({ ...s, filters: { ...s.filters, [key]: value } }))
    setActivePreset(null)
  }
  const handleZoomChange = (next: number) =>
    setSettings((s) => ({
      ...s,
      zoom: next,
      position: { x: Math.max(-50, Math.min(50, s.position.x)), y: Math.max(-50, Math.min(50, s.position.y)) },
    }))

  // Overlay changes commit live so the canvas behind reflects them immediately.
  const patchOverlay = (patch: Partial<CustomSizeOverlay>) => onOverlayChange({ ...overlay, ...patch })

  const handleDismiss = useCallback(() => {
    onSettingsChange(settings)
    onClose()
  }, [onSettingsChange, onClose, settings])

  const handleReset = () => {
    setSettings(NEUTRAL_SLOT_SETTINGS)
    setActivePreset(null)
  }

  return (
    <Lightbox isOpen={isOpen} onClose={handleDismiss} ariaLabel="Edit background image">
      <div
        onMouseDown={(e) => e.stopPropagation()}
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
              overlay={overlay}
            />

            <div className="flex flex-col justify-between h-[490px] w-[270px]">
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

              <PresetButtonGroup
                title="Presets"
                size="sm"
                presets={IMAGE_FILTER_PRESETS.map((p) => ({
                  id: p.id,
                  label: p.label,
                  active: activePreset === p.id,
                  onClick: () => {
                    setSettings((s) => ({ ...s, filters: p.values }))
                    setActivePreset(p.id)
                  },
                }))}
              />

              <div className="flex flex-col gap-3 w-full">
                <SliderRow label="Zoom">
                  <ImageEditorSlider variant="bordered" value={settings.zoom} onChange={handleZoomChange} min={ZOOM.min} max={ZOOM.max} step={ZOOM.step} ariaLabel="Zoom" />
                </SliderRow>
                <SliderRow label="Opacity">
                  <ImageEditorSlider variant="bordered" value={overlay.opacity} onChange={(v) => patchOverlay({ opacity: v })} min={0} max={1} step={0.01} ariaLabel="Overlay opacity" />
                </SliderRow>
                <div className="flex flex-col gap-[2px] w-full">
                  <SliderRow label="Exposure">
                    <ImageEditorSlider variant="bare" value={settings.filters.exposure} onChange={(v) => setFilter('exposure', v)} min={FILTER.min} max={FILTER.max} step={FILTER.step} ariaLabel="Exposure" />
                  </SliderRow>
                  <SliderRow label="Contrast">
                    <ImageEditorSlider variant="bare" value={settings.filters.contrast} onChange={(v) => setFilter('contrast', v)} min={FILTER.min} max={FILTER.max} step={FILTER.step} ariaLabel="Contrast" />
                  </SliderRow>
                  <SliderRow label="Saturation">
                    <ImageEditorSlider variant="bare" value={settings.filters.saturation} onChange={(v) => setFilter('saturation', v)} min={FILTER.min} max={FILTER.max} step={FILTER.step} ariaLabel="Saturation" />
                  </SliderRow>
                </div>
              </div>

              {/* Overlay scrim — the image-led-only block. Compact (24px) rows. */}
              <div className="flex items-start justify-between w-full">
                <SelectorRow label="Dir." size="sm">
                  <SelectorPrimitive
                    kind="enum"
                    size="sm"
                    value={overlay.coverage}
                    onChange={(v) => patchOverlay({ coverage: v as CustomSizeOverlay['coverage'] })}
                    options={DIR_OPTIONS}
                  />
                </SelectorRow>
                <SelectorRow label="Overlay" size="sm">
                  <SelectorPrimitive
                    kind="enum"
                    size="sm"
                    value={overlay.color}
                    onChange={(v) => patchOverlay({ color: v })}
                    options={OVERLAY_OPTIONS}
                  />
                </SelectorRow>
              </div>

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
