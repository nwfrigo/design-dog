/**
 * Asset Snapshot Pattern (P1-8)
 *
 * Centralizes the field list that gets copied between editor state,
 * QueuedAsset, and GeneratedAsset objects. Previously this field list
 * was duplicated across 5 functions in the store, meaning new fields
 * had to be added in 5 places (and forgetting one caused silent data loss).
 *
 * Now adding a new field means:
 * 1. Add to SNAPSHOT_FIELDS array
 * 2. Add to the relevant TypeScript interfaces (AppState, QueuedAsset, etc.)
 *
 * The snapshot functions handle the rest automatically.
 */

import type { AppState, QueuedAsset, GeneratedAsset } from '@/types'

// ---------------------------------------------------------------------------
// Snapshot field definitions
// ---------------------------------------------------------------------------

/**
 * Fields that live directly on store state with the same key name
 * as on QueuedAsset / GeneratedAsset. These are the "design settings"
 * that get copied between all three representations.
 *
 * IMPORTANT: This list must stay in sync with the QueuedAsset interface.
 * If you add a new editable field, add it here AND to the interface.
 */
const SNAPSHOT_FIELDS = [
  // Core settings
  'eyebrow',
  'solution',
  'logoColor',
  'showEyebrow',
  'showSubhead',
  'showBody',
  'showHeadline',
  // Image
  'thumbnailImageUrl',
  // Email Grid
  'subheading',
  'showLightHeader',
  'showSubheading',
  'showSolutionSet',
  'showGridDetail2',
  'gridDetail1Text',
  'gridDetail2Text',
  'gridDetail3Type',
  'gridDetail3Text',
  // Social Grid Detail
  'gridDetail4Type',
  'gridDetail4Text',
  'showGridDetail3',
  // Social Dark Gradient
  'metadata',
  'ctaText',
  'colorStyle',
  'headingSize',
  'alignment',
  'ctaStyle',
  'showMetadata',
  'showCta',
  // Social Image
  'layout',
  // Newsletter (image URL/settings ride on the universal thumbnailImage*)
  'newsletterImageSize',
  // Speakers
  'speakerCount',
  'speaker1Name',
  'speaker1Role',
  'speaker1ImageUrl',
  'speaker1ImagePosition',
  'speaker1ImageZoom',
  'speaker2Name',
  'speaker2Role',
  'speaker2ImageUrl',
  'speaker2ImagePosition',
  'speaker2ImageZoom',
  'speaker3Name',
  'speaker3Role',
  'speaker3ImageUrl',
  'speaker3ImagePosition',
  'speaker3ImageZoom',
  // Website Webinar
  'webinarVariant',
  'showSpeaker1',
  'showSpeaker2',
  'showSpeaker3',
  // Website eBook
  'ebookVariant',
  // Website Report
  'reportVariant',
  // Website Event Listing
  'eventListingVariant',
  // Customer Library
  'customerLibraryVariant',
  // Website Floating Banner
  'floatingBannerVariant',
  // Website Floating Banner Mobile
  'floatingBannerMobileVariant',
  'floatingBannerMobileArrowType',
  // Newsletter Top Banner
  'newsletterTopBannerVariant',
  // Template theme (light/dark)
  'theme',
  // Image effects
  'grayscale',
  'headlineFontSize',
  'subheadFontSize',
  // Stack alignment (shared across all spacer-aware templates)
  'stackAlign',
  // Per-template inter-block gap overrides. One nested record holds every
  // template's gaps; replaced the prior 4 per-template fields.
  'templateGaps',
  // Per-content-type line-height overrides
  'lineHeights',
  // Solution Overview - Page 1
  'solutionOverviewSolution',
  'solutionOverviewSolutionName',
  'solutionOverviewTagline',
  // Solution Overview - Page 2
  'solutionOverviewHeroImageId',
  'solutionOverviewHeroImageUrl',
  'solutionOverviewHeroImagePosition',
  'solutionOverviewHeroImageZoom',
  'solutionOverviewHeroImageGrayscale',
  'solutionOverviewPage2Header',
  'solutionOverviewSectionHeader',
  'solutionOverviewIntroParagraph',
  'solutionOverviewKeySolutions',
  'solutionOverviewQuoteText',
  'solutionOverviewQuoteName',
  'solutionOverviewQuoteTitle',
  'solutionOverviewQuoteCompany',
  // Solution Overview - Page 3
  'solutionOverviewBenefits',
  'solutionOverviewFeatures',
  'solutionOverviewScreenshotUrl',
  'solutionOverviewScreenshotPosition',
  'solutionOverviewScreenshotZoom',
  'solutionOverviewScreenshotGrayscale',
  'solutionOverviewCtaOption',
  'solutionOverviewCtaUrl',
  // Solution Overview - Page 2 Stats
  'solutionOverviewStat1Value',
  'solutionOverviewStat1Label',
  'solutionOverviewStat2Value',
  'solutionOverviewStat2Label',
  'solutionOverviewStat3Value',
  'solutionOverviewStat3Label',
  'solutionOverviewStat4Value',
  'solutionOverviewStat4Label',
  'solutionOverviewStat5Value',
  'solutionOverviewStat5Label',
  // Social Carousel
  'carouselSlides',
  'carouselCurrentSlideIndex',
  // Email Cority Connect 2026
  'ccBackgroundVariant',
  // Email EHS Accelerate Banner
  'eventDate',
  'eventLocation',
  // Email EHS Accelerate Signature
  'signatureWorkshopName',
  'showSignatureWorkshopName',
  'showSignatureEventDetails',
  // Email EHS Accelerate Invitation
  'invitationHeader',
  'invitationHeadline',
  'invitationEventTitle',
  'invitationEventDate',
  'invitationEventLocation',
  'invitationEventTime',
  'invitationEventTimeNote',
  'invitationBody',
  // Email Cority Customer Exchange Signature
  'cceEventTime',
  'showCceEventDate',
  'showCceEventLocation',
  'showCceEventTime',
] as const

// Type for the shared field keys
type SnapshotFieldKey = typeof SNAPSHOT_FIELDS[number]

// ---------------------------------------------------------------------------
// captureEditorSnapshot
// ---------------------------------------------------------------------------

/**
 * Captures the current editor state into a flat object containing all
 * editable "design settings" fields. This is the source-of-truth field
 * list — used by addToQueue, saveQueuedAssetEdit, and other store functions
 * that need to read the current editor state.
 *
 * Note: This captures the DIRECT state fields only. Copy fields
 * (headline, subhead, body) and image position/zoom from
 * thumbnailImageSettings are handled separately by callers because
 * they have different source locations.
 */
export function captureEditorSnapshot(state: AppState): Record<SnapshotFieldKey, unknown> {
  const snapshot: Record<string, unknown> = {}
  for (const field of SNAPSHOT_FIELDS) {
    snapshot[field] = state[field as keyof AppState]
  }
  return snapshot as Record<SnapshotFieldKey, unknown>
}

// ---------------------------------------------------------------------------
// restoreEditorSnapshot
// ---------------------------------------------------------------------------

/**
 * Produces a partial state object that restores all editable fields
 * from a source object (QueuedAsset or GeneratedAsset) back into the
 * editor state. Used by editQueuedAsset and loadGeneratedAssetIntoEditor.
 *
 * @param source - A QueuedAsset, GeneratedAsset, or any object with the same field keys
 * @returns A Partial<AppState> suitable for passing to Zustand's `set()`
 */
export function restoreEditorSnapshot(source: Record<string, unknown>): Partial<AppState> {
  const partial: Record<string, unknown> = {}
  for (const field of SNAPSHOT_FIELDS) {
    if (field in source) {
      // Special case: headlineFontSize/subheadFontSize may be undefined in old data, normalize to null
      if (field === 'headlineFontSize' || field === 'subheadFontSize') {
        partial[field] = source[field] ?? null
      } else {
        partial[field] = source[field]
      }
    }
  }
  return partial as Partial<AppState>
}

// ---------------------------------------------------------------------------
// snapshotToQueuedAsset
// ---------------------------------------------------------------------------

/**
 * Builds a QueuedAsset from the current editor state. This is the
 * centralized version of the field copying that was previously
 * duplicated in addToQueue() and saveQueuedAssetEdit().
 *
 * @param state - The current AppState
 * @param meta - Queue-specific metadata (id, sourceAssetIndex, templateType)
 * @param imagePosition - The resolved thumbnail image position
 * @param imageZoom - The resolved thumbnail image zoom
 */
export function snapshotToQueuedAsset(
  state: AppState,
  meta: { id: string; sourceAssetIndex: number; templateType: string },
  imagePosition: { x: number; y: number },
  imageZoom: number,
  imageFilters?: import('./image-filters').ImageFilters,
): QueuedAsset {
  const snapshot = captureEditorSnapshot(state)
  return {
    ...snapshot,
    id: meta.id,
    templateType: meta.templateType as QueuedAsset['templateType'],
    sourceAssetIndex: meta.sourceAssetIndex,
    // Copy fields come from verbatimCopy, not from snapshot fields
    headline: state.verbatimCopy.headline,
    subhead: state.verbatimCopy.subhead,
    body: state.verbatimCopy.body,
    // Image position/zoom/filters come from the per-template settings,
    // not directly from state. Filters default to neutral when absent.
    thumbnailImagePosition: imagePosition,
    thumbnailImageZoom: imageZoom,
    thumbnailImageFilters: imageFilters,
  } as QueuedAsset
}

// ---------------------------------------------------------------------------
// generatedAssetToQueuedAsset
// ---------------------------------------------------------------------------

/**
 * Converts a GeneratedAsset into a QueuedAsset. This is the centralized
 * version of the field copying in addAllGeneratedToQueue().
 *
 * @param asset - The GeneratedAsset to convert
 * @param queueId - The unique ID for the new queue item
 */
export function generatedAssetToQueuedAsset(
  asset: GeneratedAsset,
  queueId: string,
): QueuedAsset {
  const partial: Record<string, unknown> = {}
  for (const field of SNAPSHOT_FIELDS) {
    if (field in asset) {
      // Normalize specific fields to match original behavior
      if (field === 'headlineFontSize' || field === 'subheadFontSize') {
        partial[field] = (asset as unknown as Record<string, unknown>)[field] ?? null
      } else if (field === 'solutionOverviewCtaUrl') {
        partial[field] = (asset as unknown as Record<string, unknown>)[field] || ''
      } else if (field === 'carouselSlides') {
        partial[field] = (asset as unknown as Record<string, unknown>)[field] || []
      } else if (field === 'carouselCurrentSlideIndex') {
        partial[field] = (asset as unknown as Record<string, unknown>)[field] ?? 0
      } else {
        partial[field] = (asset as unknown as Record<string, unknown>)[field]
      }
    }
  }

  return {
    ...partial,
    id: queueId,
    templateType: asset.templateType,
    // Copy fields come from the asset's copy object
    headline: asset.copy.headline,
    subhead: asset.copy.subhead,
    body: asset.copy.body,
    // Image position/zoom/filters come directly from the generated asset.
    thumbnailImagePosition: asset.thumbnailImagePosition,
    thumbnailImageZoom: asset.thumbnailImageZoom,
    thumbnailImageFilters: asset.thumbnailImageFilters,
    sourceAssetIndex: 0,
  } as QueuedAsset
}

