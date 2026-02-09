'use client'

import { useState, useRef } from 'react'
import type { SolutionCategory } from '@/types'
import {
  getHeroImagesForSolution,
  heroCategoryLabels,
  type HeroLibraryImage,
} from '@/config/solution-overview-hero-images'

interface SolutionOverviewImageLibraryModalProps {
  solution: SolutionCategory
  onSelect: (url: string) => void
  onClose: () => void
  title?: string
}

export function SolutionOverviewImageLibraryModal({
  solution,
  onSelect,
  onClose,
  title = 'Hero Image Library',
}: SolutionOverviewImageLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    solution === 'converged' ? null : solution
  )
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get images sorted by relevance to current solution
  const allImages = getHeroImagesForSolution(solution)

  // Filter by selected category tab
  const filteredImages = selectedCategory
    ? allImages.filter(img => img.category === selectedCategory)
    : allImages

  // Get unique categories in display order (current solution first)
  const categories = solution === 'converged'
    ? ['environmental', 'health', 'quality', 'safety', 'sustainability'] as const
    : [solution, ...(['environmental', 'health', 'quality', 'safety', 'sustainability'] as const).filter(c => c !== solution)]

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[700px] max-w-[90vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
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
                  <span className="font-medium text-blue-600 dark:text-blue-400">Upload your own image</span>
                  {' '}or drag and drop
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {heroCategoryLabels[cat as keyof typeof heroCategoryLabels]}
              {solution !== 'converged' && cat === solution && (
                <span className="ml-1 text-xs opacity-60">(current)</span>
              )}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filteredImages.map(image => (
              <button
                key={image.id}
                onClick={() => onSelect(image.url)}
                className="group relative aspect-[16/9] rounded-lg overflow-hidden border-2 border-transparent
                  hover:border-blue-500 transition-all bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={image.url}
                  alt={image.id}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white capitalize">
                    {heroCategoryLabels[image.category]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer with count */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  )
}
