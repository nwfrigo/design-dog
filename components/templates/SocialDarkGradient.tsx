'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export type ColorStyle = '1' | '2' | '3' | '4'
export type HeadingSize = 'S' | 'M' | 'L'
export type Alignment = 'left' | 'center'
export type CtaStyle = 'link' | 'button'

/** Logical IDs for editable blocks + the `logo` anchor at the top of
 *  the stack (always-visible, brand-locked). The anchor is part of the
 *  union so ContentStack's renderSpacerBetween stays strictly typed for
 *  the anchor→first-block gap. */
export type SocialDarkGradientBlockId =
  | 'logo'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'body'
  | 'metadata'
  | 'cta'

export interface SocialDarkGradientProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  metadata: string
  ctaText: string
  colorStyle: ColorStyle
  headingSize: HeadingSize
  alignment: Alignment
  ctaStyle: CtaStyle
  logoColor: 'orange' | 'white'
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showBody: boolean
  showMetadata: boolean
  showCta: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  /** Vertical distribution of the content stack within the canvas. Defaults
   *  to 'top'. Previously the template forced space-between (logo top,
   *  content middle, cta bottom); stackAlign now controls this on a per-
   *  asset basis via the stage bar. */
  stackAlign?: StackAlign
  /** Sparse gap overrides keyed `gap-${prev}-to-${next}`. Falls back to
   *  DEFAULT_GAP per missing key. Drives the adjustable per-gap spacing
   *  feature in the editor. */
  gaps?: Record<string, number>
  /** Stage & Bench render-prop: editor-time drag handle between blocks. */
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: SocialDarkGradientBlockId,
    nextId: SocialDarkGradientBlockId,
  ) => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  /** Stage & Bench render-prop: wraps each editable region in <Editable>. */
  renderBlock?: (blockId: SocialDarkGradientBlockId, content: ReactNode) => ReactNode
  /** Stage & Bench render-prop: swaps a block's inner content for an in-place editor. */
  renderInlineEditor?: (blockId: SocialDarkGradientBlockId, defaultInner: ReactNode) => ReactNode
  /** Stage & Bench render-prop: absolutely-positioned overlay inside the
   *  template's stacking context (drag scrim lives here). */
  renderOverlay?: () => ReactNode
}

const DEFAULT_GAP = 24

const BACKGROUND_IMAGES: Record<ColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

const HEADING_SIZES: Record<HeadingSize, number> = {
  'S': 60,
  'M': 84,
  'L': 112,
}

const SUBHEAD_SIZES: Record<HeadingSize, number> = {
  'S': 30,
  'M': 33,
  'L': 36,
}

const BODY_SIZES: Record<HeadingSize, number> = {
  'S': 18,
  'M': 22,
  'L': 26,
}

// Check if HTML content is effectively empty (handles <p></p> etc.)
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  // Strip tags and check for content
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped === ''
}

// Inline styles for rich text elements (white text on dark background)
const RICH_TEXT_STYLES = `
  .rich-text-white strong { font-weight: 500; }
  .rich-text-white em { font-style: italic; }
  .rich-text-white p { margin: 0; }
  .rich-text-white p + p { margin-top: 0.3em; }
`

export function SocialDarkGradient({
  eyebrow,
  headline,
  subhead,
  body,
  metadata,
  ctaText,
  colorStyle,
  headingSize,
  alignment,
  ctaStyle,
  logoColor,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showBody,
  showMetadata,
  showCta,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  colors,
  typography,
  scale = 1,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
}: SocialDarkGradientProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : '#FFFFFF'
  const textColor = '#FFFFFF'
  const ctaColor = '#FFFFFF' // CTA is always white on dark backgrounds
  const itemsAlign = alignment === 'center' ? 'center' : 'flex-start'
  const textAlign = alignment === 'center' ? ('center' as const) : ('left' as const)
  const stackMaxWidth = alignment === 'center' ? 900 : undefined

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const contentStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 64,
  }

  // Determine if content is empty for conditional rendering
  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)
  const hasBody = !isHtmlEmpty(body)

  const blocks: ContentStackBlock<SocialDarkGradientBlockId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow && !!eyebrow,
      defaultInner: eyebrow,
      renderChrome: (inner) => (
        <div
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 1.54,
            textAlign,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: headlineFontSize ?? HEADING_SIZES[headingSize],
            fontWeight: 300,
            lineHeight: 1.1,
            textAlign,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead && hasSubhead,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: subhead }} />
      ),
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: subheadFontSize ?? SUBHEAD_SIZES[headingSize],
            fontWeight: 300,
            lineHeight: 1.3,
            textAlign,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'body',
      visible: showBody && hasBody,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: body }} />
      ),
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: BODY_SIZES[headingSize],
            fontWeight: 300,
            lineHeight: 1.4,
            textAlign,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'metadata',
      visible: showMetadata && !!metadata,
      defaultInner: metadata,
      renderChrome: (inner) => (
        <div
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 1.54,
            textAlign,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'cta',
      visible: showCta && !!ctaText,
      defaultInner: ctaText,
      renderChrome: (inner) =>
        ctaStyle === 'link' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                color: ctaColor,
                fontSize: 24,
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              {inner}
            </span>
            <ArrowIcon color={ctaColor} width={22} height={22 * 0.8} />
          </div>
        ) : (
          <div
            style={{
              padding: '16px 32px',
              background: '#FFFFFF',
              borderRadius: 100,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#000000',
                fontSize: 18,
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              {inner}
            </span>
          </div>
        ),
    },
  ]

  return (
    <div style={containerStyle}>
      {/* Rich text styles for HTML content */}
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Background Image */}
      <img
        src={BACKGROUND_IMAGES[colorStyle]}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content overlay — ContentStack handles vertical distribution
       *  (stackAlign) and adjustable per-gap spacing. Logo is a topAnchor,
       *  always pinned to the top of the canvas regardless of stackAlign. */}
      <div style={contentStyle}>
        <ContentStack<SocialDarkGradientBlockId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock}
          renderInlineEditor={renderInlineEditor}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: <CorityLogo fill={logoFill} height={37} />,
            renderBlock: renderBlock ? (node) => renderBlock('logo', node) : undefined,
          }}
          alignItems={itemsAlign}
          maxWidth={stackMaxWidth}
        />
        {renderOverlay?.()}
      </div>
    </div>
  )
}
