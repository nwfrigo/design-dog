'use client'

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useStore } from '@/store'
import { createDefaultCarouselSlide } from '@/store'
import { SocialCarousel } from '@/components/templates/SocialCarousel'
import { SimpleRichTextEditor } from '@/components/SimpleRichTextEditor'
import { ImageCropModal } from '@/components/ImageCropModal'
import { ImageLibraryModal } from '@/components/ImageLibraryModal'
import { EyeIcon } from '@/components/shared/EyeIcon'
import { ToggleSwitch } from '@/components/shared/ToggleSwitch'
import { ImagePreviewWithCrop } from '@/components/shared/ImagePreviewWithCrop'
import { fetchColorsConfig, fetchTypographyConfig, type ColorsConfig, type TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide, CarouselSlideType, CarouselBackgroundStyle } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeleteConfirmModal } from './shared/DeleteConfirmModal'

// Layout type labels
const SLIDE_TYPE_LABELS: Record<CarouselSlideType, string> = {
  'cover-text': 'Cover',
  'cover-image': 'Cover+Img',
  'text': 'Text',
  'text-image': 'Text+Img',
  'outro': 'Outro',
}

const SLIDE_TYPES: CarouselSlideType[] = ['cover-text', 'cover-image', 'text', 'text-image', 'outro']

const BACKGROUND_STYLES: CarouselBackgroundStyle[] = ['1', '2', '3', '4', '5', '6', '7']

const BACKGROUND_IMAGES: Record<CarouselBackgroundStyle, string> = {
  '1': '/assets/backgrounds/carousel-dark-gradient-1.png',
  '2': '/assets/backgrounds/carousel-dark-gradient-2.png',
  '3': '/assets/backgrounds/carousel-dark-gradient-3.png',
  '4': '/assets/backgrounds/carousel-dark-gradient-4.png',
  '5': '/assets/backgrounds/carousel-dark-gradient-5.png',
  '6': '/assets/backgrounds/carousel-dark-gradient-6.png',
  '7': '/assets/backgrounds/carousel-dark-gradient-7.png',
}

// Sortable carousel slide — all slides render at same displaySize
// Tools (drag, duplicate, delete) float above the slide on hover
function SortableCarouselSlide({
  slide,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  canDelete,
  colors,
  typography,
  displaySize,
}: {
  slide: CarouselSlide
  index: number
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  canDelete: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  displaySize: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const scale = displaySize / 1080

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 group">
      {/* Toolbar above slide — visible on hover */}
      <div className="flex items-center justify-between mb-1.5 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Left: drag handle + slide number */}
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-[10px] font-medium text-gray-400 dark:text-content-secondary">{index + 1}</span>
        </div>

        {/* Right: duplicate + delete */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate() }}
            className="p-0.5 text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary"
            title="Duplicate slide"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="p-0.5 text-gray-400 dark:text-content-secondary hover:text-red-500"
              title="Delete slide"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Preview — uses Stacker active ring pattern */}
      <div
        onClick={onSelect}
        className={`cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-gray-200 dark:border-transparent hover:border-gray-300'
        }`}
        style={{ width: displaySize, height: displaySize }}
      >
        <div style={{
          width: 1080,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <SocialCarousel
            slide={slide}
            logoColor="white"
            colors={colors}
            typography={typography}
            scale={1}
          />
        </div>
      </div>
    </div>
  )
}

export function SocialCarouselEditorScreen() {
  const {
    carouselSlides,
    carouselCurrentSlideIndex,
    setCarouselSlides,
    setCarouselCurrentSlideIndex,
    setCurrentScreen,
  } = useStore()

  // Local state synced to store
  const [slides, setSlides] = useState<CarouselSlide[]>(carouselSlides)
  const [currentIndex, setCurrentIndex] = useState(carouselCurrentSlideIndex)
  const logoColor = 'white' as const
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [colorsConfig, setColorsConfig] = useState<ColorsConfig | null>(null)
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)

  // Carousel container ref for sizing
  const carouselContainerRef = useRef<HTMLDivElement>(null)
  const [displaySize, setDisplaySize] = useState(300)
  const exportDropdownRef = useRef<HTMLDivElement>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Sync local state to store for draft persistence
  useEffect(() => {
    setCarouselSlides(slides)
  }, [slides, setCarouselSlides])

  useEffect(() => {
    setCarouselCurrentSlideIndex(currentIndex)
  }, [currentIndex, setCarouselCurrentSlideIndex])

  // Load brand config
  useEffect(() => {
    Promise.all([fetchColorsConfig(), fetchTypographyConfig()]).then(([colors, typography]) => {
      setColorsConfig(colors)
      setTypographyConfig(typography)
    })
  }, [])

  // Measure carousel container height to compute slide display size
  // Toolbar above each slide is ~30px, plus padding — account for that
  useLayoutEffect(() => {
    const el = carouselContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const availableHeight = entry.contentRect.height
        // 32px for container padding, 30px for toolbar above slide
        const newSize = Math.max(150, Math.round(availableHeight - 62))
        setDisplaySize(prev => Math.abs(prev - newSize) > 2 ? newSize : prev)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Click outside to close export dropdown
  useEffect(() => {
    if (!showExportDropdown) return
    const handleClick = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showExportDropdown])

  // Current slide
  const currentSlide = slides[currentIndex] || slides[0]

  // Update a field on the current slide
  const updateSlide = useCallback((updates: Partial<CarouselSlide>) => {
    setSlides(prev => prev.map((s, i) => i === currentIndex ? { ...s, ...updates } : s))
  }, [currentIndex])

  // Slide management
  const addSlide = useCallback(() => {
    const newSlide = createDefaultCarouselSlide('text')
    setSlides(prev => [...prev, newSlide])
    setCurrentIndex(slides.length)
  }, [slides.length])

  const duplicateSlide = useCallback((index: number) => {
    const original = slides[index]
    const dupe: CarouselSlide = { ...original, id: Math.random().toString(36).substring(2, 9) }
    const newSlides = [...slides]
    newSlides.splice(index + 1, 0, dupe)
    setSlides(newSlides)
    setCurrentIndex(index + 1)
  }, [slides])

  const deleteSlide = useCallback((id: string) => {
    if (slides.length <= 1) return
    const idx = slides.findIndex(s => s.id === id)
    const newSlides = slides.filter(s => s.id !== id)
    setSlides(newSlides)
    if (currentIndex >= newSlides.length) {
      setCurrentIndex(newSlides.length - 1)
    } else if (currentIndex > idx) {
      setCurrentIndex(currentIndex - 1)
    }
    setDeleteConfirm(null)
  }, [slides, currentIndex])

  // DnD handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = slides.findIndex(s => s.id === active.id)
    const newIndex = slides.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newSlides = [...slides]
    const [moved] = newSlides.splice(oldIndex, 1)
    newSlides.splice(newIndex, 0, moved)
    setSlides(newSlides)

    // Keep selection on the moved slide
    if (currentIndex === oldIndex) {
      setCurrentIndex(newIndex)
    } else if (currentIndex > oldIndex && currentIndex <= newIndex) {
      setCurrentIndex(currentIndex - 1)
    } else if (currentIndex < oldIndex && currentIndex >= newIndex) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [slides, currentIndex])

  // Export handlers
  const handleExportPng = useCallback(async () => {
    setShowExportDropdown(false)
    setIsExporting(true)
    try {
      const slide = slides[currentIndex]
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'social-carousel',
          scale: 2,
          slideType: slide.slideType,
          backgroundStyle: slide.backgroundStyle,
          eyebrow: slide.eyebrow,
          headline: slide.headline,
          subhead: slide.subhead,
          body: slide.body,
          ctaText: slide.ctaText,
          showEyebrow: slide.showEyebrow,
          showHeadline: slide.showHeadline,
          showSubhead: slide.showSubhead,
          showBody: slide.showBody,
          showCta: slide.showCta,
          headlineFontSize: slide.headlineFontSize,
          imageUrl: slide.imageUrl,
          imagePositionX: slide.imagePosition.x,
          imagePositionY: slide.imagePosition.y,
          imageZoom: slide.imageZoom,
          grayscale: slide.grayscale,
          logoColor,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `carousel-slide-${currentIndex + 1}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [slides, currentIndex, logoColor])

  const handleExportPdf = useCallback(async () => {
    setShowExportDropdown(false)
    setIsExporting(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'social-carousel',
          scale: 2,
          page: 'all',
          slidesData: JSON.stringify(slides),
          logoColor,
          numSlides: slides.length,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'carousel.pdf'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [slides, logoColor])

  // Headline size config for carousel
  const headlineSizeConfig = { default: 112, min: 40, max: 140, step: 4 }
  const isCoverOrOutro = currentSlide?.slideType === 'cover-text' || currentSlide?.slideType === 'cover-image' || currentSlide?.slideType === 'outro'
  const effectiveDefault = isCoverOrOutro ? 112 : 60
  const effectiveSize = currentSlide?.headlineFontSize ?? effectiveDefault

  // Determine which fields to show based on slide type
  const showImageSection = currentSlide?.slideType === 'cover-image' || currentSlide?.slideType === 'text-image'

  // Scroll to selected slide in carousel
  useEffect(() => {
    if (carouselContainerRef.current) {
      const scrollContainer = carouselContainerRef.current.querySelector('[data-carousel-scroll]')
      if (scrollContainer) {
        const selectedChild = scrollContainer.children[currentIndex] as HTMLElement
        if (selectedChild) {
          selectedChild.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        }
      }
    }
  }, [currentIndex])

  if (!currentSlide) return null
  if (!colorsConfig || !typographyConfig) return null

  return (
    <div className="flex h-full">
      {/* Left Panel — Controls */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-line-subtle overflow-y-auto bg-white dark:bg-surface-primary">
        <div className="p-4 space-y-5">
          {/* Layout Type Picker */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide mb-2 block">Layout</label>
            <div className="flex flex-wrap gap-1.5">
              {SLIDE_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => updateSlide({ slideType: type })}
                  className={`px-2 py-1 text-[11px] rounded-full transition-colors ${
                    currentSlide.slideType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-surface-secondary text-gray-600 dark:text-content-secondary hover:bg-gray-200 dark:hover:bg-interactive-hover'
                  }`}
                >
                  {SLIDE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Background Style Picker */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide mb-2 block">Background</label>
            <div className="flex gap-2">
              {BACKGROUND_STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => updateSlide({ backgroundStyle: style })}
                  className={`w-9 h-9 rounded-md overflow-hidden transition-all ${
                    currentSlide.backgroundStyle === style
                      ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-surface-primary'
                      : 'ring-1 ring-gray-200 dark:ring-line-subtle hover:ring-gray-400'
                  }`}
                >
                  <img src={BACKGROUND_IMAGES[style]} alt={`Style ${style}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Eyebrow */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide">Eyebrow</label>
              <EyeIcon visible={currentSlide.showEyebrow} onClick={() => updateSlide({ showEyebrow: !currentSlide.showEyebrow })} />
            </div>
            <input
              type="text"
              value={currentSlide.eyebrow}
              onChange={e => updateSlide({ eyebrow: e.target.value })}
              placeholder="Eyebrow text"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Headline */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide">Headline</label>
              <div className="flex items-center gap-1">
                <EyeIcon visible={currentSlide.showHeadline} onClick={() => updateSlide({ showHeadline: !currentSlide.showHeadline })} />
              </div>
            </div>
            <div className="flex gap-1.5 items-start">
              <div className="flex-1">
                <SimpleRichTextEditor
                  content={currentSlide.headline}
                  onChange={(html) => updateSlide({ headline: html })}
                  placeholder="Headline"
                  minHeight="60px"
                  onFontSizeUp={() => updateSlide({ headlineFontSize: Math.min(effectiveSize + headlineSizeConfig.step, headlineSizeConfig.max) })}
                  onFontSizeDown={() => updateSlide({ headlineFontSize: Math.max(effectiveSize - headlineSizeConfig.step, headlineSizeConfig.min) })}
                  fontSizeAtMax={effectiveSize >= headlineSizeConfig.max}
                  fontSizeAtMin={effectiveSize <= headlineSizeConfig.min}
                />
              </div>
            </div>
          </div>

          {/* Subhead */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide">Subhead</label>
              <EyeIcon visible={currentSlide.showSubhead} onClick={() => updateSlide({ showSubhead: !currentSlide.showSubhead })} />
            </div>
            <SimpleRichTextEditor
              content={currentSlide.subhead}
              onChange={(html) => updateSlide({ subhead: html })}
              placeholder="Subhead"
              minHeight="40px"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide">Body</label>
              <EyeIcon visible={currentSlide.showBody} onClick={() => updateSlide({ showBody: !currentSlide.showBody })} />
            </div>
            <SimpleRichTextEditor
              content={currentSlide.body}
              onChange={(html) => updateSlide({ body: html })}
              placeholder="Body text"
              minHeight="40px"
            />
          </div>

          {/* CTA (Outro only) */}
          {currentSlide.slideType === 'outro' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide">CTA</label>
                <EyeIcon visible={currentSlide.showCta} onClick={() => updateSlide({ showCta: !currentSlide.showCta })} />
              </div>
              <input
                type="text"
                value={currentSlide.ctaText}
                onChange={e => updateSlide({ ctaText: e.target.value })}
                placeholder="Call to action"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Image Section */}
          {showImageSection && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wide mb-2 block">Image</label>
              {currentSlide.imageUrl ? (
                <div>
                  <ImagePreviewWithCrop
                    imageUrl={currentSlide.imageUrl}
                    imagePosition={currentSlide.imagePosition}
                    imageZoom={currentSlide.imageZoom}
                    grayscale={currentSlide.grayscale}
                    onAdjust={() => setShowCropModal(true)}
                    onRemove={() => updateSlide({ imageUrl: null, imagePosition: { x: 0, y: 0 }, imageZoom: 1 })}
                    width={272}
                    height={180}
                  />
                  {/* Grayscale toggle */}
                  <ToggleSwitch
                    label="Grayscale"
                    checked={currentSlide.grayscale}
                    onChange={() => updateSlide({ grayscale: !currentSlide.grayscale })}
                    className="mt-3"
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  {/* Upload box */}
                  <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16 hover:border-blue-400 dark:hover:border-line-focus transition-colors flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          updateSlide({ imageUrl: url })
                        }
                      }}
                    />
                    <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload
                  </label>
                  {/* Library box */}
                  <button
                    onClick={() => setShowImageLibrary(true)}
                    className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16 hover:border-gray-400 dark:hover:border-line-focus transition-colors flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
                  >
                    <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose from library
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Toolbar + Horizontal Carousel */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-surface-tertiary overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary">
          <div className="flex items-center gap-2">
            {/* Preview All */}
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-content-secondary bg-gray-100 dark:bg-surface-secondary rounded-md hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors border border-gray-200 dark:border-line-subtle"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>

            {/* Export dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export'}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-surface-secondary rounded-lg shadow-lg border border-gray-200 dark:border-line-subtle py-1 z-20">
                  <button
                    onClick={handleExportPng}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover"
                  >
                    Export Slide (PNG)
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover"
                  >
                    Export All (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-content-secondary">
            Slide {currentIndex + 1} of {slides.length}
          </div>
        </div>

        {/* Carousel area */}
        <div ref={carouselContainerRef} className="flex-1 flex items-start overflow-hidden pt-4">
          <div className="flex items-start gap-4 overflow-x-auto px-4 w-full" data-carousel-scroll>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={slides.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                {slides.map((slide, index) => (
                  <SortableCarouselSlide
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isSelected={index === currentIndex}
                    onSelect={() => setCurrentIndex(index)}
                    onDuplicate={() => duplicateSlide(index)}
                    onDelete={() => setDeleteConfirm(slide.id)}
                    canDelete={slides.length > 1}
                    colors={colorsConfig}
                    typography={typographyConfig}
                    displaySize={displaySize}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add slide button — has spacer above to align with slides */}
            <div className="flex-shrink-0">
              <div className="h-6 mb-1.5" />
              <button
                onClick={addSlide}
                className="rounded-lg border-2 border-dashed border-gray-300 dark:border-line-subtle hover:border-blue-400 dark:hover:border-blue-500 flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ width: displaySize, height: displaySize }}
              >
                <svg className="w-8 h-8 text-gray-400 dark:text-content-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-400 dark:text-content-secondary">Add Slide</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onConfirm={() => deleteConfirm && deleteSlide(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        itemType="Slide"
      />

      {/* Image Library Modal */}
      {showImageLibrary && (
        <ImageLibraryModal
          onSelect={(imageUrl) => {
            updateSlide({ imageUrl, imagePosition: { x: 0, y: 0 }, imageZoom: 1 })
            setShowImageLibrary(false)
          }}
          onClose={() => setShowImageLibrary(false)}
        />
      )}

      {/* Image Crop Modal */}
      {currentSlide.imageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={currentSlide.imageUrl}
          frameWidth={currentSlide.slideType === 'cover-image' ? 302 : 952}
          frameHeight={currentSlide.slideType === 'cover-image' ? 1080 : 628}
          initialPosition={currentSlide.imagePosition}
          initialZoom={currentSlide.imageZoom}
          onSave={(position, zoom) => {
            updateSlide({ imagePosition: position, imageZoom: zoom })
            setShowCropModal(false)
          }}
        />
      )}

      {/* Preview All Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setShowPreview(false)}>
          <div className="max-w-[90vw] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-white text-lg font-medium">All Slides Preview</h3>
              <div className="flex-1" />
              <button onClick={() => setShowPreview(false)} className="text-white/70 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {slides.map((slide, i) => (
                <div key={slide.id} className="flex-shrink-0">
                  <div className="text-white/60 text-xs mb-1 text-center">{i + 1}</div>
                  <div style={{ width: 400, height: 400 }}>
                    <div style={{
                      width: 1080,
                      height: 1080,
                      transform: 'scale(0.37)',
                      transformOrigin: 'top left',
                    }}>
                      <SocialCarousel
                        slide={slide}
                        logoColor={logoColor}
                        colors={colorsConfig}
                        typography={typographyConfig}
                        scale={1}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
