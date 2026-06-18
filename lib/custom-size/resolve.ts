/**
 * Custom-Size layout resolver — SPIKE (exploration only, not wired into the app).
 *
 * Pure function: given brand content + arbitrary canvas dimensions, decide how
 * to lay it out. This is the "judgment layer" — the system makes the layout
 * call so a non-designer can't produce an off-brand mess at a weird ratio.
 *
 * SCALE-INVARIANT: each band is designed ONCE at a reference size, then scaled
 * uniformly by how large the actual canvas is along its driver axis. Two
 * canvases of the same ratio render the same design, just zoomed — a 5000×3500
 * is a 1.43 landscape scaled way up, not a tiny design floating in a void.
 *
 * Design constraints we committed to:
 *   - ≤5 strategies (one per ratio band). No per-template special-casing.
 *   - Output is consumed by a renderer built ONLY from shared primitives
 *     (ContentStack + thin flex frames) — so this never grows its own layout
 *     language and a future merge with real templates stays a snap-together job.
 *   - Triage is explicit and reasoned (what got dropped + why) so the UI can
 *     show it instead of silently vanishing content.
 *
 * No React here. Pure data in → layout descriptor out.
 */

import type { StackAlign } from '@/types'

export type CustomBlockId = 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'

export interface CustomContent {
  showLogo: boolean
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  showSolutionPill: boolean
  hasImage: boolean
}

export type Band = 'strip' | 'landscape' | 'square' | 'portrait' | 'tower'
export type LayoutKind = 'strip' | 'row' | 'hero-top' | 'single' | 'tower'
export type TriageReason = 'band-excluded' | 'no-space' | 'too-small' | 'empty'

export interface ResolvedTextBlock {
  id: CustomBlockId
  fontSize: number
}

export interface TriagedBlock {
  id: CustomBlockId | 'image' | 'solutionPill'
  reason: TriageReason
}

export interface ResolvedLayout {
  band: Band
  strategyLabel: string
  kind: LayoutKind
  /** Uniform scale vs the band's reference size — 1.0 at reference, 5.0 on a
   *  canvas 5× larger. Everything dimensional is multiplied by this. */
  sizeScale: number
  padding: number
  gap: number
  logoHeight: number
  showLogo: boolean
  showSolutionPill: boolean
  showImage: boolean
  imageSide: 'left' | 'right'
  imageFraction: number
  textStackAlign: StackAlign
  textAlign: 'left' | 'center'
  alignItems: 'flex-start' | 'center'
  /** Survivors, in visual order. */
  blocks: ResolvedTextBlock[]
  /** What didn't make it, and why — for transparent triage UI. */
  triagedOut: TriagedBlock[]
}

const LEGIBILITY_FLOOR = 11 // px — below this, text isn't worth showing
const VISUAL_ORDER: CustomBlockId[] = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
/** Dropped first → last when vertical space runs out. Headline + CTA are never
 *  dropped for space (only legibility can remove them at brutal ratios). */
const SPACE_DROP_ORDER: CustomBlockId[] = ['body', 'subhead', 'eyebrow']
/** Rough wrapped-line count per block, for height estimation. */
const EST_LINES: Record<CustomBlockId, number> = {
  eyebrow: 1, headline: 2, subhead: 1, body: 3, cta: 1,
}

/** Each band's design, specified ONCE at a reference size. `driver` is the axis
 *  whose length sets the uniform scale; `refDriver` is the length at which the
 *  hand-picked values below are "1×". Tune these numbers to taste — they ARE
 *  the per-band design judgment. */
interface BandRef {
  driver: 'w' | 'h'
  refDriver: number
  headline: number
  padding: number
  gap: number
  logo: number
}
const BAND_REF: Record<Band, BandRef> = {
  strip:     { driver: 'h', refDriver: 120,  headline: 34, padding: 24, gap: 16, logo: 48 },
  landscape: { driver: 'h', refDriver: 700,  headline: 54, padding: 44, gap: 22, logo: 28 },
  square:    { driver: 'w', refDriver: 1080, headline: 60, padding: 56, gap: 26, logo: 30 },
  portrait:  { driver: 'w', refDriver: 1080, headline: 54, padding: 52, gap: 24, logo: 28 },
  tower:     { driver: 'w', refDriver: 320,  headline: 30, padding: 22, gap: 14, logo: 22 },
}

/** Derived text sizes as ratios of the headline — keeps the type hierarchy
 *  fixed and scale-invariant (no absolute caps). */
const TYPE_RATIO: Record<CustomBlockId, number> = {
  headline: 1, eyebrow: 0.32, subhead: 0.52, body: 0.42, cta: 0.46,
}

function classifyBand(w: number, h: number): Band {
  const r = w / h
  if (r >= 2.5) return 'strip'
  if (r >= 1.18) return 'landscape'
  if (r >= 0.85) return 'square'
  if (r >= 0.45) return 'portrait'
  return 'tower'
}

function textOf(content: CustomContent, id: CustomBlockId): string {
  return content[id] ?? ''
}

/** Estimate a text block's rendered height including line-height. */
function estHeight(id: CustomBlockId, fontSize: number): number {
  return fontSize * 1.2 * EST_LINES[id]
}

export interface LayoutOverrides {
  /** User-forced image side (drag-flip). Wins over the band default. */
  imageSide?: 'left' | 'right'
  /** User-chosen block order (survivor ids, drag-reorder). Unlisted ids fall to the end. */
  order?: CustomBlockId[]
}

export function resolveLayout(
  content: CustomContent,
  width: number,
  height: number,
  overrides?: LayoutOverrides,
): ResolvedLayout {
  const band = classifyBand(width, height)
  const triagedOut: TriagedBlock[] = []

  // --- uniform scale: design-at-reference × how-big-this-canvas-is ---------
  const ref = BAND_REF[band]
  const driverLen = ref.driver === 'h' ? height : width
  const sizeScale = driverLen / ref.refDriver
  const padding = ref.padding * sizeScale
  const gap = ref.gap * sizeScale
  const logoHeight = ref.logo * sizeScale
  const headlineSize = ref.headline * sizeScale

  // --- per-band arrangement + which text blocks the strategy wants ---------
  let candidates: CustomBlockId[]
  let kind: LayoutKind
  let strategyLabel: string
  let textStackAlign: StackAlign = 'top'
  let textAlign: 'left' | 'center' = 'left'
  let alignItems: 'flex-start' | 'center' = 'flex-start'
  const imageSide: 'left' | 'right' = overrides?.imageSide ?? 'right'
  let imageFraction = 0.4
  let wantsImage = false

  switch (band) {
    case 'strip':
      kind = 'strip'
      strategyLabel = 'Strip — logo · headline · CTA in one row'
      candidates = ['headline'] // cta handled in renderer; rest excluded
      break
    case 'landscape':
      kind = content.hasImage ? 'row' : 'single'
      strategyLabel = content.hasImage
        ? 'Landscape — text left / image right'
        : 'Landscape — centered text column'
      candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
      textStackAlign = 'center'
      wantsImage = content.hasImage
      if (!content.hasImage) { textAlign = 'center'; alignItems = 'center' }
      break
    case 'square':
      kind = content.hasImage ? 'hero-top' : 'single'
      strategyLabel = content.hasImage
        ? 'Square — image top / text below'
        : 'Square — centered stack'
      candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
      textStackAlign = content.hasImage ? 'top' : 'center'
      imageFraction = 0.46
      wantsImage = content.hasImage
      if (!content.hasImage) { textAlign = 'center'; alignItems = 'center' }
      break
    case 'portrait':
      kind = content.hasImage ? 'hero-top' : 'single'
      strategyLabel = content.hasImage
        ? 'Portrait — hero image top / text stack below'
        : 'Portrait — top-aligned stack'
      imageFraction = 0.5
      wantsImage = content.hasImage
      candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
      break
    case 'tower':
    default:
      kind = 'tower'
      strategyLabel = 'Tower — logo top · headline · CTA pinned bottom'
      candidates = ['eyebrow', 'headline', 'cta'] // no body/subhead/image room
      break
  }

  // Image triage note (only landscape/square/portrait want it)
  if (content.hasImage && !wantsImage) {
    triagedOut.push({ id: 'image', reason: 'band-excluded' })
  }
  // Solution pill: kept on all bands except a very narrow tower
  let showSolutionPill = content.showSolutionPill && content.solution !== 'none'
  if (showSolutionPill && band === 'tower' && width < 140) {
    showSolutionPill = false
    triagedOut.push({ id: 'solutionPill', reason: 'no-space' })
  }

  // Blocks the band excludes outright
  for (const id of VISUAL_ORDER) {
    if (!candidates.includes(id)) triagedOut.push({ id, reason: 'band-excluded' })
  }

  const sizeOf = (id: CustomBlockId): number => headlineSize * TYPE_RATIO[id]

  // Start from candidates that actually have content, then run triage.
  let survivors = candidates.filter((id) => {
    if (textOf(content, id).trim() === '') {
      triagedOut.push({ id, reason: 'empty' })
      return false
    }
    return true
  })

  // Legibility floor (don't drop headline/cta here — they anchor the design)
  survivors = survivors.filter((id) => {
    if (id === 'headline' || id === 'cta') return true
    if (sizeOf(id) < LEGIBILITY_FLOOR) {
      triagedOut.push({ id, reason: 'too-small' })
      return false
    }
    return true
  })

  // Vertical fit triage (skip strip — it's a single horizontal line)
  if (kind !== 'strip') {
    const headerH = content.showLogo ? logoHeight : 0
    const imageH = wantsImage && kind === 'hero-top' ? height * imageFraction : 0
    const availH = height - padding * 2 - headerH - imageH - gap
    const fits = () => {
      const h = survivors.reduce((sum, id, i) =>
        sum + estHeight(id, sizeOf(id)) + (i > 0 ? gap : 0), 0)
      return h <= availH
    }
    for (const id of SPACE_DROP_ORDER) {
      if (fits()) break
      const idx = survivors.indexOf(id)
      if (idx >= 0) {
        survivors.splice(idx, 1)
        triagedOut.push({ id, reason: 'no-space' })
      }
    }
  }

  let blocks: ResolvedTextBlock[] = VISUAL_ORDER
    .filter((id) => survivors.includes(id))
    .map((id) => ({ id, fontSize: sizeOf(id) }))
  if (overrides?.order) {
    const pos = (id: CustomBlockId) => {
      const i = overrides.order!.indexOf(id)
      return i < 0 ? 999 : i
    }
    blocks = [...blocks].sort((a, b) => pos(a.id) - pos(b.id))
  }

  return {
    band,
    strategyLabel,
    kind,
    sizeScale,
    padding,
    gap,
    logoHeight,
    showLogo: content.showLogo,
    showSolutionPill,
    showImage: wantsImage,
    imageSide,
    imageFraction,
    textStackAlign,
    textAlign,
    alignItems,
    blocks,
    triagedOut,
  }
}
