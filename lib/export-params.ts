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

  // Image
  thumbnailImageUrl: string | null
  thumbnailImagePosition: { x: number; y: number }
  thumbnailImageZoom: number
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
  showRow3: boolean
  showRow4: boolean
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

  // Grid detail fields
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: string
  gridDetail3Text: string
  gridDetail4Type: string
  gridDetail4Text: string

  // Newsletter image
  newsletterImageSize: string
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number

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
}

type ExportParamBuilder = (s: ExportParamState) => Record<string, unknown>

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
  return {
    imageUrl: s.thumbnailImageUrl,
    imagePositionX: s.thumbnailImagePosition.x,
    imagePositionY: s.thumbnailImagePosition.y,
    imageZoom: s.thumbnailImageZoom,
    grayscale: s.grayscale,
  }
}

const BUILDERS: Record<string, ExportParamBuilder> = {
  'website-thumbnail': (s) => ({
    ...buildImageParams(s),
    variant: s.ebookVariant,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showCta: s.showCta,
    ctaText: s.ctaText,
  }),

  'website-press-release': (s) => ({
    ...buildImageParams(s),
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showBody: s.showBody && !!s.verbatimCopy.body,
    showCta: s.showCta,
    ctaText: s.ctaText,
  }),

  'website-event-listing': (s) => ({
    variant: s.eventListingVariant,
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Text: s.gridDetail3Text,
    gridDetail4Text: s.gridDetail4Text,
    showRow3: s.showRow3,
    showRow4: s.showRow4,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    ctaText: s.ctaText,
  }),

  'email-grid': (s) => ({
    subheading: s.subheading,
    showLightHeader: s.showLightHeader,
    showHeavyHeader: false,
    showSubheading: s.showSubheading,
    showBody: s.showBody,
    showSolutionSet: s.showSolutionSet,
    showGridDetail2: s.showGridDetail2,
    gridDetail1Type: 'data',
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Type: 'data',
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Type: s.gridDetail3Type,
    gridDetail3Text: s.gridDetail3Text,
  }),

  'social-dark-gradient': (s) => ({
    metadata: s.metadata,
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    headingSize: s.headingSize,
    alignment: s.alignment,
    ctaStyle: s.ctaStyle,
    showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showMetadata: s.showMetadata,
    showCta: s.showCta,
  }),

  'social-blue-gradient': (s) => ({
    metadata: s.metadata,
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    headingSize: s.headingSize,
    alignment: s.alignment,
    ctaStyle: s.ctaStyle,
    showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showMetadata: s.showMetadata,
    showCta: s.showCta,
  }),

  'social-image': (s) => ({
    metadata: s.metadata,
    ctaText: s.ctaText,
    imageUrl: s.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
    imagePositionX: s.thumbnailImagePosition.x,
    imagePositionY: s.thumbnailImagePosition.y,
    imageZoom: s.thumbnailImageZoom,
    layout: s.layout,
    showSubhead: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showMetadata: s.showMetadata,
    showCta: s.showCta,
    showSolutionSet: s.showSolutionSet,
    grayscale: s.grayscale,
  }),

  'social-grid-detail': (s) => ({
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showSolutionSet: s.showSolutionSet,
    gridDetail1Text: s.gridDetail1Text,
    gridDetail2Text: s.gridDetail2Text,
    gridDetail3Type: s.gridDetail3Type,
    gridDetail3Text: s.gridDetail3Text,
    gridDetail4Type: s.gridDetail4Type,
    gridDetail4Text: s.gridDetail4Text,
    showRow3: s.showRow3,
    showRow4: s.showRow4,
  }),

  'email-image': (s) => ({
    ctaText: s.ctaText,
    imageUrl: s.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
    imagePositionX: s.thumbnailImagePosition.x,
    imagePositionY: s.thumbnailImagePosition.y,
    imageZoom: s.thumbnailImageZoom,
    layout: s.layout,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
    showSolutionSet: s.showSolutionSet,
    grayscale: s.grayscale,
  }),

  'email-dark-gradient': (s) => ({
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    alignment: s.alignment,
    ctaStyle: s.ctaStyle,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showSubheading: s.showSubhead && !isHtmlEmpty(s.verbatimCopy.subhead),
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
  }),

  'email-speakers': (s) => ({
    ctaText: s.ctaText,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !isHtmlEmpty(s.verbatimCopy.body),
    showCta: s.showCta,
    showSolutionSet: s.showSolutionSet,
    ...buildSpeakerParams(s),
    grayscale: s.grayscale,
  }),

  'email-product-release': (s) => ({
    eyebrow: s.eyebrow || 'Product Release',
    headline: s.verbatimCopy.headline || 'GX2 2026.1',
    imageUrl: s.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png',
    imagePositionX: s.thumbnailImagePosition.x,
    imagePositionY: s.thumbnailImagePosition.y,
    imageZoom: s.thumbnailImageZoom,
    grayscale: s.grayscale,
  }),

  'newsletter-dark-gradient': (s) => ({
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    imageSize: s.newsletterImageSize,
    newsletterImageUrl: s.newsletterImageUrl,
    newsletterImagePositionX: s.newsletterImagePosition.x,
    newsletterImagePositionY: s.newsletterImagePosition.y,
    newsletterImageZoom: s.newsletterImageZoom,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !!s.verbatimCopy.body,
    showCta: s.showCta,
    grayscale: s.grayscale,
  }),

  'newsletter-blue-gradient': (s) => ({
    ctaText: s.ctaText,
    colorStyle: s.colorStyle,
    imageSize: s.newsletterImageSize,
    newsletterImageUrl: s.newsletterImageUrl,
    newsletterImagePositionX: s.newsletterImagePosition.x,
    newsletterImagePositionY: s.newsletterImagePosition.y,
    newsletterImageZoom: s.newsletterImageZoom,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !!s.verbatimCopy.body,
    showCta: s.showCta,
    grayscale: s.grayscale,
  }),

  'newsletter-light': (s) => ({
    ctaText: s.ctaText,
    imageSize: s.newsletterImageSize,
    newsletterImageUrl: s.newsletterImageUrl,
    newsletterImagePositionX: s.newsletterImagePosition.x,
    newsletterImagePositionY: s.newsletterImagePosition.y,
    newsletterImageZoom: s.newsletterImageZoom,
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showBody: s.showBody && !!s.verbatimCopy.body,
    showCta: s.showCta,
    grayscale: s.grayscale,
  }),

  'newsletter-top-banner': (s) => ({
    variant: s.newsletterTopBannerVariant,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
  }),

  'website-report': (s) => ({
    ...buildImageParams(s),
    variant: s.reportVariant,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showCta: s.showCta,
    ctaText: s.ctaText,
  }),

  'website-webinar': (s) => ({
    variant: s.webinarVariant,
    ...buildImageParams(s),
    showEyebrow: s.showEyebrow && !!s.eyebrow,
    showSubhead: s.showSubhead && !!s.verbatimCopy.subhead,
    showBody: s.showBody && !!s.verbatimCopy.body,
    showCta: s.showCta,
    ctaText: s.ctaText,
    ...buildSpeakerParams(s),
    showSpeaker1: s.showSpeaker1,
    showSpeaker2: s.showSpeaker2,
    showSpeaker3: s.showSpeaker3,
  }),

  'website-floating-banner': (s) => ({
    variant: s.floatingBannerVariant,
    cta: s.ctaText,
  }),

  'website-floating-banner-mobile': (s) => ({
    variant: s.floatingBannerMobileVariant,
    arrowType: s.floatingBannerMobileArrowType,
    cta: s.ctaText,
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
  }

  const builder = BUILDERS[template]
  if (builder) {
    const templateParams = builder(state)
    return { ...common, ...templateParams }
  }

  // Fallback: just return common params
  return common
}
