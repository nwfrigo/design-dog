/**
 * Canonical placeholder strings, keyed by slot kind. Single source of truth
 * for the strings that appear in empty slots — read by both template
 * components (via `value || SLOT_PLACEHOLDERS.foo`) and adapter slot
 * descriptors (`content: { placeholder: SLOT_PLACEHOLDERS.foo }`).
 *
 * Editor and export render the same template against the same store, so
 * a single map guarantees they show the same placeholder when a slot is
 * empty. See STAGE-AND-BENCH.md §8.4 for the rule.
 *
 * Override per template only when the design calls for a flavored default
 * (event-specific labels, product names). Those flavored defaults stay
 * inline in the template — they're not canonical.
 */
export const SLOT_PLACEHOLDERS = {
  eyebrow: 'Eyebrow',
  headline: 'Headline',
  subhead: 'Subheadline',
  subheading: 'Subheadline',
  body: 'Body copy goes here.',
  metadata: 'Small Caption',
  cta: 'Call to Action',
  eventDate: 'Event date',
  eventLocation: 'Event location',
  eventTime: 'Event time',
  workshopName: 'Workshop name',
  speakerName: 'Firstname Lastname',
  speakerRole: 'Role, Company',
  gridDetail1: 'Grid detail 1',
  gridDetail2: 'Grid detail 2',
  gridDetail3: 'Grid detail 3',
  gridDetail4: 'Grid detail 4',
} as const

export type SlotPlaceholderKey = keyof typeof SLOT_PLACEHOLDERS
