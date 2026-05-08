'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'
import { MOTION } from './tokens'

/**
 * useFlipReflow — animate any layout reflow inside a container using FLIP.
 *
 * FLIP = First-Last-Invert-Play: capture each tracked element's position
 * before and after a render, compute the delta, apply an inverse transform
 * synchronously (so the element appears to be in its old place), then
 * transition the transform back to zero (so it animates to the new place).
 *
 * Generic by design — knows nothing about canvas-editor or templates. Pass
 * a container ref and (optionally) a selector and the hook animates any
 * matching element that moved between renders.
 *
 * Default selector is `[data-editable-path]` — the same data attribute every
 * Stage & Bench template applies via `<Editable>`. Override the selector to
 * use this hook elsewhere (e.g., asset queue cards, tab strip reorder).
 *
 * Note on `display: contents` wrappers: many editor primitives wrap children
 * in `display: contents` so they don't break flex layout. Such wrappers have
 * no rect of their own, so the hook measures and transforms the wrapper's
 * `firstElementChild` instead. Falls back to the wrapper itself if there is
 * no child.
 *
 * No deps array: runs every render. The diff against the previous positions
 * is the cheap branch, and transforms only apply when an element actually
 * moved — so this is effectively a no-op when nothing changed.
 */
export function useFlipReflow(
  containerRef: RefObject<HTMLElement | null>,
  options: { selector?: string; durationMs?: number; easing?: string } = {},
) {
  const {
    selector = '[data-editable-path]',
    durationMs = MOTION.duration.md,
    easing = MOTION.easing.out,
  } = options

  const prevRects = useRef<Map<string, DOMRect>>(new Map())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector))

    const idFor = (el: HTMLElement): string =>
      el.getAttribute('data-editable-path') || el.dataset.flipId || el.id || ''

    const present = new Set<string>()

    elements.forEach((el) => {
      const id = idFor(el)
      if (!id) return
      present.add(id)

      // Use firstElementChild for `display: contents` wrappers, which have no
      // rect of their own. Falls back to el for normal-display wrappers.
      const target =
        getComputedStyle(el).display === 'contents'
          ? (el.firstElementChild as HTMLElement | null) ?? el
          : el

      const newRect = target.getBoundingClientRect()
      const oldRect = prevRects.current.get(id)

      if (oldRect) {
        const dx = oldRect.left - newRect.left
        const dy = oldRect.top - newRect.top
        // Sub-pixel deltas are noise from layout rounding; ignore.
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          // Compose with any existing transitions the consumer set (e.g.
          // opacity). Strip any prior `transform` so repeated FLIPs don't
          // accumulate duplicates.
          const existing = target.style.transition || ''
          const otherTransitions = existing
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s && !s.startsWith('transform'))
            .join(', ')
          const flipTransition = `transform ${durationMs}ms ${easing}`
          const composedTransition = otherTransitions
            ? `${otherTransitions}, ${flipTransition}`
            : flipTransition

          // INVERT — move element back to where it was, instantly.
          target.style.transition = 'none'
          target.style.transform = `translate(${dx}px, ${dy}px)`
          // Force reflow so the browser commits the displaced position before
          // we set up the transition. Without this, the browser may batch the
          // two style writes and skip the animation entirely.
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          target.offsetHeight
          // PLAY — animate back to natural position.
          target.style.transition = composedTransition
          target.style.transform = ''
        }
      }

      prevRects.current.set(id, newRect)
    })

    // Drop tracking for elements that left the DOM, so re-introducing them
    // later doesn't try to animate from a stale position.
    Array.from(prevRects.current.keys()).forEach((k) => {
      if (!present.has(k)) prevRects.current.delete(k)
    })
  })
}
