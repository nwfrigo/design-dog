import { Suspense } from 'react'
import { WebsiteEventListingRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseBoolTrue, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'LIVE EVENT')
  const headline = parseString(searchParams, 'headline', 'Headline')
  const subhead = parseString(searchParams, 'subhead', 'This is your subheader or description text. Keep it to two lines if you can.')
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const variant = parseEnum<'orange' | 'light' | 'dark-gradient'>(searchParams, 'variant', 'orange')
  const gridDetail1Text = parseString(searchParams, 'gridDetail1Text', 'Add Details or Hide Me')
  const gridDetail2Text = parseString(searchParams, 'gridDetail2Text', 'Add Details or Hide Me')
  const gridDetail3Text = parseString(searchParams, 'gridDetail3Text', 'Add Details or Hide Me')
  const gridDetail4Text = parseString(searchParams, 'gridDetail4Text', 'Add Details or Hide Me')
  const showRow3 = parseBoolTrue(searchParams, 'showRow3')
  const showRow4 = parseBoolTrue(searchParams, 'showRow4')
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showSubhead = parseBoolTrue(searchParams, 'showSubhead')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

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
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
