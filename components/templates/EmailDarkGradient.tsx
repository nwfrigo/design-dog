'use client'

import { CSSProperties, ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export type ColorStyle = '1' | '2' | '3' | '4'
export type Alignment = 'left' | 'center'
export type CtaStyle = 'link' | 'button'

export type EmailDarkGradientBlockId = 'logo' | 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'

export interface EmailDarkGradientProps {
  headline: string
  eyebrow?: string
  subhead?: string
  body: string
  ctaText: string
  colorStyle: ColorStyle
  alignment: Alignment
  ctaStyle: CtaStyle
  showEyebrow?: boolean
  showHeadline?: boolean
  showSubhead?: boolean
  showBody: boolean
  showCta: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  /** Sparse gap overrides keyed as `gap-{prev}-to-{next}`. Falls back to DEFAULT_GAP per slot. */
  gaps?: Record<string, number>
  /** Sparse line-height overrides keyed by content type ('headline' | 'subhead' | 'body'). Falls back to per-slot defaults below. */
  lineHeights?: Record<string, number>
  /** Optional render-prop for spacer slots. Receives the gap key and current value. Editor passes a drag handle; export passes nothing → falls back to a plain div. */
  renderSpacerBetween?: (gapKey: string, value: number, prevId: EmailDarkGradientBlockId, nextId: EmailDarkGradientBlockId) => ReactNode
  /** Optional render-prop wrapping each block (after chrome). Editor passes a wrapper that adds selection affordances; export passes nothing → block renders as-is. */
  renderBlock?: (blockId: EmailDarkGradientBlockId, content: ReactNode) => ReactNode
  /**
   * Optional render-prop for swapping the *inner* text content of a block, leaving its chrome
   * (background, icons, padding) intact. Editor returns an in-place text editor when the block
   * is being edited; otherwise returns the supplied default. This is what preserves the white
   * CTA pill background during text editing.
   */
  renderInlineEditor?: (blockId: EmailDarkGradientBlockId, defaultInner: ReactNode) => ReactNode
  /**
   * Optional render-prop for absolutely-positioned overlays inside the design
   * (drag scrim, watermarks, etc.). Rendered as the last child of the inner
   * overlay, so it shares the template's stacking context — z-index inside
   * the returned node can layer between existing blocks (static) and any
   * blocks bumped above with their own z-index.
   */
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped === ''
}

// Normalize <b> and <i> alongside <strong>/<em> — execCommand is browser-dependent
// and may insert either tag. Without normalization, <b> renders at the browser default
// (bolder of parent's 350 ≈ 400) instead of the brand's 500, producing a multi-step
// weight cycle on bold-toggle.
const RICH_TEXT_STYLES = `
  .rich-text-white strong, .rich-text-white b { font-weight: 500; }
  .rich-text-white em, .rich-text-white i { font-style: italic; }
  .rich-text-white p { margin: 0; }
  .rich-text-white p + p { margin-top: 0.3em; }
`

const BACKGROUND_IMAGES: Record<ColorStyle, string> = {
  '1': '/assets/backgrounds/social-dark-gradient-1.png',
  '2': '/assets/backgrounds/social-dark-gradient-2.png',
  '3': '/assets/backgrounds/social-dark-gradient-3.png',
  '4': '/assets/backgrounds/social-dark-gradient-4.png',
}

/** Default line-heights per content slot. Imported by both this template's
 *  render (fallback when no override is set) and the Stage & Bench config
 *  registry (slider default value). Single source of truth. */
export const EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS = {
  headline: 1.26,
  subhead: 1.4,
  body: 1.4,
} as const

/** Figma-style leading-trim: collapse the half-leading above the first line so
 *  the glyph cap aligns with the block's top edge. Uses CSS `text-box-trim`
 *  (Chrome 133+ / Safari 18.2+, ~2025). Browsers without support fall back to
 *  default CSS half-leading distribution; can revisit if Firefox usage matters. */
const TRIM_TOP_LEADING = {
  textBoxTrim: 'trim-start',
  textBoxEdge: 'cap alphabetic',
} as const

const DEFAULT_GAP = 24

export function gapKey(prevId: EmailDarkGradientBlockId, nextId: EmailDarkGradientBlockId): string {
  return `gap-${prevId}-to-${nextId}`
}

type Block = ContentStackBlock<EmailDarkGradientBlockId>

export function EmailDarkGradient({
  headline,
  eyebrow,
  subhead,
  body,
  ctaText,
  colorStyle,
  alignment,
  ctaStyle,
  showEyebrow = false,
  showHeadline = true,
  showSubhead = false,
  showBody,
  showCta,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  lineHeights,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
}: EmailDarkGradientProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#FFFFFF'
  const ctaColor = '#0080FF'

  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)
  const hasBody = !isHtmlEmpty(body)
  const hasCta = !!ctaText

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 32,
  }

  const logoRowStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: alignment === 'center' ? 'center' : 'flex-start',
    flexShrink: 0,
  }

  const textBlockMaxWidth = alignment === 'center' ? 460 : 480
  const itemsAlign = alignment === 'center' ? 'center' : 'flex-start'
  const textAlign = alignment === 'center' ? ('center' as const) : ('left' as const)

  const blocks: Block[] = [
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
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textAlign,
            maxWidth: textBlockMaxWidth,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />,
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: headlineFontSize ?? 38,
            fontWeight: 350,
            lineHeight: lineHeights?.headline ?? EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS.headline,
            ...TRIM_TOP_LEADING,
            textAlign,
            maxWidth: textBlockMaxWidth,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead && hasSubhead,
      defaultInner: <div dangerouslySetInnerHTML={{ __html: subhead! }} />,
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: subheadFontSize ?? 24,
            fontWeight: 350,
            lineHeight: lineHeights?.subhead ?? EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS.subhead,
            ...TRIM_TOP_LEADING,
            textAlign,
            maxWidth: textBlockMaxWidth,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'body',
      visible: showBody,
      defaultInner: <div dangerouslySetInnerHTML={{ __html: body || 'Body copy goes here.' }} />,
      renderChrome: (inner) => (
        <div
          className="rich-text-white"
          style={{
            color: textColor,
            fontSize: 18,
            fontWeight: 350,
            lineHeight: lineHeights?.body ?? EMAIL_DARK_GRADIENT_LINE_HEIGHT_DEFAULTS.body,
            ...TRIM_TOP_LEADING,
            textAlign,
            maxWidth: textBlockMaxWidth,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'cta',
      visible: showCta && hasCta,
      defaultInner: ctaText,
      renderChrome: (inner) =>
        ctaStyle === 'link' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: textColor, fontSize: 18, fontWeight: 500, lineHeight: 1 }}>
              {inner}
            </div>
            <ArrowIcon
              color={ctaColor}
              width={16.5}
              height={16.5 * 0.795}
              viewBox="0 0 16.5 13.12"
              pathD="M9.75 0.75L15.75 6.56M15.75 6.56L9.75 12.37M15.75 6.56H0.75"
              strokeWidth={1.12}
            />
          </div>
        ) : (
          <div
            style={{
              height: 45,
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 17,
              paddingBottom: 17,
              background: '#FFFFFF',
              borderRadius: 22.5,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#060015', fontSize: 16, fontWeight: 500, lineHeight: 1.33 }}>
              {inner}
            </div>
          </div>
        ),
    },
  ]

  const visible = blocks.filter((b) => b.visible)

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

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

      <div style={overlayStyle}>
        <ContentStack<EmailDarkGradientBlockId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock}
          renderInlineEditor={renderInlineEditor}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: (
              <div style={logoRowStyle}>
                <CorityLogo fill="#FFFFFF" height={23} />
              </div>
            ),
            renderBlock: renderBlock ? (node) => renderBlock('logo', node) : undefined,
          }}
          alignItems={itemsAlign}
          maxWidth={textBlockMaxWidth}
        />
        {renderOverlay?.()}
      </div>
    </div>
  )
}
