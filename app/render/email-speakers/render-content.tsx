'use client'

import { useEffect, useState } from 'react'
import { EmailSpeakers, type SpeakerInfo } from '@/components/templates/EmailSpeakers'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  eyebrow?: string
  body: string
  ctaText: string
  solution: string
  logoColor: 'black' | 'orange'
  showEyebrow?: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  speakerCount: 1 | 2 | 3
  speaker1: SpeakerInfo
  speaker2: SpeakerInfo
  speaker3: SpeakerInfo
  grayscale?: boolean
  colors: ColorsConfig
  typography: TypographyConfig
}

export function EmailSpeakersRender(props: Props) {
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
      <EmailSpeakers
        headline={props.headline}
        eyebrow={props.eyebrow}
        body={props.body}
        ctaText={props.ctaText}
        solution={props.solution}
        logoColor={props.logoColor}
        showEyebrow={props.showEyebrow}
        showBody={props.showBody}
        showCta={props.showCta}
        showSolutionSet={props.showSolutionSet}
        speakerCount={props.speakerCount}
        speaker1={props.speaker1}
        speaker2={props.speaker2}
        speaker3={props.speaker3}
        grayscale={props.grayscale}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
