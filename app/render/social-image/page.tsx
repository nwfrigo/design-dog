import { Suspense } from 'react'
import { SocialImageRender } from './render-content'
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
  const headline = (searchParams.headline as string) || 'Headline'
  const subhead = (searchParams.subhead as string) || ''
  const metadata = (searchParams.metadata as string) || 'Day / Month | 00:00'
  const ctaText = (searchParams.ctaText as string) || 'Learn More'
  const imageUrl = (searchParams.imageUrl as string) || '/assets/images/default_placeholder_image_1.png'
  const imagePositionX = parseFloat((searchParams.imagePositionX as string) || '0')
  const imagePositionY = parseFloat((searchParams.imagePositionY as string) || '0')
  const imageZoom = parseFloat((searchParams.imageZoom as string) || '1')
  const layout = ((searchParams.layout as string) || 'even') as 'even' | 'more-image' | 'more-text'
  const solution = (searchParams.solution as string) || 'environmental'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'
  const showSubhead = searchParams.showSubhead !== 'false'
  const showMetadata = searchParams.showMetadata !== 'false'
  const showCta = searchParams.showCta !== 'false'
  const showSolutionSet = searchParams.showSolutionSet !== 'false'
  const grayscale = searchParams.grayscale === 'true'

  return (
    <div style={{
      width: 1200,
      height: 628,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 1200, height: 628, background: '#ffffff' }}>Loading...</div>}>
        <SocialImageRender
          headline={headline}
          subhead={subhead}
          metadata={metadata}
          ctaText={ctaText}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          layout={layout}
          solution={solution}
          logoColor={logoColor}
          showSubhead={showSubhead}
          showMetadata={showMetadata}
          showCta={showCta}
          showSolutionSet={showSolutionSet}
          grayscale={grayscale}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
