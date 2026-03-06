'use client'

import { useEffect, useState } from 'react'
import { SocialImageMeddbase } from '@/components/templates/SocialImageMeddbase'
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
  showHeadline?: boolean
  showSubhead: boolean
  showMetadata: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
}

export function SocialImageMeddbaseRender(props: Props) {
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
      <SocialImageMeddbase
        headline={props.headline}
        subhead={props.subhead}
        metadata={props.metadata}
        ctaText={props.ctaText}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        layout={props.layout}
        solution={props.solution}
        showHeadline={props.showHeadline}
        showSubhead={props.showSubhead}
        showMetadata={props.showMetadata}
        showCta={props.showCta}
        showSolutionSet={props.showSolutionSet}
        grayscale={props.grayscale}
        headlineFontSize={props.headlineFontSize}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
