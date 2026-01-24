import { Suspense } from 'react'
import { SocialGridDetailRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { GridDetailRow } from '@/components/templates/SocialGridDetail'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headline = (searchParams.headline as string) || 'Room for a great headline.'
  const subhead = (searchParams.subhead as string) || 'This is your subheader or description text. Keep it to two lines if you can.'
  const eyebrow = (searchParams.eyebrow as string) || "Don't miss this."
  const showEyebrow = searchParams.showEyebrow !== 'false'
  const showSubhead = searchParams.showSubhead !== 'false'
  const showSolutionSet = searchParams.showSolutionSet !== 'false'
  const solution = (searchParams.solution as string) || 'environmental'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'
  const showRow3 = searchParams.showRow3 !== 'false'
  const showRow4 = searchParams.showRow4 !== 'false'

  // Grid details
  const gridDetail1Text = (searchParams.gridDetail1Text as string) || 'Date: January 1st, 2026'
  const gridDetail2Text = (searchParams.gridDetail2Text as string) || 'Time: Midnight, EST'
  const gridDetail3Text = (searchParams.gridDetail3Text as string) || 'Place: Wherever'
  const gridDetail3Type = ((searchParams.gridDetail3Type as string) || 'data') as 'data' | 'cta'
  const gridDetail4Text = (searchParams.gridDetail4Text as string) || 'Join the event'
  const gridDetail4Type = ((searchParams.gridDetail4Type as string) || 'cta') as 'data' | 'cta'

  const gridDetail1: GridDetailRow = { type: 'data', text: gridDetail1Text }
  const gridDetail2: GridDetailRow = { type: 'data', text: gridDetail2Text }
  const gridDetail3: GridDetailRow = { type: gridDetail3Type, text: gridDetail3Text }
  const gridDetail4: GridDetailRow = { type: gridDetail4Type, text: gridDetail4Text }

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
        <SocialGridDetailRender
          headline={headline}
          subhead={subhead}
          eyebrow={eyebrow}
          showEyebrow={showEyebrow}
          showSubhead={showSubhead}
          showSolutionSet={showSolutionSet}
          solution={solution}
          logoColor={logoColor}
          showRow3={showRow3}
          showRow4={showRow4}
          gridDetail1={gridDetail1}
          gridDetail2={gridDetail2}
          gridDetail3={gridDetail3}
          gridDetail4={gridDetail4}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
