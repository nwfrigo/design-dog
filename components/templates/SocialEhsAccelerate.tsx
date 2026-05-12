'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

/** Logical IDs for editable blocks + the `logo` topAnchor (always-visible,
 *  brand-locked baked-in lockup). */
export type SocialEhsAccelerateBlockId =
  | 'logo'
  | 'headline'
  | 'subhead'
  | 'cta'

export interface SocialEhsAccelerateProps {
  headline: string
  subhead: string
  ctaText: string
  showHeadline: boolean
  showSubhead: boolean
  showCta: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: SocialEhsAccelerateBlockId,
    nextId: SocialEhsAccelerateBlockId,
  ) => ReactNode
  renderBlock?: (blockId: SocialEhsAccelerateBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: SocialEhsAccelerateBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGE = '/assets/backgrounds/Template_Social_EHS-Accelerate-background.png'

const HEADLINE_DEFAULT = 84
const SUBHEAD_DEFAULT = 36
const DEFAULT_GAP = 36

function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

const RICH_TEXT_STYLES = `
  .social-ehs-rich-text strong { font-weight: 500; }
  .social-ehs-rich-text em { font-style: italic; }
  .social-ehs-rich-text p { margin: 0; }
  .social-ehs-rich-text p + p { margin-top: 0.3em; }
`

export function SocialEhsAccelerate({
  headline,
  subhead,
  ctaText,
  showHeadline,
  showSubhead,
  showCta,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: SocialEhsAccelerateProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const textColor = '#060015'

  const hasHeadline = !isHtmlEmpty(headline)
  const hasSubhead = !isHtmlEmpty(subhead)

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    position: 'relative',
    overflow: 'hidden',
    background: '#FFFFFF',
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

  const blocks: ContentStackBlock<SocialEhsAccelerateBlockId>[] = [
    {
      id: 'headline',
      visible: showHeadline,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="social-ehs-rich-text"
          style={{
            color: textColor,
            fontSize: headlineFontSize ?? HEADLINE_DEFAULT,
            fontWeight: 350,
            lineHeight: 1.14,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead,
      defaultInner: (
        <div dangerouslySetInnerHTML={{ __html: hasSubhead ? subhead : 'Subheadline' }} />
      ),
      renderChrome: (inner) => (
        <div
          className="social-ehs-rich-text"
          style={{
            color: textColor,
            fontSize: subheadFontSize ?? SUBHEAD_DEFAULT,
            fontWeight: 350,
            lineHeight: 1.3,
          }}
        >
          {inner}
        </div>
      ),
    },
    {
      id: 'cta',
      visible: showCta,
      defaultInner: <span>{ctaText || 'Call to Action'}</span>,
      renderChrome: (inner) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: textColor,
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1,
        }}>
          {inner}
          <ArrowIcon color={textColor} width={22} height={22 * 0.8} strokeWidth={1.5} />
        </div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Background image (gradients + lockup-adjacent art baked in) */}
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content overlay — ContentStack handles vertical distribution
       *  (stackAlign) and adjustable per-gap spacing. EhsAccelerate logo
       *  lockup is a topAnchor, always pinned to top regardless of stackAlign. */}
      <div style={contentStyle}>
        <ContentStack<SocialEhsAccelerateBlockId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock}
          renderInlineEditor={renderInlineEditor}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: <EhsAccelerateLogo width={400} />,
            renderBlock: renderBlock ? (node) => renderBlock('logo', node) : undefined,
          }}
          alignItems="flex-start"
        />
        {renderOverlay?.()}
      </div>
    </div>
  )
}
