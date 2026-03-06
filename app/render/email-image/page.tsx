import { Suspense } from 'react'
import { EmailImageRender } from './render-content'
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
  const headline = parseString(searchParams, 'headline', 'Headline')
  const body = parseString(searchParams, 'body', 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum')
  const ctaText = parseString(searchParams, 'ctaText', 'Responsive')
  const imageUrl = parseString(searchParams, 'imageUrl', '/assets/images/default_placeholder_image_1.png')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const layout = parseEnum<'even' | 'more-image' | 'more-text'>(searchParams, 'layout', 'even')
  const solution = parseString(searchParams, 'solution', 'environmental')
  const logoColor = parseEnum<'black' | 'orange'>(searchParams, 'logoColor', 'black')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const showSolutionSet = parseBoolTrue(searchParams, 'showSolutionSet')
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 640,
      height: 300,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 300, background: '#ffffff' }}>Loading...</div>}>
        <EmailImageRender
          headline={headline}
          body={body}
          ctaText={ctaText}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          layout={layout}
          solution={solution}
          logoColor={logoColor}
          showHeadline={showHeadline}
          showBody={showBody}
          showCta={showCta}
          showSolutionSet={showSolutionSet}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
