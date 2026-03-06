import { Suspense } from 'react'
import { SocialGridDetailRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { GridDetailRow } from '@/components/templates/SocialGridDetail'
import { parseString, parseEnum, parseBoolTrue, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headline = parseString(searchParams, 'headline', 'Headline')
  const subhead = parseString(searchParams, 'subhead', 'This is your subheader or description text. Keep it to two lines if you can.')
  const eyebrow = parseString(searchParams, 'eyebrow', "Don't miss this.")
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showSubhead = parseBoolTrue(searchParams, 'showSubhead')
  const showSolutionSet = parseBoolTrue(searchParams, 'showSolutionSet')
  const solution = parseString(searchParams, 'solution', 'environmental')
  const logoColor = parseEnum<'black' | 'orange'>(searchParams, 'logoColor', 'black')
  const showRow3 = parseBoolTrue(searchParams, 'showRow3')
  const showRow4 = parseBoolTrue(searchParams, 'showRow4')

  // Grid details
  const gridDetail1Text = parseString(searchParams, 'gridDetail1Text', 'Date: January 1st, 2026')
  const gridDetail2Text = parseString(searchParams, 'gridDetail2Text', 'Time: Midnight, EST')
  const gridDetail3Text = parseString(searchParams, 'gridDetail3Text', 'Place: Wherever')
  const gridDetail3Type = parseEnum<'data' | 'cta'>(searchParams, 'gridDetail3Type', 'data')
  const gridDetail4Text = parseString(searchParams, 'gridDetail4Text', 'Join the event')
  const gridDetail4Type = parseEnum<'data' | 'cta'>(searchParams, 'gridDetail4Type', 'cta')

  const gridDetail1: GridDetailRow = { type: 'data', text: gridDetail1Text }
  const gridDetail2: GridDetailRow = { type: 'data', text: gridDetail2Text }
  const gridDetail3: GridDetailRow = { type: gridDetail3Type, text: gridDetail3Text }
  const gridDetail4: GridDetailRow = { type: gridDetail4Type, text: gridDetail4Text }
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

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
          showHeadline={showHeadline}
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
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
