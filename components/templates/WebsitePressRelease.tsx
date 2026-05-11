'use client'

import { CSSProperties, Fragment, type ReactNode } from 'react'
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

const STACK_JUSTIFY: Record<StackAlign, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
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

type PRStackBlock =
  | { id: Exclude<WebsitePressReleaseStackId, 'logo'>; node: ReactNode }
  | null

interface PRLeftColumnProps {
  header: ReactNode
  blocks: PRStackBlock[]
  stackAlign: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: WebsitePressReleaseProps['renderSpacerBetween']
}

function renderPressReleaseSpacer(
  prevId: WebsitePressReleaseStackId,
  nextId: WebsitePressReleaseStackId,
  gaps: Record<string, number> | undefined,
  renderSpacerBetween: WebsitePressReleaseProps['renderSpacerBetween'],
): ReactNode {
  const key = websitePressReleaseGapKey(prevId, nextId)
  const value = gaps?.[key] ?? DEFAULT_GAP
  if (renderSpacerBetween) {
    return (
      <div style={{ width: '100%', flexShrink: 0 }} key={key}>
        {renderSpacerBetween(key, value, prevId, nextId)}
      </div>
    )
  }
  return <div key={key} style={{ height: value, width: '100%', flexShrink: 0 }} />
}

function PressReleaseLeftColumn({
  header, blocks, stackAlign, gaps, renderSpacerBetween,
}: PRLeftColumnProps) {
  const visible = blocks.filter((b): b is NonNullable<PRStackBlock> => b !== null)

  return (
    <div
      style={{
        width: 396,
        flex: '1 1 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {header}
      {visible.length > 0 && stackAlign === 'top' &&
        renderPressReleaseSpacer('logo', visible[0].id, gaps, renderSpacerBetween)}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: STACK_JUSTIFY[stackAlign],
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {visible.map((block, i) => (
            <Fragment key={block.id}>
              {block.node}
              {i < visible.length - 1 &&
                renderPressReleaseSpacer(block.id, visible[i + 1].id, gaps, renderSpacerBetween)}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

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

      {/* Left content area — header anchored top, stack container holds the rest */}
      <PressReleaseLeftColumn
        stackAlign={stackAlign}
        gaps={gaps}
        renderSpacerBetween={renderSpacerBetween}
        header={
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

            {/* Solution Pill - white fill with border matching other templates */}
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
        }
        blocks={[
          showEyebrow && eyebrow ? {
            id: 'eyebrow',
            node: wrapBlock(
              'eyebrow',
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
                {wrapInline('eyebrow', eyebrow)}
              </div>,
            ),
          } : null,
          showHeadline ? {
            id: 'headline',
            node: wrapBlock(
              'headline',
              <div
                style={{
                  alignSelf: 'stretch',
                  color: themeColors.textPrimary,
                  fontSize: headlineFontSize ?? 35.42,
                  fontWeight: 350,
                  lineHeight: `${(headlineFontSize ?? 35.42) * (50.20 / 35.42)}px`,
                }}
              >
                {wrapInline('headline', headline || 'Lightweight header.')}
              </div>,
            ),
          } : null,
          showSubhead && subhead ? {
            id: 'subhead',
            node: wrapBlock(
              'subhead',
              <div
                style={{
                  alignSelf: 'stretch',
                  color: themeColors.textPrimary,
                  fontSize: subheadFontSize ?? 22,
                  fontWeight: 350,
                }}
              >
                {wrapInline('subhead', subhead)}
              </div>,
            ),
          } : null,
          showBody && body ? {
            id: 'body',
            node: wrapBlock(
              'body',
              <div
                style={{
                  alignSelf: 'stretch',
                  color: themeColors.textPrimary,
                  fontSize: 14.58,
                  fontWeight: 350,
                }}
              >
                {wrapInline('body', body)}
              </div>,
            ),
          } : null,
          showCta && cta ? {
            id: 'cta',
            node: wrapBlock(
              'cta',
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
                  {wrapInline('cta', cta)}
                </span>
                <ArrowIcon color={themeColors.buttonSecondaryText} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
              </div>,
            ),
          } : null,
        ]}
      />
      {renderOverlay?.()}
    </div>
  )
}
