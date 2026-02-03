import { Suspense } from 'react'
import { WebsitePressReleaseRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'NEWS'
  const headline = (searchParams.headline as string) || 'Lightweight header.'
  const subhead = (searchParams.subhead as string) || ''
  const body = (searchParams.body as string) || ''
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = (searchParams.solution as string) || 'health'
  const imageUrl = (searchParams.imageUrl as string) || '/placeholder-mountain.jpg'
  const imagePositionX = parseFloat((searchParams.imagePositionX as string) || '0')
  const imagePositionY = parseFloat((searchParams.imagePositionY as string) || '0')
  const imageZoom = parseFloat((searchParams.imageZoom as string) || '1')
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead === 'true'
  const showBody = searchParams.showBody === 'true'
  const showCta = searchParams.showCta !== 'false'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'

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
          showSubhead={showSubhead}
          showBody={showBody}
          showCta={showCta}
          logoColor={logoColor}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
