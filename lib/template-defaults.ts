import type { TemplateType } from '@/types'

/**
 * Central source of truth for per-template default block visibility.
 *
 * One table, consumed by:
 *   - store init   (`getDefaultAssetSettings` in `store/index.ts`)
 *   - thumbnails   (`TemplateTile.tsx`)
 *   - render route (`template-registry.tsx` parser defaults align with this)
 *
 * Canonical visibility (the rule before overrides):
 *
 *   eyebrow            — off (opt-in branding label)
 *   headline           — on  (mandatory; the primary title)
 *   subhead            — on  (secondary line; expected in most designs)
 *   body               — off (long-form copy; opt-in for marketing/event templates)
 *   metadata           — off (event-specific captions; opt-in)
 *   cta                — on  (call to action; expected in most designs)
 *   solutionSet (pill) — on  (Cority branding marker)
 *   eventDate/Loc/Time — on  (when the field exists on the template, it's load-bearing)
 *   workshopName       — on  (signature template field)
 *   speaker1/2/3       — on  (webinar default; user trims)
 *   gridDetail rows    — on  (grid templates require all rows visible)
 *
 * Per-template overrides below — each row is the *full* materialized
 * flag set that applies to that template. Add a flag only if the
 * template actually has that field; omit otherwise. Per-template
 * overrides from canonical are commented inline.
 */

export type TemplateDefaultFlags = Record<string, boolean>

const DEFAULT_FLAGS: Record<string, TemplateDefaultFlags> = {
  // ----- Email --------------------------------------------------------

  'email-dark-gradient': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showBody: true,             // override: long-form email body
    showCta: true,
  },

  'email-grid': {
    showEyebrow: false,
    showHeadline: true,
    showLightHeader: true,
    showHeavyHeader: false,
    showSubheading: true,       // template uses `subheading`, not `subhead`
    showBody: true,             // override: grid-column body copy
    showSolutionSet: true,
    showGridDetail2: true,
  },

  'email-image': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showBody: true,             // override: long-form email body
    showCta: true,
  },

  'email-speakers': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showBody: true,             // override: webinar invitation body
    showCta: true,
    showSpeaker1: true,
    showSpeaker2: true,
    showSpeaker3: true,
  },

  'email-product-release': {
    // Track 2 — eyebrow + headline only
    showEyebrow: true,          // override: branded "Product Release" eyebrow is the design
    showHeadline: true,
  },

  'email-cority-connect-2026': {
    // Track 2 — sparse
    showHeadline: true,
    showBody: false,            // canonical (sparse design)
    showCta: true,
  },

  'email-cority-customer-exchange-banner': {
    // Track 2
    showHeadline: true,
    showBody: true,             // override: banner has supporting body copy
    showCta: true,
  },

  'email-cority-customer-exchange-signature': {
    // Track 2 — event signature
    showCceEventDate: true,
    showCceEventLocation: true,
    showCceEventTime: true,
    showCta: true,
  },

  'email-ehs-accelerate-banner': {
    // Track 2 — event banner
    showHeadline: true,
    showBody: true,             // override: event description
    showCta: true,
  },

  'email-ehs-accelerate-signature': {
    // Track 2 — workshop signature
    showSignatureWorkshopName: true,
    showSignatureEventDetails: true,
    showCta: true,
  },

  'email-ehs-accelerate-invitation': {
    // Track 2 — invitation card, all always-visible (no S&B yet)
  },

  // ----- Newsletter ---------------------------------------------------

  'newsletter-dark-gradient': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'newsletter-blue-gradient': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'newsletter-light': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'newsletter-top-banner': {
    // deferred from S&B; eyebrow + headline + subhead pattern
    showHeadline: true,
    showSubhead: true,
  },

  // ----- Social -------------------------------------------------------

  'social-blue-gradient': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showBody: false,            // canonical (social is shorter)
    showMetadata: false,
    showCta: true,
  },

  'social-dark-gradient': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showBody: false,
    showMetadata: false,
    showCta: true,
  },

  'social-image': {
    showHeadline: true,
    showSubhead: true,
    showMetadata: false,
    showCta: true,
    showSolutionSet: true,
  },

  'social-image-meddbase': {
    showHeadline: true,
    showSubhead: true,
    showMetadata: false,
    showCta: true,
    showSolutionSet: true,
  },

  'social-grid-detail': {
    showEyebrow: false,
    showHeadline: true,
    showSubhead: true,
    showSolutionSet: true,
    showGridDetail2: true,
    showGridDetail3: true,
  },

  'social-ehs-accelerate': {
    // Headline lockup is baked into the background; no eyebrow field
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'social-carousel': {
    // Multi-page collateral; per-slide flags live in carouselSlides
  },

  // ----- Website ------------------------------------------------------

  'website-thumbnail': {
    showEyebrow: true,          // override: branded "EBOOK" eyebrow
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'website-press-release': {
    showEyebrow: true,          // override: branded "NEWS" eyebrow
    showHeadline: true,
    showSubhead: false,         // override: press release design omits subhead
    showBody: true,             // override: press release body is core
    showCta: true,
  },

  'website-webinar': {
    showEyebrow: true,          // override: branded "Webinar" eyebrow
    showHeadline: true,
    showSubhead: true,
    showBody: true,             // override: webinar description body
    showCta: true,
    showSpeaker1: true,
    showSpeaker2: true,
    showSpeaker3: true,
  },

  'website-event-listing': {
    showEyebrow: true,          // override: branded "LIVE EVENT" eyebrow
    showHeadline: true,
    showSubhead: true,
    showGridDetail2: true,
    showGridDetail3: true,
  },

  'website-ehs-accelerate-listing': {
    showEyebrow: true,          // override: branded eyebrow
    showHeadline: true,
    showSubhead: true,
    showGridDetail2: true,
    showGridDetail3: true,
  },

  'website-report': {
    showEyebrow: true,          // override: branded "REPORT" eyebrow
    showHeadline: true,
    showSubhead: true,
    showCta: true,
  },

  'website-floating-banner': {
    // Track 2 — eyebrow + headline + cta pattern
    showEyebrow: true,          // override: banners typically lead with eyebrow
    showHeadline: true,
  },

  'website-floating-banner-mobile': {
    showEyebrow: true,          // override: same
    showHeadline: true,
  },
}

/**
 * Returns the default visibility flag map for a template. Empty record
 * if the template isn't in the table (collateral / unknown).
 */
export function getDefaultVisibility(templateType: TemplateType): TemplateDefaultFlags {
  return DEFAULT_FLAGS[templateType] ?? {}
}

/**
 * Per-template branded seed text for fields that ship with a flavored
 * default in the design (e.g. press release eyebrow = "NEWS"). Used by
 * both `getDefaultAssetSettings` and the homepage thumbnail so the
 * editor and thumbnail render the same string.
 *
 * Editable text fields not listed here seed empty. The template's own
 * `value || 'Canonical Placeholder'` fallback renders the canonical
 * placeholder ('Headline', 'Body copy goes here.', 'Call to Action',
 * etc.) when the seed is empty.
 */
export const BRANDED_SEEDS: Partial<Record<TemplateType, { eyebrow?: string; headline?: string }>> = {
  'website-press-release': { eyebrow: 'NEWS' },
  'website-thumbnail': { eyebrow: 'EBOOK' },
  'website-webinar': { eyebrow: 'Webinar' },
  'website-event-listing': { eyebrow: 'LIVE EVENT' },
  'website-ehs-accelerate-listing': { eyebrow: 'LIVE EVENT' },
  'website-report': { eyebrow: 'REPORT' },
  'email-product-release': { eyebrow: 'Product Release', headline: 'GX2 2026.1' },
}

export function getBrandedSeed(templateType: TemplateType, field: 'eyebrow' | 'headline'): string {
  return BRANDED_SEEDS[templateType]?.[field] ?? ''
}

/**
 * Returns a single flag's default for a template, or `undefined` if
 * the template doesn't define that flag.
 */
export function getDefaultFlag(
  templateType: TemplateType,
  flagName: string,
): boolean | undefined {
  return DEFAULT_FLAGS[templateType]?.[flagName]
}

/**
 * Universal show-flag defaults applied when the store needs values
 * before the user picks a template. Once a template is selected,
 * `getDefaultVisibility` overlays template-specific overrides on top.
 *
 * `as const` keeps each key's literal type so a `{ ...UNIVERSAL_FALLBACK_FLAGS }`
 * spread carries every field name into the inferred object type.
 */
export const UNIVERSAL_FALLBACK_FLAGS = {
  showEyebrow: false as boolean,
  showHeadline: true as boolean,
  showSubhead: true as boolean,
  showBody: false as boolean,
  showMetadata: false as boolean,
  showCta: true as boolean,
  showSolutionSet: true as boolean,
  showLightHeader: true as boolean,
  showHeavyHeader: false as boolean,
  showSubheading: true as boolean,
  showGridDetail2: true as boolean,
  showGridDetail3: true as boolean,
  showSpeaker1: true as boolean,
  showSpeaker2: true as boolean,
  showSpeaker3: true as boolean,
  showSignatureWorkshopName: true as boolean,
  showSignatureEventDetails: true as boolean,
  showCceEventDate: true as boolean,
  showCceEventLocation: true as boolean,
  showCceEventTime: true as boolean,
} as const
