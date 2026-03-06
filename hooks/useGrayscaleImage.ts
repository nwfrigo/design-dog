'use client'

import { useState, useEffect } from 'react'

/**
 * Converts an image to grayscale using canvas compositing.
 *
 * Returns the grayscale data-URL when `grayscale` is true and the image has
 * loaded, or `null` otherwise.  Consumers should use the return value as the
 * image `src` (falling back to the original URL) and apply
 * `filter: grayscale(100%)` as a CSS fallback while the canvas processes:
 *
 * ```tsx
 * const grayscaleUrl = useGrayscaleImage(imageUrl, grayscale)
 *
 * <img
 *   src={grayscaleUrl || imageUrl}
 *   style={{ filter: grayscale ? (grayscaleUrl ? 'none' : 'grayscale(100%)') : 'none' }}
 * />
 * ```
 *
 * For templates that gate grayscale on additional conditions (e.g. variant,
 * imageSize), fold those into the `grayscale` argument at the call site:
 *
 * ```tsx
 * const grayscaleUrl = useGrayscaleImage(imageUrl, grayscale && variant === 'image')
 * ```
 */
export function useGrayscaleImage(
  imageUrl: string | null | undefined,
  grayscale: boolean,
): string | null {
  const [grayscaleUrl, setGrayscaleUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl || !grayscale) {
      setGrayscaleUrl(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        ctx.globalCompositeOperation = 'saturation'
        ctx.fillStyle = 'hsl(0, 0%, 50%)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setGrayscaleUrl(canvas.toDataURL('image/jpeg', 0.9))
      }
    }
    img.onerror = () => setGrayscaleUrl(null)
    img.src = imageUrl
  }, [imageUrl, grayscale])

  return grayscaleUrl
}
