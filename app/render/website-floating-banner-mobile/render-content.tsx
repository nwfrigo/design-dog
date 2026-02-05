'use client'

import { WebsiteFloatingBannerMobile, FloatingBannerMobileVariant, FloatingBannerMobileArrowType } from '@/components/templates/WebsiteFloatingBannerMobile'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchColorsConfig, fetchTypographyConfig, ColorsConfig, TypographyConfig } from '@/lib/brand-config'

export function RenderContent() {
  const searchParams = useSearchParams()
  const [colorsConfig, setColorsConfig] = useState<ColorsConfig | null>(null)
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([fetchColorsConfig(), fetchTypographyConfig()]).then(([colors, typography]) => {
      setColorsConfig(colors)
      setTypographyConfig(typography)
    })
  }, [])

  // Wait for fonts to load before signaling ready
  useEffect(() => {
    if (!colorsConfig || !typographyConfig) return

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
  }, [colorsConfig, typographyConfig])

  if (!colorsConfig || !typographyConfig) {
    return <div>Loading...</div>
  }

  const eyebrow = searchParams.get('eyebrow') || 'Eyebrow'
  const headline = searchParams.get('headline') || 'Headline'
  const cta = searchParams.get('cta') || 'Learn More'
  const showEyebrow = searchParams.get('showEyebrow') !== 'false'
  const variant = (searchParams.get('variant') || 'light') as FloatingBannerMobileVariant
  const arrowType = (searchParams.get('arrowType') || 'text') as FloatingBannerMobileArrowType

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <WebsiteFloatingBannerMobile
        eyebrow={eyebrow}
        headline={headline}
        cta={cta}
        showEyebrow={showEyebrow}
        variant={variant}
        arrowType={arrowType}
        colors={colorsConfig}
        typography={typographyConfig}
        scale={1}
      />
    </>
  )
}
