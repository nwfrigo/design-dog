'use client'

import { useEffect, useState } from 'react'
import { WebsiteReport, type ReportVariant } from '@/components/templates/WebsiteReport'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  solution: string
  variant: ReportVariant
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  showEyebrow: boolean
  showSubhead: boolean
  showCta: boolean
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsiteReportRender(props: Props) {
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
      <WebsiteReport
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        cta={props.cta}
        solution={props.solution}
        variant={props.variant}
        imageUrl={props.imageUrl}
        imagePosition={props.imagePosition}
        imageZoom={props.imageZoom}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showCta={props.showCta}
        grayscale={props.grayscale}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
