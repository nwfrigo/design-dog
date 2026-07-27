import type { CSSProperties } from 'react'

/**
 * Renders the value of a `format: 'html'` slot.
 *
 * This is the ONLY sanctioned way to render an HTML slot value. Slots declared
 * `content: { format: 'html' }` in a Stage & Bench adapter store real HTML —
 * `InlineTextEdit` reads `innerHTML` back out of its contentEditable, and the
 * editbar's block-level Bold/Italic wraps the value in `<strong>` / `<em>`.
 * Passing that string to React as a text child escapes it, so the user sees
 * literal `<strong>` / `<div>` on the canvas and in the export.
 *
 * `scripts/validate-registrations.ts` enforces this: any slot declaring
 * `format: 'html'` whose render site isn't a `<RichText>` fails the build gate.
 *
 * Styling contract lives in `.dd-rich-text` (app/globals.css) — one rule set,
 * inherited by both the editor and the Puppeteer render route, so bold reads
 * as Fakt Pro Medium (500) everywhere instead of the browser's default 700.
 * Typography (font, size, color, line-height) stays with the template's chrome;
 * this primitive owns inline formatting only.
 *
 * Pass `className` to layer a per-template override on top of the canonical
 * rules (e.g. executive-overview's wider paragraph rhythm).
 */
export function RichText({
  html,
  className,
  style,
  as: Tag = 'div',
}: {
  /** The slot's HTML string. Callers pass their placeholder fallback in. */
  html: string
  /** Optional per-template override class, applied alongside `dd-rich-text`. */
  className?: string
  style?: CSSProperties
  /** Host element. Defaults to `div`; pass `span` where the slot renders
   *  inline inside its parent's text flow and a block box would reflow it. */
  as?: 'div' | 'span'
}) {
  return (
    <Tag
      className={className ? `dd-rich-text ${className}` : 'dd-rich-text'}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
