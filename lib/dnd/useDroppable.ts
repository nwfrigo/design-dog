'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useDndContext } from './DndProvider'
import type { DropResult } from './types'

/**
 * useDroppable — make any element a drop target.
 *
 * Returns a `setNodeRef` (attach to the drop region) and `isOver`
 * (true while the active drag is hovering over this droppable AND
 * `accept(data)` returned true). `isOver` is reactive — flip CSS
 * (scrim, highlight, etc.) on it freely.
 *
 * `accept` is called repeatedly during pointermove for hit-testing —
 * keep it cheap and synchronous. Use it to filter incompatible drag
 * sources (e.g., the bench drop target only accepts drags whose
 * `data.region === 'stage'`).
 *
 * Lifecycle callbacks (`onDragEnter` / `onDragLeave` / `onDrop`) all
 * receive the same `data` payload the user attached at the source via
 * `useDraggable`. They live in refs so handler identity changes don't
 * tear down the registration (re-registering would briefly drop in-flight
 * drags' over state).
 */

export interface UseDroppableOptions<T = unknown> {
  /** Stable id for this drop target. Used by `useActiveDrag().overTargetId`
   *  consumers and for the `isOver` self-check. */
  id: string
  /** Predicate — return true if this droppable accepts the given drag.
   *  Default: accept everything. Called repeatedly during pointermove,
   *  so keep cheap. */
  accept?: (data: T) => boolean
  /** Fired when the cursor enters this droppable with an accepted drag. */
  onDragEnter?: (data: T) => void
  /** Fired when the cursor leaves this droppable, OR when the drag
   *  is cancelled while over this target. */
  onDragLeave?: (data: T) => void
  /** Fired on pointer release while over this droppable. May return a
   *  {@link DropResult} to control the settle animation — e.g. supply
   *  `settleTo: someElement` to animate the preview toward that element
   *  before it unmounts. Returning `void` (or no settleTo) skips the
   *  settle and removes the preview immediately. */
  onDrop: (data: T) => DropResult | void
}

export interface UseDroppableReturn {
  setNodeRef: (el: HTMLElement | null) => void
  /** True while the active drag is over this droppable. */
  isOver: boolean
}

export function useDroppable<T = unknown>(opts: UseDroppableOptions<T>): UseDroppableReturn {
  const ctx = useDndContext()
  const elementRef = useRef<HTMLElement | null>(null)

  // Hold callbacks in a ref so updating them doesn't re-register the
  // droppable (which would briefly drop the over-target state mid-drag).
  const optsRef = useRef(opts)
  optsRef.current = opts

  const setNodeRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el
  }, [])

  // Register once (per id). The provider keeps a Map keyed by id; if
  // the id changes, we unregister the old and register the new.
  useEffect(() => {
    return ctx.registerDroppable({
      id: opts.id,
      getElement: () => elementRef.current,
      accept: (data) => (optsRef.current.accept ? optsRef.current.accept(data as T) : true),
      onDragEnter: (data) => optsRef.current.onDragEnter?.(data as T),
      onDragLeave: (data) => optsRef.current.onDragLeave?.(data as T),
      onDrop: (data) => optsRef.current.onDrop(data as T) ?? undefined,
    })
  }, [ctx, opts.id])

  return {
    setNodeRef,
    isOver: ctx.overTargetId === opts.id,
  }
}

/**
 * useActiveDrag — read the active drag's data without being a draggable
 * or droppable yourself. Useful for ambient UI that reacts to "any drag
 * is in progress" (e.g., the stage scrim, the FLIP reflow trigger).
 *
 * Returns `{ data, overTargetId }` or `null` when nothing is being dragged.
 * Re-renders when either changes.
 */
export function useActiveDrag<T = unknown>(): {
  data: T
  overTargetId: string | null
} | null {
  const ctx = useDndContext()
  if (!ctx.activeDrag) return null
  return {
    data: ctx.activeDrag.data as T,
    overTargetId: ctx.overTargetId,
  }
}
