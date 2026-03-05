'use client'

import { useEffect, useState } from 'react'
import { SocialCarousel } from '@/components/templates/SocialCarousel'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide } from '@/types'

interface SingleSlideProps {
  slide: CarouselSlide
  logoColor: 'orange' | 'white'
  colors: ColorsConfig
  typography: TypographyConfig
}

interface AllSlidesProps {
  slides: CarouselSlide[]
  logoColor: 'orange' | 'white'
  colors: ColorsConfig
  typography: TypographyConfig
}

export function SocialCarouselRenderSingle({ slide, logoColor, colors, typography }: SingleSlideProps) {
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
      <SocialCarousel
        slide={slide}
        logoColor={logoColor}
        colors={colors}
        typography={typography}
        scale={1}
      />
    </>
  )
}

export function SocialCarouselRenderAll({ slides, logoColor, colors, typography }: AllSlidesProps) {
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
      {slides.map((slide, i) => (
        <div key={slide.id || i} style={{ width: 1080, height: 1080, pageBreakAfter: 'always' }}>
          <SocialCarousel
            slide={slide}
            logoColor={logoColor}
            colors={colors}
            typography={typography}
            scale={1}
          />
        </div>
      ))}
    </>
  )
}
