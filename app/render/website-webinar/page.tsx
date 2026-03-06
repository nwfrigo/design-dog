import { Suspense } from 'react'
import { WebsiteWebinarRender } from './render-content'
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
  const eyebrow = parseString(searchParams, 'eyebrow', 'Webinar')
  const headline = parseString(searchParams, 'headline', 'Lightweight header.')
  const subhead = parseString(searchParams, 'subhead', '')
  const body = parseString(searchParams, 'body', '')
  const cta = (searchParams.ctaText as string) || (searchParams.cta as string) || 'Responsive'
  const solution = parseString(searchParams, 'solution', 'safety')
  const variant = parseEnum<'none' | 'image' | 'speakers'>(searchParams, 'variant', 'image')
  const imageUrl = (searchParams.imageUrl as string) || undefined
  const imagePositionX = parseNumber(searchParams, 'imagePositionX', 0)
  const imagePositionY = parseNumber(searchParams, 'imagePositionY', 0)
  const imageZoom = parseNumber(searchParams, 'imageZoom', 1)
  const showEyebrow = parseBoolTrue(searchParams, 'showEyebrow')
  const showHeadline = parseBoolTrue(searchParams, 'showHeadline')
  // showSubhead: default FALSE — subhead is hidden by default in website-webinar
  const showSubhead = parseBoolFalse(searchParams, 'showSubhead')
  // showBody: default FALSE — body is hidden by default in website-webinar
  const showBody = parseBoolFalse(searchParams, 'showBody')
  const showCta = parseBoolTrue(searchParams, 'showCta')
  const speakerCount = parseInt_(searchParams, 'speakerCount', 3) as 1 | 2 | 3

  const speaker1 = parseSpeakerParams(searchParams, 1)
  const speaker2 = parseSpeakerParams(searchParams, 2)
  const speaker3 = parseSpeakerParams(searchParams, 3)

  // Speaker visibility
  const showSpeaker1 = parseBoolTrue(searchParams, 'showSpeaker1')
  const showSpeaker2 = parseBoolTrue(searchParams, 'showSpeaker2')
  const showSpeaker3 = parseBoolTrue(searchParams, 'showSpeaker3')
  const grayscale = parseBoolFalse(searchParams, 'grayscale')
  const headlineFontSize = parseNumberOrUndefined(searchParams, 'headlineFontSize')

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
        <WebsiteWebinarRender
          eyebrow={eyebrow}
          headline={headline}
          subhead={subhead}
          body={body}
          cta={cta}
          solution={solution}
          variant={variant}
          imageUrl={imageUrl}
          imagePosition={{ x: imagePositionX, y: imagePositionY }}
          imageZoom={imageZoom}
          showEyebrow={showEyebrow}
          showHeadline={showHeadline}
          showSubhead={showSubhead}
          showBody={showBody}
          showCta={showCta}
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
          showSpeaker1={showSpeaker1}
          showSpeaker2={showSpeaker2}
          showSpeaker3={showSpeaker3}
          grayscale={grayscale}
          headlineFontSize={headlineFontSize}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
