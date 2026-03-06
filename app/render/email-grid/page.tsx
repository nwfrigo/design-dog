import { Suspense } from 'react'
import { EmailGridRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headline = parseString(searchParams, 'headline', 'Headline')
  const body = parseString(searchParams, 'body', 'This is your body copy. Lorem ipsum dolor sit am')
  const eyebrow = parseString(searchParams, 'eyebrow', '')
  const subheading = parseString(searchParams, 'subheading', '')
  const solution = parseString(searchParams, 'solution', 'environmental')
  const logoColor = parseEnum<'black' | 'orange'>(searchParams, 'logoColor', 'black')

  // showEyebrow: default FALSE — eyebrow is hidden by default in email-grid
  const showEyebrow = parseBoolFalse(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showLightHeader = parseBoolTrue(searchParams, 'showLightHeader')
  // showHeavyHeader: default FALSE — heavy header is off by default
  const showHeavyHeader = parseBoolFalse(searchParams, 'showHeavyHeader')
  // showSubheading: default FALSE — subheading is hidden by default
  const showSubheading = parseBoolFalse(searchParams, 'showSubheading')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showSolutionSet = parseBoolTrue(searchParams, 'showSolutionSet')
  const showGridDetail2 = parseBoolTrue(searchParams, 'showGridDetail2')

  const gridDetail1Type = parseEnum<'data' | 'cta'>(searchParams, 'gridDetail1Type', 'data')
  const gridDetail1Text = parseString(searchParams, 'gridDetail1Text', 'Date: January 1st, 2026')
  const gridDetail2Type = parseEnum<'data' | 'cta'>(searchParams, 'gridDetail2Type', 'data')
  const gridDetail2Text = parseString(searchParams, 'gridDetail2Text', 'Date: January 1st, 2026')
  const gridDetail3Type = parseEnum<'data' | 'cta'>(searchParams, 'gridDetail3Type', 'cta')
  const gridDetail3Text = parseString(searchParams, 'gridDetail3Text', 'Responsive')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

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
          showHeadline={showHeadline}
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
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
