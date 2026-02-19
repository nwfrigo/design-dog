import { Suspense } from 'react'
import { EmailProductReleaseRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse params on server
  const eyebrow = (searchParams.eyebrow as string) || 'Product Release'
  const headline = (searchParams.headline as string) || 'GX2 2026.1'
  const imageUrl = (searchParams.imageUrl as string) || '/assets/images/default_placeholder_image_1.png'
  const imagePositionX = parseFloat((searchParams.imagePositionX as string) || '0')
  const imagePositionY = parseFloat((searchParams.imagePositionY as string) || '0')
  const imageZoom = parseFloat((searchParams.imageZoom as string) || '1')

  return (
    <div style={{
      width: 640,
      height: 164,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#F1F3F4',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 164, background: '#F1F3F4' }}>Loading...</div>}>
        <EmailProductReleaseRender
          eyebrow={eyebrow}
          headline={headline}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
