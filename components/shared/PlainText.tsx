import type { CSSProperties } from 'react'

/**
 * Renders the value of a multi-line `format: 'plain'` slot.
 *
 * Sibling of `RichText`, for the other half of `SlotContentSpec.format`. Plain
 * slots store a bare string — `InlineTextEdit` reads `innerText` back out, so a
 * user's Enter arrives in the store as a literal `\n`. HTML collapses newlines
 * to spaces, and `InlineTextEdit` itself edits under `white-space: pre-wrap`, so
 * without this the break is visible while editing and silently disappears the
 * moment the edit commits — and never reaches the export at all.
 *
 * Only needed where line breaks are actually reachable: a slot that is neither
 * `singleLine: true` nor `kind: 'cta'` (which defaults to single-line). Single-
 * line slots can't contain a `\n`, so they render as ordinary text children.
 *
 * `scripts/validate-registrations.ts` enforces this: any multi-line plain slot
 * whose render site isn't a `<PlainText>` fails the build gate.
 *
 * Defaults to `span` — plain slots are usually inline inside their parent's text
 * flow, where a block box would reflow the layout. Pass `as="div"` when the slot
 * owns its own line.
 */
export function PlainText({
  text,
  className,
  style,
  as: Tag = 'span',
}: {
  /** The slot's plain-string value. Callers pass their placeholder fallback in. */
  text: string
  className?: string
  style?: CSSProperties
  as?: 'div' | 'span'
}) {
  return (
    <Tag className={className ? `dd-plain-text ${className}` : 'dd-plain-text'} style={style}>
      {text}
    </Tag>
  )
}
