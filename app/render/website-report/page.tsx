import { Suspense } from 'react'
import { WebsiteReportRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { ReportVariant } from '@/components/templates/WebsiteReport'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const eyebrow = (searchParams.eyebrow as string) || 'REPORT'
  const headline = (searchParams.headline as string) || 'Lightweight header.'
  const subhead = (searchParams.subhead as string) || ''
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = (searchParams.solution as string) || 'safety'
  const variant = ((searchParams.variant as string) || 'image') as ReportVariant
  const imageUrl = (searchParams.imageUrl as string) || '/assets/images/default_placeholder_image_report.png'
  const imagePositionX = parseFloat((searchParams.imagePositionX as string) || '0')
  const imagePositionY = parseFloat((searchParams.imagePositionY as string) || '0')
  const imageZoom = parseFloat((searchParams.imageZoom as string) || '1')
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead === 'true'
  const showCta = searchParams.showCta !== 'false'
  const grayscale = searchParams.grayscale === 'true'

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
          showSubhead={showSubhead}
          showCta={showCta}
          grayscale={grayscale}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
