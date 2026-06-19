'use client'

/**
 * CustomSizeCanvas — SPIKE renderer for the custom-size layout engine.
 *
 * Takes brand content + arbitrary dimensions (+ optional user overrides), asks
 * the pure resolver how to lay it out, and renders using ONLY shared substrate
 * primitives: ContentStack for vertical zones, thin flex frames for
 * row/hero-top/strip, and brand chrome.
 *
 * `interactive` tags blocks/image with data-cs-* so the editor harness can
 * hit-test drag gestures. When false (export / grid preview) output is pure +
 * identical — no wrappers, no attrs.
 */

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'
import {
  resolveLayout,
  type CustomContent,
  type CustomBlockId,
  type ResolvedTextBlock,
  type LayoutOverrides,
} from '@/lib/custom-size/resolve'

export interface CustomSizeCanvasProps {
  content: CustomContent
  width: number
  height: number
  theme?: TemplateTheme
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  overrides?: LayoutOverrides
  /** Tag blocks/image for drag gestures (editor only). */
  interactive?: boolean
  /** Block currently being dragged — dimmed for feedback. */
  activeBlockId?: CustomBlockId | null
}

function ImagePlaceholder({ style, tag }: { style?: CSSProperties; tag?: boolean }) {
  return (
    <div
      {...(tag ? { 'data-cs-image': 'true' } : {})}
      style={{
        background: 'rgba(127,127,127,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: tag ? 'grab' : undefined,
        ...style,
      }}
    >
      <svg width="24%" height="24%" viewBox="0 0 24 24" fill="none"
        stroke="rgba(160,160,160,0.65)" strokeWidth="1.4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.8" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  )
}

export function CustomSizeCanvas({
  content, width, height, theme = 'dark', colors, typography, scale = 1,
  overrides, interactive = false, activeBlockId = null,
}: CustomSizeCanvasProps) {
  const layout = resolveLayout(content, width, height, overrides)
  const t = TEMPLATE_THEMES[theme]
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const sol = colors.solutions[content.solution] || colors.solutions.none

  // Over a full-bleed image, force white text + white logo regardless of theme;
  // the scrim guarantees contrast. Otherwise use theme colors.
  const overlay = layout.kind === 'overlay'
  const textColor = overlay ? '#ffffff' : t.textPrimary
  const btnText = overlay ? '#ffffff' : t.buttonSecondaryText
  const logoFill = overlay ? '#ffffff' : t.logoFill

  const chrome = (id: CustomBlockId, fontSize: number): ((inner: ReactNode) => ReactNode) => {
    const ta = layout.textAlign
    switch (id) {
      case 'eyebrow': return (i) => <div style={{ fontSize, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: textColor, textAlign: ta }}>{i}</div>
      case 'headline': return (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.12, color: textColor, textAlign: ta }}>{i}</div>
      case 'subhead': return (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.3, color: textColor, opacity: 0.9, textAlign: ta }}>{i}</div>
      case 'body': return (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.5, color: textColor, opacity: 0.8, textAlign: ta }}>{i}</div>
      case 'cta': return (i) => <div style={{ display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.45, fontSize, fontWeight: 500, color: btnText, justifyContent: ta === 'center' ? 'center' : 'flex-start' }}>{i}<ArrowIcon color={btnText} width={fontSize * 0.92} height={fontSize * 0.72} /></div>
    }
  }

  // Editor wrapper: full-width grab target tagged for drag-reorder hit-testing.
  const wrapEditable = (id: CustomBlockId, node: ReactNode): ReactNode => (
    <div data-cs-block={id} style={{ width: '100%', cursor: 'grab', opacity: activeBlockId === id ? 0.4 : 1, transition: 'opacity 0.12s' }}>{node}</div>
  )

  const toBlocks = (items: ResolvedTextBlock[]): ContentStackBlock<CustomBlockId>[] =>
    items.map((b) => ({
      id: b.id,
      visible: true,
      defaultInner: <span>{content[b.id]}</span>,
      renderChrome: chrome(b.id, b.fontSize),
    }))

  const headerRow = (justify: CSSProperties['justifyContent']): ReactNode =>
    (layout.showLogo || layout.showSolutionPill) ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: layout.gap, justifyContent: justify, flexShrink: 0 }}>
        {layout.showLogo && <CorityLogo fill={logoFill} height={layout.logoHeight} />}
        {layout.showSolutionPill && (
          <SolutionPill variant="email" solutionColor={sol.color} solutionLabel={sol.label} textColor={textColor} background={t.bgCategoryChip} border={`0.79px solid ${t.borderFocus}`} />
        )}
      </div>
    ) : null

  const stack = (items: ResolvedTextBlock[], align = layout.textStackAlign): ReactNode => (
    <ContentStack<CustomBlockId>
      blocks={toBlocks(items)}
      defaultGap={layout.gap}
      stackAlign={align}
      alignItems={layout.alignItems}
      renderBlock={interactive ? wrapEditable : undefined}
    />
  )

  const container: CSSProperties = {
    width, height, background: t.backgroundPrimary, fontFamily,
    overflow: 'hidden', position: 'relative',
    transform: `scale(${scale})`, transformOrigin: 'top left',
  }

  let inner: ReactNode

  if (layout.kind === 'overlay') {
    const fx = content.bgFocalX ?? 50
    const fy = content.bgFocalY ?? 50
    const owMax = width > height ? '62%' : '100%'
    inner = (
      <>
        <img
          src={content.backgroundImage || ''}
          alt=""
          data-export-image="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%` }}
        />
        {/* legibility scrim: strong at bottom (text), mild at top (logo) */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 38%, rgba(0,0,0,0) 62%), linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 22%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: layout.padding }}>
          {headerRow('flex-start')}
          <div style={{ maxWidth: owMax }}>{stack(layout.blocks, 'bottom')}</div>
        </div>
      </>
    )
  } else if (layout.kind === 'strip') {
    const hl = layout.blocks.find((b) => b.id === 'headline')
    const ctaSize = Math.max(12, layout.logoHeight * 0.5)
    inner = (
      <div style={{ display: 'flex', alignItems: 'center', gap: layout.gap * 1.5, height: '100%', padding: `0 ${layout.padding}px` }}>
        {layout.showLogo && <CorityLogo fill={logoFill} height={layout.logoHeight} />}
        {layout.showSolutionPill && <SolutionPill variant="email" solutionColor={sol.color} solutionLabel={sol.label} textColor={textColor} background={t.bgCategoryChip} border={`0.79px solid ${t.borderFocus}`} />}
        {hl && (
          <div style={{ flex: 1, minWidth: 0, fontSize: hl.fontSize, fontWeight: 300, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{content.headline}</div>
        )}
        {content.cta.trim() !== '' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: ctaSize * 0.45, fontSize: ctaSize, fontWeight: 500, color: btnText, flexShrink: 0 }}>{content.cta}<ArrowIcon color={btnText} width={ctaSize * 0.92} height={ctaSize * 0.72} /></div>
        )}
      </div>
    )
  } else if (layout.kind === 'tower') {
    const top = layout.blocks.filter((b) => b.id !== 'cta')
    const cta = layout.blocks.find((b) => b.id === 'cta')
    inner = (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: layout.padding, gap: layout.gap }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: layout.gap }}>
          {headerRow('flex-start')}
          {top.length > 0 && <div>{stack(top, 'top')}</div>}
        </div>
        {cta && <div>{chrome('cta', cta.fontSize)(<span>{content.cta}</span>)}</div>}
      </div>
    )
  } else if (layout.kind === 'row') {
    const textCol = (
      <div style={{ flex: 1.1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: layout.gap, padding: layout.padding }}>
        {headerRow('flex-start')}
        <div style={{ flex: 1, minHeight: 0 }}>{stack(layout.blocks)}</div>
      </div>
    )
    const imageCol = <ImagePlaceholder tag={interactive} style={{ width: `${layout.imageFraction * 100}%`, height: '100%', flexShrink: 0 }} />
    inner = (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        {layout.imageSide === 'left' ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
      </div>
    )
  } else if (layout.kind === 'hero-top') {
    inner = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ImagePlaceholder style={{ width: '100%', height: `${layout.imageFraction * 100}%`, flexShrink: 0 }} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: layout.gap, padding: layout.padding }}>
          {headerRow('flex-start')}
          <div style={{ flex: 1, minHeight: 0 }}>{stack(layout.blocks, 'top')}</div>
        </div>
      </div>
    )
  } else {
    // single — centered (square / landscape-no-image) or top-aligned stack
    inner = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: layout.padding, gap: layout.gap, alignItems: layout.alignItems }}>
        {headerRow(layout.alignItems === 'center' ? 'center' : 'flex-start')}
        <div style={{ width: '100%', flex: 1, minHeight: 0 }}>{stack(layout.blocks)}</div>
      </div>
    )
  }

  return <div style={container}>{inner}</div>
}
