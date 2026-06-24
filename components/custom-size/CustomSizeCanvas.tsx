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
import { SolutionPill } from '@/components/shared/SolutionPill'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import { filtersToCss, applyGrayscaleBoolean, NEUTRAL_FILTERS } from '@/lib/image-filters'
import { overlayBackground, NOISE_BG } from '@/lib/custom-size/overlay'
import { brandChrome, BrandHeaderRow, type CtaStyle } from '@/lib/brand-chrome'
import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'
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
  type CustomSizeSlotId,
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

export interface CustomSizeCanvasProps {
  content: CustomContent
  width: number
  height: number
  theme?: TemplateTheme
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  overrides?: LayoutOverrides
  /** Tag blocks/image for drag gestures (lab only). */
  interactive?: boolean
  /** Block currently being dragged — dimmed for feedback. */
  activeBlockId?: CustomBlockId | null
  /** CTA styling: `link` (text + arrow, default) or `button` (filled pill). */
  ctaStyle?: CtaStyle
  // --- Stage & Bench render-prop contract (§4.15) ---
  renderBlock?: (id: CustomSizeSlotId, content: ReactNode) => ReactNode
  renderInlineEditor?: (id: CustomBlockId, defaultInner: ReactNode) => ReactNode
  renderSpacerBetween?: (gapKey: string, value: number, prevId: CustomBlockId, nextId: CustomBlockId) => ReactNode
  renderOverlay?: () => ReactNode
  /** Per-gap overrides (absolute px, keyed `gap-${prev}-to-${next}`). Sparse;
   *  missing keys use the engine's computed gap. */
  gaps?: Record<string, number>
  /** Editor-only: drag the zone image's inner edge to resize how much of the
   *  canvas it occupies (row = width fraction, hero-top = height fraction).
   *  Receives the new fraction (unclamped — the engine clamps). */
  onResizeImageFraction?: (next: number) => void
}

/**
 * ImageFractionHandle — the draggable divider on the zone image's INNER edge.
 * Drag it to grow/shrink the image's share of the canvas. Lives inside the
 * scale-transformed canvas, so its thickness is divided by `scale` to stay a
 * constant on-screen size; it reveals on stage hover like the resize chrome.
 */
function ImageFractionHandle({
  axis, edge, scale, total, fraction, onResize,
}: {
  axis: 'x' | 'y'
  /** The image edge the handle sits on (its inner edge). */
  edge: 'left' | 'right' | 'top' | 'bottom'
  scale: number
  /** Canvas dimension the fraction is measured against (width for x, height for y). */
  total: number
  fraction: number
  onResize: (next: number) => void
}) {
  const THICK = 6 // on-screen px
  const grow = edge === 'left' || edge === 'top' ? -1 : 1 // drag toward the text → bigger
  const onDown = (e: import('react').PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const startPos = axis === 'x' ? e.clientX : e.clientY
    const startFraction = fraction
    const onMove = (ev: globalThis.PointerEvent) => {
      const cur = axis === 'x' ? ev.clientX : ev.clientY
      const deltaCanvas = (cur - startPos) / scale
      onResize(startFraction + (grow * deltaCanvas) / total)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  const t = THICK / scale
  const vertical = axis === 'x' // a vertical bar that resizes width
  const style: CSSProperties = vertical
    ? { top: '50%', height: '38%', width: t, transform: 'translateY(-50%)', [edge]: -t / 2, cursor: 'ew-resize' }
    : { left: '50%', width: '38%', height: t, transform: 'translateX(-50%)', [edge]: -t / 2, cursor: 'ns-resize' }
  return (
    <div
      onPointerDown={onDown}
      data-cs-image-resize={axis}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        position: 'absolute',
        zIndex: 25,
        borderRadius: t,
        background: '#ffffff',
        boxShadow: `0 0 0 ${1 / scale}px rgba(0,0,0,0.18), 0 ${1 / scale}px ${3 / scale}px rgba(0,0,0,0.35)`,
        ...style,
      }}
    />
  )
}

function ImagePlaceholder({
  style, tag, src, focalX = 50, focalY = 50, zoom = 1, filterCss,
}: {
  style?: CSSProperties; tag?: boolean; src?: string | null
  focalX?: number; focalY?: number; zoom?: number; filterCss?: string
}) {
  return (
    <div
      {...(tag ? { 'data-cs-image': 'true' } : {})}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(127,127,127,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: tag ? 'grab' : undefined,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          data-export-image="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focalX}% ${focalY}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, filter: filterCss }}
        />
      ) : (
        <svg width="24%" height="24%" viewBox="0 0 24 24" fill="none"
          stroke="rgba(160,160,160,0.65)" strokeWidth="1.4">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.8" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )}
    </div>
  )
}

export function CustomSizeCanvas({
  content, width, height, theme = 'dark', colors, typography, scale = 1,
  overrides, interactive = false, activeBlockId = null, ctaStyle = 'link',
  renderBlock, renderInlineEditor, renderSpacerBetween, renderOverlay, gaps,
  onResizeImageFraction,
}: CustomSizeCanvasProps) {
  const layout = resolveLayout(content, width, height, overrides)
  // Image colour edits via the shared pipeline (same as every other template):
  // exposure/contrast/saturation → filtersToCss, grayscale folded in. Applies to
  // both the zone image and the full-bleed background.
  const imageFilterCss = filtersToCss(
    applyGrayscaleBoolean(content.imageFilters ?? NEUTRAL_FILTERS, content.bgGrayscale ?? false),
  )
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

  // Primary-button (filled pill) colors. Inverse of the surface so it adapts
  // across light/dark; over an image, the pill takes the on-image contrast
  // colour with opposite-colour text so it reads on the photo.
  const buttonBg = overlay ? onImageColor : t.textPrimary
  const buttonText = overlay ? (overlayLight ? '#ffffff' : '#111111') : t.backgroundPrimary

  const chromeFor = (id: CustomBlockId, fontSize: number) =>
    brandChrome(id, { fontSize, textColor, btnText, align: layout.textAlign, ctaStyle, buttonBg, buttonText })

  // Lab drag wrapper: full-width grab target tagged for drag-reorder hit-testing.
  const wrapEditable = (id: CustomBlockId, node: ReactNode): ReactNode => (
    <div data-cs-block={id} style={{ width: '100%', cursor: 'grab', opacity: activeBlockId === id ? 0.4 : 1, transition: 'opacity 0.12s' }}>{node}</div>
  )

  // The zone image is NOT wrapped in the factory Editable: custom-size owns its
  // interaction entirely via CustomSizeStage (click → editor, drag → flip/hide).
  // Wrapping it in Editable would re-introduce a mousedown-select that opens the
  // editor mid-drag. `data-cs-image` (set on the placeholder) is the hit target.
  const wrapImage = (node: ReactNode): ReactNode => node

  // html-format blocks render via dangerouslySetInnerHTML so inline bold/italic
  // survives the edit; plain blocks render as text. Empty → canonical placeholder.
  const HTML_BLOCKS = new Set<CustomBlockId>(['headline', 'subhead', 'body'])
  const defaultInnerFor = (id: CustomBlockId): ReactNode => {
    const val = content[id] || SLOT_PLACEHOLDERS[id]
    return HTML_BLOCKS.has(id)
      ? <div dangerouslySetInnerHTML={{ __html: val }} />
      : <span>{val}</span>
  }

  const toBlocks = (items: ResolvedTextBlock[]): ContentStackBlock<CustomBlockId>[] =>
    items.map((b) => ({
      id: b.id,
      visible: true,
      defaultInner: defaultInnerFor(b.id),
      renderChrome: chromeFor(b.id, b.fontSize),
    }))

  // The chip wraps through renderBlock — same as the text blocks — so it's
  // selectable and hideable to the bench (typical Stage & Bench behavior).
  const renderPill = renderBlock ? (node: ReactNode) => renderBlock('solutionPill', node) : undefined
  const headerRow = (justify: CSSProperties['justifyContent']): ReactNode => (
    <BrandHeaderRow
      showLogo={layout.showLogo}
      logoFill={logoFill}
      logoHeight={layout.logoHeight}
      pill={layout.showSolutionPill ? { solutionColor: sol.color, solutionLabel: sol.label, textColor, background: t.bgCategoryChip, border: `0.79px solid ${t.borderFocus}` } : null}
      pillScale={layout.pillScale}
      gap={layout.gap * 2}
      justify={justify}
      renderPill={renderPill}
    />
  )

  const stack = (items: ResolvedTextBlock[], align = layout.textStackAlign): ReactNode => (
    <ContentStack<CustomBlockId>
      blocks={toBlocks(items)}
      defaultGap={layout.gap}
      gaps={gaps}
      stackAlign={align}
      alignItems={layout.alignItems}
      renderBlock={renderBlock ?? (interactive ? wrapEditable : undefined)}
      renderInlineEditor={renderInlineEditor}
      renderSpacerBetween={renderSpacerBetween}
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
    const owMax = width > height ? '62%' : '100%'
    // Single source — the modal preview paints the exact same scrim (overlay.ts).
    const overlayBg = overlayBackground({ color: oColor, opacity: oOpacity, coverage: cov, noise: content.overlayNoise ?? false })
    inner = (
      <>
        <img
          src={content.backgroundImage || ''}
          alt=""
          data-export-image="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, filter: imageFilterCss }}
        />
        <div style={{ position: 'absolute', inset: 0, background: overlayBg }} />
        {content.overlayNoise && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE_BG, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: layout.padding, gap: layout.gap }}>
          {headerRow('flex-start')}
          <div style={{ maxWidth: owMax, flex: 1, minHeight: 0 }}>{stack(layout.blocks)}</div>
        </div>
      </>
    )
  } else if (layout.kind === 'strip') {
    const hl = layout.blocks.find((b) => b.id === 'headline')
    const cta = layout.blocks.find((b) => b.id === 'cta')
    const ctaSize = cta ? cta.fontSize : Math.max(14, layout.logoHeight * 0.55)
    // Headline + CTA ride the same renderInlineEditor → renderBlock path as every
    // other block, so they select / inline-edit / move to the bench. The Editable
    // wrapper is display:contents, so the flex layout (flex:1 headline) survives.
    const stripBlock = (id: CustomBlockId, styleWrap: (n: ReactNode) => ReactNode): ReactNode => {
      const withEditor = renderInlineEditor ? renderInlineEditor(id, defaultInnerFor(id)) : defaultInnerFor(id)
      const styled = styleWrap(withEditor)
      return renderBlock ? renderBlock(id, styled) : styled
    }
    inner = (
      <div style={{ display: 'flex', alignItems: 'center', gap: layout.gap * 1.5, height: '100%', padding: `0 ${layout.padding}px` }}>
        {layout.showLogo && <CorityLogo fill={logoFill} height={layout.logoHeight} />}
        {layout.showSolutionPill && (() => {
          const pillNode = <SolutionPill variant="email" scale={layout.pillScale} solutionColor={sol.color} solutionLabel={sol.label} textColor={textColor} background={t.bgCategoryChip} border={`0.79px solid ${t.borderFocus}`} />
          return renderPill ? renderPill(pillNode) : pillNode
        })()}
        {hl && stripBlock('headline', (node) => (
          <div style={{ flex: 1, minWidth: 0, fontSize: hl.fontSize, fontWeight: 300, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node}</div>
        ))}
        {cta && stripBlock('cta', (node) => (
          // Same brandChrome path as every other band, so link/button switches
          // here too. flex-shrink:0 keeps the CTA from collapsing in the row.
          <span style={{ flexShrink: 0 }}>{brandChrome('cta', { fontSize: ctaSize, textColor, btnText, align: 'left', ctaStyle, buttonBg, buttonText })(node)}</span>
        ))}
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
    // Image on a relative wrapper so the inner-edge resize handle can overhang
    // the divider (overflow visible) without clipping. The placeholder keeps the
    // `data-cs-image` tag for the stage's flip/hide gesture; the handle sits
    // outside it (sibling) so a divider drag never triggers a flip.
    const imageCol = wrapImage(
      <div style={{ position: 'relative', width: `${layout.imageFraction * 100}%`, height: '100%', flexShrink: 0 }}>
        <ImagePlaceholder tag={interactive || !!renderBlock} src={content.zoneImageUrl} focalX={content.bgFocalX} focalY={content.bgFocalY} zoom={content.bgZoom} filterCss={imageFilterCss} style={{ width: '100%', height: '100%' }} />
        {onResizeImageFraction && (
          <ImageFractionHandle axis="x" edge={layout.imageSide === 'left' ? 'right' : 'left'} scale={scale} total={width} fraction={layout.imageFraction} onResize={onResizeImageFraction} />
        )}
      </div>,
    )
    inner = (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        {layout.imageSide === 'left' ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
      </div>
    )
  } else if (layout.kind === 'hero-top') {
    const heroImage = wrapImage(
      <div style={{ position: 'relative', width: '100%', height: `${layout.imageFraction * 100}%`, flexShrink: 0 }}>
        <ImagePlaceholder tag={interactive || !!renderBlock} src={content.zoneImageUrl} focalX={content.bgFocalX} focalY={content.bgFocalY} zoom={content.bgZoom} filterCss={imageFilterCss} style={{ width: '100%', height: '100%' }} />
        {onResizeImageFraction && (
          <ImageFractionHandle axis="y" edge={layout.imageVPos === 'bottom' ? 'top' : 'bottom'} scale={scale} total={height} fraction={layout.imageFraction} onResize={onResizeImageFraction} />
        )}
      </div>,
    )
    const heroText = (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: layout.gap, padding: layout.padding }}>
        {headerRow('flex-start')}
        <div style={{ flex: 1, minHeight: 0 }}>{stack(layout.blocks)}</div>
      </div>
    )
    inner = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {layout.imageVPos === 'bottom' ? <>{heroText}{heroImage}</> : <>{heroImage}{heroText}</>}
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

  return <div style={container}>{inner}{renderOverlay?.()}</div>
}
