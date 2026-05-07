'use client'

/**
 * Editbar shell primitives — shared across every contextual toolbar.
 *
 * Tokens mirror the Design Dog Figma file (toolbar_text / toolbar_image /
 * toolbar_slider, node family 277:2731+). Single source of truth — when a
 * token changes in Figma, update it here and every editbar restyles.
 */

import type { CSSProperties, ReactNode } from 'react'
import { GripVertical } from 'lucide-react'

export const EDITBAR_TOKENS = {
  // Surfaces
  bg: '#161719',
  border: '#494a4c',
  borderThin: 0.5,
  // Icon colors (resolved from Figma variables: text/secondary, text/primary, text/tertiary)
  iconDefault: '#7c7d80',     // text/secondary — resting
  iconActive: '#ffffff',      // text/primary — hover + selected/active
  iconDisabled: '#343538',    // text/tertiary — non-interactive
  iconDestructive: '#eb3232',
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#7c7d80',
  // Spacing scale
  space1: 4,
  space2: 8,
  space3: 12,                 // section gap (between groups)
  space4: 16,                 // within-section icon gap
  space5: 20,
  // Sizes
  height: 36,                 // editbar height (fixed)
  radius: 4,                  // outer corner radius
  iconSize: 24,               // grip / large icons
  iconSizeSm: 18,             // inline action icons (B I A↑ A↓ ↕)
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
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
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
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
  fontFamily: EDITBAR_TOKENS.fontFamily,
  color: EDITBAR_TOKENS.iconDefault,
}

/**
 * Labeled segmented toggle for the editbar — words inside the switch.
 * Matches the dark editbar palette: subtle inset backdrop, active cell goes
 * darker (toward black) with white text, inactive stays muted.
 */
export interface EditbarSegmentedOption<T extends string> {
  value: T
  label: string
}

export function EditbarSegmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (next: T) => void
  options: readonly EditbarSegmentedOption<T>[]
  ariaLabel?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 2,
        borderRadius: EDITBAR_TOKENS.radius,
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange(opt.value)}
            style={{
              minWidth: 48,
              padding: '4px 10px',
              borderRadius: Math.max(EDITBAR_TOKENS.radius - 1, 2),
              border: 'none',
              background: active ? '#000' : 'transparent',
              color: active ? EDITBAR_TOKENS.iconActive : EDITBAR_TOKENS.iconDefault,
              fontFamily: EDITBAR_TOKENS.fontFamily,
              fontSize: EDITBAR_TOKENS.fontSize,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'color 120ms, background 120ms',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
