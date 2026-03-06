/**
 * Shared SolutionPill component used across all template types.
 *
 * Displays a solution category indicator with a colored dot and uppercase label.
 * Supports multiple size presets for different template channels (email, social,
 * website dark/light, PDF) via the `variant` prop. All styling differences
 * between templates are captured in variant presets, while color/label are
 * passed through from the parent template's brand config.
 */

import { CSSProperties } from 'react'

/** Size/style presets for each template channel family. */
const VARIANTS = {
  /** Dark-background website templates (WebsiteReport, WebsiteWebinar) */
  'website-dark': {
    padding: '15px 19px',
    background: '#060621',
    borderRadius: 6.25,
    border: '0.79px solid #0080FF',
    gap: 12.02,
    dotSize: 11.15,
    dotRadius: 1.92,
    fontSize: 10.80,
    letterSpacing: 1.19,
    textColor: 'white',
    lineHeight: 1 as number | undefined,
  },
  /** Light-background website templates (WebsiteThumbnail) */
  'website-light': {
    padding: '14.96px 18.08px',
    background: '#FFFFFF',
    borderRadius: 7.48,
    border: '1px solid #D9D8D6',
    gap: 14.39,
    dotSize: 10.93,
    dotRadius: 2.30,
    fontSize: 10.59,
    letterSpacing: 1.17,
    textColor: undefined as string | undefined, // uses colors.ui.textPrimary passed via prop
    lineHeight: undefined as number | undefined,
  },
  /** Light-background website press-release (slightly larger than website-light) */
  'website-press-release': {
    padding: '15.58px 18.84px',
    background: '#FFFFFF',
    borderRadius: 7.79,
    border: '1px solid #D9D8D6',
    gap: 14.99,
    dotSize: 11.39,
    dotRadius: 2.40,
    fontSize: 12.50,
    letterSpacing: 1.38,
    textColor: undefined as string | undefined,
    lineHeight: undefined as number | undefined,
  },
  /** Email templates (EmailGrid, EmailImage, EmailSpeakers) - smallest size */
  'email': {
    padding: '12.5px 15px',
    background: undefined as string | undefined, // uses colors.ui.surface passed via prop
    borderRadius: 6.25,
    border: undefined as string | undefined, // uses colors.ui.border passed via prop
    gap: 12,
    dotSize: 9,
    dotRadius: 2,
    fontSize: 8.85,
    letterSpacing: 0.97,
    textColor: undefined as string | undefined,
    lineHeight: undefined as number | undefined,
  },
  /** EmailGrid variant (slightly larger text) */
  'email-grid': {
    padding: '12px 15px',
    background: undefined as string | undefined,
    borderRadius: 6,
    border: undefined as string | undefined,
    gap: 12,
    dotSize: 9,
    dotRadius: 2,
    fontSize: 9,
    letterSpacing: 0.97,
    textColor: undefined as string | undefined,
    lineHeight: undefined as number | undefined,
  },
  /** Social templates (SocialImage, SocialGridDetail) - largest size */
  'social': {
    padding: '20px 24px',
    background: undefined as string | undefined,
    borderRadius: 10,
    border: undefined as string | undefined,
    gap: 19,
    dotSize: 14,
    dotRadius: 3,
    fontSize: 14,
    letterSpacing: 1.54,
    textColor: undefined as string | undefined,
    lineHeight: undefined as number | undefined,
  },
  /** FAQ PDF cover page - print-scale, white bg */
  'faq-cover': {
    padding: '10.76px 13px',
    background: 'white',
    borderRadius: 5.38,
    border: '0.68px solid #D9D8D6',
    gap: 10.34,
    dotSize: 7.86,
    dotRadius: 1.65,
    fontSize: 7.62,
    letterSpacing: 0.84,
    textColor: 'black',
    lineHeight: undefined as number | undefined,
  },
} as const

export type SolutionPillVariant = keyof typeof VARIANTS

export interface SolutionPillProps {
  /** Which size/style preset to use. */
  variant: SolutionPillVariant
  /** The solution category color (from brand config). */
  solutionColor: string
  /** The display label text (from brand config). */
  solutionLabel: string
  /**
   * Fallback text color for variants that don't have a hardcoded text color.
   * Typically `colors.ui.textPrimary` from the parent template.
   */
  textColor?: string
  /**
   * Dynamic background color for variants that don't hardcode it.
   * Typically `colors.ui.surface` from the parent template.
   */
  background?: string
  /**
   * Dynamic border string for variants that don't hardcode it.
   * E.g. `\`0.79px solid ${colors.ui.border}\``
   */
  border?: string
  /** Additional inline styles applied to the outermost container. */
  style?: CSSProperties
}

export function SolutionPill({
  variant,
  solutionColor,
  solutionLabel,
  textColor,
  background,
  border,
  style,
}: SolutionPillProps) {
  const v = VARIANTS[variant]

  const resolvedTextColor = v.textColor ?? textColor ?? '#060015'
  const resolvedBackground = v.background ?? background ?? '#FFFFFF'
  const resolvedBorder = v.border ?? border ?? '1px solid #D9D8D6'

  return (
    <div
      style={{
        padding: v.padding,
        background: resolvedBackground,
        borderRadius: v.borderRadius,
        border: resolvedBorder,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: v.gap,
        ...(variant === 'faq-cover' ? { display: 'inline-flex', alignSelf: 'flex-start' } : {}),
        ...style,
      }}
    >
      {/* Color dot */}
      <div
        style={{
          width: v.dotSize,
          height: v.dotSize,
          background: solutionColor,
          borderRadius: v.dotRadius,
        }}
      />
      {/* Label */}
      <span
        style={{
          color: resolvedTextColor,
          fontSize: v.fontSize,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: v.letterSpacing,
          ...(v.lineHeight != null ? { lineHeight: v.lineHeight } : {}),
        }}
      >
        {solutionLabel}
      </span>
    </div>
  )
}
