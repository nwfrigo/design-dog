import { Suspense } from 'react'
import { SocialDarkGradientRender } from './render-content'
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
  const eyebrow = (searchParams.eyebrow as string) || 'Eyebrow'
  const headline = (searchParams.headline as string) || 'Room for a great headline.'
  const subhead = (searchParams.subhead as string) || ''
  const body = (searchParams.body as string) || ''
  const metadata = (searchParams.metadata as string) || 'Day / Month | 00:00'
  const ctaText = (searchParams.ctaText as string) || 'Responsive'
  const colorStyle = ((searchParams.colorStyle as string) || '1') as '1' | '2' | '3' | '4'
  const headingSize = ((searchParams.headingSize as string) || 'L') as 'S' | 'M' | 'L'
  const alignment = ((searchParams.alignment as string) || 'left') as 'left' | 'center'
  const ctaStyle = ((searchParams.ctaStyle as string) || 'link') as 'link' | 'button'
  const logoColor = ((searchParams.logoColor as string) || 'white') as 'orange' | 'white'
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead !== 'false'
  const showBody = searchParams.showBody !== 'false'
  const showMetadata = searchParams.showMetadata !== 'false'
  const showCta = searchParams.showCta !== 'false'

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
          showSubhead={showSubhead}
          showBody={showBody}
          showMetadata={showMetadata}
          showCta={showCta}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
