'use client'

import { useState, useEffect } from 'react'
import { StackerPdf } from '@/components/templates/StackerPdf'
import type { StackerModule } from '@/types'

export interface StackerPdfRenderProps {
  modules: StackerModule[]
}

export function StackerPdfRender({ modules }: StackerPdfRenderProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for fonts to load before signaling ready
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
      <StackerPdf modules={modules} scale={1} />
    </>
  )
}
