'use client'

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'

type InlineTextEditProps = {
  value: string
  onChange: (next: string) => void
  /** 'html' preserves rich tags (bold/italic); 'plain' is text-only. Default 'html'. */
  format?: 'html' | 'plain'
  /** Suppresses Enter (no newlines). Used for plain-text fields like eyebrow / CTA. */
  singleLine?: boolean
  /** Hard cap on visible line count. Input (typing or paste) that would push
   *  the field past `maxLines` rendered lines is rejected (reverts to the last
   *  valid value). Measured from the element's own line-height, so it's
   *  content-independent — 1 keeps a field to a single line, 4 to four. */
  maxLines?: number
  /** Visual style applied to the editor so it matches the block's static rendering. */
  style?: CSSProperties
  /** Auto-focus on mount (default true). */
  autoFocus?: boolean
}

/**
 * Uncontrolled in-place editor.
 *
 * Initializes the DOM once on mount (innerHTML for 'html', innerText for 'plain'),
 * then never touches it from React again. The user owns the DOM during edit;
 * outflow happens via `onInput`. Inflow is intentionally absent so React's
 * reconciliation can't clobber edits in progress.
 *
 * Formatting (bold/italic) in 'html' mode happens via:
 *  - Browser-native Cmd/Ctrl+B / Cmd/Ctrl+I (contentEditable wraps selection in <b>/<i> or <strong>/<em>)
 *  - Future: contextual toolbar buttons that issue selection-wrapping commands.
 */
export function InlineTextEdit({
  value,
  onChange,
  format = 'html',
  singleLine = false,
  maxLines,
  style,
  autoFocus = true,
}: InlineTextEditProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initialRef = useRef(value)
  // Last value that was within the maxLines cap — reverted to when input overflows.
  const lastValidRef = useRef(value)

  const placeCursorEnd = (el: HTMLElement) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  const withinMaxLines = (el: HTMLElement): boolean => {
    if (!maxLines) return true
    const cs = getComputedStyle(el)
    let lh = parseFloat(cs.lineHeight)
    if (!lh || Number.isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.3
    return el.scrollHeight <= lh * maxLines + 1
  }

  useLayoutEffect(() => {
    if (!ref.current) return
    if (format === 'html') {
      if (ref.current.innerHTML !== initialRef.current) {
        ref.current.innerHTML = initialRef.current
      }
    } else {
      if (ref.current.innerText !== initialRef.current) {
        ref.current.innerText = initialRef.current
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!autoFocus || !ref.current) return
    ref.current.focus()
    const range = document.createRange()
    range.selectNodeContents(ref.current)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [autoFocus])

  return (
    <div
      ref={ref}
      style={{ ...style, outline: 'none', whiteSpace: 'pre-wrap' }}
      className={format === 'html' ? 'rich-text-white' : undefined}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!withinMaxLines(el)) {
          // Overflow past the line cap. For plain text, trim from the end until
          // it fits — keeps as much as possible (handles both overflow typing
          // AND large pastes, rather than dropping everything). For rich text,
          // revert to the last valid value (char-slicing HTML could split tags).
          if (format === 'html') {
            el.innerHTML = lastValidRef.current
            placeCursorEnd(el)
            return
          }
          let text = el.innerText
          while (text.length > 0 && !withinMaxLines(el)) {
            text = text.slice(0, -1)
            el.innerText = text
          }
          placeCursorEnd(el)
          lastValidRef.current = text
          onChange(text)
          return
        }
        const next = format === 'html' ? el.innerHTML : el.innerText
        lastValidRef.current = next
        onChange(next)
      }}
      onKeyDown={(e) => {
        if (singleLine && e.key === 'Enter') {
          e.preventDefault()
        }
      }}
    />
  )
}
