'use client'

import { useEffect, useState } from 'react'
import { SocialImage } from '@/components/templates/SocialImage'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  subhead: string
  metadata: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  layout: 'even' | 'more-image' | 'more-text'
  solution: string
  logoColor: 'black' | 'orange'
  showSubhead: boolean
  showMetadata: boolean
  showCta: boolean
  showSolutionSet: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function SocialImageRender(props: Props) {
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
      <SocialImage
        headline={props.headline}
        subhead={props.subhead}
        metadata={props.metadata}
        ctaText={props.ctaText}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        layout={props.layout}
        solution={props.solution}
        logoColor={props.logoColor}
        showSubhead={props.showSubhead}
        showMetadata={props.showMetadata}
        showCta={props.showCta}
        showSolutionSet={props.showSolutionSet}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
