'use client'

import { useState, useEffect, useRef } from 'react'
import type { SolutionCategory } from '@/types'
import {
  getHeroImagesForSolution,
  heroCategoryLabels,
  type HeroLibraryImage,
} from '@/config/solution-overview-hero-images'
import {
  getFaqCoverImagesForSolution,
  faqCoverCategoryLabels,
  type FaqCoverLibraryImage,
} from '@/config/faq-cover-images'

// Generic library image type (for library.json)
export interface LibraryImage {
  id: string
  url: string
  name: string
  category?: string
}

// Unified image type for internal use
type UnifiedImage = {
  id: string
  url: string
  category?: string
  displayName?: string
}

// Variant configuration
type VariantConfig = {
  width: string
  aspectRatio: string
  defaultTitle: string
  showCount: boolean
  categoryLabelStyle: 'subtle' | 'solid'
}

const VARIANT_CONFIG: Record<ImageLibraryVariant, VariantConfig> = {
  generic: {
    width: 'w-[600px]',
    aspectRatio: 'aspect-[4/3]',
    defaultTitle: 'Image Library',
    showCount: false,
    categoryLabelStyle: 'subtle',
  },
  'solution-hero': {
    width: 'w-[700px]',
    aspectRatio: 'aspect-[16/9]',
    defaultTitle: 'Hero Image Library',
    showCount: true,
    categoryLabelStyle: 'subtle',
  },
  'faq-cover': {
    width: 'w-[700px]',
    aspectRatio: 'aspect-[204/792]',
    defaultTitle: 'Cover Image Library',
    showCount: true,
    categoryLabelStyle: 'solid',
  },
}

const SOLUTION_CATEGORIES = ['environmental', 'health', 'quality', 'safety', 'sustainability'] as const

export type ImageLibraryVariant = 'generic' | 'solution-hero' | 'faq-cover'

interface BaseProps {
  onSelect: (url: string) => void
  onClose: () => void
  title?: string
}

interface GenericVariantProps extends BaseProps {
  variant?: 'generic'
  solution?: never
}

interface SolutionVariantProps extends BaseProps {
  variant: 'solution-hero' | 'faq-cover'
  solution: SolutionCategory
}

export type ImageLibraryModalProps = GenericVariantProps | SolutionVariantProps

export function ImageLibraryModal(props: ImageLibraryModalProps) {
  const { onSelect, onClose, title, variant = 'generic' } = props
  const solution = 'solution' in props ? props.solution : undefined

  const config = VARIANT_CONFIG[variant]
  const displayTitle = title ?? config.defaultTitle

  const [images, setImages] = useState<UnifiedImage[]>([])
  const [loading, setLoading] = useState(variant === 'generic')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (variant !== 'generic' && solution && solution !== 'converged') {
      return solution
    }
    return null
  })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load images based on variant
  useEffect(() => {
    if (variant === 'generic') {
      // Load from library.json
      const loadLibrary = async () => {
        try {
          const response = await fetch('/assets/image-library/library.json')
          if (response.ok) {
            const data = await response.json()
            const libraryImages = (data.images || []) as LibraryImage[]
            setImages(libraryImages.map(img => ({
              id: img.id,
              url: img.url,
              category: img.category,
              displayName: img.name,
            })))
          }
        } catch (error) {
          console.error('Failed to load image library:', error)
        } finally {
          setLoading(false)
        }
      }
      loadLibrary()
    } else if (variant === 'solution-hero' && solution) {
      const heroImages = getHeroImagesForSolution(solution)
      setImages(heroImages.map(img => ({
        id: img.id,
        url: img.url,
        category: img.category,
      })))
    } else if (variant === 'faq-cover' && solution) {
      const faqImages = getFaqCoverImagesForSolution(solution)
      setImages(faqImages.map(img => ({
        id: img.id,
        url: img.url,
        category: img.category,
      })))
    }
  }, [variant, solution])

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setIsUploading(false)
      onSelect(dataUrl)
    }
    reader.onerror = () => {
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Get unique categories
  const categories = variant === 'generic'
    ? Array.from(new Set(images.map(img => img.category).filter((c): c is string => Boolean(c))))
    : solution === 'converged'
      ? [...SOLUTION_CATEGORIES]
      : solution
        ? [solution, ...SOLUTION_CATEGORIES.filter(c => c !== solution)]
        : [...SOLUTION_CATEGORIES]

  // Filter images by category
  const filteredImages = selectedCategory
    ? images.filter(img => img.category === selectedCategory)
    : images

  // Get category label
  const getCategoryLabel = (cat: string): string => {
    if (variant === 'solution-hero') {
      return heroCategoryLabels[cat as keyof typeof heroCategoryLabels] || cat
    }
    if (variant === 'faq-cover') {
      return faqCoverCategoryLabels[cat as keyof typeof faqCoverCategoryLabels] || cat
    }
    return cat
  }

  // Get image display name
  const getImageDisplayName = (image: UnifiedImage): string => {
    if (image.displayName) return image.displayName
    if (variant !== 'generic' && image.category) {
      return getCategoryLabel(image.category)
    }
    return image.id
  }

  // Category button styles
  const getCategoryButtonClass = (isSelected: boolean): string => {
    if (config.categoryLabelStyle === 'solid') {
      return isSelected
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }
    return isSelected
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl ${config.width} max-w-[90vw] max-h-[85vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{displayTitle}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
              hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {isUploading ? (
              <span className="text-sm text-gray-500">Uploading...</span>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {variant === 'generic' ? 'Upload an image' : 'Upload your own image'}
                  </span>
                  {' '}or drag and drop
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm ${config.categoryLabelStyle === 'solid' ? 'font-medium' : ''} rounded-full transition-colors whitespace-nowrap ${getCategoryButtonClass(selectedCategory === null)}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm ${config.categoryLabelStyle === 'solid' ? 'font-medium' : ''} rounded-full transition-colors whitespace-nowrap ${getCategoryButtonClass(selectedCategory === cat)}`}
              >
                {getCategoryLabel(cat)}
                {variant !== 'generic' && solution !== 'converged' && cat === solution && (
                  <span className="ml-1 text-xs opacity-60">(current)</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Loading...
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No images in library</p>
              {variant === 'generic' && (
                <p className="text-xs mt-1">Add images to /public/assets/image-library/</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredImages.map(image => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.url)}
                  className={`group relative ${config.aspectRatio} rounded-lg overflow-hidden border-2 border-transparent
                    hover:border-blue-500 transition-all bg-gray-100 dark:bg-gray-800`}
                >
                  <img
                    src={image.url}
                    alt={getImageDisplayName(image)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate capitalize">
                      {getImageDisplayName(image)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {config.showCount && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>
    </div>
  )
}

// Re-export for backwards compatibility during migration
export { ImageLibraryModal as SolutionOverviewImageLibraryModal }
export { ImageLibraryModal as FaqCoverImageLibraryModal }
