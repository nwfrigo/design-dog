import { Suspense } from 'react'
import { EmailDarkGradientRender } from './render-content'
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
  const headline = (searchParams.headline as string) || 'Lightweight header.'
  const eyebrow = (searchParams.eyebrow as string) || ''
  const subheading = (searchParams.subheading as string) || ''
  const body = (searchParams.body as string) || ''
  const ctaText = (searchParams.ctaText as string) || 'Responsive'
  const colorStyle = ((searchParams.colorStyle as string) || '1') as '1' | '2' | '3' | '4'
  const alignment = ((searchParams.alignment as string) || 'left') as 'left' | 'center'
  const ctaStyle = ((searchParams.ctaStyle as string) || 'link') as 'link' | 'button'
  const showEyebrow = searchParams.showEyebrow === 'true'
  const showSubheading = searchParams.showSubheading === 'true'
  const showBody = searchParams.showBody !== 'false'
  const showCta = searchParams.showCta !== 'false'

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
          showSubheading={showSubheading}
          showBody={showBody}
          showCta={showCta}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
