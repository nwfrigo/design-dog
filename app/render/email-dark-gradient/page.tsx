import { Suspense } from 'react'
import { EmailDarkGradientRender } from './render-content'
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
  const headline = parseString(searchParams, 'headline', 'Headline')
  const eyebrow = parseString(searchParams, 'eyebrow', '')
  const subheading = parseString(searchParams, 'subheading', '')
  const body = parseString(searchParams, 'body', '')
  const ctaText = parseString(searchParams, 'ctaText', 'Responsive')
  const colorStyle = parseEnum<'1' | '2' | '3' | '4'>(searchParams, 'colorStyle', '1')
  const alignment = parseEnum<'left' | 'center'>(searchParams, 'alignment', 'left')
  const ctaStyle = parseEnum<'link' | 'button'>(searchParams, 'ctaStyle', 'link')
  // showEyebrow: default FALSE — eyebrow is hidden by default in email-dark-gradient
  const showEyebrow = parseBoolFalse(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubheading: default FALSE — subheading is hidden by default
  const showSubheading = parseBoolFalse(searchParams, 'showSubheading')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 640,
      height: 300,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#000000',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 300, background: '#000000' }}>Loading...</div>}>
        <EmailDarkGradientRender
          headline={headline}
          eyebrow={eyebrow}
          subheading={subheading}
          body={body}
          ctaText={ctaText}
          colorStyle={colorStyle}
          alignment={alignment}
          ctaStyle={ctaStyle}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubheading={showSubheading}
          showBody={showBody}
          showCta={showCta}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
