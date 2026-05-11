'use client'

import { Fragment, type CSSProperties, type ReactNode } from 'react'
import type { StackAlign } from '@/types'

/**
 * ContentStack — vertical content stack primitive (Stage & Bench substrate).
 *
 * Owns *spatial relationships between blocks* and nothing else. Templates
 * remain fully in control of:
 *   - block typography (font, size, weight, color, line-height)
 *   - default gap value (passed via `defaultGap`)
 *   - block ordering (caller passes blocks in canonical order)
 *   - block visibility logic (caller sets `block.visible`)
 *   - the outer container (padding, background, dimensions, columns)
 *   - text alignment within each block (block.renderChrome owns it)
 *
 * What ContentStack handles:
 *   - Filtering blocks by `visible` (hidden blocks → no gap → no phantom
 *     double-spacing on the neighbors)
 *   - Vertical flex column with `justifyContent` driven by `stackAlign`
 *   - Calling `renderSpacerBetween` between consecutive visible blocks
 *     (or rendering a static <div height={gap}> in export mode)
 *   - Fanning out `renderBlock` + `renderInlineEditor` per block so the
 *     Stage & Bench editor can wrap each in <Editable> and swap inline
 *     editors when active
 *   - Optional `topAnchor` (always-visible block above the stack, e.g.
 *     a logo) with a managed anchor→first-block spacer when stackAlign
 *     is 'top'. The anchor is OUTSIDE the stackAlign distribution.
 *
 * Anti-convergence guardrails (load-bearing):
 *   1. ContentStack accepts `defaultGap` — NEVER hardcoded
 *   2. ContentStack does NOT style block children (renderChrome owns it)
 *   3. ContentStack does NOT impose a column width (caller wraps if needed)
 *   4. ContentStack does NOT pick block order
 *   5. ContentStack does NOT own visibility logic (caller flags blocks)
 *   6. No variants. If a template's needs don't fit, the template
 *      composes the layout manually for that section.
 *
 * See `.claude/RENOVATION-PLAN.md` §4 + §7 for the full guardrails.
 */

const STACK_JUSTIFY: Record<StackAlign, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
}

/** A single block in the stack. Templates declare typography, alignment,
 *  and any visual chrome inside `renderChrome`. ContentStack just decides
 *  where to put the wrapped result vertically. */
export type ContentStackBlock<BlockId extends string> = {
  id: BlockId
  visible: boolean
  /** Default content rendered inside the chrome. Typically the text /
   *  HTML / image element. `renderInlineEditor` (if provided) swaps this
   *  for an inline editor when the slot is being edited. */
  defaultInner: ReactNode
  /** Wraps the inner content with the block's visual chrome (typography
   *  styles, button background, icons, padding). Template-specific. */
  renderChrome: (inner: ReactNode) => ReactNode
}

export interface ContentStackProps<BlockId extends string> {
  /** All blocks in canonical order. ContentStack filters out non-visible
   *  blocks; the order of visible blocks is preserved. */
  blocks: ContentStackBlock<BlockId>[]

  /** Sparse gap overrides keyed `gap-${prev}-to-${next}`. Missing keys
   *  use `defaultGap`. */
  gaps?: Record<string, number>

  /** Fallback gap value (px) used when no override is provided for a key.
   *  Required because templates each pick their own design-correct value
   *  — there is no substrate-level "default gap." */
  defaultGap: number

  /** Editor-time spacer between blocks. Called with the gap key, current
   *  value, and adjacent block ids. Returns a drag-handle node. When
   *  omitted (export mode, non-migrated callers), a static spacer div
   *  is rendered instead. */
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: BlockId,
    nextId: BlockId,
  ) => ReactNode

  /** Editor-time wrapper around each block (Stage & Bench Editable). */
  renderBlock?: (id: BlockId, content: ReactNode) => ReactNode

  /** Editor-time inline editor swap for a block's inner content. */
  renderInlineEditor?: (id: BlockId, defaultInner: ReactNode) => ReactNode

  /** Vertical distribution within the parent container. Default 'top'. */
  stackAlign?: StackAlign

  /** Optional always-visible anchor block above the stack (e.g. logo).
   *  When provided AND `stackAlign === 'top'`, ContentStack renders a
   *  managed anchor→first-visible-block spacer. The anchor sits outside
   *  the stackAlign distribution (always pinned to the top of the parent
   *  flex container). */
  topAnchor?: TopAnchor<BlockId>

  /** flex `alignItems` for the column. Default 'flex-start'. Pass
   *  'center' for center-aligned templates. */
  alignItems?: CSSProperties['alignItems']

  /** Optional max-width applied to the inner block wrapper. Templates
   *  use this to constrain text line-length without affecting the
   *  outer column width. */
  maxWidth?: number | string

  /** Escape hatches for outer container styling. Use sparingly — most
   *  template-specific styling belongs in the parent wrapper or in each
   *  block's renderChrome, not here. */
  className?: string
  style?: CSSProperties
}

export type TopAnchor<BlockId extends string> = {
  /** Identifier used in the gap key (`gap-${anchorId}-to-${firstBlockId}`).
   *  Constrained to `BlockId` so the template's renderSpacerBetween stays
   *  strictly typed — the anchor id must be declared in the block union. */
  id: BlockId
  /** The anchor's rendered node (template-built — e.g. <Logo />). */
  node: ReactNode
  /** Editor-time wrapper around the anchor itself. Optional. */
  renderBlock?: (node: ReactNode) => ReactNode
}

export function ContentStack<BlockId extends string>({
  blocks,
  gaps,
  defaultGap,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  stackAlign = 'top',
  topAnchor,
  alignItems = 'flex-start',
  maxWidth,
  className,
  style,
}: ContentStackProps<BlockId>) {
  const visible = blocks.filter((b) => b.visible)

  // Anchor → first-visible spacer is only meaningful when the stack is
  // top-anchored. With center/bottom, the stack moves away from the
  // anchor and any anchor-to-first gap loses its visual contract.
  const showAnchorSpacer = !!topAnchor && stackAlign === 'top' && visible.length > 0
  const anchorGapKey =
    topAnchor && visible.length > 0 ? `gap-${topAnchor.id}-to-${visible[0].id}` : null
  const anchorGapValue = anchorGapKey ? gaps?.[anchorGapKey] ?? defaultGap : defaultGap

  const renderSpacer = (
    key: string,
    value: number,
    prevId: BlockId,
    nextId: BlockId,
  ): ReactNode => {
    if (renderSpacerBetween) {
      return (
        <div key={key} style={{ width: '100%', flexShrink: 0 }}>
          {renderSpacerBetween(key, value, prevId, nextId)}
        </div>
      )
    }
    return <div key={key} style={{ height: value, width: '100%', flexShrink: 0 }} />
  }

  const renderedAnchor = topAnchor
    ? (topAnchor.renderBlock
        ? topAnchor.renderBlock(topAnchor.node)
        : topAnchor.node)
    : null

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        ...style,
      }}
    >
      {renderedAnchor}

      {showAnchorSpacer && anchorGapKey &&
        renderSpacer(anchorGapKey, anchorGapValue, topAnchor!.id, visible[0].id)}

      {/* Stack container takes remaining vertical space and distributes
       *  visible blocks per stackAlign. When there's no topAnchor, it
       *  just fills the parent and behaves as a simple column. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: STACK_JUSTIFY[stackAlign],
          alignItems,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems,
            width: '100%',
            ...(maxWidth ? { maxWidth } : {}),
          }}
        >
          {visible.map((block, i) => {
            const inner = renderInlineEditor
              ? renderInlineEditor(block.id, block.defaultInner)
              : block.defaultInner
            const rendered = block.renderChrome(inner)
            const wrapped = renderBlock ? renderBlock(block.id, rendered) : rendered
            return (
              <Fragment key={block.id}>
                {wrapped}
                {i < visible.length - 1 &&
                  renderSpacer(
                    `gap-${block.id}-to-${visible[i + 1].id}`,
                    gaps?.[`gap-${block.id}-to-${visible[i + 1].id}`] ?? defaultGap,
                    block.id,
                    visible[i + 1].id,
                  )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
