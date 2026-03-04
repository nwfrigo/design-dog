import { Suspense } from 'react'
import { WebsiteFloatingBannerRender } from './render-content'
import { FloatingBannerVariant } from '@/components/templates/WebsiteFloatingBanner'
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
  const eyebrow = (searchParams.eyebrow as string) || ''
  const headline = (searchParams.headline as string) || 'Headline'
  const cta = (searchParams.cta as string) || (searchParams.ctaText as string) || 'Learn More'
  const showEyebrow = searchParams.showEyebrow === 'true'
  const showHeadline = searchParams.showHeadline !== 'false'
  const variant = ((searchParams.variant as string) || 'dark') as FloatingBannerVariant
  const headlineFontSize = searchParams.headlineFontSize ? parseFloat(searchParams.headlineFontSize as string) : undefined

  return (
    <div style={{
      width: 2256,
      height: 100,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      <Suspense fallback={<div style={{ width: 2256, height: 100 }}>Loading...</div>}>
        <WebsiteFloatingBannerRender
          eyebrow={eyebrow}
          headline={headline}
          cta={cta}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          variant={variant}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
