import { Suspense } from 'react'
import { WebsiteFloatingBannerRender } from './render-content'
import { FloatingBannerVariant } from '@/components/templates/WebsiteFloatingBanner'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', '')
  const headline = parseString(searchParams, 'headline', 'Headline')
  const cta = (searchParams.cta as string) || (searchParams.ctaText as string) || 'Learn More'
  // showEyebrow: default FALSE — eyebrow is hidden by default in floating banner
  const showEyebrow = parseBoolFalse(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const variant = parseEnum(searchParams, 'variant', 'dark') as FloatingBannerVariant
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

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
