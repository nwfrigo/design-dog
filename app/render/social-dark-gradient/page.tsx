'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import type { ColorStyle, HeadingSize, Alignment, CtaStyle } from '@/components/templates/SocialDarkGradient'
import {
  fetchColorsConfig,
  fetchTypographyConfig,
  type ColorsConfig,
  type TypographyConfig
} from '@/lib/brand-config'

function RenderContent() {
  const searchParams = useSearchParams()
  const [colorsConfig, setColorsConfig] = useState<ColorsConfig | null>(null)
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig | null>(null)
  const [ready, setReady] = useState(false)

  // Parse params
  const eyebrow = searchParams.get('eyebrow') || 'Eyebrow'
  const headline = searchParams.get('headline') || 'Room for a great headline.'
  const subhead = searchParams.get('subhead') || ''
  const body = searchParams.get('body') || ''
  const metadata = searchParams.get('metadata') || 'Day / Month | 00:00'
  const ctaText = searchParams.get('ctaText') || 'Responsive'
  const colorStyle = (searchParams.get('colorStyle') || '1') as ColorStyle
  const headingSize = (searchParams.get('headingSize') || 'L') as HeadingSize
  const alignment = (searchParams.get('alignment') || 'left') as Alignment
  const ctaStyle = (searchParams.get('ctaStyle') || 'link') as CtaStyle
  const logoColor = (searchParams.get('logoColor') || 'white') as 'orange' | 'white'
  const showEyebrow = searchParams.get('showEyebrow') !== 'false'
  const showSubhead = searchParams.get('showSubhead') !== 'false'
  const showBody = searchParams.get('showBody') !== 'false'
  const showMetadata = searchParams.get('showMetadata') !== 'false'
  const showCta = searchParams.get('showCta') !== 'false'

  useEffect(() => {
    async function loadConfig() {
      const [colors, typography] = await Promise.all([
        fetchColorsConfig(),
        fetchTypographyConfig(),
      ])
      setColorsConfig(colors)
      setTypographyConfig(typography)
      // Signal ready after a short delay for fonts to load
      setTimeout(() => setReady(true), 500)
    }
    loadConfig()
  }, [])

  if (!colorsConfig || !typographyConfig) {
    return <div>Loading...</div>
  }

  return (
    <>
      {/* Hidden ready signal for Puppeteer */}
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <SocialDarkGradient
        eyebrow={eyebrow}
        headline={headline}
        subhead={subhead}
        body={body}
        metadata={metadata}
        ctaText={ctaText}
        colorStyle={colorStyle}
        headingSize={headingSize}
        alignment={alignment}
        ctaStyle={ctaStyle}
        logoColor={logoColor}
        showEyebrow={showEyebrow}
        showSubhead={showSubhead}
        showBody={showBody}
        showMetadata={showMetadata}
        showCta={showCta}
        colors={colorsConfig}
        typography={typographyConfig}
        scale={1}
      />
    </>
  )
}

export default function RenderPage() {
  return (
    <div style={{
      width: 1200,
      height: 628,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#000000',
    }}>
      <Suspense fallback={<div style={{ width: 1200, height: 628, background: '#000000' }}>Loading...</div>}>
        <RenderContent />
      </Suspense>
    </div>
  )
}
