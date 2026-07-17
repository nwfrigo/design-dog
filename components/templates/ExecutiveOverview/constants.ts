/**
 * Executive Overview — shared block ids, content model, design tokens, and
 * provisional placeholder copy. Lives in its own module (not the barrel) so
 * the page components can import it without a circular dependency on `index`.
 *
 * NOTE: placeholder copy is PROVISIONAL — neutral, length-indicative text so
 * empty slots read at the right density. Finalizing the default copy is a
 * later decision; change it here only.
 */

/* ------------------------------------------------------------------ */
/* Block ids                                                           */
/* ------------------------------------------------------------------ */

export const EXEC_CARD_COUNT = 4
export const EXEC_CHIPS_PER_CARD = 3
export const EXEC_STAT_COUNT = 5

type CardIndex = 1 | 2 | 3 | 4
type ChipIndex = 1 | 2 | 3
type StatIndex = 1 | 2 | 3 | 4 | 5

/** Every editable region across both pages, as a flat dotted-path-safe id.
 *  Page 1 ids are semantic; page 2 card/chip/stat ids are indexed. */
export type ExecutiveOverviewBlockId =
  // page 1
  | 'partnerLogo'
  | 'introHeadline'
  | 'introBody'
  | 'quote'
  | 'quoteAttribution'
  | 'heroImage'
  // page 2
  | 'tagline'
  | `card${CardIndex}Title`
  | `card${CardIndex}Body`
  | `card${CardIndex}Chip${ChipIndex}`
  | 'trustedHeader'
  | 'trustedSubhead'
  | `stat${StatIndex}`
  | 'footerCta'
  | 'contactName'
  | 'contactRole'
  | 'contactEmail'
  | 'contactAvatar'

/* ------------------------------------------------------------------ */
/* Content model (mirrors ExecutiveOverviewDocument, resolved)         */
/* ------------------------------------------------------------------ */

export interface ExecutiveOverviewChip {
  label: string
  /** Lucide icon id (kebab-case), resolved via getIconByName. */
  icon: string
  show: boolean
}

export interface ExecutiveOverviewCard {
  title: string
  body: string
  /** Always length EXEC_CHIPS_PER_CARD; trailing chips may have show:false. */
  chips: ExecutiveOverviewChip[]
}

export interface ExecutiveOverviewStat {
  label: string
  show: boolean
}

/* ------------------------------------------------------------------ */
/* Design tokens (from the Figma design system + BRAND.md)             */
/* ------------------------------------------------------------------ */

export const EXEC_TOKENS = {
  pageBg: '#FAFAFB', // bg/raised
  cardBg: '#FFFFFF', // bg/primary
  chipBg: '#FAFAFB', // bg/raised
  footerBg: '#FFFFFF',
  text: '#060015', // text/primary
  textSecondary: '#767676', // text/secondary
  orange: '#D35F0B', // button/primary/bg-default
  border: '#D9D8D6', // border/default
  borderXs: 0.5, // border/xs
  radiusS: 6, // radius/s
  radiusXs: 4, // radius/xs
} as const

export const EXEC_PAGE_W = 612
export const EXEC_PAGE_H = 792

/* ------------------------------------------------------------------ */
/* Provisional placeholder copy (finalize later — one place to edit)   */
/* ------------------------------------------------------------------ */

export const EXEC_PLACEHOLDERS = {
  // page 1
  introHeadline: 'Cority & Partner Name',
  introBody:
    '<p>Introduce the prospect and the moment: a one- or two-sentence framing of where their business is headed and why the timing is right to invest now.</p><p></p><p>Follow with the cost of waiting — the risks, inefficiencies, or blind spots that a fragmented approach leaves in place across their operations.</p>',
  quote: '“A short, verbatim customer quote that reinforces the value of a single connected system.”',
  quoteAttribution: 'Attribution, Company',
  // page 2
  tagline: 'The platform and partnership built to grow with your business.',
  cardTitle: 'Value proposition',
  cardBody:
    'One or two sentences describing this pillar of the recommended solution and the outcome it drives for the prospect.',
  chipLabel: 'Supporting point',
  trustedHeader: 'A trusted partner.',
  trustedSubhead: 'Choose the team of experts committed to your success.',
  stat: 'Proof point or metric',
  footerCta: 'Let’s build a path forward together.',
  contactName: 'Firstname Lastname',
  contactRole: 'Role, Company',
  contactEmail: 'name@company.com',
} as const

/** Default Lucide icon ids per card/chip, matching the source design. Used
 *  by the document factory — the template renders whatever it's given and
 *  falls back to a neutral dot when an icon id doesn't resolve. */
/** Default cover hero image — a branded Cority graphic (153×792, matches the
 *  hero frame) that ships so the cover reads complete out of the box. Users
 *  swap or keep it; same frame, no layout effect. */
export const EXEC_DEFAULT_HERO_IMAGE = '/assets/images/executive_overview_default.png'

export const EXEC_DEFAULT_CHIP_ICONS: string[][] = [
  ['building', 'waypoints', 'link'],
  ['sparkles', 'file-chart-pie', 'link'],
  ['banknote-arrow-up', 'users-round', 'link'],
  ['sticker', 'database-zap', 'link'],
]
