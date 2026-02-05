'use client'

import { useEffect, useState } from 'react'
import { WebsiteFloatingBanner, FloatingBannerVariant } from '@/components/templates/WebsiteFloatingBanner'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  cta: string
  showEyebrow: boolean
  variant: FloatingBannerVariant
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsiteFloatingBannerRender(props: Props) {
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
      <WebsiteFloatingBanner
        eyebrow={props.eyebrow}
        headline={props.headline}
        cta={props.cta}
        showEyebrow={props.showEyebrow}
        variant={props.variant}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
