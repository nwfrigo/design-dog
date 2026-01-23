'use client'

import { useEffect, useState } from 'react'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  metadata: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  headingSize: 'S' | 'M' | 'L'
  alignment: 'left' | 'center'
  ctaStyle: 'link' | 'button'
  logoColor: 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showMetadata: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function SocialDarkGradientRender(props: Props) {
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
      <SocialDarkGradient
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        body={props.body}
        metadata={props.metadata}
        ctaText={props.ctaText}
        colorStyle={props.colorStyle}
        headingSize={props.headingSize}
        alignment={props.alignment}
        ctaStyle={props.ctaStyle}
        logoColor={props.logoColor}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showBody={props.showBody}
        showMetadata={props.showMetadata}
        showCta={props.showCta}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
