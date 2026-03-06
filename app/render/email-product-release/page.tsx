import { Suspense } from 'react'
import { EmailProductReleaseRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseNumber, parseBoolFalse } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'Product Release')
  const headline = parseString(searchParams, 'headline', 'GX2 2026.1')
  const imageUrl = parseString(searchParams, 'imageUrl', '/assets/images/default_placeholder_image_1.png')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const grayscale = parseBoolFalse(searchParams, 'grayscale')

  return (
    <div style={{
      width: 640,
      height: 164,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#F9F9F9',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 164, background: '#F9F9F9' }}>Loading...</div>}>
        <EmailProductReleaseRender
          eyebrow={eyebrow}
          headline={headline}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          grayscale={grayscale}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
