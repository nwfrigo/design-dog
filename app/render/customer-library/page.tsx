import { Suspense } from 'react'
import { CustomerLibraryRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined, parseStringOrNull } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headline = parseString(searchParams, 'headline', 'Chemical Library')
  const eyebrow = parseString(searchParams, 'eyebrow', 'Chemical Safety Data Sheet Library')
  const body = parseString(searchParams, 'body', 'Lorem ipsum')
  const footerText = parseString(searchParams, 'footerText', 'Lorem ipsum')
  const variant = parseEnum<'orange' | 'dark' | 'light'>(searchParams, 'variant', 'dark')
  const qrCodeUrl = parseStringOrNull(searchParams, 'qrCodeUrl')
  const hasQrCode = parseBoolFalse(searchParams, 'hasQrCode')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showFooterText = parseBoolTrue(searchParams, 'showFooterText')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  const bgColor = variant === 'light' ? 'white' : variant === 'orange' ? '#D35F0B' : '#060015'

  return (
    <div style={{
      width: 590,
      height: 330,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: bgColor,
      position: 'relative',
    }}>
      <Suspense fallback={<div style={{ width: 590, height: 330, background: bgColor }}>Loading...</div>}>
        <CustomerLibraryRender
          headline={headline}
          eyebrow={eyebrow}
          body={body}
          footerText={footerText}
          variant={variant}
          qrCodeUrl={qrCodeUrl || undefined}
          hasQrCode={hasQrCode}
          showHeadline={showHeadline}
          showEyebrow={showEyebrow}
          showBody={showBody}
          showFooterText={showFooterText}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
