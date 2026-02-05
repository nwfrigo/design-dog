// Brand Voice Types
export interface BrandExample {
  type: 'headline' | 'body' | 'cta'
  content: string
  context?: string
}

export interface VoiceProfile {
  summary: string
  toneDescriptors: string[]
  vocabularyPatterns: string[]
  structureNotes: string[]
  doAndDonts: {
    do: string[]
    dont: string[]
  }
}

export interface BrandVoiceConfig {
  companyName: string
  voiceProfile: VoiceProfile
  examples: BrandExample[]
}

// Copy Types
export type TemplateType = 'website-thumbnail' | 'website-press-release' | 'website-webinar' | 'website-event-listing' | 'website-report' | 'website-floating-banner' | 'website-floating-banner-mobile' | 'email-grid' | 'email-image' | 'email-dark-gradient' | 'email-speakers' | 'social-dark-gradient' | 'social-blue-gradient' | 'social-image' | 'social-grid-detail' | 'newsletter-dark-gradient' | 'newsletter-blue-gradient' | 'newsletter-light'

export interface CopyContent {
  headline: string
  subhead: string
  body: string
  cta: string
}

export interface GeneratedCopy extends CopyContent {
  variations?: {
    headlines: string[]
    ctas: string[]
  }
}

// App Flow Types
export type ContentMode = 'verbatim' | 'generate'
export type AppScreen = 'select' | 'editor' | 'queue' | 'auto-create-content' | 'auto-create-assets' | 'auto-create-generating' | 'auto-create-editor'

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
  errorDetails?: string
}

export interface ContentSourceState {
  method: 'upload' | 'manual' | null
  pdfContent: string | null
  manualDescription: string
  manualKeyPoints: string
  additionalContext: string
  uploadedFileName: string | null
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

// Alias for backwards compatibility
export type QuickStartState = AutoCreateState

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
  logoColor: 'black' | 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
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
  gridDetail3Type: 'data' | 'cta'
  gridDetail3Text: string
  gridDetail4Type: 'data' | 'cta'
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  metadata: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  headingSize: 'S' | 'M' | 'L'
  alignment: 'left' | 'center'
  ctaStyle: 'link' | 'button'
  showMetadata: boolean
  showCta: boolean
  layout: 'even' | 'more-image' | 'more-text'
  newsletterImageSize: 'none' | 'small' | 'large'
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number
  speakerCount: 1 | 2 | 3
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
  webinarVariant: 'none' | 'image' | 'speakers'
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: 'image' | 'none'
  // Website Report specific
  reportVariant: 'image' | 'none'
  // Website Event Listing specific
  eventListingVariant: 'orange' | 'light' | 'dark-gradient'
  // Website Floating Banner specific
  floatingBannerVariant: 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  floatingBannerMobileArrowType: 'text' | 'arrow'
  // Image effects
  grayscale: boolean
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
  logoColor: 'black' | 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
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
  gridDetail3Type: 'data' | 'cta'
  gridDetail3Text: string
  // Social Grid Detail specific (4th row)
  gridDetail4Type: 'data' | 'cta'
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  // Social Dark Gradient specific
  metadata: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  headingSize: 'S' | 'M' | 'L'
  alignment: 'left' | 'center'
  ctaStyle: 'link' | 'button'
  showMetadata: boolean
  showCta: boolean
  // Social Image specific
  layout: 'even' | 'more-image' | 'more-text'
  // Newsletter Dark Gradient specific
  newsletterImageSize: 'none' | 'small' | 'large'
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number
  // Email Speakers specific
  speakerCount: 1 | 2 | 3
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
  webinarVariant: 'none' | 'image' | 'speakers'
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: 'image' | 'none'
  // Website Report specific
  reportVariant: 'image' | 'none'
  // Website Event Listing specific
  eventListingVariant: 'orange' | 'light' | 'dark-gradient'
  // Website Floating Banner specific
  floatingBannerVariant: 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  floatingBannerMobileArrowType: 'text' | 'arrow'
  // Image effects
  grayscale: boolean
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

  // Design settings (per-asset, changes when switching assets)
  templateType: TemplateType
  thumbnailImageUrl: string | null
  // Per-template image position/zoom settings (decoupled per template)
  thumbnailImageSettings: ThumbnailImageSettings
  eyebrow: string
  solution: string
  logoColor: 'black' | 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean

  // Email Grid specific settings
  subheading: string
  showLightHeader: boolean
  showSubheading: boolean
  showSolutionSet: boolean
  showGridDetail2: boolean
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Type: 'data' | 'cta'
  gridDetail3Text: string

  // Social Grid Detail specific settings
  gridDetail4Type: 'data' | 'cta'
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean

  // Social Dark Gradient specific settings
  metadata: string
  ctaText: string
  colorStyle: '1' | '2' | '3' | '4'
  headingSize: 'S' | 'M' | 'L'
  alignment: 'left' | 'center'
  ctaStyle: 'link' | 'button'
  showMetadata: boolean
  showCta: boolean

  // Social Image specific settings
  layout: 'even' | 'more-image' | 'more-text'

  // Newsletter Dark Gradient specific settings
  newsletterImageSize: 'none' | 'small' | 'large'
  newsletterImageUrl: string | null
  newsletterImagePosition: { x: number; y: number }
  newsletterImageZoom: number

  // Email Speakers specific settings
  speakerCount: 1 | 2 | 3
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
  webinarVariant: 'none' | 'image' | 'speakers'
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  // Website eBook Listing specific
  ebookVariant: 'image' | 'none'
  // Website Report specific
  reportVariant: 'image' | 'none'
  // Website Event Listing specific
  eventListingVariant: 'orange' | 'light' | 'dark-gradient'
  // Website Floating Banner specific
  floatingBannerVariant: 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2'
  floatingBannerMobileArrowType: 'text' | 'arrow'
  // Image effects
  grayscale: boolean

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
  setLogoColor: (color: 'black' | 'orange' | 'white') => void
  setShowEyebrow: (show: boolean) => void
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
  setGridDetail3Type: (type: 'data' | 'cta') => void
  setGridDetail3Text: (text: string) => void

  // Social Grid Detail specific actions
  setGridDetail4Type: (type: 'data' | 'cta') => void
  setGridDetail4Text: (text: string) => void
  setShowRow3: (show: boolean) => void
  setShowRow4: (show: boolean) => void

  // Social Dark Gradient specific actions
  setMetadata: (metadata: string) => void
  setCtaText: (text: string) => void
  setColorStyle: (style: '1' | '2' | '3' | '4') => void
  setHeadingSize: (size: 'S' | 'M' | 'L') => void
  setAlignment: (alignment: 'left' | 'center') => void
  setCtaStyle: (style: 'link' | 'button') => void
  setShowMetadata: (show: boolean) => void
  setShowCta: (show: boolean) => void

  // Social Image specific actions
  setLayout: (layout: 'even' | 'more-image' | 'more-text') => void

  // Newsletter Dark Gradient specific actions
  setNewsletterImageSize: (size: 'none' | 'small' | 'large') => void
  setNewsletterImageUrl: (url: string | null) => void
  setNewsletterImagePosition: (position: { x: number; y: number }) => void
  setNewsletterImageZoom: (zoom: number) => void

  // Email Speakers specific actions
  setSpeakerCount: (count: 1 | 2 | 3) => void
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
  setWebinarVariant: (variant: 'none' | 'image' | 'speakers') => void
  setShowSpeaker1: (show: boolean) => void
  setShowSpeaker2: (show: boolean) => void
  setShowSpeaker3: (show: boolean) => void
  // Website eBook Listing specific
  setEbookVariant: (variant: 'image' | 'none') => void
  // Website Report specific
  setReportVariant: (variant: 'image' | 'none') => void
  // Website Event Listing specific
  setEventListingVariant: (variant: 'orange' | 'light' | 'dark-gradient') => void
  // Website Floating Banner specific
  setFloatingBannerVariant: (variant: 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2') => void
  // Website Floating Banner Mobile specific
  setFloatingBannerMobileVariant: (variant: 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2') => void
  setFloatingBannerMobileArrowType: (arrowType: 'text' | 'arrow') => void
  // Image effects
  setGrayscale: (grayscale: boolean) => void

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
  saveCurrentAssetState: () => void
  proceedToAutoCreateEditor: () => void
  addAllGeneratedToQueue: () => void

  // Backwards compatibility aliases
  quickStart: AutoCreateState
  openQuickStartWizard: () => void
  closeQuickStartWizard: () => void
  setQuickStartStep: (step: WizardStep) => void
  setQuickStartContentSource: (source: Partial<ContentSourceState>) => void
  setQuickStartAssets: (assets: TemplateType[]) => void
  toggleQuickStartAsset: (asset: TemplateType) => void
  resetQuickStart: () => void
  startQuickStartGeneration: () => Promise<void>
  proceedToQuickStartEditor: () => void

  // Draft persistence
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
}
