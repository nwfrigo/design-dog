'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'

export interface SpeakerInfo {
  name: string
  role: string
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
}

export interface EmailSpeakersProps {
  headline: string
  eyebrow?: string
  body: string
  ctaText: string
  solution: string
  logoColor: 'black' | 'orange'
  showEyebrow?: boolean
  showHeadline?: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  speakerCount: 1 | 2 | 3
  speaker1: SpeakerInfo
  speaker2: SpeakerInfo
  speaker3: SpeakerInfo
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Check if HTML content is effectively empty (handles <p></p> etc.)
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped === ''
}

// Inline styles for rich text elements (dark text on light background)
const RICH_TEXT_STYLES = `
  .rich-text-dark strong { font-weight: 500; }
  .rich-text-dark em { font-style: italic; }
  .rich-text-dark p { margin: 0; }
  .rich-text-dark p + p { margin-top: 0.3em; }
`

// Component to render a circular speaker avatar with optional grayscale
function SpeakerAvatar({
  imageUrl,
  position,
  zoom,
  size = 48,
  speakerIndex,
  grayscale = false,
}: {
  imageUrl: string
  position: { x: number; y: number }
  zoom: number
  size?: number
  speakerIndex: number
  grayscale?: boolean
}) {
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
    backgroundColor: '#E5E5E5',
  }

  const imageStyle: CSSProperties = {
    position: 'absolute',
    width: `${100 * zoom}%`,
    height: `${100 * zoom}%`,
    objectFit: 'cover',
    left: `${50 + position.x}%`,
    top: `${50 + position.y}%`,
    transform: 'translate(-50%, -50%)',
    filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
  }

  if (!imageUrl) {
    return <div style={containerStyle} />
  }

  return (
    <div style={containerStyle}>
      <img
        src={grayscaleImageUrl || imageUrl}
        alt=""
        data-export-image="true"
        data-speaker={speakerIndex}
        style={imageStyle}
      />
    </div>
  )
}

export function EmailSpeakers({
  headline,
  eyebrow,
  body,
  ctaText,
  solution,
  logoColor,
  showEyebrow = false,
  showHeadline = true,
  showBody,
  showCta,
  showSolutionSet,
  grayscale = false,
  speakerCount,
  speaker1,
  speaker2,
  speaker3,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: EmailSpeakersProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const textColor = colors.ui.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  // Determine if content is empty for conditional rendering
  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    padding: 32,
    background: colors.ui.surface,
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 32,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const speakers = [speaker1, speaker2, speaker3].slice(0, speakerCount)

  return (
    <div style={containerStyle}>
      {/* Rich text styles for HTML content */}
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Left content area */}
      <div style={{
        alignSelf: 'stretch',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Header: Logo + Solution Pill */}
        <div style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 40,
        }}>
          <CorityLogo fill={logoFill} height={23} />

          {showSolutionSet && solution !== 'none' && (
            <SolutionPill
              variant="email"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={textColor}
              background={colors.ui.surface}
              border={`0.79px solid ${colors.ui.border}`}
            />
          )}
        </div>

        {/* Text content block */}
        <div style={{
          width: 315,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 24,
        }}>
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div style={{
              color: textColor,
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.1px',
            }}>
              {eyebrow}
            </div>
          )}

          {/* Headline - supports rich text (bold, italic, line breaks) */}
          {showHeadline && (
            <div
              className="rich-text-dark"
              style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: headlineFontSize ?? 38.15,
                fontWeight: 350,
                lineHeight: `${(headlineFontSize ?? 38.15) * (48.19 / 38.15)}px`,
              }}
              dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }}
            />
          )}

          {/* Body - supports rich text (bold, italic, line breaks) */}
          {showBody && hasBody && (
            <div
              className="rich-text-dark"
              style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 18.07,
                fontWeight: 350,
              }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
        </div>

        {/* CTA */}
        {showCta && ctaText && (
          <div style={{
            display: 'inline-flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{
              textAlign: 'center',
              color: '#060015',
              fontSize: 18,
              fontWeight: 350,
              lineHeight: '18px',
            }}>
              {ctaText}
            </span>
            <ArrowIcon color="#060015" width={16.5} height={16.5 * 0.8} />
          </div>
        )}
      </div>

      {/* Right speakers area */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        overflow: 'hidden',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {speakers.map((speaker, index) => (
          <div
            key={index}
            style={{
              alignSelf: 'stretch',
              flex: '1 1 0',
              display: 'inline-flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <SpeakerAvatar
              imageUrl={speaker.imageUrl}
              position={speaker.imagePosition}
              zoom={speaker.imageZoom}
              size={48}
              speakerIndex={index + 1}
              grayscale={grayscale}
            />
            <div style={{
              width: 161,
              display: 'inline-flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 18,
                fontWeight: 350,
              }}>
                {speaker.name || 'Firstname Lastname'}
              </div>
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 12,
                fontWeight: 350,
                lineHeight: '16px',
              }}>
                {speaker.role || 'Role, Company'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
