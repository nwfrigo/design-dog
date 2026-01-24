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
export type TemplateType = 'website-thumbnail' | 'email-grid' | 'social-dark-gradient' | 'social-image' | 'social-grid-detail'

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
export type AppScreen = 'select' | 'editor' | 'queue'

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

  // Design settings (per-asset, changes when switching assets)
  templateType: TemplateType
  thumbnailImageUrl: string | null
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

  // Flow actions
  proceedToEditor: () => void
  goToQueue: () => void
  reset: () => void
}
