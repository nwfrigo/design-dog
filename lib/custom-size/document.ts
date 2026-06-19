/**
 * CustomSizeDocument — the canonical, persisted/exported contract for a
 * custom-size asset (PRD §12.3). This is the ONLY net-new persisted state; the
 * shared content fields (headline/eyebrow/solution/theme/grayscale/image
 * settings) are REUSED from the existing store, not duplicated here.
 *
 * The renderer (CustomSizeCanvas) still speaks the lab `CustomContent` shape;
 * `customSizeToProps` is the boundary mapper that assembles a document + the
 * reused content into the renderer's props. This keeps the validated lab
 * experience untouched while the persisted/exported model stays canonical.
 * (Refactoring CustomSizeCanvas to consume the canonical model directly is a
 * later cleanup — tracked, not required for the pipeline.)
 */

import type { CustomContent, CustomBlockId, LayoutOverrides } from './resolve'

export interface CustomSizeOverlay {
  color: string
  opacity: number // 0-1
  coverage: 'full' | 'fade-up' | 'fade-down'
  noise: boolean
}

export interface CustomSizeDocument {
  width: number
  height: number
  /** RESERVED — engine chooses the structure when null (no picker UI in v1). */
  arrangement: string | null

  // per-block state (logo + headline are always-on; never in `hidden`)
  order: CustomBlockId[] | null
  hidden: CustomBlockId[]
  fontScale: Partial<Record<CustomBlockId, number>>   // relative nudge, default 1
  gapScale: Record<string, number>                    // relative spacing, key = gap-a-to-b
  lineHeight: Partial<Record<CustomBlockId, number>>  // RESERVED, unused in v1

  // image — one at a time. position / zoom / grayscale / filters come from the
  // REUSED thumbnail image settings + global grayscale, NOT redeclared here.
  imageMode: 'none' | 'zone' | 'background'
  imageUrl: string | null
  imageSide: 'left' | 'right' | null                  // zone mode; null = engine

  overlay: CustomSizeOverlay
}

/** Reused global per-asset content (already in the store / ManualAssetSettings).
 *  Passed alongside the document — not part of it. */
export interface ReusedContent {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  showSolutionSet: boolean
  theme: 'light' | 'dark'
  grayscale: boolean
  /** Canonical image settings: position is a -50..+50 offset, zoom 1..3. */
  imagePosition: { x: number; y: number }
  imageZoom: number
}

export function defaultCustomSizeDocument(width = 1080, height = 1080): CustomSizeDocument {
  return {
    width,
    height,
    arrangement: null,
    order: null,
    hidden: [],
    fontScale: {},
    gapScale: {},
    lineHeight: {},
    imageMode: 'none',
    imageUrl: null,
    imageSide: null,
    overlay: { color: '#060015', opacity: 0.55, coverage: 'fade-up', noise: false },
  }
}

/** Boundary mapper: (canonical document + reused content) → the props the
 *  existing CustomSizeCanvas renderer accepts. Converts canonical image
 *  position (-50..+50 offset) to the renderer's object-position percentage. */
export function customSizeToProps(
  doc: CustomSizeDocument,
  reused: ReusedContent,
): { content: CustomContent; width: number; height: number; theme: 'light' | 'dark'; overrides: LayoutOverrides } {
  const isBg = doc.imageMode === 'background'
  const isZone = doc.imageMode === 'zone'
  // ImagePreviewWithCrop / templates render `object-position: ${50 - x}%`.
  const focalX = 50 - reused.imagePosition.x
  const focalY = 50 - reused.imagePosition.y

  const content: CustomContent = {
    showLogo: true, // logo is always-on
    eyebrow: reused.eyebrow,
    headline: reused.headline,
    subhead: reused.subhead,
    body: reused.body,
    cta: reused.cta,
    solution: reused.solution,
    showSolutionPill: reused.showSolutionSet,
    hasImage: isZone,
    zoneImageUrl: isZone ? doc.imageUrl : null,
    backgroundImage: isBg ? doc.imageUrl : null,
    bgFocalX: focalX,
    bgFocalY: focalY,
    bgZoom: reused.imageZoom,
    bgGrayscale: reused.grayscale,
    overlayColor: doc.overlay.color,
    overlayOpacity: doc.overlay.opacity,
    overlayCoverage: doc.overlay.coverage,
    overlayNoise: doc.overlay.noise,
  }

  return {
    content,
    width: doc.width,
    height: doc.height,
    theme: reused.theme,
    overrides: { order: doc.order ?? undefined, imageSide: doc.imageSide ?? undefined },
  }
}

/** Build the POST body for the export API. Pairs exactly with the render route's
 *  param parsing: the document rides as `customSizeConfig`; reused content rides
 *  as the standard flat params. Pure — the editor calls this in handleExport. */
export function customSizeExportBody(
  doc: CustomSizeDocument,
  reused: ReusedContent,
  opts: { format: 'png' | 'pdf'; scale: number; exportedBy?: string | null },
): Record<string, unknown> {
  return {
    template: 'custom-size',
    customSizeConfig: doc,
    eyebrow: reused.eyebrow,
    headline: reused.headline,
    subhead: reused.subhead,
    body: reused.body,
    ctaText: reused.cta,
    solution: reused.solution,
    showSolutionSet: reused.showSolutionSet,
    theme: reused.theme,
    grayscale: reused.grayscale,
    imagePositionX: reused.imagePosition.x,
    imagePositionY: reused.imagePosition.y,
    imageZoom: reused.imageZoom,
    format: opts.format,
    scale: opts.scale,
    ...(opts.exportedBy != null ? { exportedBy: opts.exportedBy } : {}),
  }
}
