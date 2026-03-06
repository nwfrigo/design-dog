// Copy Types
export type TemplateType = 'website-thumbnail' | 'website-press-release' | 'website-webinar' | 'website-event-listing' | 'website-report' | 'website-floating-banner' | 'website-floating-banner-mobile' | 'email-grid' | 'email-image' | 'email-dark-gradient' | 'email-speakers' | 'email-product-release' | 'social-dark-gradient' | 'social-blue-gradient' | 'social-image' | 'social-grid-detail' | 'social-carousel' | 'newsletter-dark-gradient' | 'newsletter-blue-gradient' | 'newsletter-light' | 'newsletter-top-banner' | 'solution-overview-pdf' | 'faq-pdf' | 'stacker-pdf'

// Shared variant/setting union types (extracted to avoid repeating inline unions)
export type LogoColor = 'black' | 'orange' | 'white'
export type ColorStyle = '1' | '2' | '3' | '4'
export type HeadingSize = 'S' | 'M' | 'L'
export type TextAlignment = 'left' | 'center'
export type CtaStyle = 'link' | 'button'
export type ImageLayout = 'even' | 'more-image' | 'more-text'
export type NewsletterImageSize = 'none' | 'small' | 'large'
export type GridDetailType = 'data' | 'cta'
export type SpeakerCount = 1 | 2 | 3
export type ImageVariant = 'image' | 'none'
export type WebinarVariant = 'none' | 'image' | 'speakers'
export type EventListingVariant = 'orange' | 'light' | 'dark-gradient'
export type FloatingBannerVariant = 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
export type FloatingBannerMobileVariant = 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
export type FloatingBannerMobileArrowType = 'text' | 'arrow'
export type NewsletterTopBannerVariant = 'dark' | 'light'
export type SolutionOverviewCtaOption = 'demo' | 'learn' | 'start' | 'contact'
export type SolutionOverviewPage = 1 | 2 | 3

// Social Carousel Types
export type CarouselSlideType = 'cover-text' | 'cover-image' | 'text' | 'text-image' | 'outro'
export type CarouselBackgroundStyle = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export interface CarouselSlide {
  id: string
  slideType: CarouselSlideType
  backgroundStyle: CarouselBackgroundStyle
  eyebrow: string
  headline: string
  subhead: string
  body: string
  metadata: string
  ctaText: string
  showEyebrow: boolean
  showHeadline: boolean
  showSubhead: boolean
  showBody: boolean
  showMetadata: boolean
  showCta: boolean
  headlineFontSize: number | null
  imageUrl: string | null
  imagePosition: { x: number; y: number }
  imageZoom: number
  grayscale: boolean
}

// Solution Overview PDF Types
// ORDER: environmental, health, safety, quality, sustainability, converged
export type SolutionCategory = 'environmental' | 'health' | 'safety' | 'quality' | 'sustainability' | 'converged'

export interface SolutionOverviewBenefit {
  icon: string  // Lucide icon name (e.g., 'shield', 'clock', 'zap')
  title: string
  description: string
}

export interface SolutionOverviewFeature {
  title: string
  description: string
}

// Stacker PDF Types
export type StackerModuleType =
  | 'logo-chip'
  | 'header'
  | 'paragraph'
  | 'bullet-three'
  | 'image'
  | 'image-16x9'
  | 'divider'
  | 'three-card'
  | 'image-cards'
  | 'quote'
  | 'three-stats'
  | 'one-stat'
  | 'footer'

export interface StackerBaseModule {
  id: string
  type: StackerModuleType
}

export interface StackerLogoChipModule extends StackerBaseModule {
  type: 'logo-chip'
  showChips: boolean
  activeCategories: SolutionCategory[]
}

export interface StackerHeaderModule extends StackerBaseModule {
  type: 'header'
  heading: string
  headingSize: 'h1' | 'h2' | 'h3'
  subheader: string
  showSubheader: boolean
  cta: string
  ctaUrl: string
  showCta: boolean
}

export interface StackerParagraphModule extends StackerBaseModule {
  type: 'paragraph'
  intro: string
  body: string
  showIntro: boolean
  showBody: boolean
}

export interface StackerBulletThreeModule extends StackerBaseModule {
  type: 'bullet-three'
  heading: string
  columns: [
    { label: string; bullets: string[] },
    { label: string; bullets: string[] },
    { label: string; bullets: string[] }
  ]
}

export interface StackerImageModule extends StackerBaseModule {
  type: 'image'
  imagePosition: 'left' | 'right'
  imageSize: 'S' | 'M' | 'L'
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  grayscale: boolean
  eyebrow: string
  showEyebrow: boolean
  heading: string
  showHeading: boolean
  body: string
  showBody: boolean
  cta: string
  ctaUrl: string
  showCta: boolean
}

export interface StackerImage16x9Module extends StackerBaseModule {
  type: 'image-16x9'
  imagePosition: 'left' | 'right'
  imageSize: 'S' | 'M' | 'L'
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  grayscale: boolean
  eyebrow: string
  showEyebrow: boolean
  heading: string
  showHeading: boolean
  body: string
  showBody: boolean
}

export interface StackerDividerModule extends StackerBaseModule {
  type: 'divider'
}

export interface StackerThreeCardModule extends StackerBaseModule {
  type: 'three-card'
  cards: [
    { icon: string; title: string; description: string },
    { icon: string; title: string; description: string },
    { icon: string; title: string; description: string }
  ]
}

export interface StackerImageCardData {
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  eyebrow: string
  showEyebrow: boolean
  title: string
  body: string
}

export interface StackerImageCardsModule extends StackerBaseModule {
  type: 'image-cards'
  heading: string
  showHeading: boolean
  cards: [StackerImageCardData, StackerImageCardData, StackerImageCardData]
  showCard3: boolean
  grayscale: boolean
}

export interface StackerQuoteModule extends StackerBaseModule {
  type: 'quote'
  quote: string
  name: string
  jobTitle: string
  organization: string
}

export interface StackerThreeStatsModule extends StackerBaseModule {
  type: 'three-stats'
  stats: [
    { value: string; label: string },
    { value: string; label: string },
    { value: string; label: string }
  ]
  showStat3: boolean
}

export interface StackerOneStatModule extends StackerBaseModule {
  type: 'one-stat'
  value: string
  label: string
  eyebrow: string
  body: string
}

export interface StackerFooterModule extends StackerBaseModule {
  type: 'footer'
  // Stats are editable, logo and about paragraph are locked
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  stat4Value: string
  stat4Label: string
  stat5Value: string
  stat5Label: string
}

export type StackerModule =
  | StackerLogoChipModule
  | StackerHeaderModule
  | StackerParagraphModule
  | StackerBulletThreeModule
  | StackerImageModule
  | StackerImage16x9Module
  | StackerDividerModule
  | StackerThreeCardModule
  | StackerImageCardsModule
  | StackerQuoteModule
  | StackerThreeStatsModule
  | StackerOneStatModule
  | StackerFooterModule

// FAQ PDF Types
export interface FaqHeadingBlock {
  type: 'heading'
  id: string
  text: string
}

export interface FaqQABlock {
  type: 'qa'
  id: string
  question: string
  answer: string  // HTML string for rich text
}

export interface FaqTableBlock {
  type: 'table'
  id: string
  rows: number
  cols: number
  data: string[][]
}

export interface FaqImageBlock {
  type: 'image'
  id: string
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  grayscale: boolean
  displayWidth: number // Percentage of full width (100 = full, 75, 50, 25)
  nativeAspectRatio: number | null // Width/height ratio (e.g., 1.78 for 16:9, 0.75 for portrait)
}

export type FaqContentBlock = FaqHeadingBlock | FaqQABlock | FaqTableBlock | FaqImageBlock

export interface FaqPage {
  id: string
  blocks: FaqContentBlock[]
}

export interface CopyContent {
  headline: string
  subhead: string
  body: string
  cta: string
}

// Per-asset settings for manual mode (fields that should be independent per asset)
export interface ManualAssetSettings {
  eyebrow: string
  ctaText: string
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  gridDetail4Text: string
  thumbnailImageUrl: string | null
  thumbnailImagePosition: { x: number; y: number }
  thumbnailImageZoom: number
  // Toggle states
  showBody: boolean
  // Social metadata
  metadata: string
  // Speaker details
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
  // Manual text size
  headlineFontSize: number | null
  // Template variant settings (must persist when switching assets)
  ebookVariant: ImageVariant
  reportVariant: ImageVariant
  webinarVariant: WebinarVariant
  eventListingVariant: EventListingVariant
  floatingBannerVariant: FloatingBannerVariant
  floatingBannerMobileVariant: FloatingBannerMobileVariant
  floatingBannerMobileArrowType: FloatingBannerMobileArrowType
  newsletterTopBannerVariant: NewsletterTopBannerVariant
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  grayscale: boolean
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewCurrentPage: SolutionOverviewPage
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: string
  solutionOverviewHeroImageUrl: string | null
  solutionOverviewHeroImagePosition: { x: number; y: number }
  solutionOverviewHeroImageZoom: number
  solutionOverviewHeroImageGrayscale: boolean
  solutionOverviewPage2Header: string
  solutionOverviewSectionHeader: string
  solutionOverviewIntroParagraph: string
  solutionOverviewKeySolutions: string[]
  solutionOverviewQuoteText: string
  solutionOverviewQuoteName: string
  solutionOverviewQuoteTitle: string
  solutionOverviewQuoteCompany: string
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  solutionOverviewFeatures: SolutionOverviewFeature[]
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewScreenshotGrayscale: boolean
  solutionOverviewCtaOption: SolutionOverviewCtaOption
  solutionOverviewCtaUrl: string
  // Solution Overview PDF - Page 2 Stats (editable)
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
  // Social Carousel specific
  carouselSlides: CarouselSlide[]
  carouselCurrentSlideIndex: number
}

// App Flow Types
export type ContentMode = 'verbatim' | 'generate'
export type AppScreen = 'select' | 'editor' | 'queue' | 'auto-create-content' | 'auto-create-assets' | 'auto-create-generating' | 'auto-create-editor' | 'solution-overview-export' | 'solution-overview-setup' | 'faq-setup' | 'faq-editor' | 'faq-export' | 'stacker-setup' | 'stacker-editor' | 'stacker-export' | 'social-carousel-editor'

// Auto-Create Types (formerly Quick Start)
export type WizardStep = 'kit-selection' | 'content-source' | 'asset-selection' | 'generating' | 'complete'

// Extracted content from PDF analysis
export interface ExtractedContent {
  title?: string
  mainMessage?: string
  keyPoints?: string[]
  targetAudience?: string
  callToAction?: string
  dates?: string | null
  speakers?: string[] | null
  rawSummary?: string
}

// User-edited version of extracted content
export interface EditedContent {
  title: string
  mainMessage: string
  keyPoints: string[]
  callToAction: string
}

// Analysis metadata
export interface AnalysisInfo {
  fileSizeBytes: number
  fileSizeMB: string
  fileFormat: string
  extracted?: ExtractedContent
  error?: string
  errorCode?: 'rate_limit' | 'overloaded' | 'invalid_pdf' | 'unknown'
  errorDetails?: string
}

export interface ContentSourceState {
  method: 'upload' | 'manual' | 'unified' | null
  pdfContent: string | null
  manualDescription: string
  manualKeyPoints: string
  additionalContext: string
  uploadedFileName: string | null
  uploadedFileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' | null
  // Persisted analysis state
  analysisInfo: AnalysisInfo | null
  editedContent: EditedContent | null
  editedFields: string[]
}

export interface AutoCreateState {
  isWizardOpen: boolean  // Only for modal (kit selection)
  currentStep: WizardStep
  selectedKit: import('@/config/kit-configs').KitType | null
  contentSource: ContentSourceState
  selectedAssets: TemplateType[]
  generationProgress: {
    total: number
    completed: number
    failed: string[]
  }
}

export interface GeneratedAsset {
  id: string
  templateType: TemplateType
  status: 'pending' | 'generating' | 'complete' | 'error'
  error: string | null
  copy: CopyContent
  variations: { headlines: string[]; ctas: string[] } | null
  // Settings from QueuedAsset
  eyebrow: string
  solution: string
  logoColor: LogoColor
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showHeadline: boolean
  thumbnailImageUrl: string | null
  thumbnailImagePosition: { x: number; y: number }
  thumbnailImageZoom: number
  subheading: string
  showLightHeader: boolean
  showSubheading: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: GridDetailType
  gridDetail3Text: string
  gridDetail4Type: GridDetailType
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  metadata: string
  ctaText: string
  colorStyle: ColorStyle
  headingSize: HeadingSize
  alignment: TextAlignment
  ctaStyle: CtaStyle
  showMetadata: boolean
  showCta: boolean
  layout: ImageLayout
  newsletterImageSize: NewsletterImageSize
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number
  speakerCount: SpeakerCount
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
  // Website Webinar specific
  webinarVariant: WebinarVariant
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: ImageVariant
  // Website Report specific
  reportVariant: ImageVariant
  // Website Event Listing specific
  eventListingVariant: EventListingVariant
  // Website Floating Banner specific
  floatingBannerVariant: FloatingBannerVariant
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: FloatingBannerMobileVariant
  floatingBannerMobileArrowType: FloatingBannerMobileArrowType
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: NewsletterTopBannerVariant
  // Image effects
  grayscale: boolean
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewCurrentPage: SolutionOverviewPage
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: string
  solutionOverviewHeroImageUrl: string | null
  solutionOverviewHeroImagePosition: { x: number; y: number }
  solutionOverviewHeroImageZoom: number
  solutionOverviewHeroImageGrayscale: boolean
  solutionOverviewPage2Header: string
  solutionOverviewSectionHeader: string
  solutionOverviewIntroParagraph: string
  solutionOverviewKeySolutions: string[]
  solutionOverviewQuoteText: string
  solutionOverviewQuoteName: string
  solutionOverviewQuoteTitle: string
  solutionOverviewQuoteCompany: string
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  solutionOverviewFeatures: SolutionOverviewFeature[]
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewScreenshotGrayscale: boolean
  solutionOverviewCtaOption: SolutionOverviewCtaOption
  solutionOverviewCtaUrl: string
  // Solution Overview PDF - Page 2 Stats (editable)
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
  // Manual text size
  headlineFontSize: number | null
  // Social Carousel specific
  carouselSlides: CarouselSlide[]
  carouselCurrentSlideIndex: number
}

// Per-template image settings for decoupled zoom/pan
export interface ImageSettings {
  position: { x: number; y: number }
  zoom: number
}

export type ThumbnailImageSettings = Partial<Record<TemplateType, ImageSettings>>

// Export Queue Types
export interface QueuedAsset {
  id: string
  templateType: TemplateType
  // Content
  headline: string
  subhead: string
  body: string
  eyebrow: string
  // Settings
  solution: string
  logoColor: LogoColor
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showHeadline: boolean
  thumbnailImageUrl: string | null
  thumbnailImagePosition: { x: number; y: number }
  thumbnailImageZoom: number
  // Email Grid specific
  subheading: string
  showLightHeader: boolean
  showSubheading: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: GridDetailType
  gridDetail3Text: string
  // Social Grid Detail specific (4th row)
  gridDetail4Type: GridDetailType
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  // Social Dark Gradient specific
  metadata: string
  ctaText: string
  colorStyle: ColorStyle
  headingSize: HeadingSize
  alignment: TextAlignment
  ctaStyle: CtaStyle
  showMetadata: boolean
  showCta: boolean
  // Social Image specific
  layout: ImageLayout
  // Newsletter Dark Gradient specific
  newsletterImageSize: NewsletterImageSize
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number
  // Email Speakers specific
  speakerCount: SpeakerCount
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
  // Website Webinar specific
  webinarVariant: WebinarVariant
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: ImageVariant
  // Website Report specific
  reportVariant: ImageVariant
  // Website Event Listing specific
  eventListingVariant: EventListingVariant
  // Website Floating Banner specific
  floatingBannerVariant: FloatingBannerVariant
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: FloatingBannerMobileVariant
  floatingBannerMobileArrowType: FloatingBannerMobileArrowType
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: NewsletterTopBannerVariant
  // Image effects
  grayscale: boolean
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: string
  solutionOverviewHeroImageUrl: string | null
  solutionOverviewHeroImagePosition: { x: number; y: number }
  solutionOverviewHeroImageZoom: number
  solutionOverviewHeroImageGrayscale: boolean
  solutionOverviewPage2Header: string
  solutionOverviewSectionHeader: string
  solutionOverviewIntroParagraph: string
  solutionOverviewKeySolutions: string[]
  solutionOverviewQuoteText: string
  solutionOverviewQuoteName: string
  solutionOverviewQuoteTitle: string
  solutionOverviewQuoteCompany: string
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  solutionOverviewFeatures: SolutionOverviewFeature[]
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewScreenshotGrayscale: boolean
  solutionOverviewCtaOption: SolutionOverviewCtaOption
  solutionOverviewCtaUrl: string
  // Solution Overview PDF - Page 2 Stats (editable)
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
  // Manual text size
  headlineFontSize: number | null
  // Social Carousel specific
  carouselSlides: CarouselSlide[]
  carouselCurrentSlideIndex: number
  // For editing - track which asset index this came from
  sourceAssetIndex: number
}

// Store Types
export interface AppState {
  // Current screen
  currentScreen: AppScreen

  // Content mode
  contentMode: ContentMode

  // Verbatim copy (user-entered)
  verbatimCopy: CopyContent

  // Generation context
  generationContext: string
  pdfContent: string | null
  contextFile: File | null

  // Final copy (either verbatim or generated)
  finalCopy: CopyContent | null
  generatedVariations: { headlines: string[]; ctas: string[] } | null
  isGenerating: boolean

  // Multi-asset selection
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  // Per-asset copy for manual mode (keyed by index)
  manualAssetCopies: Record<number, CopyContent>
  // Per-asset settings for manual mode (eyebrow, ctaText, grid details, images)
  manualAssetSettings: Record<number, ManualAssetSettings>

  // Design settings (per-asset, changes when switching assets)
  templateType: TemplateType
  thumbnailImageUrl: string | null
  // Per-template image position/zoom settings (decoupled per template)
  thumbnailImageSettings: ThumbnailImageSettings
  eyebrow: string
  solution: string
  logoColor: LogoColor
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  showHeadline: boolean

  // Email Grid specific settings
  subheading: string
  showLightHeader: boolean
  showSubheading: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: GridDetailType
  gridDetail3Text: string

  // Social Grid Detail specific settings
  gridDetail4Type: GridDetailType
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean

  // Social Dark Gradient specific settings
  metadata: string
  ctaText: string
  colorStyle: ColorStyle
  headingSize: HeadingSize
  alignment: TextAlignment
  ctaStyle: CtaStyle
  showMetadata: boolean
  showCta: boolean

  // Social Image specific settings
  layout: ImageLayout

  // Newsletter Dark Gradient specific settings
  newsletterImageSize: NewsletterImageSize
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number

  // Email Speakers specific settings
  speakerCount: SpeakerCount
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
  // Website Webinar specific
  webinarVariant: WebinarVariant
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: ImageVariant
  // Website Report specific
  reportVariant: ImageVariant
  // Website Event Listing specific
  eventListingVariant: EventListingVariant
  // Website Floating Banner specific
  floatingBannerVariant: FloatingBannerVariant
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: FloatingBannerMobileVariant
  floatingBannerMobileArrowType: FloatingBannerMobileArrowType
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: NewsletterTopBannerVariant
  // Image effects
  grayscale: boolean
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewCurrentPage: SolutionOverviewPage
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: string
  solutionOverviewHeroImageUrl: string | null
  solutionOverviewHeroImagePosition: { x: number; y: number }
  solutionOverviewHeroImageZoom: number
  solutionOverviewHeroImageGrayscale: boolean
  solutionOverviewPage2Header: string
  solutionOverviewSectionHeader: string
  solutionOverviewIntroParagraph: string
  solutionOverviewKeySolutions: string[]
  solutionOverviewQuoteText: string
  solutionOverviewQuoteName: string
  solutionOverviewQuoteTitle: string
  solutionOverviewQuoteCompany: string
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  solutionOverviewFeatures: SolutionOverviewFeature[]
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewScreenshotGrayscale: boolean
  solutionOverviewCtaOption: SolutionOverviewCtaOption
  solutionOverviewCtaUrl: string
  // Solution Overview PDF - Page 2 Stats (editable)
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

  // Manual text size
  headlineFontSize: number | null

  // FAQ PDF state
  faqTitle: string
  faqCoverSubheader: string
  faqPages: FaqPage[]
  faqCoverSolution: SolutionCategory | 'none'
  faqCoverImageUrl: string | null
  faqCoverImagePosition: { x: number; y: number }
  faqCoverImageZoom: number
  faqCoverImageGrayscale: boolean

  // Stacker PDF state
  stackerGeneratedModules: StackerModule[] | null
  stackerDocumentTitle: string | null
  stackerSourceContent: string | null
  // Stacker edited modules (persisted for export screen)
  stackerLogoChipModule: StackerLogoChipModule
  stackerHeaderModule: StackerHeaderModule
  stackerContentModules: StackerModule[]
  stackerFooterModule: StackerFooterModule
  // Per-module vertical spacing (keyed by module ID, missing = 32px default)
  stackerModuleSpacing: Record<string, number>
  // Footer visibility toggle
  stackerFooterHidden: boolean
  // Dark mode toggle
  stackerDarkMode: boolean

  // Social Carousel state
  carouselSlides: CarouselSlide[]
  carouselCurrentSlideIndex: number

  // Actions
  setCurrentScreen: (screen: AppScreen) => void
  setContentMode: (mode: ContentMode) => void
  setVerbatimCopy: (copy: Partial<CopyContent>) => void
  setGenerationContext: (context: string) => void
  setPdfContent: (content: string | null) => void
  setContextFile: (file: File | null) => void
  setFinalCopy: (copy: CopyContent | null) => void
  setGeneratedVariations: (variations: { headlines: string[]; ctas: string[] } | null) => void
  setIsGenerating: (generating: boolean) => void
  setTemplateType: (type: TemplateType) => void
  setThumbnailImageUrl: (url: string | null) => void
  // Per-template image settings (uses current templateType as key)
  setThumbnailImageSettings: (templateType: TemplateType, settings: ImageSettings) => void
  getThumbnailImageSettings: (templateType: TemplateType) => ImageSettings
  setEyebrow: (eyebrow: string) => void
  setSolution: (solution: string) => void
  setLogoColor: (color: LogoColor) => void
  setShowEyebrow: (show: boolean) => void
  setShowHeadline: (show: boolean) => void
  setShowSubhead: (show: boolean) => void
  setShowBody: (show: boolean) => void

  // Email Grid specific actions
  setSubheading: (subheading: string) => void
  setShowLightHeader: (show: boolean) => void
  setShowSubheading: (show: boolean) => void
  setShowSolutionSet: (show: boolean) => void
  setShowGridDetail2: (show: boolean) => void
  setGridDetail1Text: (text: string) => void
  setGridDetail2Text: (text: string) => void
  setGridDetail3Type: (type: GridDetailType) => void
  setGridDetail3Text: (text: string) => void

  // Social Grid Detail specific actions
  setGridDetail4Type: (type: GridDetailType) => void
  setGridDetail4Text: (text: string) => void
  setShowRow3: (show: boolean) => void
  setShowRow4: (show: boolean) => void

  // Social Dark Gradient specific actions
  setMetadata: (metadata: string) => void
  setCtaText: (text: string) => void
  setColorStyle: (style: ColorStyle) => void
  setHeadingSize: (size: HeadingSize) => void
  setAlignment: (alignment: TextAlignment) => void
  setCtaStyle: (style: CtaStyle) => void
  setShowMetadata: (show: boolean) => void
  setShowCta: (show: boolean) => void

  // Social Image specific actions
  setLayout: (layout: ImageLayout) => void

  // Newsletter Dark Gradient specific actions
  setNewsletterImageSize: (size: NewsletterImageSize) => void
  setNewsletterImageUrl: (url: string | null) => void
  setNewsletterImagePosition: (position: { x: number; y: number }) => void
  setNewsletterImageZoom: (zoom: number) => void

  // Email Speakers specific actions
  setSpeakerCount: (count: SpeakerCount) => void
  setSpeaker1Name: (name: string) => void
  setSpeaker1Role: (role: string) => void
  setSpeaker1ImageUrl: (url: string) => void
  setSpeaker1ImagePosition: (position: { x: number; y: number }) => void
  setSpeaker1ImageZoom: (zoom: number) => void
  setSpeaker2Name: (name: string) => void
  setSpeaker2Role: (role: string) => void
  setSpeaker2ImageUrl: (url: string) => void
  setSpeaker2ImagePosition: (position: { x: number; y: number }) => void
  setSpeaker2ImageZoom: (zoom: number) => void
  setSpeaker3Name: (name: string) => void
  setSpeaker3Role: (role: string) => void
  setSpeaker3ImageUrl: (url: string) => void
  setSpeaker3ImagePosition: (position: { x: number; y: number }) => void
  setSpeaker3ImageZoom: (zoom: number) => void
  // Website Webinar specific
  setWebinarVariant: (variant: WebinarVariant) => void
  setShowSpeaker1: (show: boolean) => void
  setShowSpeaker2: (show: boolean) => void
  setShowSpeaker3: (show: boolean) => void
  // Website eBook Listing specific
  setEbookVariant: (variant: ImageVariant) => void
  // Website Report specific
  setReportVariant: (variant: ImageVariant) => void
  // Website Event Listing specific
  setEventListingVariant: (variant: EventListingVariant) => void
  // Website Floating Banner specific
  setFloatingBannerVariant: (variant: FloatingBannerVariant) => void
  // Website Floating Banner Mobile specific
  setFloatingBannerMobileVariant: (variant: FloatingBannerMobileVariant) => void
  setFloatingBannerMobileArrowType: (arrowType: FloatingBannerMobileArrowType) => void
  // Newsletter Top Banner specific
  setNewsletterTopBannerVariant: (variant: NewsletterTopBannerVariant) => void
  // Image effects
  setGrayscale: (grayscale: boolean) => void
  // Manual text size
  setHeadlineFontSize: (size: number | null) => void
  // Solution Overview PDF specific - Page 1
  setSolutionOverviewSolution: (solution: SolutionCategory) => void
  setSolutionOverviewSolutionName: (name: string) => void
  setSolutionOverviewTagline: (tagline: string) => void
  setSolutionOverviewCurrentPage: (page: SolutionOverviewPage) => void
  // Solution Overview PDF specific - Page 2
  setSolutionOverviewHeroImageId: (id: string) => void
  setSolutionOverviewHeroImageUrl: (url: string | null) => void
  setSolutionOverviewHeroImagePosition: (position: { x: number; y: number }) => void
  setSolutionOverviewHeroImageZoom: (zoom: number) => void
  setSolutionOverviewHeroImageGrayscale: (grayscale: boolean) => void
  setSolutionOverviewPage2Header: (header: string) => void
  setSolutionOverviewSectionHeader: (header: string) => void
  setSolutionOverviewIntroParagraph: (paragraph: string) => void
  setSolutionOverviewKeySolutions: (solutions: string[]) => void
  setSolutionOverviewKeySolution: (index: number, value: string) => void
  addSolutionOverviewKeySolution: () => void
  removeSolutionOverviewKeySolution: (index: number) => void
  setSolutionOverviewQuoteText: (text: string) => void
  setSolutionOverviewQuoteName: (name: string) => void
  setSolutionOverviewQuoteTitle: (title: string) => void
  setSolutionOverviewQuoteCompany: (company: string) => void
  // Solution Overview PDF specific - Page 3
  setSolutionOverviewBenefits: (benefits: SolutionOverviewBenefit[]) => void
  setSolutionOverviewBenefit: (index: number, benefit: SolutionOverviewBenefit) => void
  addSolutionOverviewBenefit: () => void
  removeSolutionOverviewBenefit: (index: number) => void
  setSolutionOverviewFeatures: (features: SolutionOverviewFeature[]) => void
  setSolutionOverviewFeature: (index: number, feature: SolutionOverviewFeature) => void
  addSolutionOverviewFeature: () => void
  removeSolutionOverviewFeature: (index: number) => void
  setSolutionOverviewScreenshotUrl: (url: string | null) => void
  setSolutionOverviewScreenshotPosition: (position: { x: number; y: number }) => void
  setSolutionOverviewScreenshotZoom: (zoom: number) => void
  setSolutionOverviewScreenshotGrayscale: (grayscale: boolean) => void
  setSolutionOverviewCtaOption: (option: SolutionOverviewCtaOption) => void
  setSolutionOverviewCtaUrl: (url: string) => void
  // Solution Overview PDF - Page 2 Stats setters
  setSolutionOverviewStat1Value: (value: string) => void
  setSolutionOverviewStat1Label: (label: string) => void
  setSolutionOverviewStat2Value: (value: string) => void
  setSolutionOverviewStat2Label: (label: string) => void
  setSolutionOverviewStat3Value: (value: string) => void
  setSolutionOverviewStat3Label: (label: string) => void
  setSolutionOverviewStat4Value: (value: string) => void
  setSolutionOverviewStat4Label: (label: string) => void
  setSolutionOverviewStat5Value: (value: string) => void
  setSolutionOverviewStat5Label: (label: string) => void

  // FAQ PDF actions
  setFaqTitle: (title: string) => void
  setFaqCoverSubheader: (subheader: string) => void
  setFaqPages: (pages: FaqPage[]) => void
  setFaqCoverSolution: (solution: SolutionCategory | 'none') => void
  setFaqCoverImageUrl: (url: string | null) => void
  setFaqCoverImagePosition: (position: { x: number; y: number }) => void
  setFaqCoverImageZoom: (zoom: number) => void
  setFaqCoverImageGrayscale: (grayscale: boolean) => void
  resetFaqToDefaults: () => void

  // Stacker PDF actions
  setStackerGeneratedModules: (modules: StackerModule[] | null) => void
  setStackerDocumentTitle: (title: string | null) => void
  setStackerSourceContent: (content: string | null) => void
  clearStackerGenerated: () => void
  // Stacker edited module actions
  setStackerLogoChipModule: (module: StackerLogoChipModule) => void
  setStackerHeaderModule: (module: StackerHeaderModule) => void
  setStackerContentModules: (modules: StackerModule[]) => void
  setStackerFooterModule: (module: StackerFooterModule) => void
  setStackerModuleSpacing: (spacing: Record<string, number>) => void
  setStackerFooterHidden: (hidden: boolean) => void
  setStackerDarkMode: (darkMode: boolean) => void

  // Social Carousel actions
  setCarouselSlides: (slides: CarouselSlide[]) => void
  setCarouselCurrentSlideIndex: (index: number) => void

  // Multi-asset actions
  setSelectedAssets: (assets: TemplateType[]) => void
  toggleAssetSelection: (asset: TemplateType) => void
  goToAsset: (index: number) => void

  // Export queue
  exportQueue: QueuedAsset[]
  addToQueue: () => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  editQueuedAsset: (id: string) => void
  editingQueueItemId: string | null
  saveQueuedAssetEdit: () => void
  cancelQueueEdit: () => void

  // Flow actions
  proceedToEditor: () => void
  goToEditorWithTemplate: (templateType: TemplateType) => void
  goToQueue: () => void
  reset: () => void

  // Auto-Create state (formerly Quick Start)
  autoCreate: AutoCreateState
  generatedAssets: Record<string, GeneratedAsset>

  // Auto-Create wizard actions
  openAutoCreateWizard: () => void
  closeAutoCreateWizard: () => void
  setAutoCreateStep: (step: WizardStep) => void
  setSelectedKit: (kit: import('@/config/kit-configs').KitType | null) => void
  setAutoCreateContentSource: (source: Partial<ContentSourceState>) => void
  setAutoCreateAssets: (assets: TemplateType[]) => void
  toggleAutoCreateAsset: (asset: TemplateType) => void
  resetAutoCreate: () => void

  // Auto-Create flow navigation
  startAutoCreateWithKit: (kit: import('@/config/kit-configs').KitType) => void
  goToAutoCreateContent: () => void
  goToAutoCreateAssets: () => void
  skipToAssetEditor: () => void

  // Auto-Create generation actions
  startAutoCreateGeneration: () => Promise<void>
  updateGeneratedAsset: (id: string, updates: Partial<GeneratedAsset>) => void
  retryFailedAsset: (assetId: string) => Promise<void>
  addAndGenerateAssets: (templateTypes: TemplateType[]) => Promise<string[]>

  // Multi-asset editor actions
  loadGeneratedAssetIntoEditor: (assetId: string) => void
  proceedToAutoCreateEditor: () => void
  addAllGeneratedToQueue: () => void

  // Draft persistence
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
}
