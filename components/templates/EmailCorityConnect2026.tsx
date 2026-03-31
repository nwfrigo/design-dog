'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityConnectLogo } from '@/components/shared/CorityConnectLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

// Background variant format: '{mode}-{color}-{number}'
// e.g. 'dark-blue-1', 'light-orange-3'
// Files live in /public/assets/backgrounds/ with the "emial" typo preserved.
export type CCBackgroundVariant =
  | 'dark-blue-1' | 'dark-blue-2' | 'dark-blue-3' | 'dark-blue-4'
  | 'dark-orange-1' | 'dark-orange-2' | 'dark-orange-3' | 'dark-orange-4'
  | 'light-blue-1' | 'light-blue-2' | 'light-blue-3' | 'light-blue-4'
  | 'light-orange-1' | 'light-orange-2' | 'light-orange-3' | 'light-orange-4'

export interface EmailCorityConnect2026Props {
  headline: string
  body: string
  ctaText: string
  backgroundVariant: CCBackgroundVariant
  showHeadline: boolean
  showBody: boolean
  showCta: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

// Note: filenames use "emial" (Figma export typo) — must match exactly.
function backgroundUrl(variant: CCBackgroundVariant): string {
  return `/assets/backgrounds/cority-connect-emial-background-${variant}.png`
}

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

const RICH_TEXT_STYLES = `
  .cc-rich-text strong { font-weight: 500; }
  .cc-rich-text em { font-style: italic; }
  .cc-rich-text p { margin: 0; }
  .cc-rich-text p + p { margin-top: 0.3em; }
`

export function EmailCorityConnect2026({
  headline,
  body,
  ctaText,
  backgroundVariant = 'dark-blue-1',
  showHeadline = true,
  showBody = true,
  showCta = true,
  headlineFontSize,
  typography,
  scale = 1,
}: EmailCorityConnect2026Props) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const isDark = backgroundVariant.startsWith('dark-')
  const textColor = isDark ? '#ffffff' : '#060015'
  const mode = isDark ? 'dark' : 'light'

  const DEFAULT_FONT_SIZE = 38.15
  const LINE_HEIGHT_RATIO = 48.19 / 38.15
  const fontSize = headlineFontSize ?? DEFAULT_FONT_SIZE

  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 370,
    // No padding here — padding lives on the inner content div to avoid
    // box-sizing ambiguity inflating the outer height in the export renderer.
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Full-bleed background image */}
      <img
        src={backgroundUrl(backgroundVariant)}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* Content layer — sits above the background, carries the padding */}
      <div style={{
        position: 'absolute',
        inset: 0,
        padding: 32,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
      }}>

      {/* Inner layout: logo + text, full height */}
      <div style={{
        width: 480,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>

        {/* Logo — static, always shown */}
        <CorityConnectLogo mode={mode} />

        {/* Headline + Body */}
        <div style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {showHeadline && (
            <div
              className="cc-rich-text"
              style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize,
                fontWeight: 350,
                lineHeight: `${fontSize * LINE_HEIGHT_RATIO}px`,
              }}
              dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Lightweight header.' }}
            />
          )}

          {showBody && hasBody && (
            <div
              className="cc-rich-text"
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
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{
              color: textColor,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: '18px',
            }}>
              {ctaText}
            </span>
            <ArrowIcon color="#0080FF" width={16.5} height={13.13} />
          </div>
        )}
      </div>
      {/* close content layer (absolute inset) */}
      </div>
    </div>
  )
}
