'use client'

import { useState, useEffect } from 'react'

export interface LibraryIcon {
  id: string
  url: string
  name: string
  category?: string
}

interface IconLibraryModalProps {
  onSelect: (iconId: string) => void
  onClose: () => void
  currentIconId?: string
}

export function IconLibraryModal({ onSelect, onClose, currentIconId }: IconLibraryModalProps) {
  const [icons, setIcons] = useState<LibraryIcon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Load library icons on mount
  useEffect(() => {
    async function loadLibrary() {
      try {
        const response = await fetch('/assets/icon-library/library.json')
        if (response.ok) {
          const data = await response.json()
          setIcons(data.icons || [])
        }
      } catch (error) {
        console.error('Failed to load icon library:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLibrary()
  }, [])

  // Get unique categories
  const categories = Array.from(new Set(icons.map(icon => icon.category).filter((c): c is string => Boolean(c))))

  // Filter icons by category
  const filteredIcons = selectedCategory
    ? icons.filter(icon => icon.category === selectedCategory)
    : icons

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[500px] max-w-[90vw] max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Icon</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
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
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Loading...
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="text-sm">No icons in library</p>
              <p className="text-xs mt-1 text-gray-400">Add icons to /public/assets/icon-library/</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {filteredIcons.map(icon => (
                <button
                  key={icon.id}
                  onClick={() => onSelect(icon.id)}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                    flex items-center justify-center bg-white dark:bg-gray-800
                    ${currentIconId === icon.id
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  title={icon.name}
                >
                  <img
                    src={icon.url}
                    alt={icon.name}
                    className="w-8 h-8 object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
