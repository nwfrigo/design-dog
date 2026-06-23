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
import type { ImageFilters } from '@/lib/image-filters'

export type CustomBlockId = 'eyebrow' | 'headline' | 'subhead' | 'body' | 'cta'

/** All editable slot ids in custom-size: the text blocks plus the non-text
 *  brand elements (image, solution pill, logo). The Stage & Bench adapter keys
 *  off this; render-props for non-text slots (image) use it. */
export type CustomSizeSlotId = CustomBlockId | 'image' | 'solutionPill' | 'logo'

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
  /** Zone (foreground) image URL — shown in row/hero-top image zones. */
  zoneImageUrl?: string | null
  /** Image-led mode: full-bleed background. When set, layout → 'overlay'. */
  backgroundImage?: string | null
  bgFocalX?: number // 0-100, object-position X
  bgFocalY?: number // 0-100, object-position Y
  bgZoom?: number // 1+ zoom on the background image
  bgGrayscale?: boolean
  /** Image colour edits (exposure/contrast/saturation) — applied via the shared
   *  `filtersToCss` to both the zone and background image, same as every other
   *  template. Combined with bgGrayscale through `applyGrayscaleBoolean`. */
  imageFilters?: ImageFilters
  /** Editable overlay layer (replaces the fixed scrim). */
  overlayColor?: string // hex (brand preset)
  overlayOpacity?: number // 0-1
  overlayCoverage?: 'full' | 'fade-up' | 'fade-down'
  overlayNoise?: boolean
}

export type Band = 'strip' | 'landscape' | 'square' | 'portrait' | 'tower'
export type LayoutKind = 'strip' | 'row' | 'hero-top' | 'single' | 'tower' | 'overlay'
export type TriageReason = 'band-excluded' | 'no-space' | 'too-small' | 'empty' | 'hidden'

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
  /** Category-chip size multiplier — its own curve (tracks the logo), not the
   *  linear sizeScale. CustomSizeCanvas passes this to SolutionPill. */
  pillScale: number
  showLogo: boolean
  showSolutionPill: boolean
  showImage: boolean
  imageSide: 'left' | 'right'
  /** Vertical position of the zone image in the hero-top layout. */
  imageVPos: 'top' | 'bottom'
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
/** Type scales SUB-linearly with the canvas (vs. padding/gap/logo, which stay
 *  linear). < 1 means small/medium canvases get a step-up in type size relative
 *  to a pure zoom — filling negative space and keeping eyebrow/body above the
 *  legibility floor — while huge canvases don't blow up. Tune to taste. */
const TYPE_POWER = 0.78
/** Logo + category chip ride their OWN curve, decoupled from the per-band linear
 *  scaling: a floor (min readable px) + gentle sub-linear growth, keyed off the
 *  canvas's geometric-mean size √(w·h). A brand mark should read at a roughly
 *  constant size across canvases, not scale 1:1 with the design — so small
 *  canvases keep a legible logo and huge ones don't balloon. Applied to the
 *  content bands only; strip (logo-forward bar) and tower (narrow) keep their
 *  bespoke scaling. Calibrated in /custom-size-lab/logo-scale. */
const LOGO_REF = 48        // logo height at the reference geometric mean
const LOGO_FLOOR = 32      // never smaller than this (small canvases)
const LOGO_POWER = 0.78    // sub-linear growth above the reference
const LOGO_REF_GM = 1080   // geometric mean at which LOGO_REF applies (1080² square)
const CHIP_REF = 2.0       // category-chip scale at the reference; tracks the logo
// Strip joins the shared curve too: a thin banner wants the same ~constant-size
// logo as everything else, NOT a logo scaled to 40% of its tiny height. Tower
// stays bespoke (its narrow-width logo nuance is a separate question).
const OWN_LOGO_BANDS = new Set<Band>(['landscape', 'square', 'portrait', 'strip'])
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
// `headline` values are the reference (1×) sizes; the effective size is
// `headline × sizeScale^TYPE_POWER`. Raised from the original spike values for a
// step-change in fill (the originals read tiny on small/medium canvases).
const BAND_REF: Record<Band, BandRef> = {
  strip:     { driver: 'h', refDriver: 120,  headline: 40, padding: 24, gap: 16, logo: 48 },
  landscape: { driver: 'h', refDriver: 700,  headline: 74, padding: 44, gap: 22, logo: 28 },
  square:    { driver: 'w', refDriver: 1080, headline: 96, padding: 56, gap: 26, logo: 30 },
  portrait:  { driver: 'w', refDriver: 1080, headline: 92, padding: 52, gap: 24, logo: 28 },
  tower:     { driver: 'w', refDriver: 320,  headline: 40, padding: 22, gap: 14, logo: 22 },
}

/** Derived text sizes as ratios of the headline — keeps the type hierarchy
 *  fixed and scale-invariant (no absolute caps). */
const TYPE_RATIO: Record<CustomBlockId, number> = {
  headline: 1, eyebrow: 0.32, subhead: 0.52, body: 0.42, cta: 0.46,
}

// Absolute-size gates for the two content-stripping bands. Ratio alone can't
// tell a roomy wide rectangle (1754×630) from a thin banner (728×90) — both are
// "wide". So strip/tower only apply when the CONSTRAINED axis is genuinely too
// small to host a stacked layout; otherwise the canvas falls through to
// landscape/portrait and keeps full content + image. (Taste knobs — the px below
// which stacking stops being viable.)
const STRIP_MIN_H = 100 // wide + shorter than this → one-line strip bar (true banner)
const TOWER_MIN_W = 420 // tall + narrower than this → vertical-only tower

function classifyBand(w: number, h: number): Band {
  const r = w / h
  if (r >= 2.5 && h < STRIP_MIN_H) return 'strip'
  if (r < 0.45 && w < TOWER_MIN_W) return 'tower'
  if (r >= 1.18) return 'landscape'
  if (r >= 0.85) return 'square'
  return 'portrait'
}

function textOf(content: CustomContent, id: CustomBlockId): string {
  return content[id] ?? ''
}

/** Estimate a text block's rendered height including line-height. */
function estHeight(id: CustomBlockId, fontSize: number): number {
  return fontSize * 1.2 * EST_LINES[id]
}

export interface LayoutOverrides {
  /** User-forced image side (drag-flip, row layout). Wins over the band default. */
  imageSide?: 'left' | 'right'
  /** User-forced image vertical position (drag-flip, hero-top layout). */
  imageVPos?: 'top' | 'bottom'
  /** User-dragged zone-image size as a fraction of the canvas (row = width,
   *  hero-top = height). Clamped to [0.2, 0.8]; null/undefined = band default. */
  imageFraction?: number
  /** User-chosen content-stack alignment (top/middle/bottom). Wins over the
   *  band default; undefined = engine default. (Stage-bar control.) */
  stackAlign?: StackAlign
  /** User-chosen block order (survivor ids, drag-reorder). Unlisted ids fall to the end. */
  order?: CustomBlockId[]
  /** Editor visibility (show flags). When provided, a block is present iff
   *  shown !== false — empty-but-shown blocks still render a placeholder (WYSIWYG).
   *  When absent (lab/export-from-content), presence falls back to content emptiness. */
  shownBlocks?: Partial<Record<CustomBlockId, boolean>>
  /** Per-block font-size nudge — a RELATIVE multiplier on the engine's computed
   *  (canvas-scaled) size, default 1. Because it multiplies the scaled base, the
   *  user's size choice persists PROPORTIONALLY across canvas resizes. Pushed far
   *  enough, it can trip legibility/space triage — the engine re-art-directs. */
  fontScale?: Partial<Record<CustomBlockId, number>>
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
  // Logo + chip on their own curve (content bands); strip/tower stay bespoke.
  const ownLogo = OWN_LOGO_BANDS.has(band)
  const gmScale = Math.sqrt(width * height) / LOGO_REF_GM
  const logoHeight = ownLogo
    ? Math.max(LOGO_FLOOR, LOGO_REF * Math.pow(gmScale, LOGO_POWER))
    : ref.logo * sizeScale
  // Chip tracks the logo's effective multiplier so the lockup moves as one.
  const pillScale = ownLogo ? CHIP_REF * (logoHeight / LOGO_REF) : sizeScale
  // Type grows sub-linearly (see TYPE_POWER) — bigger on small canvases, damped
  // on huge ones — while padding/gap/logo stay linear (true zoom).
  const headlineSize = ref.headline * Math.pow(sizeScale, TYPE_POWER)

  // --- per-band arrangement + which text blocks the strategy wants ---------
  let candidates: CustomBlockId[]
  let kind: LayoutKind
  let strategyLabel: string
  let textStackAlign: StackAlign = 'top'
  let textAlign: 'left' | 'center' = 'left'
  let alignItems: 'flex-start' | 'center' = 'flex-start'
  const imageSide: 'left' | 'right' = overrides?.imageSide ?? 'right'
  const imageVPos: 'top' | 'bottom' = overrides?.imageVPos ?? 'top'
  let imageFraction = 0.4
  let wantsImage = false

  switch (band) {
    case 'strip':
      kind = 'strip'
      strategyLabel = 'Strip — logo · headline · CTA in one row'
      // headline + cta are real survivor blocks (so they select / edit / bench
      // like everywhere else); eyebrow/subhead/body/image don't fit one line.
      candidates = ['headline', 'cta']
      break
    case 'landscape':
      kind = content.hasImage ? 'row' : 'single'
      strategyLabel = content.hasImage
        ? 'Landscape — text left / image right'
        : 'Landscape — left text column'
      candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
      textStackAlign = 'center'
      wantsImage = content.hasImage
      // Left-aligned by default (textAlign/alignItems keep their left defaults).
      break
    case 'square':
      kind = content.hasImage ? 'hero-top' : 'single'
      strategyLabel = content.hasImage
        ? 'Square — image top / text below'
        : 'Square — left stack'
      candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
      textStackAlign = content.hasImage ? 'top' : 'center'
      imageFraction = 0.46
      wantsImage = content.hasImage
      // Left-aligned by default.
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

  // Image-led override: a full-bleed background takes over the canvas; the band
  // still sets type scale + triage, but the arrangement becomes a text overlay.
  const overlay = !!content.backgroundImage
  if (overlay) {
    kind = 'overlay'
    candidates = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
    textStackAlign = 'bottom'
    textAlign = 'left'
    alignItems = 'flex-start'
    wantsImage = false
  }

  // User-dragged zone-image size wins over the band default (row = width frac,
  // hero-top = height frac). Clamp so neither the image nor the text zone can be
  // crushed; engine still owns triage of what fits in the remaining space.
  if (wantsImage && overrides?.imageFraction != null) {
    imageFraction = Math.min(0.8, Math.max(0.2, overrides.imageFraction))
  }

  // User alignment wins over the band default (content no longer pinned top).
  if (overrides?.stackAlign) textStackAlign = overrides.stackAlign

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

  // Per-block size = canvas-scaled base × type-hierarchy ratio × the user's
  // relative nudge (default 1). The nudge rides on the scaled base, so it stays
  // proportional as the canvas changes size.
  const sizeOf = (id: CustomBlockId): number =>
    headlineSize * TYPE_RATIO[id] * (overrides?.fontScale?.[id] ?? 1)

  // Presence: in the editor, show-flags decide (empty-but-shown blocks still
  // render a placeholder, per WYSIWYG); otherwise fall back to content emptiness.
  const shown = overrides?.shownBlocks
  let survivors = candidates.filter((id) => {
    const present = shown ? shown[id] !== false : textOf(content, id).trim() !== ''
    if (!present) {
      triagedOut.push({ id, reason: shown ? 'hidden' : 'empty' })
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
    pillScale,
    showLogo: content.showLogo,
    showSolutionPill,
    showImage: wantsImage,
    imageSide,
    imageVPos,
    imageFraction,
    textStackAlign,
    textAlign,
    alignItems,
    blocks,
    triagedOut,
  }
}
