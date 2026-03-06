import { Suspense } from 'react'
import { SocialDarkGradientRender } from './render-content'
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
  const eyebrow = parseString(searchParams, 'eyebrow', 'Eyebrow')
  const headline = parseString(searchParams, 'headline', 'Headline')
  const subhead = parseString(searchParams, 'subhead', '')
  const body = parseString(searchParams, 'body', '')
  const metadata = parseString(searchParams, 'metadata', 'Day / Month | 00:00')
  const ctaText = parseString(searchParams, 'ctaText', 'Responsive')
  const colorStyle = parseEnum<'1' | '2' | '3' | '4'>(searchParams, 'colorStyle', '1')
  const headingSize = parseEnum<'S' | 'M' | 'L'>(searchParams, 'headingSize', 'L')
  const alignment = parseEnum<'left' | 'center'>(searchParams, 'alignment', 'left')
  const ctaStyle = parseEnum<'link' | 'button'>(searchParams, 'ctaStyle', 'link')
  const logoColor = parseEnum<'orange' | 'white'>(searchParams, 'logoColor', 'white')
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showSubhead = parseBoolTrue(searchParams, 'showSubhead')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showMetadata = parseBoolTrue(searchParams, 'showMetadata')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 1200,
      height: 628,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#000000',
    }}>
      <Suspense fallback={<div style={{ width: 1200, height: 628, background: '#000000' }}>Loading...</div>}>
        <SocialDarkGradientRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          body={body}
          metadata={metadata}
          ctaText={ctaText}
          colorStyle={colorStyle}
          headingSize={headingSize}
          alignment={alignment}
          ctaStyle={ctaStyle}
          logoColor={logoColor}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          showBody={showBody}
          showMetadata={showMetadata}
          showCta={showCta}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
