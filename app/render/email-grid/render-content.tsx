'use client'

import { useEffect, useState } from 'react'
import { EmailGrid } from '@/components/templates/EmailGrid'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  body: string
  eyebrow: string
  subheading: string
  solution: string
  logoColor: 'black' | 'orange'
  showEyebrow: boolean
  showLightHeader: boolean
  showHeavyHeader: boolean
  showSubheading: boolean
  showBody: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  gridDetail1Type: 'data' | 'cta'
  gridDetail1Text: string
  gridDetail2Type: 'data' | 'cta'
  gridDetail2Text: string
  gridDetail3Type: 'data' | 'cta'
  gridDetail3Text: string
  colors: ColorsConfig
  typography: TypographyConfig
}

export function EmailGridRender(props: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <EmailGrid
        headline={props.headline}
        body={props.body}
        eyebrow={props.eyebrow}
        subheading={props.subheading}
        solution={props.solution}
        logoColor={props.logoColor}
        showEyebrow={props.showEyebrow}
        showLightHeader={props.showLightHeader}
        showHeavyHeader={props.showHeavyHeader}
        showSubheading={props.showSubheading}
        showBody={props.showBody}
        showSolutionSet={props.showSolutionSet}
        showGridDetail2={props.showGridDetail2}
        gridDetail1={{ type: props.gridDetail1Type, text: props.gridDetail1Text }}
        gridDetail2={{ type: props.gridDetail2Type, text: props.gridDetail2Text }}
        gridDetail3={{ type: props.gridDetail3Type, text: props.gridDetail3Text }}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
