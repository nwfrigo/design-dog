import { Suspense } from 'react'
import { EmailSpeakersRender } from './render-content'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseNumber, parseInt_, parseBoolTrue, parseBoolFalse, parseNumberOrUndefined, parseSpeakerParams } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headline = parseString(searchParams, 'headline', 'Headline')
  const eyebrow = parseString(searchParams, 'eyebrow', '')
  const body = parseString(searchParams, 'body', '')
  const ctaText = parseString(searchParams, 'ctaText', 'Responsive')
  const solution = parseString(searchParams, 'solution', 'environmental')
  const logoColor = parseEnum<'black' | 'orange'>(searchParams, 'logoColor', 'black')
  // showEyebrow: default FALSE — eyebrow is hidden by default in email-speakers
  const showEyebrow = parseBoolFalse(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  const showBody = parseBoolTrue(searchParams, 'showBody')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const showSolutionSet = parseBoolTrue(searchParams, 'showSolutionSet')
  const speakerCount = parseInt_(searchParams, 'speakerCount', 3) as 1 | 2 | 3

  const speaker1 = parseSpeakerParams(searchParams, 1)
  const speaker2 = parseSpeakerParams(searchParams, 2)
  const speaker3 = parseSpeakerParams(searchParams, 3)
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

  return (
    <div style={{
      width: 640,
      height: 300,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#FFFFFF',
    }}>
      <Suspense fallback={<div style={{ width: 640, height: 300, background: '#FFFFFF' }}>Loading...</div>}>
        <EmailSpeakersRender
          headline={headline}
          eyebrow={eyebrow}
          body={body}
          ctaText={ctaText}
          solution={solution}
          logoColor={logoColor}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showBody={showBody}
          showCta={showCta}
          showSolutionSet={showSolutionSet}
          speakerCount={speakerCount}
          speaker1={{
            name: speaker1.name,
            role: speaker1.role,
            imageUrl: speaker1.imageUrl,
            imagePosition: { x: speaker1.imagePositionX, y: speaker1.imagePositionY },
            imageZoom: speaker1.imageZoom,
          }}
          speaker2={{
            name: speaker2.name,
            role: speaker2.role,
            imageUrl: speaker2.imageUrl,
            imagePosition: { x: speaker2.imagePositionX, y: speaker2.imagePositionY },
            imageZoom: speaker2.imageZoom,
          }}
          speaker3={{
            name: speaker3.name,
            role: speaker3.role,
            imageUrl: speaker3.imageUrl,
            imagePosition: { x: speaker3.imagePositionX, y: speaker3.imagePositionY },
            imageZoom: speaker3.imageZoom,
          }}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
