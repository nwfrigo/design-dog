'use client'

import { useEffect, useState } from 'react'
import { WebsiteWebinar, type WebinarSpeakerInfo, type WebinarVariant } from '@/components/templates/WebsiteWebinar'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  variant: WebinarVariant
  imageUrl?: string
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  speakerCount: 1 | 2 | 3
  speaker1: WebinarSpeakerInfo
  speaker2: WebinarSpeakerInfo
  speaker3: WebinarSpeakerInfo
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function WebsiteWebinarRender(props: Props) {
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
      <WebsiteWebinar
        eyebrow={props.eyebrow}
        headline={props.headline}
        subhead={props.subhead}
        body={props.body}
        cta={props.cta}
        solution={props.solution}
        variant={props.variant}
        imageUrl={props.imageUrl}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showBody={props.showBody}
        showCta={props.showCta}
        speakerCount={props.speakerCount}
        speaker1={props.speaker1}
        speaker2={props.speaker2}
        speaker3={props.speaker3}
        showSpeaker1={props.showSpeaker1}
        showSpeaker2={props.showSpeaker2}
        showSpeaker3={props.showSpeaker3}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
