'use client'

import { WebsiteFloatingBannerMobile, FloatingBannerMobileVariant, FloatingBannerMobileArrowType } from '@/components/templates/WebsiteFloatingBannerMobile'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchColorsConfig, fetchTypographyConfig, ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { fromURLSearchParams, parseString, parseEnum, parseBoolTrue, parseNumberOrUndefined } from '@/lib/render-params'

export function RenderContent() {
  const rawParams = useSearchParams()
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

  const searchParams = fromURLSearchParams(rawParams)
  const eyebrow = parseString(searchParams, 'eyebrow', 'Eyebrow')
  const headline = parseString(searchParams, 'headline', 'Headline')
  const cta = parseString(searchParams, 'cta', 'Learn More')
  // showEyebrow: default TRUE — consistent with other banner templates
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const variant = parseEnum(searchParams, 'variant', 'light') as FloatingBannerMobileVariant
  const arrowType = parseEnum(searchParams, 'arrowType', 'text') as FloatingBannerMobileArrowType
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <WebsiteFloatingBannerMobile
        eyebrow={eyebrow}
        headline={headline}
        cta={cta}
        showEyebrow={showEyebrow}
        showHeadline={showHeadline}
        variant={variant}
        arrowType={arrowType}
        headlineFontSize={headlineFontSize}
        colors={colorsConfig}
        typography={typographyConfig}
        scale={1}
      />
    </>
  )
}
