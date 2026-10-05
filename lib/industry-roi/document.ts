import type { ImageFilters } from '@/lib/image-filters'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

/**
 * Industry ROI one-pager — document model.
 *
 * Figma: Sales-Collateral | 2026 Master, frame `roi-1` (1223:1746).
 * Fixed 612px width, VARIABLE height (vertical flow; hidden sections
 * collapse, rows/bullets add and remove). Export is a single long-page PDF
 * at 612 × measured height via the Stacker measured branch.
 *
 * The blob holds ONLY the user-editable surface, per the source Word doc's
 * highlights ("Industry ROI template.docx" — highlighted = editable):
 * industry token, hero intro + image, ROI table rows (dynamic), the
 * did-you-know band (text/source + hide), risk bullets (dynamic), and the
 * customer-story band (text/attribution/logo + hide). Everything else —
 * table intro/footnote, Strategic Benefits (incl. card copy and images),
 * Risks title, the whole Verdantix ROI block and stats, solution pills,
 * and the CTA band — is brand-locked static art in the template.
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

export interface IndustryRoiDocument {
  // Hero
  heroImageUrl: string | null
  heroImagePosition: { x: number; y: number }
  heroImageZoom: number
  heroImageFilters: ImageFilters
  /** The industry token — the title renders as
   *  "Return on Investment in {industry}" with the prefix locked. */
  industry: string
  heroIntro: string
  // ROI table (dynamic)
  rows: RoiTableRow[]
  // "Did you know?" dark band (hideable)
  showDidYouKnow: boolean
  didYouKnowText: string
  didYouKnowSource: string
  // Risks — dynamic bullets
  bullets: RoiBullet[]
  // Customer story (hideable)
  showCustomerStory: boolean
  customerLogoUrl: string | null
  customerLogoHeight: number
  customerStoryText: string
  customerStoryAttribution: string
}

export const ROI_MAX_ROWS = 8
export const ROI_MAX_BULLETS = 10
export const ROI_CUSTOMER_LOGO = { default: 27, min: 14, max: 48 }

export function newRoiItemId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function defaultIndustryRoiDocument(): IndustryRoiDocument {
  return {
    heroImageUrl: '/assets/image-library/images/scenes/design-dog-library_001.jpg',
    heroImagePosition: { x: 0, y: 0 },
    heroImageZoom: 1,
    heroImageFilters: NEUTRAL_FILTERS,
    industry: 'Lorem Industry',
    heroIntro:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.',
    rows: [
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet elit sed', value: '$500K–$3M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit eiusmod', value: '$250K–$1M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet consectetur adi', value: '$250K–$1M+' },
      { id: newRoiItemId(), label: 'Lorem ipsum dolor sit amet elit', value: '5–15% Reduction' },
    ],
    showDidYouKnow: true,
    didYouKnowText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
    didYouKnowSource: '(Source – Lorem Ipsum Dolor)',
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

// ---------------------------------------------------------------------------
// Brand-locked static content (NOT user-editable; per the source doc, only
// highlighted copy is editable — this is everything else).
// ---------------------------------------------------------------------------

export const ROI_TITLE_PREFIX = 'Return on Investment in'
export const ROI_TABLE_INTRO = 'What could you achieve with EHS+ software?'
export const ROI_TABLE_FOOTNOTE = 'Estimated values based on typical exposures and volume of activity. Directional only.'
export const ROI_BENEFITS_HEADER = 'Strategic Benefits'
export const ROI_BENEFIT_CARDS = [
  { image: '/assets/industry-roi/card-1.png', role: 'C-suite leader', body: 'Holistic view of EHS and Sustainability performance for better decision-making.' },
  { image: '/assets/industry-roi/card-2.png', role: 'Manager', body: 'Streamlined reporting, increased efficiency through automation and proactive risk mitigation.' },
  { image: '/assets/industry-roi/card-3.png', role: 'Front-line employee', body: 'Better access to EHS and Sustainability information, easier data entry and enhanced monitoring.' },
] as const
export const ROI_RISKS_TITLE = 'Risks Mitigated'
export const ROI_HEADLINE = '171% 3-Year ROI'
export const ROI_INTRO =
  "Verdantix, a third-party analyst, found that deploying nine of CorityOne's EHS and Sustainability solutions has the following three-year financial impact:"
export const ROI_STATS = [
  { value: '171%', label: 'ROI over 3 years' },
  { value: '16 Months', label: 'Break-even point' },
  { value: '$2.28M', label: 'Net present value (NPV) over 3 years' },
  { value: '$4.51M', label: 'Total benefits over 3 years' },
] as const
export const ROI_CTA_HEADLINE = 'Ready to see what EHS software can do for you? Contact Cority today.'
export const ROI_CTA_TEXT = 'Explore Cority'
export const ROI_SOLUTION_PILLS: readonly string[][] = [
  ['Occupational Health', 'Industrial Hygiene', 'Compliance Management'],
  ['Air Emissions', 'Risk Management', 'Sustainability Management'],
  ['Incident Management', 'Audits & Inspections', 'Mobile Solutions'],
]
