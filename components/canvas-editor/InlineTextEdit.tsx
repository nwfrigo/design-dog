'use client'

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'

type InlineTextEditProps = {
  value: string
  onChange: (next: string) => void
  /** 'html' preserves rich tags (bold/italic); 'plain' is text-only. Default 'html'. */
  format?: 'html' | 'plain'
  /** Suppresses Enter (no newlines). Used for plain-text fields like eyebrow / CTA. */
  singleLine?: boolean
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
  style,
  autoFocus = true,
}: InlineTextEditProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initialRef = useRef(value)

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
        onChange(format === 'html' ? el.innerHTML : el.innerText)
      }}
      onKeyDown={(e) => {
        if (singleLine && e.key === 'Enter') {
          e.preventDefault()
        }
      }}
    />
  )
}
