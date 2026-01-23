'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { WebsiteThumbnail } from '@/components/templates/WebsiteThumbnail'
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
  const headline = searchParams.get('headline') || 'Your headline here'
  const subhead = searchParams.get('subhead') || ''
  const body = searchParams.get('body') || ''
  const solution = searchParams.get('solution') || 'environmental'
  const imageUrl = searchParams.get('imageUrl') || '/placeholder-mountain.jpg'
  const showEyebrow = searchParams.get('showEyebrow') !== 'false'
  const showSubhead = searchParams.get('showSubhead') !== 'false'
  const showBody = searchParams.get('showBody') !== 'false'
  const logoColor = (searchParams.get('logoColor') || 'black') as 'black' | 'orange'

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
      <WebsiteThumbnail
        eyebrow={eyebrow}
        headline={headline}
        subhead={subhead}
        body={body}
        solution={solution}
        imageUrl={imageUrl}
        showEyebrow={showEyebrow}
        showSubhead={showSubhead}
        showBody={showBody}
        logoColor={logoColor}
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
      width: 700,
      height: 434,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 700, height: 434, background: '#ffffff' }}>Loading...</div>}>
        <RenderContent />
      </Suspense>
    </div>
  )
}
