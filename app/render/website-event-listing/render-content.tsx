'use client'

import { useEffect, useState } from 'react'
import { WebsiteEventListing, type EventListingVariant } from '@/components/templates/WebsiteEventListing'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  variant: EventListingVariant
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  showEyebrow: boolean
  showSubhead: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsiteEventListingRender(props: Props) {
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
      <WebsiteEventListing
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        cta={props.cta}
        variant={props.variant}
        gridDetail1Text={props.gridDetail1Text}
        gridDetail2Text={props.gridDetail2Text}
        gridDetail3Text={props.gridDetail3Text}
        gridDetail4Text={props.gridDetail4Text}
        showRow3={props.showRow3}
        showRow4={props.showRow4}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
