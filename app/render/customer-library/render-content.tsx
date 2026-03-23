'use client'

import { useEffect, useState } from 'react'
import { CustomerLibrary, type CustomerLibraryVariant } from '@/components/templates/CustomerLibrary'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

interface Props {
  headline: string
  eyebrow: string
  body: string
  footerText: string
  variant: CustomerLibraryVariant
  qrCodeUrl?: string
  hasQrCode?: boolean
  showHeadline: boolean
  showEyebrow: boolean
  showBody: boolean
  showFooterText: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
}

export function CustomerLibraryRender(props: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const waitForFonts = async () => {
      try {
        await document.fonts.ready
        setTimeout(() => setReady(true), 100)
      } catch {
        setTimeout(() => setReady(true), 500)
      }
    }
    waitForFonts()
  }, [])

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}
      <CustomerLibrary
        headline={props.headline}
        eyebrow={props.eyebrow}
        body={props.body}
        footerText={props.footerText}
        variant={props.variant}
        qrCodeUrl={props.qrCodeUrl}
        hasQrCode={props.hasQrCode}
        showHeadline={props.showHeadline}
        showEyebrow={props.showEyebrow}
        showBody={props.showBody}
        showFooterText={props.showFooterText}
        headlineFontSize={props.headlineFontSize}
        colors={props.colors}
        typography={props.typography}
        scale={1}
      />
    </>
  )
}
