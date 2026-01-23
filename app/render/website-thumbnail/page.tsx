import { Suspense } from 'react'
import { WebsiteThumbnailRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'Eyebrow'
  const headline = (searchParams.headline as string) || 'Your headline here'
  const subhead = (searchParams.subhead as string) || ''
  const body = (searchParams.body as string) || ''
  const solution = (searchParams.solution as string) || 'environmental'
  const imageUrl = (searchParams.imageUrl as string) || '/placeholder-mountain.jpg'
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead !== 'false'
  const showBody = searchParams.showBody !== 'false'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'

  return (
    <div style={{
      width: 700,
      height: 434,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 700, height: 434, background: '#ffffff' }}>Loading...</div>}>
        <WebsiteThumbnailRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          body={body}
          solution={solution}
          imageUrl={imageUrl}
          showEyebrow={showEyebrow}
          showSubhead={showSubhead}
          showBody={showBody}
          logoColor={logoColor}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
