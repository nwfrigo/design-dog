'use client'

import { useEffect, useState } from 'react'
import { WebsitePressRelease } from '@/components/templates/WebsitePressRelease'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  logoColor: 'black' | 'orange'
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsitePressReleaseRender(props: Props) {
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
      <WebsitePressRelease
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        body={props.body}
        cta={props.cta}
        solution={props.solution}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showBody={props.showBody}
        showCta={props.showCta}
        logoColor={props.logoColor}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
