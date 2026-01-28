import { Suspense } from 'react'
import { EmailSpeakersRender } from './render-content'
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
  const body = (searchParams.body as string) || ''
  const ctaText = (searchParams.ctaText as string) || 'Responsive'
  const solution = (searchParams.solution as string) || 'environmental'
  const logoColor = ((searchParams.logoColor as string) || 'black') as 'black' | 'orange'
  const showEyebrow = searchParams.showEyebrow === 'true'
  const showBody = searchParams.showBody !== 'false'
  const showCta = searchParams.showCta !== 'false'
  const showSolutionSet = searchParams.showSolutionSet !== 'false'
  const speakerCount = (parseInt(searchParams.speakerCount as string) || 3) as 1 | 2 | 3

  // Speaker 1
  const speaker1Name = (searchParams.speaker1Name as string) || 'Firstname Lastname'
  const speaker1Role = (searchParams.speaker1Role as string) || 'Role, Company'
  const speaker1ImageUrl = (searchParams.speaker1ImageUrl as string) || ''
  const speaker1ImagePositionX = parseFloat(searchParams.speaker1ImagePositionX as string) || 0
  const speaker1ImagePositionY = parseFloat(searchParams.speaker1ImagePositionY as string) || 0
  const speaker1ImageZoom = parseFloat(searchParams.speaker1ImageZoom as string) || 1

  // Speaker 2
  const speaker2Name = (searchParams.speaker2Name as string) || 'Firstname Lastname'
  const speaker2Role = (searchParams.speaker2Role as string) || 'Role, Company'
  const speaker2ImageUrl = (searchParams.speaker2ImageUrl as string) || ''
  const speaker2ImagePositionX = parseFloat(searchParams.speaker2ImagePositionX as string) || 0
  const speaker2ImagePositionY = parseFloat(searchParams.speaker2ImagePositionY as string) || 0
  const speaker2ImageZoom = parseFloat(searchParams.speaker2ImageZoom as string) || 1

  // Speaker 3
  const speaker3Name = (searchParams.speaker3Name as string) || 'Firstname Lastname'
  const speaker3Role = (searchParams.speaker3Role as string) || 'Role, Company'
  const speaker3ImageUrl = (searchParams.speaker3ImageUrl as string) || ''
  const speaker3ImagePositionX = parseFloat(searchParams.speaker3ImagePositionX as string) || 0
  const speaker3ImagePositionY = parseFloat(searchParams.speaker3ImagePositionY as string) || 0
  const speaker3ImageZoom = parseFloat(searchParams.speaker3ImageZoom as string) || 1

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
          showBody={showBody}
          showCta={showCta}
          showSolutionSet={showSolutionSet}
          speakerCount={speakerCount}
          speaker1={{
            name: speaker1Name,
            role: speaker1Role,
            imageUrl: speaker1ImageUrl,
            imagePosition: { x: speaker1ImagePositionX, y: speaker1ImagePositionY },
            imageZoom: speaker1ImageZoom,
          }}
          speaker2={{
            name: speaker2Name,
            role: speaker2Role,
            imageUrl: speaker2ImageUrl,
            imagePosition: { x: speaker2ImagePositionX, y: speaker2ImagePositionY },
            imageZoom: speaker2ImageZoom,
          }}
          speaker3={{
            name: speaker3Name,
            role: speaker3Role,
            imageUrl: speaker3ImageUrl,
            imagePosition: { x: speaker3ImagePositionX, y: speaker3ImagePositionY },
            imageZoom: speaker3ImageZoom,
          }}
          colors={colorsConfig}
          typography={typographyConfig}
        />
      </Suspense>
    </div>
  )
}
