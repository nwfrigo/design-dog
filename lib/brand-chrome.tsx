'use client'

/**
 * Brand chrome — the INVARIANT styling of rendered brand blocks, in one place.
 *
 * "Chrome" here = the codebase's `renderChrome` sense: the visual wrapper around
 * a block's content (eyebrow casing/weight, headline weight, the CTA arrow, the
 * logo + solution-pill header row). This is the OUTPUT styling of a design — not
 * the editor UI.
 *
 * Why this exists: the same invariants were copy-pasted across the custom-size
 * engine AND ~19 ContentStack templates, so a brand change (e.g. headline weight)
 * had to be hand-edited in ~20 places and they drifted. This is the single home.
 *
 * Contract: font SIZE is a PARAM (it legitimately differs per context — 38 vs 35
 * vs 84). Everything centralized here is the brand *invariant* (weight, casing,
 * letter-spacing ratio, line-height ratio, arrow geometry). Letter-spacing/line
 * heights are expressed relatively (em / ratio) so the styling is scale-invariant
 * and works for both fixed-size templates and the responsive engine.
 *
 * Adoption is incremental: the custom-size engine consumes this now; the existing
 * templates migrate opportunistically (see SUBSTRATE-DEBT.md → "Brand chrome
 * extraction"). Until a template migrates, it keeps its own renderChrome.
 */

import { type CSSProperties, type ReactNode } from 'react'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { SolutionPill } from '@/components/shared/SolutionPill'

export type BrandBlockId = 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'

export type CtaStyle = 'link' | 'button'

export interface BrandChromeOpts {
  /** Resolved font size in px — per-context, NOT an invariant. */
  fontSize: number
  textColor: string
  /** CTA text/arrow color. Defaults to textColor. */
  btnText?: string
  align?: 'left' | 'center'
  /** CTA rendering: `link` (text + arrow, default) or `button` (filled pill). */
  ctaStyle?: CtaStyle
  /** Filled-pill background for `ctaStyle: 'button'`. Defaults to btnText. */
  buttonBg?: string
  /** Filled-pill text color for `ctaStyle: 'button'`. Defaults to textColor. */
  buttonText?: string
}

/** Returns the `renderChrome` function for a brand block: wraps inner content in
 *  the block's invariant styling at the given font size. */
export function brandChrome(
  id: BrandBlockId,
  { fontSize, textColor, btnText = textColor, align = 'left', ctaStyle = 'link', buttonBg, buttonText }: BrandChromeOpts,
): (inner: ReactNode) => ReactNode {
  // Keyed by block id — arrows live in object-property position (the same idiom
  // the per-template `renderChrome` blocks use). The Record is exhaustive over
  // BrandBlockId, so the compiler enforces every block is handled.
  const chromeById: Record<BrandBlockId, (inner: ReactNode) => ReactNode> = {
    eyebrow: (i) => <div style={{ fontSize, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: textColor, textAlign: align }}>{i}</div>,
    headline: (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.12, color: textColor, textAlign: align }}>{i}</div>,
    subhead: (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.3, color: textColor, opacity: 0.9, textAlign: align }}>{i}</div>,
    body: (i) => <div style={{ fontSize, fontWeight: 300, lineHeight: 1.5, color: textColor, opacity: 0.8, textAlign: align }}>{i}</div>,
    cta: (i) =>
      ctaStyle === 'button' ? (
        // Filled pill (primary). Padding tracks the font size; no trailing arrow.
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: `${fontSize * 0.7}px ${fontSize * 1.4}px`, background: buttonBg ?? btnText, color: buttonText ?? textColor, borderRadius: 999, fontSize, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {i}
        </div>
      ) : (
        // Link (secondary): text + trailing arrow.
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.45, fontSize, fontWeight: 500, color: btnText, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          {i}
          <ArrowIcon color={btnText} width={fontSize * 0.92} height={fontSize * 0.72} />
        </div>
      ),
  }
  return chromeById[id]
}

export interface BrandPill {
  solutionColor: string
  solutionLabel: string
  textColor: string
  background: string
  border: string
}

export interface BrandHeaderRowProps {
  showLogo?: boolean
  logoFill: string
  logoHeight: number
  /** Solution pill, or null to omit. */
  pill?: BrandPill | null
  gap: number
  justify?: CSSProperties['justifyContent']
  /** Size multiplier for the pill so it scales with the canvas (custom-size). */
  pillScale?: number
  /** Wrap the pill so it participates in selection/visibility (Stage & Bench
   *  `renderBlock`). When omitted, the pill renders raw (export / preview). */
  renderPill?: (pill: ReactNode) => ReactNode
}

/** Logo + (optional) solution-pill header row. Returns null when neither shows. */
export function BrandHeaderRow({ showLogo = true, logoFill, logoHeight, pill, gap, justify = 'flex-start', pillScale = 1, renderPill }: BrandHeaderRowProps) {
  if (!showLogo && !pill) return null
  const pillNode = pill ? (
    <SolutionPill variant="email" scale={pillScale} solutionColor={pill.solutionColor} solutionLabel={pill.solutionLabel} textColor={pill.textColor} background={pill.background} border={pill.border} />
  ) : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, justifyContent: justify, flexShrink: 0 }}>
      {showLogo && <CorityLogo fill={logoFill} height={logoHeight} />}
      {pillNode && (renderPill ? renderPill(pillNode) : pillNode)}
    </div>
  )
}
