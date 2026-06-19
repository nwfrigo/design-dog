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
import { brandChrome, BrandHeaderRow } from '@/lib/brand-chrome'
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function rgba(hex: string, a: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}
// Self-contained tiling noise (no asset needed).
const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

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

  // Over a full-bleed image the overlay guarantees contrast; pick text color
  // against the overlay (dark text only on a light, opaque overlay).
  const overlay = layout.kind === 'overlay'
  const oColor = content.overlayColor ?? '#060015'
  const oOpacity = content.overlayOpacity ?? 0.55
  const overlayLight = overlay && luminance(oColor) > 0.6 && oOpacity >= 0.5
  const onImageColor = overlayLight ? '#111111' : '#ffffff'
  const textColor = overlay ? onImageColor : t.textPrimary
  const btnText = overlay ? onImageColor : t.buttonSecondaryText
  const logoFill = overlay ? onImageColor : t.logoFill

  const chromeFor = (id: CustomBlockId, fontSize: number) =>
    brandChrome(id, { fontSize, textColor, btnText, align: layout.textAlign })

  // Editor wrapper: full-width grab target tagged for drag-reorder hit-testing.
  const wrapEditable = (id: CustomBlockId, node: ReactNode): ReactNode => (
    <div data-cs-block={id} style={{ width: '100%', cursor: 'grab', opacity: activeBlockId === id ? 0.4 : 1, transition: 'opacity 0.12s' }}>{node}</div>
  )

  const toBlocks = (items: ResolvedTextBlock[]): ContentStackBlock<CustomBlockId>[] =>
    items.map((b) => ({
      id: b.id,
      visible: true,
      defaultInner: <span>{content[b.id]}</span>,
      renderChrome: chromeFor(b.id, b.fontSize),
    }))

  const headerRow = (justify: CSSProperties['justifyContent']): ReactNode => (
    <BrandHeaderRow
      showLogo={layout.showLogo}
      logoFill={logoFill}
      logoHeight={layout.logoHeight}
      pill={layout.showSolutionPill ? { solutionColor: sol.color, solutionLabel: sol.label, textColor, background: t.bgCategoryChip, border: `0.79px solid ${t.borderFocus}` } : null}
      gap={layout.gap}
      justify={justify}
    />
  )

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
    const zoom = content.bgZoom ?? 1
    const cov = content.overlayCoverage ?? 'fade-up'
    const textTop = cov === 'fade-down'
    const owMax = width > height ? '62%' : '100%'
    const overlayBg =
      cov === 'full'
        ? rgba(oColor, oOpacity)
        : cov === 'fade-up'
          ? `linear-gradient(to top, ${rgba(oColor, oOpacity)} 0%, ${rgba(oColor, oOpacity * 0.45)} 32%, ${rgba(oColor, 0)} 72%)`
          : `linear-gradient(to bottom, ${rgba(oColor, oOpacity)} 0%, ${rgba(oColor, oOpacity * 0.45)} 32%, ${rgba(oColor, 0)} 72%)`
    inner = (
      <>
        <img
          src={content.backgroundImage || ''}
          alt=""
          data-export-image="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, filter: content.bgGrayscale ? 'grayscale(100%)' : undefined }}
        />
        <div style={{ position: 'absolute', inset: 0, background: overlayBg }} />
        {content.overlayNoise && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE_BG, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: textTop ? 'flex-start' : 'space-between', padding: layout.padding, gap: layout.gap }}>
          {headerRow('flex-start')}
          <div style={{ maxWidth: owMax }}>{stack(layout.blocks, textTop ? 'top' : 'bottom')}</div>
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
        {cta && <div>{chromeFor('cta', cta.fontSize)(<span>{content.cta}</span>)}</div>}
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
