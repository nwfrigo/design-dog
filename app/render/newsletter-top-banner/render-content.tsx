'use client'

import { useEffect, useState } from 'react'
import { NewsletterTopBanner } from '@/components/templates/NewsletterTopBanner'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  variant: 'dark' | 'light'
  showSubhead: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function NewsletterTopBannerRender(props: Props) {
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
      <NewsletterTopBanner
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        variant={props.variant}
        showSubhead={props.showSubhead}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
