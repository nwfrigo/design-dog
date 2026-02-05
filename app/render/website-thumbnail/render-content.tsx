'use client'

import { useEffect, useState } from 'react'
import { WebsiteThumbnail, type EbookVariant } from '@/components/templates/WebsiteThumbnail'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  solution: string
  variant: EbookVariant
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showSubhead: boolean
  showCta: boolean
  logoColor: 'black' | 'orange'
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsiteThumbnailRender(props: Props) {
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
      <WebsiteThumbnail
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        cta={props.cta}
        solution={props.solution}
        variant={props.variant}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showCta={props.showCta}
        logoColor={props.logoColor}
        grayscale={props.grayscale}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
