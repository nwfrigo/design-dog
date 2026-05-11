'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { ArrowLeft, ImageUp, Search, WandSparkles } from 'lucide-react'
import { ImageEditButton } from './ImageEditButton'

/**
 * ImageLibraryView — chrome-less library view (Figma 373:509).
 *
 * Renders the library grid + filters + search + upload tile + (future)
 * generate tile, **without** any outer modal chrome. Hosts inside
 * `ImageEditorModal`'s view-switching frame; the legacy `<ImageLibraryModal>`
 * still wraps a copy of this UI for non-migrated templates.
 *
 * Data: loads `/assets/image-library/library.json` — same source as the
 * legacy modal. Categories come from the JSON's `categories` field plus
 * any unique `category` values found on the images themselves.
 *
 * Upload: Vercel Blob via `/api/upload-image`; falls back to a data URL
 * in local dev without a token.
 *
 * Thumbnail fit: each tile is 160×90 (16:9 aspect) with `object-cover` so
 * any source aspect ratio fits cleanly without the modal frame growing.
 *
 * Scroll: the grid section scrolls vertically; the header (Back / filters /
 * search) and footer (upload / create) stay anchored.
 */

interface LibraryImage {
  id: string
  url: string
  name: string
  category?: string
}

export interface ImageLibraryViewProps {
  /** Fires when the user picks an image (from the grid or after upload).
   *  Parent should swap back to the editor view with the new URL. */
  onSelect: (url: string) => void
  /** Fires when the user clicks the Back arrow. Parent should swap back
   *  to the editor view without changing the image. */
  onBack: () => void
}

export function ImageLibraryView({ onSelect, onBack }: ImageLibraryViewProps) {
  const [images, setImages] = useState<LibraryImage[]>([])
  const [explicitCategories, setExplicitCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---- data load ----
  useEffect(() => {
    let cancelled = false
    async function loadLibrary() {
      try {
        const response = await fetch('/assets/image-library/library.json')
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setImages(data.images || [])
            if (Array.isArray(data.categories)) setExplicitCategories(data.categories)
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to load image library:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadLibrary()
    return () => {
      cancelled = true
    }
  }, [])

  // ---- categories: merge explicit + image-derived ----
  const categories = useMemo(() => {
    const fromImages = images.map((i) => i.category).filter((c): c is string => Boolean(c))
    return Array.from(new Set([...explicitCategories, ...fromImages]))
  }, [explicitCategories, images])

  // Default the first category active so the segmented control isn't ambiguous
  // about "what's selected." If there are no categories, no filter applies.
  useEffect(() => {
    if (activeCategory === null && categories.length > 0) {
      setActiveCategory(categories[0])
    }
  }, [activeCategory, categories])

  // ---- filtered grid ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return images.filter((img) => {
      if (activeCategory && img.category !== activeCategory) return false
      if (q && !img.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [images, activeCategory, query])

  // ---- upload ----
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setIsUploading(true)
    try {
      const ext = file.name.split('.').pop() || file.type.split('/')[1] || 'png'
      const filename = `images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-image',
      })
      setIsUploading(false)
      onSelect(blob.url)
    } catch {
      // Local dev fallback when BLOB_READ_WRITE_TOKEN isn't set — data URL.
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setIsUploading(false)
        onSelect(dataUrl)
      }
      reader.onerror = () => setIsUploading(false)
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      {/* Header — Back · filter tabs · search */}
      <div className="flex gap-12 items-center flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-2 py-[10px] text-btn-ghost-text font-mono text-[12px] uppercase leading-none hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
          Back
        </button>

        {categories.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
              Find Images
            </span>
            <div className="flex">
              {categories.map((cat, i) => {
                const active = activeCategory === cat
                const isFirst = i === 0
                const isLast = i === categories.length - 1
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      'h-9 flex items-center px-2 py-1.5',
                      'border-[0.5px] border-line-subtle',
                      'font-mono text-[12px] uppercase whitespace-nowrap leading-none',
                      'transition-colors',
                      active
                        ? 'bg-surface-tertiary text-content-primary'
                        : 'bg-surface-primary text-content-secondary hover:bg-surface-tertiary/50',
                      isFirst ? 'rounded-l-sm' : '',
                      isLast ? 'rounded-r-sm' : '',
                      !isFirst ? '-ml-px' : '',
                    ].join(' ')}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <label className="flex h-9 w-[185px] items-center gap-2 px-3 rounded-sm border-[0.5px] border-line-subtle bg-surface-primary">
          <Search size={12} className="text-content-secondary flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder=""
            className="flex-1 bg-transparent font-mono text-[12px] text-content-primary placeholder:text-content-secondary outline-none"
          />
        </label>
      </div>

      {/* Grid — scrolls when content overflows. Tiles are 16:9 with
       *  object-cover so any source aspect ratio fits without reshaping
       *  the modal frame. */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-content-secondary font-mono text-[12px] uppercase">
            loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-content-secondary font-mono text-[12px] uppercase">
            no images
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(image.url)}
                className="relative h-[90px] rounded-md overflow-hidden bg-white hover:opacity-85 transition-opacity"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer — Drag or upload · Create. The upload tile is the file-drop
       *  receiver; the hidden <input type="file"> is wired to the same tile's
       *  click. Create stays disabled until an AI generate flow lands. */}
      <div className="flex items-center justify-end gap-3 h-[100px] flex-shrink-0 w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <ImageEditButton
          icon={<ImageUp className="w-full h-full" strokeWidth={1.5} />}
          label={isUploading ? 'Uploading…' : 'Drag or Upload'}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-[100px] flex-1"
          buttonProps={{
            onDrop: handleDrop,
            onDragOver: (e) => e.preventDefault(),
          }}
        />
        <ImageEditButton
          icon={<WandSparkles className="w-full h-full" strokeWidth={1.5} />}
          label="Create"
          disabled
          className="h-[100px] w-[100px]"
        />
      </div>
    </div>
  )
}
