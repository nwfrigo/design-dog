import { Suspense } from 'react'
import { NewsletterBlueGradientRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'EYEBROW'
  const headline = (searchParams.headline as string) || 'Headline'
  const body = (searchParams.body as string) || ''
  const ctaText = (searchParams.ctaText as string) || 'Responsive'
  const colorStyle = ((searchParams.colorStyle as string) || '1') as '1' | '2' | '3' | '4'
  const imageSize = ((searchParams.imageSize as string) || 'none') as 'none' | 'small' | 'large'
  const imageUrl = (searchParams.imageUrl as string) || null
  const imagePositionX = parseFloat((searchParams.imagePositionX as string) || '0')
  const imagePositionY = parseFloat((searchParams.imagePositionY as string) || '0')
  const imageZoom = parseFloat((searchParams.imageZoom as string) || '1')
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showBody = searchParams.showBody !== 'false'
  const showCta = searchParams.showCta !== 'false'

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
        <NewsletterBlueGradientRender
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
          showBody={showBody}
          showCta={showCta}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
