'use client'

import { useEffect, useState } from 'react'
import { SocialGridDetail, type GridDetailRow } from '@/components/templates/SocialGridDetail'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  subhead: string
  eyebrow: string
  showEyebrow: boolean
  showSubhead: boolean
  showSolutionSet: boolean
  solution: string
  logoColor: 'black' | 'orange'
  showRow3: boolean
  showRow4: boolean
  gridDetail1: GridDetailRow
  gridDetail2: GridDetailRow
  gridDetail3: GridDetailRow
  gridDetail4: GridDetailRow
  colors: ColorsConfig
  typography: TypographyConfig
}

export function SocialGridDetailRender(props: Props) {
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
      <SocialGridDetail
        headline={props.headline}
        subhead={props.subhead}
        eyebrow={props.eyebrow}
        showEyebrow={props.showEyebrow}
        showSubhead={props.showSubhead}
        showSolutionSet={props.showSolutionSet}
        solution={props.solution}
        logoColor={props.logoColor}
        showRow3={props.showRow3}
        showRow4={props.showRow4}
        gridDetail1={props.gridDetail1}
        gridDetail2={props.gridDetail2}
        gridDetail3={props.gridDetail3}
        gridDetail4={props.gridDetail4}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
