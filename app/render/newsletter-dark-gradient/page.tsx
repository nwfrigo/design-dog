import { Suspense } from 'react'
import { NewsletterDarkGradientRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined, parseStringOrNull } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'EYEBROW')
  const headline = parseString(searchParams, 'headline', 'Headline')
  const body = parseString(searchParams, 'body', '')
  const ctaText = parseString(searchParams, 'ctaText', 'Responsive')
  const colorStyle = parseEnum<'1' | '2' | '3' | '4'>(searchParams, 'colorStyle', '1')
  const imageSize = parseEnum<'none' | 'small' | 'large'>(searchParams, 'imageSize', 'none')
  const imageUrl = parseStringOrNull(searchParams, 'imageUrl')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 640,
      height: 179,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#000000',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 179, background: '#000000' }}>Loading...</div>}>
        <NewsletterDarkGradientRender
          eyebrow={eyebrow}
          headline={headline}
          body={body}
          ctaText={ctaText}
          colorStyle={colorStyle}
          imageSize={imageSize}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showBody={showBody}
          showCta={showCta}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
