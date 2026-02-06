import { Suspense } from 'react'
import { NewsletterTopBannerRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'Month | Year'
  const headline = (searchParams.headline as string) || 'EHS+ Newsletter'
  const subhead = (searchParams.subhead as string) || ''
  const variant = ((searchParams.variant as string) || 'dark') as 'dark' | 'light'
  const showSubhead = searchParams.showSubhead === 'true'

  return (
    <div style={{
      width: 600,
      height: 240,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: variant === 'dark' ? '#060015' : '#FFFFFF',
    }}>
      <Suspense fallback={<div style={{ width: 600, height: 240, background: variant === 'dark' ? '#060015' : '#FFFFFF' }}>Loading...</div>}>
        <NewsletterTopBannerRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          variant={variant}
          showSubhead={showSubhead}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
