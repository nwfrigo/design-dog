/**
 * Executive Overview — document model.
 *
 * A single self-contained blob persisted on the store (same precedent as
 * `carouselSlides` / `customSizeDocument`): one field, one setter, one
 * SNAPSHOT_FIELDS entry, one export param. Everything the 2-page asset needs
 * lives here — no reused globals, because none of this content is shared with
 * other templates.
 *
 * Pure module: types + a factory + immutable update helpers + the doc→props
 * mappers used by BOTH the editor adapter and the export render route (so the
 * exported PDF matches the editor by construction).
 */

import {
  EXEC_CARD_COUNT,
  EXEC_CHIPS_PER_CARD,
  EXEC_STAT_COUNT,
  EXEC_DEFAULT_CHIP_ICONS,
  EXEC_DEFAULT_HERO_IMAGE,
  type ExecutiveOverviewCard,
  type ExecutiveOverviewChip,
  type ExecutiveOverviewStat,
} from '@/components/templates/ExecutiveOverview/constants'
import { NEUTRAL_FILTERS, type ImageFilters } from '@/lib/image-filters'

export interface ExecutiveOverviewDocument {
  // ---- page 1 ----
  partnerLogoUrl: string | null
  showPartnerLogo: boolean
  introHeadline: string
  introBody: string // html
  quote: string
  quoteAttribution: string
  showQuote: boolean
  showQuoteAttribution: boolean
  heroImageUrl: string | null
  heroImagePosition: { x: number; y: number }
  heroImageZoom: number
  heroImageFilters: ImageFilters // exposure/contrast/saturation + presets
  grayscale: boolean // applies to the hero image
  // ---- page 2 ----
  tagline: string
  showTagline: boolean
  cards: ExecutiveOverviewCard[] // length EXEC_CARD_COUNT
  trustedHeader: string
  showTrustedHeader: boolean
  trustedSubhead: string
  showTrustedSubhead: boolean
  stats: ExecutiveOverviewStat[] // length EXEC_STAT_COUNT
  footerCta: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactAvatarUrl: string | null
  showContact: boolean
}

/** Default chip visibility per card, matching the source design (card 2 has a
 *  third chip; the rest ship with two, third available to toggle on). */
const DEFAULT_CHIP_SHOW: boolean[][] = [
  [true, true, false],
  [true, true, true],
  [true, true, false],
  [true, true, false],
]

function defaultChips(cardIndex: number): ExecutiveOverviewChip[] {
  const icons = EXEC_DEFAULT_CHIP_ICONS[cardIndex] ?? []
  return Array.from({ length: EXEC_CHIPS_PER_CARD }, (_, j) => ({
    label: '',
    icon: icons[j] ?? 'link',
    show: DEFAULT_CHIP_SHOW[cardIndex]?.[j] ?? false,
  }))
}

export function defaultExecutiveOverviewDocument(): ExecutiveOverviewDocument {
  return {
    partnerLogoUrl: null,
    showPartnerLogo: true,
    introHeadline: '',
    introBody: '',
    quote: '',
    quoteAttribution: '',
    showQuote: true,
    showQuoteAttribution: true,
    // Ships with a default hero image so the cover reads complete out of the
    // box; users can swap or keep it (same frame — no layout effect).
    heroImageUrl: EXEC_DEFAULT_HERO_IMAGE,
    heroImagePosition: { x: 0, y: 0 },
    heroImageZoom: 1,
    heroImageFilters: NEUTRAL_FILTERS,
    grayscale: false,
    tagline: '',
    showTagline: true,
    cards: Array.from({ length: EXEC_CARD_COUNT }, (_, i) => ({
      title: '',
      body: '',
      chips: defaultChips(i),
    })),
    trustedHeader: '',
    showTrustedHeader: true,
    trustedSubhead: '',
    showTrustedSubhead: true,
    stats: Array.from({ length: EXEC_STAT_COUNT }, () => ({ label: '', show: true })),
    footerCta: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactAvatarUrl: null,
    showContact: true,
  }
}

/* ------------------------------------------------------------------ */
/* Immutable update helpers (adapter setters call these)               */
/* ------------------------------------------------------------------ */

export function patchExecDoc(
  doc: ExecutiveOverviewDocument,
  patch: Partial<ExecutiveOverviewDocument>,
): ExecutiveOverviewDocument {
  return { ...doc, ...patch }
}

export function updateExecCard(
  doc: ExecutiveOverviewDocument,
  cardIndex: number,
  patch: Partial<Omit<ExecutiveOverviewCard, 'chips'>>,
): ExecutiveOverviewDocument {
  const cards = doc.cards.map((c, i) => (i === cardIndex ? { ...c, ...patch } : c))
  return { ...doc, cards }
}

export function updateExecChip(
  doc: ExecutiveOverviewDocument,
  cardIndex: number,
  chipIndex: number,
  patch: Partial<ExecutiveOverviewChip>,
): ExecutiveOverviewDocument {
  const cards = doc.cards.map((c, i) => {
    if (i !== cardIndex) return c
    const chips = c.chips.map((ch, j) => (j === chipIndex ? { ...ch, ...patch } : ch))
    return { ...c, chips }
  })
  return { ...doc, cards }
}

export function updateExecStat(
  doc: ExecutiveOverviewDocument,
  statIndex: number,
  patch: Partial<ExecutiveOverviewStat>,
): ExecutiveOverviewDocument {
  const stats = doc.stats.map((s, k) => (k === statIndex ? { ...s, ...patch } : s))
  return { ...doc, stats }
}

/* ------------------------------------------------------------------ */
/* doc → page props (shared by editor render + export render route)    */
/* ------------------------------------------------------------------ */

export type ExecPage1ContentProps = {
  partnerLogoUrl: string | null
  introHeadline: string
  introBody: string
  quote: string
  quoteAttribution: string
  heroImageUrl: string | null
  heroImagePosition: { x: number; y: number }
  heroImageZoom: number
  heroImageFilters: ImageFilters
  grayscale: boolean
  showPartnerLogo: boolean
  showQuote: boolean
  showQuoteAttribution: boolean
}

export type ExecPage2ContentProps = {
  tagline: string
  cards: ExecutiveOverviewCard[]
  trustedHeader: string
  trustedSubhead: string
  stats: ExecutiveOverviewStat[]
  footerCta: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactAvatarUrl: string | null
  showTagline: boolean
  showTrustedHeader: boolean
  showTrustedSubhead: boolean
  showContact: boolean
}

export function execDocToPage1Props(doc: ExecutiveOverviewDocument): ExecPage1ContentProps {
  return {
    partnerLogoUrl: doc.partnerLogoUrl,
    introHeadline: doc.introHeadline,
    introBody: doc.introBody,
    quote: doc.quote,
    quoteAttribution: doc.quoteAttribution,
    heroImageUrl: doc.heroImageUrl,
    heroImagePosition: doc.heroImagePosition,
    heroImageZoom: doc.heroImageZoom,
    heroImageFilters: doc.heroImageFilters,
    grayscale: doc.grayscale,
    showPartnerLogo: doc.showPartnerLogo,
    showQuote: doc.showQuote,
    showQuoteAttribution: doc.showQuoteAttribution,
  }
}

export function execDocToPage2Props(doc: ExecutiveOverviewDocument): ExecPage2ContentProps {
  return {
    tagline: doc.tagline,
    cards: doc.cards,
    trustedHeader: doc.trustedHeader,
    trustedSubhead: doc.trustedSubhead,
    stats: doc.stats,
    footerCta: doc.footerCta,
    contactName: doc.contactName,
    contactRole: doc.contactRole,
    contactEmail: doc.contactEmail,
    contactAvatarUrl: doc.contactAvatarUrl,
    showTagline: doc.showTagline,
    showTrustedHeader: doc.showTrustedHeader,
    showTrustedSubhead: doc.showTrustedSubhead,
    showContact: doc.showContact,
  }
}
