'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to convert an image to grayscale using canvas.
 * Returns a data URL of the grayscale image, or null if not ready/applicable.
 *
 * Uses canvas compositing for high-quality grayscale conversion that works
 * correctly with Puppeteer export (CSS filters don't always export properly).
 *
 * @param imageUrl - Source image URL
 * @param enabled - Whether grayscale conversion is enabled
 * @returns Grayscale image data URL, or null
 */
export function useGrayscaleImage(imageUrl: string | undefined, enabled: boolean): string | null {
  const [grayscaleImageUrl, setGrayscaleImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl || !enabled) {
      setGrayscaleImageUrl(null)
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
        // Draw original image
        ctx.drawImage(img, 0, 0)
        // Apply grayscale via saturation composite
        ctx.globalCompositeOperation = 'saturation'
        ctx.fillStyle = 'hsl(0, 0%, 50%)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // Convert to data URL
        setGrayscaleImageUrl(canvas.toDataURL('image/jpeg', 0.9))
      }
    }

    img.onerror = () => setGrayscaleImageUrl(null)
    img.src = imageUrl
  }, [imageUrl, enabled])

  return grayscaleImageUrl
}
