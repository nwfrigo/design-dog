'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import {
  applyGrayscaleBoolean,
  filtersToCss,
  NEUTRAL_FILTERS,
  type ImageFilters,
} from '@/lib/image-filters'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export type WebsitePressReleaseBlockId =
  | 'image'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'body'
  | 'cta'

/** Logical IDs for vertical-stack endpoints in the left column. 'logo' is
 *  the always-on header anchor; solutionPill renders alongside it. */
type WebsitePressReleaseStackId = 'logo' | 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'

const DEFAULT_GAP = 25.10

export function websitePressReleaseGapKey(
  prevId: WebsitePressReleaseStackId,
  nextId: WebsitePressReleaseStackId,
): string {
  return `gap-${prevId}-to-${nextId}`
}

export interface WebsitePressReleaseProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  /** Per-image exposure/contrast/saturation. Renders as CSS filter on the
   *  <img>; legacy `grayscale` boolean is OR-folded in via
   *  applyGrayscaleBoolean(). Defaults to neutral. */
  imageFilters?: ImageFilters
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
  theme?: TemplateTheme
  logoColor: 'black' | 'orange'
  headlineFontSize?: number
  subheadFontSize?: number
  /** Vertical alignment for the left-side content stack. Logo + solutionPill
   *  stay anchored to the top; image is independent (right column). */
  stackAlign?: StackAlign
  /** Sparse gap overrides keyed via `websitePressReleaseGapKey(prev, next)`.
   *  Falls back to DEFAULT_GAP per slot. */
  gaps?: Record<string, number>
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  /** Stage & Bench render-prop: wraps each editable region in <Editable>. */
  renderBlock?: (blockId: WebsitePressReleaseBlockId, content: ReactNode) => ReactNode
  /** Stage & Bench render-prop: swaps a block's inner text for an in-place editor. */
  renderInlineEditor?: (blockId: WebsitePressReleaseBlockId, defaultInner: ReactNode) => ReactNode
  /** Stage & Bench render-prop for spacer slots in the left content stack.
   *  Editor passes a drag handle; export omits → falls back to a plain div. */
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: WebsitePressReleaseStackId,
    nextId: WebsitePressReleaseStackId,
  ) => ReactNode
  /** Stage & Bench render-prop: absolutely-positioned overlay inside the
   *  template's stacking context (drag scrim lives here). */
  renderOverlay?: () => ReactNode
}

type PRStackBlock = ContentStackBlock<WebsitePressReleaseStackId>

export function WebsitePressRelease({
  eyebrow,
  headline,
  subhead,
  body,
  cta,
  solution,
  imageUrl = '/placeholder-mountain.jpg',
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showBody,
  showCta,
  grayscale = false,
  theme = 'light',
  logoColor,
  headlineFontSize,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  colors,
  typography,
  scale = 1,
  renderBlock,
  renderInlineEditor,
  renderSpacerBetween,
  renderOverlay,
}: WebsitePressReleaseProps) {
  // Default identity render-props so non-Stage-&-Bench callers behave
  // identically to before.
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = themeColors.logoFill

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  // Reconcile per-image filters with the legacy per-asset grayscale boolean:
  // grayscale=true forces saturation = -1 regardless of slider value. Lets
  // pre-filter assets render correctly without a store migration.
  const effectiveFilters = applyGrayscaleBoolean(imageFilters, grayscale)
  const filterCss = filtersToCss(effectiveFilters)

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 33.33,
    position: 'relative',
    background: themeColors.backgroundPrimary,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10.42,
  }

  return (
    <div style={containerStyle}>
      {/* Right side image - extends to right edge. Wrapped for Stage &
       *  Bench so it can receive the EditbarImage toolbar on selection. */}
      {wrapBlock(
        'image',
        <div
          style={{
            position: 'absolute',
            left: 462,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
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
              // Per-image filter (exposure/contrast/saturation). When a
              // pre-converted grayscale URL is in use, skip the saturate(0)
              // component to avoid double-applying — but keep
              // exposure/contrast active. When no pre-converted URL,
              // include saturation so the CSS does the grayscale work.
              filter:
                filterCss && grayscaleImageUrl
                  ? filtersToCss({ ...effectiveFilters, saturation: 0 }) ?? 'none'
                  : filterCss ?? 'none',
            }}
          />
        </div>,
      )}

      {/* Left content area — header anchored top, ContentStack handles
       *  the body blocks. The header (logo + solution pill row) is the
       *  topAnchor; ContentStack manages its gap to first visible block. */}
      <div
        style={{
          width: 396,
          flex: '1 1 0',
          overflow: 'hidden',
        }}
      >
        <ContentStack<WebsitePressReleaseStackId>
          blocks={[
            {
              id: 'eyebrow',
              visible: showEyebrow && !!eyebrow,
              defaultInner: eyebrow,
              renderChrome: (inner) => (
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: themeColors.textPrimary,
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1.38,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'headline',
              visible: showHeadline,
              defaultInner: headline || 'Lightweight header.',
              renderChrome: (inner) => (
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: themeColors.textPrimary,
                    fontSize: headlineFontSize ?? 35.42,
                    fontWeight: 350,
                    lineHeight: `${(headlineFontSize ?? 35.42) * (50.20 / 35.42)}px`,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'subhead',
              visible: showSubhead && !!subhead,
              defaultInner: subhead,
              renderChrome: (inner) => (
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: themeColors.textPrimary,
                    fontSize: subheadFontSize ?? 22,
                    fontWeight: 350,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'body',
              visible: showBody && !!body,
              defaultInner: body,
              renderChrome: (inner) => (
                <div
                  style={{
                    alignSelf: 'stretch',
                    color: themeColors.textPrimary,
                    fontSize: 14.58,
                    fontWeight: 350,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'cta',
              visible: showCta && !!cta,
              defaultInner: cta,
              renderChrome: (inner) => (
                <div
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 12.50,
                  }}
                >
                  <span
                    style={{
                      textAlign: 'center',
                      color: themeColors.buttonSecondaryText,
                      fontSize: 18.75,
                      fontWeight: 500,
                      lineHeight: '18.75px',
                    }}
                  >
                    {inner}
                  </span>
                  <ArrowIcon color={themeColors.buttonSecondaryText} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
                </div>
              ),
            },
          ]}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: WebsitePressReleaseStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: WebsitePressReleaseStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: (
              <div
                style={{
                  display: 'inline-flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 49.70,
                  flexShrink: 0,
                }}
              >
                <CorityLogo fill={logoFill} height={29} />

                {/* Solution Pill — wrapped via renderBlock so the editor
                 *  can select it; not part of the stack (it sits inside
                 *  the header row alongside the logo). */}
                {solution !== 'none' && wrapBlock(
                  'solutionPill',
                  <SolutionPill
                    variant="website-press-release"
                    solutionColor={solutionColor}
                    solutionLabel={solutionLabel}
                    textColor={themeColors.textPrimary}
                    background={themeColors.bgCategoryChip}
                    border={`1px solid ${themeColors.borderFocus}`}
                  />,
                )}
              </div>
            ),
          }}
          alignItems="flex-start"
        />
      </div>
      {renderOverlay?.()}
    </div>
  )
}
