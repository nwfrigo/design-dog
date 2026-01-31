import { Suspense } from 'react'
import { EmailGridRender } from './render-content'
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
  const body = (searchParams.body as string) || 'This is your body copy. Lorem ipsum dolor sit am'
  const eyebrow = (searchParams.eyebrow as string) || ''
  const subheading = (searchParams.subheading as string) || ''
  const solution = (searchParams.solution as string) || 'environmental'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'

  const showEyebrow = searchParams.showEyebrow === 'true'
  const showLightHeader = searchParams.showLightHeader !== 'false'
  const showHeavyHeader = searchParams.showHeavyHeader === 'true'
  const showSubheading = searchParams.showSubheading === 'true'
  const showBody = searchParams.showBody !== 'false'
  const showSolutionSet = searchParams.showSolutionSet !== 'false'
  const showGridDetail2 = searchParams.showGridDetail2 !== 'false'

  const gridDetail1Type = ((searchParams.gridDetail1Type as string) || 'data') as 'data' | 'cta'
  const gridDetail1Text = (searchParams.gridDetail1Text as string) || 'Date: January 1st, 2026'
  const gridDetail2Type = ((searchParams.gridDetail2Type as string) || 'data') as 'data' | 'cta'
  const gridDetail2Text = (searchParams.gridDetail2Text as string) || 'Date: January 1st, 2026'
  const gridDetail3Type = ((searchParams.gridDetail3Type as string) || 'cta') as 'data' | 'cta'
  const gridDetail3Text = (searchParams.gridDetail3Text as string) || 'Responsive'

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
        <EmailGridRender
          headline={headline}
          body={body}
          eyebrow={eyebrow}
          subheading={subheading}
          solution={solution}
          logoColor={logoColor}
          showEyebrow={showEyebrow}
          showLightHeader={showLightHeader}
          showHeavyHeader={showHeavyHeader}
          showSubheading={showSubheading}
          showBody={showBody}
          showSolutionSet={showSolutionSet}
          showGridDetail2={showGridDetail2}
          gridDetail1Type={gridDetail1Type}
          gridDetail1Text={gridDetail1Text}
          gridDetail2Type={gridDetail2Type}
          gridDetail2Text={gridDetail2Text}
          gridDetail3Type={gridDetail3Type}
          gridDetail3Text={gridDetail3Text}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
