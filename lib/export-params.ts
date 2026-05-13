/**
 * Export param builders for each template type.
 *
 * Each builder receives the full editor state (all the values that could
 * possibly be needed) and returns the additional export params specific
 * to that template.  The caller merges these with the common params
 * (template, scale, eyebrow, headline, subhead, body, solution, logoColor,
 * showEyebrow, showHeadline, headlineFontSize).
 */

import { isHtmlEmpty } from '@/components/SimpleRichTextEditor'
import type { QueuedAsset, StackAlign, TemplateType } from '@/types'

// The shape of all the state the builders can draw from.
// This is intentionally a flat bag — it mirrors the store + local state
// that EditorScreen already destructures.
export interface ExportParamState {
  // Common
  eyebrow: string
  verbatimCopy: { headline: string; subhead: string; body: string }
  solution: string
  logoColor: string
  showEyebrow: boolean
  showHeadline: boolean
  headlineFontSize: number | null
  subheadFontSize: number | null
  stackAlign: StackAlign
  // Bundled per-template gap overrides. Builders index in via the
  // template's key (e.g. `s.templateGaps['email-dark-gradient']`).
  templateGaps: Partial<Record<TemplateType, Record<string, number>>>
  lineHeights: Record<string, number>

  // Image
  thumbnailImageUrl: string | null
  thumbnailImagePosition: { x: number; y: number }
  thumbnailImageZoom: number
  /** Per-image filter values; optional so existing call sites compile until
   *  they thread filters through. Defaults to NEUTRAL_FILTERS at emit time. */
  thumbnailImageFilters?: import('./image-filters').ImageFilters
  grayscale: boolean

  // Toggles
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  showMetadata: boolean
  showSolutionSet: boolean
  showLightHeader: boolean
  showSubheading: boolean
  showGridDetail2: boolean
  showGridDetail3: boolean
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean

  // Text fields
  ctaText: string
  metadata: string
  subheading: string

  // Variant fields
  ebookVariant: string
  webinarVariant: string
  reportVariant: string
  eventListingVariant: string
  floatingBannerVariant: string
  floatingBannerMobileVariant: string
  floatingBannerMobileArrowType: string
  newsletterTopBannerVariant: string
  colorStyle: string
  headingSize: string
  alignment: string
  ctaStyle: string
  layout: string
  theme?: string

  // Grid detail fields
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: string
  gridDetail3Text: string
  gridDetail4Type: string
  gridDetail4Text: string

  // Newsletter layout switch (image data is universal — see thumbnailImage*)
  newsletterImageSize: string

  // Speakers
  speakerCount: number
  speaker1Name: string
  speaker1Role: string
  speaker1ImageUrl: string
  speaker1ImagePosition: { x: number; y: number }
  speaker1ImageZoom: number
  speaker2Name: string
  speaker2Role: string
  speaker2ImageUrl: string
  speaker2ImagePosition: { x: number; y: number }
  speaker2ImageZoom: number
  speaker3Name: string
  speaker3Role: string
  speaker3ImageUrl: string
  speaker3ImagePosition: { x: number; y: number }
  speaker3ImageZoom: number

  // Customer Library
  customerLibraryVariant: string
  qrCodeUrl: string | null
  showFooterText: boolean

  // Solution Overview PDF
  solutionOverviewSolution: string
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewHeroImageId: string
  solutionOverviewHeroImageUrl: string | null
  solutionOverviewHeroImagePosition: { x: number; y: number }
  solutionOverviewHeroImageZoom: number
  solutionOverviewPage2Header: string
  solutionOverviewSectionHeader: string
  solutionOverviewIntroParagraph: string
  solutionOverviewKeySolutions: string[]
  solutionOverviewQuoteText: string
  solutionOverviewQuoteName: string
  solutionOverviewQuoteTitle: string
  solutionOverviewQuoteCompany: string
  solutionOverviewStat1Value: string
  solutionOverviewStat1Label: string
  solutionOverviewStat2Value: string
  solutionOverviewStat2Label: string
  solutionOverviewStat3Value: string
  solutionOverviewStat3Label: string
  solutionOverviewStat4Value: string
  solutionOverviewStat4Label: string
  solutionOverviewStat5Value: string
  solutionOverviewStat5Label: string
  solutionOverviewBenefits: Array<{ title: string; description: string; icon?: string }>
  solutionOverviewFeatures: Array<{ title: string; description: string }>
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewCtaOption: string
  // Email Cority Connect 2026
  ccBackgroundVariant: import('@/components/templates/EmailCorityConnect2026').CCBackgroundVariant
  // Email EHS Accelerate Banner
  eventDate: string
  eventLocation: string
  // Email EHS Accelerate Signature
  signatureWorkshopName: string
  showSignatureWorkshopName: boolean
  showSignatureEventDetails: boolean
  // Email EHS Accelerate Invitation
  invitationHeader: string
  invitationHeadline: string
  invitationEventTitle: string
  invitationEventDate: string
  invitationEventLocation: string
  invitationEventTime: string
  invitationEventTimeNote: string
  invitationBody: string
  // Email Cority Customer Exchange Signature
  cceEventTime: string
  showCceEventDate: boolean
  showCceEventLocation: boolean
  showCceEventTime: boolean
}

export type ExportParamBuilder = (s: ExportParamState) => Record<string, unknown>

function buildSpeakerParams(s: ExportParamState): Record<string, unknown> {
  return {
    speakerCount: s.speakerCount,
    speaker1Name: s.speaker1Name,
    speaker1Role: s.speaker1Role,
    speaker1ImageUrl: s.speaker1ImageUrl,
    speaker1ImagePositionX: s.speaker1ImagePosition.x,
    speaker1ImagePositionY: s.speaker1ImagePosition.y,
    speaker1ImageZoom: s.speaker1ImageZoom,
    speaker2Name: s.speaker2Name,
    speaker2Role: s.speaker2Role,
    speaker2ImageUrl: s.speaker2ImageUrl,
    speaker2ImagePositionX: s.speaker2ImagePosition.x,
    speaker2ImagePositionY: s.speaker2ImagePosition.y,
    speaker2ImageZoom: s.speaker2ImageZoom,
    speaker3Name: s.speaker3Name,
    speaker3Role: s.speaker3Role,
    speaker3ImageUrl: s.speaker3ImageUrl,
    speaker3ImagePositionX: s.speaker3ImagePosition.x,
    speaker3ImagePositionY: s.speaker3ImagePosition.y,
    speaker3ImageZoom: s.speaker3ImageZoom,
  }
}

function buildImageParams(s: ExportParamState): Record<string, unknown> {
  const f = s.thumbnailImageFilters
  return {
    imageUrl: s.thumbnailImageUrl,
    imagePositionX: s.thumbnailImagePosition.x,
    imagePositionY: s.thumbnailImagePosition.y,
    imageZoom: s.thumbnailImageZoom,
    grayscale: s.grayscale,
    // Per-image filter values — 3 scalars so the route's auto-serializer
    // (app/api/export/route.ts) emits them as plain URL params without
    // COMPLEX_KEYS handling. Defaults to neutral when absent.
    imageFilterExposure: f?.exposure ?? 0,
    imageFilterContrast: f?.contrast ?? 0,
    imageFilterSaturation: f?.saturation ?? 0,
  }
}

const BUILDERS: Record<string, ExportParamBuilder> = {
  // 'social-image' + 'social-ehs-accelerate' — migrated to
  // stage-bench-registry (Task 2 pilots). Builders now live in their
  // respective *Registration.ts files.

  // 'email-cority-connect-2026' — migrated to stage-bench-registry
  // (Task 2 pilot). Builder lives in EmailCorityConnect2026Registration.ts.

  'email-ehs-accelerate-invitation': (s) => ({
    invitationHeader: s.invitationHeader || '',
    invitationHeadline: s.invitationHeadline || '',
    invitationEventTitle: s.invitationEventTitle || '',
    invitationEventDate: s.invitationEventDate || '',
    invitationEventLocation: s.invitationEventLocation || '',
    invitationEventTime: s.invitationEventTime || '',
    invitationEventTimeNote: s.invitationEventTimeNote || '',
    invitationBody: s.invitationBody || '',
  }),

  'newsletter-top-banner': (s) => ({
    variant: s.newsletterTopBannerVariant,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
  }),

  'customer-library': (s) => ({
    variant: s.customerLibraryVariant,
    footerText: s.verbatimCopy.subhead,
    qrCodeUrl: s.thumbnailImageUrl,
    hasQrCode: !!s.thumbnailImageUrl,
    showHeadline: s.showHeadline,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showFooterText: s.showSubhead && !!s.verbatimCopy.subhead,
  }),

  'solution-overview-pdf': (s) => ({
    solutionOverviewSolution: s.solutionOverviewSolution,
    solutionName: s.solutionOverviewSolutionName,
    tagline: s.solutionOverviewTagline,
    page: 'all',
    heroImageId: s.solutionOverviewHeroImageId,
    heroImageUrl: s.solutionOverviewHeroImageUrl,
    heroImagePositionX: s.solutionOverviewHeroImagePosition.x,
    heroImagePositionY: s.solutionOverviewHeroImagePosition.y,
    heroImageZoom: s.solutionOverviewHeroImageZoom,
    page2Header: s.solutionOverviewPage2Header,
    sectionHeader: s.solutionOverviewSectionHeader,
    introParagraph: s.solutionOverviewIntroParagraph,
    keySolutions: s.solutionOverviewKeySolutions,
    quoteText: s.solutionOverviewQuoteText,
    quoteName: s.solutionOverviewQuoteName,
    quoteTitle: s.solutionOverviewQuoteTitle,
    quoteCompany: s.solutionOverviewQuoteCompany,
    stat1Value: s.solutionOverviewStat1Value,
    stat1Label: s.solutionOverviewStat1Label,
    stat2Value: s.solutionOverviewStat2Value,
    stat2Label: s.solutionOverviewStat2Label,
    stat3Value: s.solutionOverviewStat3Value,
    stat3Label: s.solutionOverviewStat3Label,
    stat4Value: s.solutionOverviewStat4Value,
    stat4Label: s.solutionOverviewStat4Label,
    stat5Value: s.solutionOverviewStat5Value,
    stat5Label: s.solutionOverviewStat5Label,
    benefits: s.solutionOverviewBenefits,
    features: s.solutionOverviewFeatures,
    screenshotUrl: s.solutionOverviewScreenshotUrl,
    screenshotPositionX: s.solutionOverviewScreenshotPosition.x,
    screenshotPositionY: s.solutionOverviewScreenshotPosition.y,
    screenshotZoom: s.solutionOverviewScreenshotZoom,
    ctaOption: s.solutionOverviewCtaOption,
  }),
}

// Pull in builders from the central Stage & Bench registry. Stage-bench
// templates own their export logic alongside their renderProps /
// renderSchema in *Registration.ts files; this `Object.assign` is the
// only place that hand-off happens.
import { getStageBenchExportBuilders } from './stage-bench-registry'
Object.assign(BUILDERS, getStageBenchExportBuilders())

/**
 * Build the full export params for a given template type.
 * Returns the common params merged with template-specific params.
 */
export function buildExportParams(
  template: string,
  exportScale: number,
  state: ExportParamState
): Record<string, unknown> {
  const common: Record<string, unknown> = {
    template,
    scale: exportScale,
    eyebrow: state.eyebrow,
    headline: state.verbatimCopy.headline,
    subhead: state.verbatimCopy.subhead,
    body: state.verbatimCopy.body,
    solution: state.solution,
    logoColor: state.logoColor,
    showEyebrow: state.showEyebrow,
    showHeadline: state.showHeadline,
    headlineFontSize: state.headlineFontSize,
    subheadFontSize: state.subheadFontSize,
  }

  const builder = BUILDERS[template]
  if (builder) {
    const templateParams = builder(state)
    return { ...common, ...templateParams }
  }

  // Fallback: just return common params
  return common
}

/**
 * Build export params directly from a QueuedAsset.
 * Converts the flat QueuedAsset fields into the ExportParamState shape
 * that buildExportParams expects, then delegates to it.
 *
 * Used by ExportQueueScreen to avoid duplicating field mapping.
 */
export function buildExportParamsFromAsset(
  asset: QueuedAsset,
  exportScale: number
): Record<string, unknown> {
  const a = asset as unknown as Record<string, unknown>
  const state: ExportParamState = {
    eyebrow: (a.eyebrow as string) || '',
    verbatimCopy: {
      headline: (a.headline as string) || '',
      subhead: (a.subhead as string) || '',
      body: (a.body as string) || '',
    },
    solution: (a.solution as string) || '',
    logoColor: (a.logoColor as string) || 'black',
    showEyebrow: a.showEyebrow !== false,
    showHeadline: a.showHeadline !== false,
    headlineFontSize: (a.headlineFontSize as number | null) ?? null,
    subheadFontSize: (a.subheadFontSize as number | null) ?? null,
    stackAlign: (a.stackAlign as StackAlign) ?? 'top',
    templateGaps: (a.templateGaps as Partial<Record<TemplateType, Record<string, number>>>) ?? {},
    lineHeights: (a.lineHeights as Record<string, number>) ?? {},
    thumbnailImageUrl: (a.thumbnailImageUrl as string | null) ?? null,
    thumbnailImagePosition: (a.thumbnailImagePosition as { x: number; y: number }) || { x: 0, y: 0 },
    thumbnailImageZoom: (a.thumbnailImageZoom as number) ?? 1,
    thumbnailImageFilters: a.thumbnailImageFilters as import('./image-filters').ImageFilters | undefined,
    grayscale: (a.grayscale as boolean) ?? false,
    showSubhead: a.showSubhead !== false,
    showBody: a.showBody !== false,
    showCta: a.showCta !== false,
    showMetadata: a.showMetadata !== false,
    showSolutionSet: a.showSolutionSet !== false,
    showLightHeader: a.showLightHeader !== false,
    showSubheading: (a.showSubheading as boolean) ?? false,
    showGridDetail2: a.showGridDetail2 !== false,
    showGridDetail3: a.showGridDetail3 !== false,
    showSpeaker1: a.showSpeaker1 !== false,
    showSpeaker2: a.showSpeaker2 !== false,
    showSpeaker3: a.showSpeaker3 !== false,
    ctaText: (a.ctaText as string) || '',
    metadata: (a.metadata as string) || '',
    subheading: (a.subheading as string) || '',
    ebookVariant: (a.ebookVariant as string) || 'image',
    webinarVariant: (a.webinarVariant as string) || 'image',
    reportVariant: (a.reportVariant as string) || 'image',
    eventListingVariant: (a.eventListingVariant as string) || 'orange',
    floatingBannerVariant: (a.floatingBannerVariant as string) || 'dark',
    floatingBannerMobileVariant: (a.floatingBannerMobileVariant as string) || 'light',
    floatingBannerMobileArrowType: (a.floatingBannerMobileArrowType as string) || 'text',
    newsletterTopBannerVariant: (a.newsletterTopBannerVariant as string) || 'dark',
    theme: (a.theme as string) || 'light',
    colorStyle: (a.colorStyle as string) || '1',
    headingSize: (a.headingSize as string) || 'L',
    alignment: (a.alignment as string) || 'left',
    ctaStyle: (a.ctaStyle as string) || 'link',
    layout: (a.layout as string) || 'even',
    gridDetail1Text: (a.gridDetail1Text as string) || '',
    gridDetail2Text: (a.gridDetail2Text as string) || '',
    gridDetail3Type: (a.gridDetail3Type as string) || 'cta',
    gridDetail3Text: (a.gridDetail3Text as string) || '',
    gridDetail4Type: (a.gridDetail4Type as string) || 'cta',
    gridDetail4Text: (a.gridDetail4Text as string) || '',
    newsletterImageSize: (a.newsletterImageSize as string) || 'none',
    speakerCount: (a.speakerCount as number) || 3,
    speaker1Name: (a.speaker1Name as string) || '',
    speaker1Role: (a.speaker1Role as string) || '',
    speaker1ImageUrl: (a.speaker1ImageUrl as string) || '',
    speaker1ImagePosition: (a.speaker1ImagePosition as { x: number; y: number }) || { x: 0, y: 0 },
    speaker1ImageZoom: (a.speaker1ImageZoom as number) || 1,
    speaker2Name: (a.speaker2Name as string) || '',
    speaker2Role: (a.speaker2Role as string) || '',
    speaker2ImageUrl: (a.speaker2ImageUrl as string) || '',
    speaker2ImagePosition: (a.speaker2ImagePosition as { x: number; y: number }) || { x: 0, y: 0 },
    speaker2ImageZoom: (a.speaker2ImageZoom as number) || 1,
    speaker3Name: (a.speaker3Name as string) || '',
    speaker3Role: (a.speaker3Role as string) || '',
    speaker3ImageUrl: (a.speaker3ImageUrl as string) || '',
    speaker3ImagePosition: (a.speaker3ImagePosition as { x: number; y: number }) || { x: 0, y: 0 },
    speaker3ImageZoom: (a.speaker3ImageZoom as number) || 1,
    solutionOverviewSolution: (a.solutionOverviewSolution as string) || '',
    solutionOverviewSolutionName: (a.solutionOverviewSolutionName as string) || '',
    solutionOverviewTagline: (a.solutionOverviewTagline as string) || '',
    solutionOverviewHeroImageId: (a.solutionOverviewHeroImageId as string) || '',
    solutionOverviewHeroImageUrl: (a.solutionOverviewHeroImageUrl as string | null) ?? null,
    solutionOverviewHeroImagePosition: (a.solutionOverviewHeroImagePosition as { x: number; y: number }) || { x: 0, y: 0 },
    solutionOverviewHeroImageZoom: (a.solutionOverviewHeroImageZoom as number) || 1,
    solutionOverviewPage2Header: (a.solutionOverviewPage2Header as string) || '',
    solutionOverviewSectionHeader: (a.solutionOverviewSectionHeader as string) || '',
    solutionOverviewIntroParagraph: (a.solutionOverviewIntroParagraph as string) || '',
    solutionOverviewKeySolutions: (a.solutionOverviewKeySolutions as string[]) || [],
    solutionOverviewQuoteText: (a.solutionOverviewQuoteText as string) || '',
    solutionOverviewQuoteName: (a.solutionOverviewQuoteName as string) || '',
    solutionOverviewQuoteTitle: (a.solutionOverviewQuoteTitle as string) || '',
    solutionOverviewQuoteCompany: (a.solutionOverviewQuoteCompany as string) || '',
    solutionOverviewStat1Value: (a.solutionOverviewStat1Value as string) || '',
    solutionOverviewStat1Label: (a.solutionOverviewStat1Label as string) || '',
    solutionOverviewStat2Value: (a.solutionOverviewStat2Value as string) || '',
    solutionOverviewStat2Label: (a.solutionOverviewStat2Label as string) || '',
    solutionOverviewStat3Value: (a.solutionOverviewStat3Value as string) || '',
    solutionOverviewStat3Label: (a.solutionOverviewStat3Label as string) || '',
    solutionOverviewStat4Value: (a.solutionOverviewStat4Value as string) || '',
    solutionOverviewStat4Label: (a.solutionOverviewStat4Label as string) || '',
    solutionOverviewStat5Value: (a.solutionOverviewStat5Value as string) || '',
    solutionOverviewStat5Label: (a.solutionOverviewStat5Label as string) || '',
    solutionOverviewBenefits: (a.solutionOverviewBenefits as Array<{ title: string; description: string; icon?: string }>) || [],
    solutionOverviewFeatures: (a.solutionOverviewFeatures as Array<{ title: string; description: string }>) || [],
    solutionOverviewScreenshotUrl: (a.solutionOverviewScreenshotUrl as string | null) ?? null,
    solutionOverviewScreenshotPosition: (a.solutionOverviewScreenshotPosition as { x: number; y: number }) || { x: 0, y: 0 },
    solutionOverviewScreenshotZoom: (a.solutionOverviewScreenshotZoom as number) || 1,
    solutionOverviewCtaOption: (a.solutionOverviewCtaOption as string) || 'demo',
    customerLibraryVariant: (a.customerLibraryVariant as string) || 'dark',
    qrCodeUrl: (a.thumbnailImageUrl as string | null) ?? null,
    showFooterText: a.showSubhead !== false,
    ccBackgroundVariant: (a.ccBackgroundVariant as import('@/components/templates/EmailCorityConnect2026').CCBackgroundVariant) || 'dark-blue-1',
    eventDate: (a.eventDate as string) || '',
    eventLocation: (a.eventLocation as string) || '',
    signatureWorkshopName: (a.signatureWorkshopName as string) || '',
    showSignatureWorkshopName: (a.showSignatureWorkshopName as boolean) ?? true,
    showSignatureEventDetails: (a.showSignatureEventDetails as boolean) ?? true,
    invitationHeader: (a.invitationHeader as string) || '',
    invitationHeadline: (a.invitationHeadline as string) || '',
    invitationEventTitle: (a.invitationEventTitle as string) || '',
    invitationEventDate: (a.invitationEventDate as string) || '',
    invitationEventLocation: (a.invitationEventLocation as string) || '',
    invitationEventTime: (a.invitationEventTime as string) || '',
    invitationEventTimeNote: (a.invitationEventTimeNote as string) || '',
    invitationBody: (a.invitationBody as string) || '',
    cceEventTime: (a.cceEventTime as string) || '',
    showCceEventDate: (a.showCceEventDate as boolean) ?? true,
    showCceEventLocation: (a.showCceEventLocation as boolean) ?? true,
    showCceEventTime: (a.showCceEventTime as boolean) ?? true,
  }

  return buildExportParams(asset.templateType, exportScale, state)
}
