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

// 2-cell variant of LAYOUT for templates that only have Image / Text
// states (e.g. Website Report, Website Thumbnail). Reuses the same
// ImageUp + Type icons as the 3-cell layout selector so users see the
// same visual vocabulary across the app.
const LAYOUT2_CELLS: CellSpec<'image' | 'text'>[] = [
  { value: 'image', ariaLabel: 'Image variant', render: <ImageUp size={ICON_SIZE} /> },
  { value: 'text',  ariaLabel: 'Text variant',  render: <Type    size={ICON_SIZE} /> },
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
type Layout2Props   = { kind: 'layout-2';  value: 'image' | 'text'; onChange: (v: 'image' | 'text') => void }
type ColorProps     = { kind: 'color-2' | 'color-3' | 'color-4'; value: string; onChange: (v: string) => void; options: ColorOption[] }
type EnumProps      = { kind: 'enum';      value: string; onChange: (v: string) => void; options: EnumOption[] }

export type SelectorPrimitiveProps = ThemeProps | AlignmentProps | StackProps | LayoutProps | Layout2Props | ColorProps | EnumProps

// ---- shared cell button ------------------------------------------------------

/** Per-corner rounding flags. A cell rounds a corner only when it has
 *  no neighbor in the orthogonal direction — i.e. it's on the outer
 *  edge of the grid in that corner. Computed by `computeCellRadii`
 *  from a cell's (row, col) position within an N-cell grid wrapped at
 *  `perRow` columns; the same helper handles single-row and wrapped
 *  layouts so consumers don't branch. */
type CellRadii = { tl: boolean; tr: boolean; bl: boolean; br: boolean }

/** Substrate rule for stage-bar selectors: cells share a uniform 0.5px
 *  hairline border, so the outer corners of the grid round but interior
 *  edges stay square (otherwise the rounded curves would intrude into
 *  shared neighbor borders).
 *
 *  Generalizes cleanly to partial last rows: in a 7-cell grid wrapped
 *  at 4-per-row, the rightmost cell of row 0 rounds both TR (no cell
 *  above) AND BR (no cell below, since row 1 only has 3 cells). Try
 *  any count + perRow and the corners follow naturally. */
function computeCellRadii(index: number, total: number, perRow: number): CellRadii {
  const row = Math.floor(index / perRow)
  const col = index % perRow
  const hasNeighbor = (r: number, c: number) => {
    if (r < 0 || c < 0 || c >= perRow) return false
    const idx = r * perRow + c
    return idx >= 0 && idx < total
  }
  return {
    tl: row === 0 && col === 0,
    tr: row === 0 && !hasNeighbor(row, col + 1),
    bl: col === 0 && !hasNeighbor(row + 1, col),
    br: !hasNeighbor(row, col + 1) && !hasNeighbor(row + 1, col),
  }
}

function Cell({
  ariaLabel,
  active,
  onClick,
  radii,
  isColor,
  swatch,
  wide,
  overlapTop,
  overlapLeft,
  children,
}: {
  ariaLabel: string
  active: boolean
  onClick: () => void
  /** Which corners of this cell should round. Outer-edge corners only —
   *  interior corners stay square so neighbors' shared borders meet
   *  flush. See `computeCellRadii`. */
  radii: CellRadii
  isColor: boolean
  swatch?: ColorSwatch
  /** When true, the cell auto-sizes to its content width (with 12px
   *  horizontal padding) instead of the fixed 36×36 square. Used by
   *  text-label `enum` cells. */
  wide?: boolean
  /** When true, pull the cell up 1px so its top border overlaps the
   *  row above's bottom border. Avoids a 1px doubled line at the
   *  vertical seam. Set to false on the first row. */
  overlapTop?: boolean
  /** When true, pull the cell left 1px so its left border overlaps the
   *  previous cell's right border. Set to false on the first cell of
   *  each row. */
  overlapLeft?: boolean
  children?: ReactNode
}) {
  const cornerClass = [
    radii.tl ? 'rounded-tl-[4px]' : '',
    radii.tr ? 'rounded-tr-[4px]' : '',
    radii.bl ? 'rounded-bl-[4px]' : '',
    radii.br ? 'rounded-br-[4px]' : '',
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
        overlapLeft ? '-ml-px' : '',
        overlapTop ? '-mt-px' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ---- main component ----------------------------------------------------------

/** Substrate-wide wrap threshold for stage-bar selectors. Any cell
 *  grid wider than this rolls to a new row at this column count,
 *  giving wide-option selectors (CC2026's 16 backgrounds, the two
 *  FloatingBanner variant pickers' 7 swatches, plus anything future)
 *  a tidy 4-per-row block that still fits the 240px stage-bar column.
 *  Wrapping only applies to uniform-square cells; text-label cells
 *  (`wide: true`) stay single-row regardless of count because their
 *  variable width would break the grid alignment. */
const WRAP_AT = 4

export function SelectorPrimitive(props: SelectorPrimitiveProps) {
  if (props.kind === 'color-2' || props.kind === 'color-3' || props.kind === 'color-4') {
    const { value, onChange, options } = props
    const expectedLen = props.kind === 'color-2' ? 2 : props.kind === 'color-3' ? 3 : 4
    const cells = options.slice(0, expectedLen)
    // color-N caps at 4 by definition → never wraps. perRow = count
    // gives single-row corner math via the same helper.
    return (
      <CellGrid
        cells={cells.map((opt) => ({
          key: opt.value,
          ariaLabel: opt.ariaLabel ?? `Color ${opt.value}`,
          active: value === opt.value,
          onClick: () => onChange(opt.value),
          isColor: true,
          swatch: opt.swatch,
        }))}
        perRow={cells.length}
      />
    )
  }

  // N-state enum — arbitrary option list, each cell renders an icon OR a
  // text label. When all cells are uniform-square (no `wide` text labels)
  // AND the count exceeds WRAP_AT, the grid wraps at WRAP_AT per row.
  // Text-label rows stay single-row because their widths vary.
  if (props.kind === 'enum') {
    const { value, onChange, options } = props
    const anyWide = options.some((o) => !o.icon && !o.swatch && !!o.label)
    const perRow = !anyWide && options.length > WRAP_AT ? WRAP_AT : options.length
    return (
      <CellGrid
        cells={options.map((opt) => {
          const Icon = opt.icon
          const isSwatch = !Icon && !!opt.swatch
          const isWide = !Icon && !opt.swatch && !!opt.label
          return {
            key: opt.value,
            ariaLabel: opt.ariaLabel,
            active: value === opt.value,
            onClick: () => onChange(opt.value),
            isColor: isSwatch,
            swatch: opt.swatch,
            wide: isWide,
            content: Icon ? <Icon size={ICON_SIZE} /> : isSwatch ? null : opt.label,
          }
        })}
        perRow={perRow}
      />
    )
  }

  const cells: CellSpec<string>[] =
    props.kind === 'theme'     ? THEME_CELLS :
    props.kind === 'alignment' ? ALIGNMENT_CELLS :
    props.kind === 'stack'     ? STACK_CELLS :
    props.kind === 'layout-2'  ? LAYOUT2_CELLS :
                                 LAYOUT_CELLS

  return (
    <CellGrid
      cells={cells.map((cell) => {
        const active = props.value === cell.value
        return {
          key: cell.value,
          ariaLabel: cell.ariaLabel,
          active,
          onClick: () => (props.onChange as (v: string) => void)(cell.value),
          isColor: false,
          content: typeof cell.render === 'function' ? cell.render(active) : cell.render,
        }
      })}
      perRow={cells.length}
    />
  )
}

/** Shared grid renderer for every `SelectorPrimitive` kind. Splits the
 *  flat `cells` list into rows of `perRow` (set perRow=count for a
 *  single-row selector), computes each cell's outer-edge corner radii
 *  from its grid position, and threads the right `overlapTop`/`overlapLeft`
 *  flags so the 0.5px hairline borders meet flush at every seam without
 *  doubling. Owns the `role="radiogroup"` wrapper and the row containers
 *  — keeps the substrate's grid math in one place so future kinds (and
 *  any future cell-count growth) just pass cells + perRow and inherit
 *  the look. */
function CellGrid({
  cells,
  perRow,
}: {
  cells: Array<{
    key: string
    ariaLabel: string
    active: boolean
    onClick: () => void
    isColor: boolean
    swatch?: ColorSwatch
    wide?: boolean
    content?: ReactNode
  }>
  perRow: number
}) {
  const total = cells.length
  const rowCount = Math.max(1, Math.ceil(total / perRow))
  return (
    <div className="inline-flex flex-col items-start" role="radiogroup">
      {Array.from({ length: rowCount }, (_, rowIdx) => {
        const start = rowIdx * perRow
        const rowCells = cells.slice(start, start + perRow)
        return (
          <div key={rowIdx} className="inline-flex items-center">
            {rowCells.map((c, colIdx) => {
              const index = start + colIdx
              const radii = computeCellRadii(index, total, perRow)
              return (
                <Cell
                  key={c.key}
                  ariaLabel={c.ariaLabel}
                  active={c.active}
                  onClick={c.onClick}
                  radii={radii}
                  isColor={c.isColor}
                  swatch={c.swatch}
                  wide={c.wide}
                  overlapLeft={colIdx > 0}
                  overlapTop={rowIdx > 0}
                >
                  {c.content}
                </Cell>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
