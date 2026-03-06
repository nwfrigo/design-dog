import { Suspense } from 'react'
import { WebsitePressReleaseRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'NEWS')
  const headline = parseString(searchParams, 'headline', 'Lightweight header.')
  const subhead = parseString(searchParams, 'subhead', '')
  const body = parseString(searchParams, 'body', '')
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = parseString(searchParams, 'solution', 'health')
  const imageUrl = parseString(searchParams, 'imageUrl', '/placeholder-mountain.jpg')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubhead: default FALSE — subhead is hidden by default in website-press-release
  const showSubhead = parseBoolFalse(searchParams, 'showSubhead')
  // showBody: default FALSE — body is hidden by default in website-press-release
  const showBody = parseBoolFalse(searchParams, 'showBody')
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
        <WebsitePressReleaseRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          body={body}
          cta={cta}
          solution={solution}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          showBody={showBody}
          showCta={showCta}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          logoColor={logoColor}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
