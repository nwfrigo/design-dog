import { Suspense } from 'react'
import { WebsiteThumbnailRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { EbookVariant } from '@/components/templates/WebsiteThumbnail'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'EBOOK')
  const headline = parseString(searchParams, 'headline', 'Lightweight header.')
  const subhead = parseString(searchParams, 'subhead', '')
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = parseString(searchParams, 'solution', 'environmental')
  const variant = parseEnum(searchParams, 'variant', 'image') as EbookVariant
  const imageUrl = parseString(searchParams, 'imageUrl', '/assets/images/safer_is_stronger_sample_page.png')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubhead: default FALSE — subhead is hidden by default in website-thumbnail
  const showSubhead = parseBoolFalse(searchParams, 'showSubhead')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const logoColor = parseEnum<'black' | 'orange'>(searchParams, 'logoColor', 'black')
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 800,
      height: 450,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#F9F9F9',
    }}>
      <Suspense fallback={<div style={{ width: 800, height: 450, background: '#F9F9F9' }}>Loading...</div>}>
        <WebsiteThumbnailRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          cta={cta}
          solution={solution}
          variant={variant}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          showCta={showCta}
          logoColor={logoColor}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
