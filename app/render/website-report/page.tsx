import { Suspense } from 'react'
import { WebsiteReportRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { ReportVariant } from '@/components/templates/WebsiteReport'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = parseString(searchParams, 'eyebrow', 'REPORT')
  const headline = parseString(searchParams, 'headline', 'Lightweight header.')
  const subhead = parseString(searchParams, 'subhead', '')
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = parseString(searchParams, 'solution', 'safety')
  const variant = parseEnum(searchParams, 'variant', 'image') as ReportVariant
  const imageUrl = parseString(searchParams, 'imageUrl', '/assets/images/default_placeholder_image_report.png')
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubhead: default FALSE — subhead is hidden by default in website-report
  const showSubhead = parseBoolFalse(searchParams, 'showSubhead')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 800,
      height: 450,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#060015',
    }}>
      <Suspense fallback={<div style={{ width: 800, height: 450, background: '#060015' }}>Loading...</div>}>
        <WebsiteReportRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          cta={cta}
          solution={solution}
          variant={variant}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          showCta={showCta}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
