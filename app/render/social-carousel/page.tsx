import { Suspense } from 'react'
import { SocialCarouselRenderSingle, SocialCarouselRenderAll } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide, CarouselSlideType, CarouselBackgroundStyle } from '@/types'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined, parseStringOrNull } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const logoColor = parseEnum<'orange' | 'white'>(searchParams, 'logoColor', 'white')
  const page = searchParams.page as string | undefined

  // All slides mode -- slidesData is a JSON array of CarouselSlide[]
  if (page === 'all') {
    const slidesDataRaw = parseString(searchParams, 'slidesData', '[]')
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

  // Single slide mode -- individual params
  const headlineFontSizeRaw = parseNumberOrUndefined(searchParams, 'headlineFontSize')
  const slide: CarouselSlide = {
    id: parseString(searchParams, 'slideId', 'render'),
    slideType: parseEnum(searchParams, 'slideType', 'cover-text') as CarouselSlideType,
    backgroundStyle: parseEnum(searchParams, 'backgroundStyle', '1') as CarouselBackgroundStyle,
    eyebrow: parseString(searchParams, 'eyebrow', ''),
    headline: parseString(searchParams, 'headline', 'Headline'),
    subhead: parseString(searchParams, 'subhead', ''),
    body: parseString(searchParams, 'body', ''),
    metadata: parseString(searchParams, 'metadata', ''),
    ctaText: parseString(searchParams, 'ctaText', ''),
    showEyebrow: parseBoolTrue(searchParams, 'showEyebrow'),
    showHeadline: parseBoolTrue(searchParams, 'showHeadline'),
    showSubhead: parseBoolTrue(searchParams, 'showSubhead'),
    showBody: parseBoolTrue(searchParams, 'showBody'),
    showMetadata: parseBoolTrue(searchParams, 'showMetadata'),
    showCta: parseBoolTrue(searchParams, 'showCta'),
    headlineFontSize: headlineFontSizeRaw !== undefined ? headlineFontSizeRaw : null,
    imageUrl: parseStringOrNull(searchParams, 'imageUrl'),
    imagePosition: {
      x: parseNumber(searchParams, 'imagePositionX', 0),
      y: parseNumber(searchParams, 'imagePositionY', 0),
    },
    imageZoom: parseNumber(searchParams, 'imageZoom', 1),
    grayscale: parseBoolFalse(searchParams, 'grayscale'),
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
