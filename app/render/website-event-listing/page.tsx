import { Suspense } from 'react'
import { WebsiteEventListingRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'LIVE EVENT'
  const headline = (searchParams.headline as string) || 'Headline'
  const subhead = (searchParams.subhead as string) || 'This is your subheader or description text. Keep it to two lines if you can.'
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const variant = ((searchParams.variant as string) || 'orange') as 'orange' | 'light' | 'dark-gradient'
  const gridDetail1Text = (searchParams.gridDetail1Text as string) || 'Add Details or Hide Me'
  const gridDetail2Text = (searchParams.gridDetail2Text as string) || 'Add Details or Hide Me'
  const gridDetail3Text = (searchParams.gridDetail3Text as string) || 'Add Details or Hide Me'
  const gridDetail4Text = (searchParams.gridDetail4Text as string) || 'Add Details or Hide Me'
  const showRow3 = searchParams.showRow3 !== 'false'
  const showRow4 = searchParams.showRow4 !== 'false'
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead !== 'false'

  return (
    <div style={{
      width: 800,
      height: 450,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: variant === 'light' ? '#F9F9F9' : variant === 'orange' ? '#D35F0B' : '#060015',
    }}>
      <Suspense fallback={<div style={{ width: 800, height: 450, background: variant === 'light' ? '#F9F9F9' : variant === 'orange' ? '#D35F0B' : '#060015' }}>Loading...</div>}>
        <WebsiteEventListingRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          cta={cta}
          variant={variant}
          gridDetail1Text={gridDetail1Text}
          gridDetail2Text={gridDetail2Text}
          gridDetail3Text={gridDetail3Text}
          gridDetail4Text={gridDetail4Text}
          showRow3={showRow3}
          showRow4={showRow4}
          showEyebrow={showEyebrow}
          showSubhead={showSubhead}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
