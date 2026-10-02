import type { ImageFilters } from '@/lib/image-filters'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

/**
 * Industry ROI one-pager — document model.
 *
 * Figma: Sales-Collateral | 2026 Master, frame `roi-1` (1223:1746).
 * Fixed 612px width, VARIABLE height (vertical flow; hidden sections
 * collapse, rows/bullets add and remove). Export is a single long-page PDF
 * at 612 × measured-height via the Stacker measured branch of the export
 * route.
 *
 * Self-contained blob (the executive-overview pattern): ALL of this
 * template's content lives here; slot setters patch it immutably. The ROI
 * table rows and risk bullets are DYNAMIC arrays — the first Stage & Bench
 * template with true add/remove — so their slot ids are derived from entry
 * ids (`rowLabel:<id>`, `rowValue:<id>`, `bullet:<id>`).
 *
 * Seed copy is lorem ipsum sized to the hand-designed Oil & Gas original's
 * character counts (per Nick: no industry preset system at launch); numeric
 * values keep realistic shapes so the table/stats read correctly.
 */

export interface RoiTableRow {
  id: string
  label: string
  value: string
}

export interface RoiBullet {
  id: string
  text: string
}

export interface RoiPersonaCard {
  role: string
  body: string
  imageUrl: string | null
  imagePosition: { x: number; y: number }
  imageZoom: number
  imageFilters: ImageFilters
}

export interface RoiStat {
  value: string
  label: string
}

export interface IndustryRoiDocument {
  // Hero
  heroImageUrl: string | null
  heroImagePosition: { x: number; y: number }
  heroImageZoom: number
  heroImageFilters: ImageFilters
  heroTitle: string
  heroIntro: string
  // ROI table
  tableIntro: string
  rows: RoiTableRow[]
  tableFootnote: string
  // "Did you know?" dark band (hideable)
  showDidYouKnow: boolean
  didYouKnowText: string
  didYouKnowSource: string
  // Strategic benefits — 3 persona cards
  benefitsHeader: string
  cards: [RoiPersonaCard, RoiPersonaCard, RoiPersonaCard]
  // Risks — dynamic bullets
  risksTitle: string
  bullets: RoiBullet[]
  // Customer story (hideable)
  showCustomerStory: boolean
  customerLogoUrl: string | null
  customerLogoHeight: number
  customerStoryText: string
  customerStoryAttribution: string
  // Verdantix ROI block + 4 fixed stats (icons are static art)
  roiHeadline: string
  roiIntro: string
  stats: [RoiStat, RoiStat, RoiStat, RoiStat]
  // CTA band
  ctaHeadline: string
  ctaText: string
}

export const ROI_MAX_ROWS = 8
export const ROI_MAX_BULLETS = 10
export const ROI_CUSTOMER_LOGO = { default: 27, min: 14, max: 48 }

export function newRoiItemId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const card = (role: string, body: string, imageUrl: string | null = null): RoiPersonaCard => ({
  role,
  body,
  imageUrl,
  imagePosition: { x: 0, y: 0 },
  imageZoom: 1,
  imageFilters: NEUTRAL_FILTERS,
})

export function defaultIndustryRoiDocument(): IndustryRoiDocument {
  return {
    heroImageUrl: '/assets/image-library/images/scenes/design-dog-library_001.jpg',
    heroImagePosition: { x: 0, y: 0 },
    heroImageZoom: 1,
    heroImageFilters: NEUTRAL_FILTERS,
    // "Return on Investment in Oil & Gas" (33ch)
    heroTitle: 'Lorem ipsum dolor sit in industry',
    // ~210ch intro
    heroIntro:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.',
    tableIntro: 'What could you achieve with EHS+ software?',
    rows: [
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet elit sed', value: '$500K–$3M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit eiusmod', value: '$250K–$1M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet consectetur adi', value: '$250K–$1M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet elit', value: '5–15% Reduction' },
    ],
    tableFootnote: 'Estimated values based on typical exposures and volume of activity. Directional only.',
    showDidYouKnow: true,
    // ~110ch
    didYouKnowText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
    didYouKnowSource: '(Source – Lorem Ipsum Dolor)',
    benefitsHeader: 'Strategic Benefits',
    cards: [
      card('C-suite leader', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.', '/assets/image-library/images/people/01.png'),
      card('Manager', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incid.', '/assets/image-library/images/people/02.png'),
      card('Front-line employee', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incidid.', '/assets/image-library/images/people/03.png'),
    ],
    risksTitle: 'Risks Mitigated',
    bullets: [
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet consectetur adipi' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet consectetur el' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet elit' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod t' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusm' },
      { id: newRoiItemId(), text: 'Lorem ipsum dolor sit amet consectetur adipiscing el' },
    ],
    showCustomerStory: true,
    customerLogoUrl: null,
    customerLogoHeight: ROI_CUSTOMER_LOGO.default,
    customerStoryText: 'Lorem ipsum dolor sit amet consect',
    customerStoryAttribution: 'Lorem Ipsum',
    roiHeadline: '171% 3-Year ROI',
    roiIntro:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
    stats: [
      { value: '171%', label: 'ROI over 3 years' },
      { value: '16 Months', label: 'Break-even point' },
      { value: '$2.28M', label: 'Net present value (NPV) over 3 years' },
      { value: '$4.51M', label: 'Total benefits over 3 years' },
    ],
    ctaHeadline: 'Ready to see what EHS software can do for you? Contact Cority today.',
    ctaText: 'Explore Cority',
  }
}

/** Immutable field patch. */
export function patchRoiDoc(doc: IndustryRoiDocument, patch: Partial<IndustryRoiDocument>): IndustryRoiDocument {
  return { ...doc, ...patch }
}

export function updateRoiRow(doc: IndustryRoiDocument, id: string, patch: Partial<Omit<RoiTableRow, 'id'>>): IndustryRoiDocument {
  return { ...doc, rows: doc.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) }
}

export function addRoiRow(doc: IndustryRoiDocument): IndustryRoiDocument {
  if (doc.rows.length >= ROI_MAX_ROWS) return doc
  return { ...doc, rows: [...doc.rows, { id: newRoiItemId(), label: '', value: '' }] }
}

export function removeRoiRow(doc: IndustryRoiDocument, id: string): IndustryRoiDocument {
  return { ...doc, rows: doc.rows.filter((r) => r.id !== id) }
}

export function moveRoiRow(doc: IndustryRoiDocument, id: string, dir: -1 | 1): IndustryRoiDocument {
  const i = doc.rows.findIndex((r) => r.id === id)
  const j = i + dir
  if (i === -1 || j < 0 || j >= doc.rows.length) return doc
  const rows = [...doc.rows]
  ;[rows[i], rows[j]] = [rows[j], rows[i]]
  return { ...doc, rows }
}

export function updateRoiBullet(doc: IndustryRoiDocument, id: string, text: string): IndustryRoiDocument {
  return { ...doc, bullets: doc.bullets.map((b) => (b.id === id ? { ...b, text } : b)) }
}

export function addRoiBullet(doc: IndustryRoiDocument): IndustryRoiDocument {
  if (doc.bullets.length >= ROI_MAX_BULLETS) return doc
  return { ...doc, bullets: [...doc.bullets, { id: newRoiItemId(), text: '' }] }
}

export function removeRoiBullet(doc: IndustryRoiDocument, id: string): IndustryRoiDocument {
  return { ...doc, bullets: doc.bullets.filter((b) => b.id !== id) }
}

export function moveRoiBullet(doc: IndustryRoiDocument, id: string, dir: -1 | 1): IndustryRoiDocument {
  const i = doc.bullets.findIndex((b) => b.id === id)
  const j = i + dir
  if (i === -1 || j < 0 || j >= doc.bullets.length) return doc
  const bullets = [...doc.bullets]
  ;[bullets[i], bullets[j]] = [bullets[j], bullets[i]]
  return { ...doc, bullets }
}

export function updateRoiCard(doc: IndustryRoiDocument, index: number, patch: Partial<RoiPersonaCard>): IndustryRoiDocument {
  const cards = doc.cards.map((c, i) => (i === index ? { ...c, ...patch } : c)) as IndustryRoiDocument['cards']
  return { ...doc, cards }
}

export function updateRoiStat(doc: IndustryRoiDocument, index: number, patch: Partial<RoiStat>): IndustryRoiDocument {
  const stats = doc.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) as IndustryRoiDocument['stats']
  return { ...doc, stats }
}

/** The static, non-editable solution-pill set (brand-locked in Design Dog). */
export const ROI_SOLUTION_PILLS: readonly string[][] = [
  ['Occupational Health', 'Industrial Hygiene', 'Compliance Management'],
  ['Air Emissions', 'Risk Management', 'Sustainability Management'],
  ['Incident Management', 'Audits & Inspections', 'Mobile Solutions'],
]
