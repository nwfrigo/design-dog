'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'

export type LayoutVariant = 'even' | 'more-image' | 'more-text'

export interface SocialImageProps {
  headline: string
  subhead: string
  metadata: string
  ctaText: string
  imageUrl: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  layout: LayoutVariant
  solution: string
  logoColor: 'black' | 'orange'
  showHeadline?: boolean
  showSubhead: boolean
  showMetadata: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Image widths for each layout variant
const IMAGE_WIDTHS: Record<LayoutVariant, number> = {
  'even': 488,
  'more-image': 600,
  'more-text': 376,
}

// Check if HTML content is effectively empty (handles <p></p> etc.)
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  // Strip tags and check for content
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

export function SocialImage({
  headline,
  subhead,
  metadata,
  ctaText,
  imageUrl,
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  layout,
  solution,
  logoColor,
  showHeadline = true,
  showSubhead,
  showMetadata,
  showCta,
  showSolutionSet,
  grayscale = false,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: SocialImageProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const textColor = colors.ui.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const imageWidth = IMAGE_WIDTHS[layout]

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  // Determine if content is empty for conditional rendering
  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: 64,
    padding: '64px 0 64px 64px',
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
        flex: '1 1 0',
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Header: Logo + Solution Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 64,
        }}>
          <CorityLogo fill={logoFill} height={37} />

          {showSolutionSet && solution !== 'none' && (
            <SolutionPill
              variant="social"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={textColor}
              background={colors.ui.surface}
              border={`1.25px solid ${colors.ui.border}`}
            />
          )}
        </div>

        {/* Text content block */}
        <div style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Headline + Subhead group */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}>
            {/* Headline - supports rich text (bold, italic, line breaks) */}
            {showHeadline && (
              <div
                className="rich-text-dark"
                style={{
                  color: textColor,
                  fontSize: headlineFontSize ?? 84,
                  fontWeight: 300,
                  lineHeight: `${(headlineFontSize ?? 84) * (96 / 84)}px`,
                }}
                dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }}
              />
            )}

            {/* Subhead - supports rich text (bold, italic, line breaks) */}
            {showSubhead && hasSubhead && (
              <div
                className="rich-text-dark"
                style={{
                  color: textColor,
                  fontSize: 36,
                  fontWeight: 300,
                  lineHeight: 1.3,
                }}
                dangerouslySetInnerHTML={{ __html: subhead }}
              />
            )}
          </div>

          {/* Metadata */}
          {showMetadata && metadata && (
            <div style={{
              color: textColor,
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.54px',
            }}>
              {metadata}
            </div>
          )}
        </div>

        {/* CTA */}
        {showCta && ctaText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{
              color: textColor,
              fontSize: 24,
              fontWeight: 300,
              lineHeight: 1,
            }}>
              {ctaText}
            </span>
            <ArrowIcon color={colors.brand.primary} width={22} height={22 * 0.8} />
          </div>
        )}
      </div>

      {/* Right image area */}
      <div style={{
        width: imageWidth,
        height: 628,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#ffffff',
      }}>
        {/* Image */}
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
