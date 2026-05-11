/**
 * Per-image visual adjustment filters — the data model for the new image
 * editor's Exposure / Contrast / Saturation sliders.
 *
 * Implementation choice: CSS filter properties (`brightness()`, `contrast()`,
 * `saturate()`) — zero JS, GPU-accelerated, render-pipeline-safe (proven via
 * the legacy grayscale fallback). No canvas, no WebGL, no shaders. See
 * exploration notes in the Stage & Bench branch chat history for rationale.
 *
 * Slider range is −1..+1 per axis, neutral at 0. Mapping to CSS:
 *   exposure   → brightness(1 + value)
 *   contrast   → contrast(1 + value)
 *   saturation → saturate(1 + value)
 *
 * At saturation = −1 the image is fully desaturated, which cleanly
 * supersedes the legacy per-asset `grayscale` boolean. Templates that
 * still receive `grayscale: true` should OR it with the slider value at
 * render time — see `applyGrayscaleBoolean()` below.
 */

export type ImageFilters = {
  /** −1 (black) … 0 (neutral) … +1 (doubled). Linear via CSS brightness();
   *  not photographic-log, but indistinguishable from log at the ±0.3
   *  adjustments users typically make. */
  exposure: number
  contrast: number
  saturation: number
}

export const NEUTRAL_FILTERS: ImageFilters = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
}

/** Position + zoom + filters, the universal "what to do with this image"
 *  shape consumed by ImageEditorModal. Each template-adapter maps its
 *  bespoke store fields onto this contract at the modal boundary. */
export type ImageSlotSettings = {
  position: { x: number; y: number }
  zoom: number
  filters: ImageFilters
}

export const NEUTRAL_SLOT_SETTINGS: ImageSlotSettings = {
  position: { x: 0, y: 0 },
  zoom: 1,
  filters: NEUTRAL_FILTERS,
}

export function isNeutral(filters: ImageFilters): boolean {
  return filters.exposure === 0 && filters.contrast === 0 && filters.saturation === 0
}

/**
 * Convert filter values to a CSS `filter:` value. Returns `undefined` when
 * all values are neutral so callers can skip the property entirely — keeps
 * an unmodified image byte-identical in exports (no implicit no-op filter
 * baked into the DOM).
 */
export function filtersToCss(filters: ImageFilters): string | undefined {
  if (isNeutral(filters)) return undefined
  const b = 1 + filters.exposure
  const c = 1 + filters.contrast
  const s = 1 + filters.saturation
  return `brightness(${b}) contrast(${c}) saturate(${s})`
}

/**
 * Reconcile the legacy per-asset `grayscale` boolean into the new per-image
 * filter shape. Pass `grayscale: true` and the function clamps saturation
 * to −1; otherwise the slider value rides through. Use this at template
 * render time so pre-existing grayscale=true assets render correctly in
 * migrated templates without a store migration.
 *
 * The boolean dies naturally when the last template migrates and stops
 * reading it.
 */
export function applyGrayscaleBoolean(
  filters: ImageFilters,
  grayscale: boolean,
): ImageFilters {
  if (!grayscale) return filters
  return { ...filters, saturation: -1 }
}
