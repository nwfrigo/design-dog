'use client'

import { type ReactNode, type CSSProperties } from 'react'
import {
  Moon, Sun,
  AlignLeft, AlignCenter,
  ArrowDownFromLine, UnfoldVertical, ArrowUpFromLine,
  ImageUp, Scale, Type,
  type LucideIcon,
} from 'lucide-react'

/**
 * SelectorPrimitive — segmented chip atom for the Stage Bar.
 *
 * Visual contract (matches Figma node 323:176):
 *   - Each cell: 28×28, 0.5px border (stroke/hairline) of line-subtle, bg surface-primary
 *   - First cell radius/sm on left corners; last cell radius/sm on right corners
 *   - Icon variants: 12×12 lucide icon centered
 *   - Color variants: pure 28×28 swatch (no icon), cells fill with the option's color/image
 *   - Active state: filled with content-primary, inverted icon color
 *
 * API: discriminated by `kind`. Each kind has its own typed value/onChange and the
 * cells it surfaces. Adding a new kind = one new branch in `SelectorCellSpec`,
 * one new dispatch in the renderer.
 */

// Icon size matches the toolbar's inline icons (toolbar_text, toolbar_image,
// etc.). Same 18px target across every "stage chrome" control surface so
// the visual rhythm is consistent.
const ICON_SIZE = 18

type CellRender = ReactNode | ((active: boolean) => ReactNode)

type CellSpec<V extends string> = {
  value: V
  ariaLabel: string
  render: CellRender
}

// ---- per-kind cell definitions -----------------------------------------------

const THEME_CELLS: CellSpec<'light' | 'dark'>[] = [
  { value: 'dark',  ariaLabel: 'Dark theme',  render: <Moon size={ICON_SIZE} /> },
  { value: 'light', ariaLabel: 'Light theme', render: <Sun size={ICON_SIZE} /> },
]

const ALIGNMENT_CELLS: CellSpec<'left' | 'center'>[] = [
  { value: 'left',   ariaLabel: 'Align left',   render: <AlignLeft size={ICON_SIZE} /> },
  { value: 'center', ariaLabel: 'Align center', render: <AlignCenter size={ICON_SIZE} /> },
]

const STACK_CELLS: CellSpec<'top' | 'center' | 'bottom'>[] = [
  { value: 'top',    ariaLabel: 'Stack top',    render: <ArrowDownFromLine size={ICON_SIZE} /> },
  { value: 'center', ariaLabel: 'Stack center', render: <UnfoldVertical    size={ICON_SIZE} /> },
  { value: 'bottom', ariaLabel: 'Stack bottom', render: <ArrowUpFromLine   size={ICON_SIZE} /> },
]

const LAYOUT_CELLS: CellSpec<'image' | 'even' | 'text'>[] = [
  { value: 'image', ariaLabel: 'Image-heavy layout', render: <ImageUp size={ICON_SIZE} /> },
  { value: 'even',  ariaLabel: 'Even layout',        render: <Scale   size={ICON_SIZE} /> },
  { value: 'text',  ariaLabel: 'Text-heavy layout',  render: <Type    size={ICON_SIZE} /> },
]

// ---- discriminated props -----------------------------------------------------

type ColorSwatch = {
  /** CSS background image — for gradients (preferred for gradient-styled templates) */
  backgroundImage?: string
  /** CSS background color — for solid swatches */
  backgroundColor?: string
}

export type ColorOption = { value: string; swatch: ColorSwatch; ariaLabel?: string }

/** Generic option for the `enum` kind. Each cell renders one of: an icon
 *  (Lucide component), a color/image swatch (36×36 fill), or a short text
 *  label. Priority when multiple are set: icon > swatch > label. Always
 *  provide `ariaLabel` so the cell is selectable by assistive tech. */
export type EnumOption = {
  value: string
  ariaLabel: string
  icon?: LucideIcon
  swatch?: ColorSwatch
  label?: string
}

type ThemeProps     = { kind: 'theme';     value: 'light' | 'dark'; onChange: (v: 'light' | 'dark') => void }
type AlignmentProps = { kind: 'alignment'; value: 'left' | 'center'; onChange: (v: 'left' | 'center') => void }
type StackProps     = { kind: 'stack';     value: 'top' | 'center' | 'bottom'; onChange: (v: 'top' | 'center' | 'bottom') => void }
type LayoutProps    = { kind: 'layout';    value: 'image' | 'even' | 'text'; onChange: (v: 'image' | 'even' | 'text') => void }
type ColorProps     = { kind: 'color-2' | 'color-3' | 'color-4'; value: string; onChange: (v: string) => void; options: ColorOption[] }
type EnumProps      = { kind: 'enum';      value: string; onChange: (v: string) => void; options: EnumOption[] }

export type SelectorPrimitiveProps = ThemeProps | AlignmentProps | StackProps | LayoutProps | ColorProps | EnumProps

// ---- shared cell button ------------------------------------------------------

function Cell({
  ariaLabel,
  active,
  onClick,
  isFirst,
  isLast,
  isColor,
  swatch,
  wide,
  children,
}: {
  ariaLabel: string
  active: boolean
  onClick: () => void
  isFirst: boolean
  isLast: boolean
  isColor: boolean
  swatch?: ColorSwatch
  /** When true, the cell auto-sizes to its content width (with 12px
   *  horizontal padding) instead of the fixed 36×36 square. Used by
   *  text-label `enum` cells. */
  wide?: boolean
  children?: ReactNode
}) {
  const cornerClass = [
    isFirst ? 'rounded-l-[4px]' : '',
    isLast ? 'rounded-r-[4px]' : '',
  ].join(' ')

  const swatchStyle: CSSProperties | undefined = isColor && swatch
    ? {
        backgroundImage: swatch.backgroundImage,
        backgroundColor: swatch.backgroundColor,
        // Without cover/center the cell shows the natural-size image's
        // top-left corner. We want a scaled-down crop that fills the cell.
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  // Color cells use the swatch as the surface; non-active state still shows it.
  // Active gets a heavier border to indicate selection (no fill swap, since the
  // fill IS the swatch — overwriting it with content-primary would lose the color).
  const colorActiveRing = isColor && active ? 'ring-2 ring-line-focus ring-inset' : ''

  // Per Figma: all cells share the same surface/primary fill and line/subtle
  // border. The active vs. inactive distinction lives in the icon color only:
  //   active   → icon/focus  (high-contrast, the chosen state)
  //   inactive → icon/subtle (dim, available to click)
  const fillClass = isColor
    ? '' // color cells get their fill from inline style
    : active
      ? 'bg-surface-primary text-icon-focus'
      : 'bg-surface-primary text-icon-subtle hover:bg-interactive-hover'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={swatchStyle}
      className={[
        // 36px tall cell — matches the toolbar height so the stage chrome
        // (toolbars + selectors) shares one consistent control size.
        // Width is 36px fixed for icon/swatch cells, auto for text-label
        // cells (with 12px horizontal padding).
        'relative shrink-0 h-9',
        wide ? 'min-w-9 px-3 text-xs font-medium' : 'w-9',
        'flex items-center justify-center overflow-hidden',
        'border-[0.5px] border-line-subtle',
        'transition-colors',
        cornerClass,
        fillClass,
        colorActiveRing,
        // Negative margin on non-first cells to overlap shared borders (avoids 1px junction)
        isFirst ? '' : '-ml-px',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ---- main component ----------------------------------------------------------

export function SelectorPrimitive(props: SelectorPrimitiveProps) {
  if (props.kind === 'color-2' || props.kind === 'color-3' || props.kind === 'color-4') {
    const { value, onChange, options } = props
    const expectedLen = props.kind === 'color-2' ? 2 : props.kind === 'color-3' ? 3 : 4
    const cells = options.slice(0, expectedLen)
    return (
      <div className="inline-flex items-center" role="radiogroup">
        {cells.map((opt, i) => (
          <Cell
            key={opt.value}
            ariaLabel={opt.ariaLabel ?? `Color ${opt.value}`}
            active={value === opt.value}
            onClick={() => onChange(opt.value)}
            isFirst={i === 0}
            isLast={i === cells.length - 1}
            isColor
            swatch={opt.swatch}
          />
        ))}
      </div>
    )
  }

  // N-state enum — arbitrary option list, each cell renders an icon OR a
  // text label. No upper bound on options.length; when the row overflows
  // the stage bar's horizontal space, the next iteration will swap the
  // outer wrapper to a horizontal carousel. For now the row simply renders
  // inline. Always-applied min-width keeps cells consistent with the
  // icon-kind primitives.
  if (props.kind === 'enum') {
    const { value, onChange, options } = props
    return (
      <div className="inline-flex items-center" role="radiogroup">
        {options.map((opt, i) => {
          const active = value === opt.value
          const Icon = opt.icon
          // Render priority: icon > swatch > label. Swatch cells use the
          // same surface treatment as color-N (the swatch IS the fill).
          const isSwatch = !Icon && !!opt.swatch
          const isWide = !Icon && !opt.swatch && !!opt.label
          return (
            <Cell
              key={opt.value}
              ariaLabel={opt.ariaLabel}
              active={active}
              onClick={() => onChange(opt.value)}
              isFirst={i === 0}
              isLast={i === options.length - 1}
              isColor={isSwatch}
              swatch={opt.swatch}
              wide={isWide}
            >
              {Icon ? <Icon size={ICON_SIZE} /> : isSwatch ? null : opt.label}
            </Cell>
          )
        })}
      </div>
    )
  }

  const cells: CellSpec<string>[] =
    props.kind === 'theme'     ? THEME_CELLS :
    props.kind === 'alignment' ? ALIGNMENT_CELLS :
    props.kind === 'stack'     ? STACK_CELLS :
                                 LAYOUT_CELLS

  return (
    <div className="inline-flex items-center" role="radiogroup">
      {cells.map((cell, i) => {
        const active = props.value === cell.value
        return (
          <Cell
            key={cell.value}
            ariaLabel={cell.ariaLabel}
            active={active}
            onClick={() => (props.onChange as (v: string) => void)(cell.value)}
            isFirst={i === 0}
            isLast={i === cells.length - 1}
            isColor={false}
          >
            {typeof cell.render === 'function' ? cell.render(active) : cell.render}
          </Cell>
        )
      })}
    </div>
  )
}
