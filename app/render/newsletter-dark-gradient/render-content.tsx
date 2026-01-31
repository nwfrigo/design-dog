'use client'

import { useEffect, useState } from 'react'
import { NewsletterDarkGradient } from '@/components/templates/NewsletterDarkGradient'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  body: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  imageSize: 'none' | 'small' | 'large'
  imageUrl: string | null
  showEyebrow: boolean
  showBody: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function NewsletterDarkGradientRender(props: Props) {
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
      <NewsletterDarkGradient
        eyebrow={props.eyebrow}
        headline={props.headline}
        body={props.body}
        ctaText={props.ctaText}
        colorStyle={props.colorStyle}
        imageSize={props.imageSize}
        imageUrl={props.imageUrl}
        showEyebrow={props.showEyebrow}
        showBody={props.showBody}
        showCta={props.showCta}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
