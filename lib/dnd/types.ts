import type { ReactNode } from 'react'

/**
 * Public types for the pointer-event-based drag and drop primitive.
 *
 * Generic over the user's drag payload `T` — every drag carries a
 * caller-defined `data` blob. Drop targets filter by `accept(data)` and
 * receive `data` in their `onDrop` handler.
 */

export interface ActiveDrag<T = unknown> {
  /** Unique id of the dragging item — provided by useDraggable. */
  id: string
  /** Caller-defined payload, threaded through to droppables. */
  data: T
  /** What to render at the cursor while the drag is active. */
  preview: ReactNode
  /** Cursor offset from the source element's top-left at drag activation.
   *  Used to anchor the preview so it follows the cursor naturally. */
  offsetX: number
  offsetY: number
  /** Cursor position at the moment the drag activated (passed the
   *  movement threshold). Used as the preview's initial transform so
   *  it doesn't flash at (0,0). */
  initialCursorX: number
  initialCursorY: number
  /** The source element being dragged. Held so a failed drop (release
   *  outside any droppable) can animate the cursor follower back to its
   *  origin instead of vanishing instantly. */
  sourceEl?: HTMLElement | null
}

/**
 * Optional return value from a droppable's `onDrop`. Lets the consumer
 * direct the post-drop "settle" animation: the drag preview will
 * animate from its current (cursor) position to the supplied element's
 * bounding rect over a short duration before being unmounted.
 *
 * If `settleTo` is omitted/null, the preview is removed immediately
 * (the original behavior).
 */
export interface DropResult {
  /** Element the drag preview should animate toward after a successful
   *  drop. The preview's transform interpolates from its current
   *  position to the element's center, with a simultaneous opacity
   *  fade. Useful for "the chip dives into its destination" visuals. */
  settleTo?: HTMLElement | null
}

export interface DroppableRegistration<T = unknown> {
  id: string
  /** Returns the live element for hit-testing. We read it on demand
   *  rather than storing it because refs can swap on re-mount. */
  getElement: () => HTMLElement | null
  /** Predicate — return true if this droppable accepts the given drag.
   *  Called repeatedly during pointermove; keep cheap. */
  accept: (data: T) => boolean
  /** Fired when a drag enters this droppable (after passing accept). */
  onDragEnter?: (data: T) => void
  /** Fired when a drag leaves this droppable. */
  onDragLeave?: (data: T) => void
  /** Fired when the user releases the pointer over this droppable.
   *  May return a {@link DropResult} to control the settle animation. */
  onDrop: (data: T) => DropResult | void
}

export interface DndContextValue {
  /** Active drag — null when nothing is being dragged. Stable identity
   *  across the lifetime of one drag (changes don't fire mid-drag). */
  activeDrag: ActiveDrag | null
  /** Id of the currently-hovered droppable, or null. Updates during the
   *  drag as the cursor moves between regions. */
  overTargetId: string | null
  /** Internal — registers a droppable. Returns the unregister fn.
   *  Consumers don't call this directly; use `useDroppable`. */
  registerDroppable: (registration: DroppableRegistration) => () => void
  /** Internal — kicks off a drag. Called by `useDraggable` after the
   *  movement threshold is crossed. */
  startDrag: (drag: ActiveDrag) => void
  /** The element that holds the drag preview. Mutated imperatively by
   *  the pointermove loop so the cursor follower updates without
   *  triggering React re-renders. */
  previewRef: { current: HTMLDivElement | null }
}
