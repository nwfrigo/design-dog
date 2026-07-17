'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { TypographyConfig } from '@/lib/brand-config'
import type { ImageFilters } from '@/lib/image-filters'
import { CorityLogo } from '@/components/shared/CorityLogo'
import {
  EXEC_TOKENS as T,
  EXEC_PAGE_W,
  EXEC_PAGE_H,
  EXEC_PLACEHOLDERS as PH,
  type ExecutiveOverviewBlockId,
} from './constants'

/**
 * Executive Overview — Page 1 (intro + hero).
 * Fixed-composition (Track 2): left content column + full-height right image
 * rail. Follows the standard S&B render-prop contract with identity defaults.
 */

export interface Page1Props {
  partnerLogoUrl?: string | null
  introHeadline: string
  introBody: string // html
  quote: string
  quoteAttribution: string
  heroImageUrl?: string | null
  heroImagePosition?: { x: number; y: number }
  heroImageZoom?: number
  grayscale?: boolean
  showPartnerLogo: boolean
  showQuote: boolean
  showQuoteAttribution: boolean
  renderBlock?: (blockId: ExecutiveOverviewBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: ExecutiveOverviewBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  typography: TypographyConfig
  scale?: number
}

const RICH_TEXT_STYLES = `
  .exec-rich-text strong { font-weight: 500; }
  .exec-rich-text em { font-style: italic; }
  .exec-rich-text p { margin: 0; }
  .exec-rich-text p + p { margin-top: 18px; }
  .exec-rich-text a { color: ${T.orange}; text-decoration: none; }
`

// Hero rail: the Figma frame sits at x=453 (w=226) and clips to the 612 page
// edge, leaving ~159px visible with a hairline on its left edge.
const HERO_LEFT = 453
const HERO_W = EXEC_PAGE_W - HERO_LEFT // 159

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

export function Page1({
  partnerLogoUrl,
  introHeadline,
  introBody,
  quote,
  quoteAttribution,
  heroImageUrl,
  heroImagePosition = { x: 0, y: 0 },
  heroImageZoom = 1,
  grayscale = false,
  showPartnerLogo,
  showQuote,
  showQuoteAttribution,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: Page1Props) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const containerStyle: CSSProperties = {
    width: EXEC_PAGE_W,
    height: EXEC_PAGE_H,
    position: 'relative',
    overflow: 'hidden',
    background: T.pageBg,
    fontFamily,
    color: T.text,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const headlineNode = wrapBlock('introHeadline', (
    <div style={{ width: 272, fontSize: 36, fontWeight: 350, lineHeight: 1.2, color: T.text, wordBreak: 'break-word' }}>
      {wrapInline('introHeadline', <div style={{ whiteSpace: 'pre-wrap' }}>{introHeadline || PH.introHeadline}</div>)}
    </div>
  ))

  const bodyNode = wrapBlock('introBody', (
    <div className="exec-rich-text" style={{ width: 343, fontSize: 18, fontWeight: 350, lineHeight: 1.28, color: T.text }}>
      {wrapInline('introBody', (
        <div dangerouslySetInnerHTML={{ __html: isHtmlEmpty(introBody) ? PH.introBody : introBody }} />
      ))}
    </div>
  ))

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Left content column */}
      <div style={{ position: 'absolute', left: 48, top: 48, width: 381, display: 'flex', flexDirection: 'column', gap: 96 }}>
        {/* Co-brand logo row */}
        <div style={{ width: 218, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <CorityLogo fill={T.text} height={22} />
          {showPartnerLogo && wrapBlock('partnerLogo', (
            <PartnerLogo url={partnerLogoUrl} />
          ))}
        </div>

        {/* Intro copy + quote */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 96, width: 381 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {headlineNode}
            {bodyNode}
          </div>

          {showQuote && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 303 }}>
              {wrapBlock('quote', (
                <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 350, lineHeight: '18px', color: T.text }}>
                  {wrapInline('quote', <span>{quote || PH.quote}</span>)}
                </div>
              ))}
              {showQuoteAttribution && wrapBlock('quoteAttribution', (
                <div style={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.88, color: T.textSecondary }}>
                  {wrapInline('quoteAttribution', <span>{quoteAttribution || PH.quoteAttribution}</span>)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right hero rail (full height, hairline on left edge, clipped to page) */}
      {wrapBlock('heroImage', (
        <div style={{
          position: 'absolute',
          left: HERO_LEFT,
          top: 0,
          width: HERO_W,
          height: EXEC_PAGE_H,
          borderLeft: `${T.borderXs}px solid ${T.border}`,
          overflow: 'hidden',
        }}>
          <HeroImage
            url={heroImageUrl}
            position={heroImagePosition}
            zoom={heroImageZoom}
            grayscale={grayscale}
          />
        </div>
      ))}

      {renderOverlay?.()}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Image sub-components                                                */
/* ------------------------------------------------------------------ */

function PartnerLogo({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div style={{
        width: 78,
        height: 18,
        border: `1px dashed ${T.border}`,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 6,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: T.textSecondary,
      }}>
        Partner logo
      </div>
    )
  }
  return (
    <img
      src={url}
      alt=""
      data-export-image="true"
      style={{ height: 18, width: 'auto', maxWidth: 100, objectFit: 'contain', display: 'block' }}
    />
  )
}

function HeroImage({
  url,
  position,
  zoom,
  grayscale,
}: {
  url?: string | null
  position: { x: number; y: number }
  zoom: number
  grayscale: boolean
}) {
  if (!url) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#EEEEEF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.border} strokeWidth={1.25}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    )
  }
  return (
    <img
      src={url}
      alt=""
      data-export-image="true"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: `${50 - position.x}% ${50 - position.y}%`,
        transform: zoom !== 1
          ? `translate(${position.x * (zoom - 1)}%, ${position.y * (zoom - 1)}%) scale(${zoom})`
          : undefined,
        transformOrigin: 'center',
        filter: grayscale ? 'grayscale(100%)' : undefined,
      }}
    />
  )
}

export default Page1
