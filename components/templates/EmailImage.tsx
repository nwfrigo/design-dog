'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type LayoutVariant = 'even' | 'more-image' | 'more-text'

export interface EmailImageProps {
  headline: string
  body: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  layout: LayoutVariant
  solution: string
  logoColor: 'black' | 'orange'
  showHeadline?: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Text area widths for each layout variant (image fills the rest)
const TEXT_WIDTHS: Record<LayoutVariant, number> = {
  'even': 330,
  'more-image': 260,
  'more-text': 400,
}

// Image widths for each layout variant
const IMAGE_WIDTHS: Record<LayoutVariant, number> = {
  'even': 250,
  'more-image': 320,
  'more-text': 180,
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

export function EmailImage({
  headline,
  body,
  ctaText,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  layout,
  solution,
  logoColor,
  showHeadline = true,
  showBody,
  showCta,
  showSolutionSet,
  grayscale = false,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: EmailImageProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const textColor = colors.ui.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const textWidth = TEXT_WIDTHS[layout]
  const imageWidth = IMAGE_WIDTHS[layout]

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const DEFAULT_FONT_SIZE = 38.15
  const LINE_HEIGHT_RATIO = 48.19 / 38.15 // ≈ 1.263
  const fontSize = headlineFontSize ?? DEFAULT_FONT_SIZE

  // Determine if content is empty for conditional rendering
  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    background: colors.ui.surface,
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      {/* Rich text styles for HTML content */}
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
      {/* Left content area */}
      <div style={{
        width: textWidth,
        alignSelf: 'stretch',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
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
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 17,
        }}>
          {/* Headline - supports rich text (bold, italic, line breaks) */}
          {showHeadline && (
            <div
              className="rich-text-dark"
              style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize,
                fontWeight: 300,
                lineHeight: `${fontSize * LINE_HEIGHT_RATIO}px`,
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
                fontWeight: 300,
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
              fontWeight: 500,
              lineHeight: '18px',
            }}>
              {ctaText}
            </span>
            <ArrowIcon color="#060015" width={16.5} height={16.5 * 0.8} />
          </div>
        )}
      </div>

      {/* Right image area - absolutely positioned */}
      <div style={{
        width: imageWidth,
        height: 300,
        position: 'absolute',
        right: 0,
        top: 0,
        overflow: 'hidden',
      }}>
        <img
          src={grayscaleImageUrl || imageUrl}
          alt=""
          data-export-image="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${50 - imagePosition.x}% ${50 - imagePosition.y}%`,
            transform: imageZoom !== 1
              ? `translate(${imagePosition.x * (imageZoom - 1)}%, ${imagePosition.y * (imageZoom - 1)}%) scale(${imageZoom})`
              : undefined,
            transformOrigin: 'center',
            filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
          }}
        />
      </div>
    </div>
  )
}
