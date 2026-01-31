import { Suspense } from 'react'
import { EmailImageRender } from './render-content'
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
  const headline = (searchParams.headline as string) || 'Headline'
  const body = (searchParams.body as string) || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'
  const ctaText = (searchParams.ctaText as string) || 'Responsive'
  const imageUrl = (searchParams.imageUrl as string) || '/assets/images/email-image-placeholder.png'
  const layout = ((searchParams.layout as string) || 'even') as 'even' | 'more-image' | 'more-text'
  const solution = (searchParams.solution as string) || 'environmental'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'
  const showBody = searchParams.showBody !== 'false'
  const showCta = searchParams.showCta !== 'false'
  const showSolutionSet = searchParams.showSolutionSet !== 'false'

  return (
    <div style={{
      width: 640,
      height: 300,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 300, background: '#ffffff' }}>Loading...</div>}>
        <EmailImageRender
          headline={headline}
          body={body}
          ctaText={ctaText}
          imageUrl={imageUrl}
          layout={layout}
          solution={solution}
          logoColor={logoColor}
          showBody={showBody}
          showCta={showCta}
          showSolutionSet={showSolutionSet}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
