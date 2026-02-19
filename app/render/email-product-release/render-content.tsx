'use client'

import { useEffect, useState } from 'react'
import { EmailProductRelease } from '@/components/templates/EmailProductRelease'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  colors: ColorsConfig
  typography: TypographyConfig
}

export function EmailProductReleaseRender(props: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for fonts to load before signaling ready
    const waitForFonts = async () => {
      try {
        await document.fonts.ready
        // Small additional delay for rendering
        setTimeout(() => setReady(true), 100)
      } catch {
        // Fallback timeout if fonts API fails
        setTimeout(() => setReady(true), 500)
      }
    }
    waitForFonts()
  }, [])

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <EmailProductRelease
        eyebrow={props.eyebrow}
        headline={props.headline}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
