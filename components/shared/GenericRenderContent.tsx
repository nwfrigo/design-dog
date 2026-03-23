'use client'

import { useEffect, useState } from 'react'

interface GenericRenderContentProps {
  Component: React.ComponentType<any>
  props: Record<string, unknown>
}

/**
 * Generic render-content wrapper that handles font-ready signaling.
 * Replaces 22 nearly-identical render-content.tsx files.
 * Puppeteer waits for the #render-ready element before taking a screenshot.
 */
export function GenericRenderContent({ Component, props }: GenericRenderContentProps) {
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
      <Component {...props} />
    </>
  )
}
