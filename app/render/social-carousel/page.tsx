import { Suspense } from 'react'
import { SocialCarouselRenderSingle, SocialCarouselRenderAll } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide, CarouselSlideType, CarouselBackgroundStyle } from '@/types'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const logoColor = ((searchParams.logoColor as string) || 'white') as 'orange' | 'white'
  const page = searchParams.page as string | undefined

  // All slides mode — slidesData is a JSON array of CarouselSlide[]
  if (page === 'all') {
    const slidesDataRaw = (searchParams.slidesData as string) || '[]'
    let slides: CarouselSlide[] = []
    try {
      slides = JSON.parse(decodeURIComponent(slidesDataRaw))
    } catch {
      slides = []
    }

    return (
      <div style={{ width: 1080, margin: 0, padding: 0, background: '#060015' }}>
        <Suspense fallback={<div style={{ width: 1080, height: 1080, background: '#060015' }}>Loading...</div>}>
          <SocialCarouselRenderAll
            slides={slides}
            logoColor={logoColor}
            colors={colorsConfig}
            typography={typographyConfig}
          />
        </Suspense>
      </div>
    )
  }

  // Single slide mode — individual params
  const slide: CarouselSlide = {
    id: (searchParams.slideId as string) || 'render',
    slideType: ((searchParams.slideType as string) || 'cover-text') as CarouselSlideType,
    backgroundStyle: ((searchParams.backgroundStyle as string) || '1') as CarouselBackgroundStyle,
    eyebrow: (searchParams.eyebrow as string) || '',
    headline: (searchParams.headline as string) || 'Headline',
    subhead: (searchParams.subhead as string) || '',
    body: (searchParams.body as string) || '',
    metadata: (searchParams.metadata as string) || '',
    ctaText: (searchParams.ctaText as string) || '',
    showEyebrow: searchParams.showEyebrow !== 'false',
    showHeadline: searchParams.showHeadline !== 'false',
    showSubhead: searchParams.showSubhead !== 'false',
    showBody: searchParams.showBody !== 'false',
    showMetadata: searchParams.showMetadata !== 'false',
    showCta: searchParams.showCta !== 'false',
    headlineFontSize: searchParams.headlineFontSize ? parseFloat(searchParams.headlineFontSize as string) : null,
    imageUrl: (searchParams.imageUrl as string) || null,
    imagePosition: {
      x: searchParams.imagePositionX ? parseFloat(searchParams.imagePositionX as string) : 0,
      y: searchParams.imagePositionY ? parseFloat(searchParams.imagePositionY as string) : 0,
    },
    imageZoom: searchParams.imageZoom ? parseFloat(searchParams.imageZoom as string) : 1,
    grayscale: searchParams.grayscale === 'true',
  }

  return (
    <div style={{ width: 1080, height: 1080, margin: 0, padding: 0, overflow: 'hidden', background: '#060015' }}>
      <Suspense fallback={<div style={{ width: 1080, height: 1080, background: '#060015' }}>Loading...</div>}>
        <SocialCarouselRenderSingle
          slide={slide}
          logoColor={logoColor}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
