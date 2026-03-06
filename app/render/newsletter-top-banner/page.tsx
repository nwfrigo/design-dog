import { Suspense } from 'react'
import { NewsletterTopBannerRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseBoolTrue, parseBoolFalse } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'Month | Year')
  const headline = parseString(searchParams, 'headline', 'EHS+ Newsletter')
  const subhead = parseString(searchParams, 'subhead', '')
  const variant = parseEnum<'dark' | 'light'>(searchParams, 'variant', 'dark')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubhead: default FALSE — subhead is hidden by default in newsletter-top-banner
  const showSubhead = parseBoolFalse(searchParams, 'showSubhead')

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
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
