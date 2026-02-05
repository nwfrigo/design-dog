'use client'

import { useEffect, useState } from 'react'
import { EmailImage } from '@/components/templates/EmailImage'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  body: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  layout: 'even' | 'more-image' | 'more-text'
  solution: string
  logoColor: 'black' | 'orange'
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function EmailImageRender(props: Props) {
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
      <EmailImage
        headline={props.headline}
        body={props.body}
        ctaText={props.ctaText}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        layout={props.layout}
        solution={props.solution}
        logoColor={props.logoColor}
        showBody={props.showBody}
        showCta={props.showCta}
        showSolutionSet={props.showSolutionSet}
        grayscale={props.grayscale}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
