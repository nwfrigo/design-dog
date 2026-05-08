'use client'

/**
 * Editbar shell primitives — shared across every contextual toolbar.
 *
 * Tokens mirror the Design Dog Figma file (toolbar_text / toolbar_cta /
 * toolbar_image / toolbar_slider, node family 277:3029, 367:360, etc.).
 * All color tokens reference CSS variables so the toolbar swaps with the
 * app-chrome theme — light mode renders on a white surface with neutral
 * text, dark mode on a near-black surface with soft text.
 */

import type { CSSProperties, ReactNode } from 'react'
import { GripVertical } from 'lucide-react'

export const EDITBAR_TOKENS = {
  // Surfaces — theme-aware. Each value is `rgb(var(--token))` so the
  // computed style swaps when html.dark toggles.
  bg: 'rgb(var(--surface-primary))',
  border: 'rgb(var(--line-subtle))',
  borderThin: 0.5,
  // Icon colors — semantic content tokens. Active/hover lifts to primary
  // (highest-contrast against the surface); disabled drops to tertiary.
  iconDefault: 'rgb(var(--content-secondary))',
  iconActive: 'rgb(var(--content-primary))',
  iconDisabled: 'rgb(var(--content-tertiary))',
  iconDestructive: 'rgb(var(--content-destructive))',
  // Text
  textPrimary: 'rgb(var(--content-primary))',
  textSecondary: 'rgb(var(--content-secondary))',
  // Spacing scale
  space1: 4,
  space2: 8,
  space3: 12,                 // horizontal padding, section gap
  space4: 16,                 // within-section icon gap (matches Figma)
  space5: 20,
  // Sizes — fixed by Figma spec
  height: 36,
  radius: 4,                  // radius/sm
  iconSize: 24,               // grip / large icons
  iconSizeSm: 18,             // inline action icons (eye-off, B, I, A↑ A↓, ↕)
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: 11,
} as const

export function EditbarRoot({
  ariaLabel,
  children,
}: {
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: EDITBAR_TOKENS.space3,
        height: EDITBAR_TOKENS.height,
        background: EDITBAR_TOKENS.bg,
        border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
        borderRadius: EDITBAR_TOKENS.radius,
        padding: `${EDITBAR_TOKENS.space1}px ${EDITBAR_TOKENS.space3}px`,
        fontFamily: EDITBAR_TOKENS.fontFamily,
        fontSize: EDITBAR_TOKENS.fontSize,
        // Theme-aware lift: light mode = subtle drop shadow, dark mode =
        // soft glow. Same elevation tokens as BenchChip for consistency.
        boxShadow: '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        color: EDITBAR_TOKENS.textPrimary,
      }}
    >
      {children}
    </div>
  )
}

export type SectionGap = 'tight' | 'default' | 'loose'

const SECTION_GAP_PX: Record<SectionGap, number> = {
  tight: EDITBAR_TOKENS.space3,    // 12
  default: EDITBAR_TOKENS.space4,  // 16 — Figma's standard within-section icon gap
  loose: EDITBAR_TOKENS.space5,    // 20
}

export function EditbarSection({
  children,
  gap = 'default',
}: {
  children: ReactNode
  gap?: SectionGap
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SECTION_GAP_PX[gap],
      }}
    >
      {children}
    </div>
  )
}

export function EditbarDivider() {
  return (
    <div
      aria-hidden
      style={{
        alignSelf: 'stretch',
        width: EDITBAR_TOKENS.borderThin,
        background: EDITBAR_TOKENS.border,
      }}
    />
  )
}

export function EditbarDragHandle() {
  return (
    <div
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: EDITBAR_TOKENS.iconDefault,
        cursor: 'grab',
      }}
    >
      <GripVertical size={EDITBAR_TOKENS.iconSize} />
    </div>
  )
}

export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps {
  ariaLabel: string
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  active?: boolean
  size?: IconButtonSize
  /** Read-only indicator (no hover, no click). */
  cosmetic?: boolean
}

export function EditbarIconButton({
  ariaLabel,
  children,
  onClick,
  disabled,
  destructive,
  active,
  size = 'sm',
  cosmetic,
}: IconButtonProps) {
  const px = size === 'md' ? EDITBAR_TOKENS.iconSize : EDITBAR_TOKENS.iconSizeSm
  const restingColor = disabled
    ? EDITBAR_TOKENS.iconDisabled
    : destructive
      ? EDITBAR_TOKENS.iconDestructive
      : active
        ? EDITBAR_TOKENS.iconActive
        : EDITBAR_TOKENS.iconDefault

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      // Prevent button from stealing focus from the active contentEditable when clicked.
      // Without this, formatting commands (bold/italic) lose their target selection.
      onMouseDown={(e) => e.preventDefault()}
      onClick={cosmetic ? undefined : onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        color: restingColor,
        cursor: disabled || cosmetic ? 'default' : 'pointer',
        transition: 'color 120ms ease-out',
      }}
      onMouseEnter={(e) => {
        if (disabled || cosmetic || destructive) return
        e.currentTarget.style.color = EDITBAR_TOKENS.iconActive
      }}
      onMouseLeave={(e) => {
        if (disabled || cosmetic || destructive) return
        e.currentTarget.style.color = restingColor
      }}
    >
      {children}
    </button>
  )
}

export const popoverSurfaceStyle: CSSProperties = {
  background: EDITBAR_TOKENS.bg,
  border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
  borderRadius: EDITBAR_TOKENS.radius,
  padding: EDITBAR_TOKENS.space3,
  boxShadow: '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
  fontFamily: EDITBAR_TOKENS.fontFamily,
  color: EDITBAR_TOKENS.iconDefault,
}
