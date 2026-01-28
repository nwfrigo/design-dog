'use client'

import { useEffect, useState } from 'react'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  eyebrow?: string
  subheading?: string
  body: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  alignment: 'left' | 'center'
  ctaStyle: 'link' | 'button'
  showEyebrow?: boolean
  showSubheading?: boolean
  showBody: boolean
  showCta: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function EmailDarkGradientRender(props: Props) {
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
      <EmailDarkGradient
        headline={props.headline}
        eyebrow={props.eyebrow}
        subheading={props.subheading}
        body={props.body}
        ctaText={props.ctaText}
        colorStyle={props.colorStyle}
        alignment={props.alignment}
        ctaStyle={props.ctaStyle}
        showEyebrow={props.showEyebrow}
        showSubheading={props.showSubheading}
        showBody={props.showBody}
        showCta={props.showCta}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
