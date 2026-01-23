'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { EmailGrid, GridDetail } from '@/components/templates/EmailGrid'
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
  const headline = searchParams.get('headline') || 'Lightweight header.'
  const body = searchParams.get('body') || 'This is your body copy. Lorem ipsum dolor sit am'
  const eyebrow = searchParams.get('eyebrow') || ''
  const subheading = searchParams.get('subheading') || ''
  const solution = searchParams.get('solution') || 'environmental'
  const logoColor = (searchParams.get('logoColor') || 'black') as 'black' | 'orange'

  // Booleans
  const showEyebrow = searchParams.get('showEyebrow') === 'true'
  const showLightHeader = searchParams.get('showLightHeader') !== 'false'
  const showHeavyHeader = searchParams.get('showHeavyHeader') === 'true'
  const showSubheading = searchParams.get('showSubheading') === 'true'
  const showBody = searchParams.get('showBody') !== 'false'
  const showSolutionSet = searchParams.get('showSolutionSet') !== 'false'
  const showGridDetail2 = searchParams.get('showGridDetail2') !== 'false'

  // Grid details
  const gridDetail1: GridDetail = {
    type: (searchParams.get('gridDetail1Type') || 'data') as 'data' | 'cta',
    text: searchParams.get('gridDetail1Text') || 'Date: January 1st, 2026',
  }
  const gridDetail2: GridDetail = {
    type: (searchParams.get('gridDetail2Type') || 'data') as 'data' | 'cta',
    text: searchParams.get('gridDetail2Text') || 'Date: January 1st, 2026',
  }
  const gridDetail3: GridDetail = {
    type: (searchParams.get('gridDetail3Type') || 'cta') as 'data' | 'cta',
    text: searchParams.get('gridDetail3Text') || 'Responsive',
  }

  useEffect(() => {
    async function loadConfig() {
      const [colors, typography] = await Promise.all([
        fetchColorsConfig(),
        fetchTypographyConfig(),
      ])
      setColorsConfig(colors)
      setTypographyConfig(typography)
      setTimeout(() => setReady(true), 500)
    }
    loadConfig()
  }, [])

  if (!colorsConfig || !typographyConfig) {
    return <div>Loading...</div>
  }

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <EmailGrid
        headline={headline}
        body={body}
        eyebrow={eyebrow}
        subheading={subheading}
        showEyebrow={showEyebrow}
        showLightHeader={showLightHeader}
        showHeavyHeader={showHeavyHeader}
        showSubheading={showSubheading}
        showBody={showBody}
        showSolutionSet={showSolutionSet}
        solution={solution}
        logoColor={logoColor}
        showGridDetail2={showGridDetail2}
        gridDetail1={gridDetail1}
        gridDetail2={gridDetail2}
        gridDetail3={gridDetail3}
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
      width: 640,
      height: 300,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 300, background: '#ffffff' }}>Loading...</div>}>
        <RenderContent />
      </Suspense>
    </div>
  )
}
