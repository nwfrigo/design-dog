import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AppState, CopyContent, AppScreen, ContentMode, TemplateType, QueuedAsset, AutoCreateState, ContentSourceState, WizardStep, GeneratedAsset, ImageSettings, ThumbnailImageSettings } from '@/types'
import type { KitType } from '@/config/kit-configs'
import { KIT_CONFIGS } from '@/config/kit-configs'
import { saveDraftToStorage, loadDraftFromStorage, clearDraft as clearDraftStorage, type DraftState } from '@/lib/draft-storage'

const initialVerbatimCopy: CopyContent = {
  headline: '',
  subhead: '',
  body: '',
  cta: '',
}

const initialContentSource: ContentSourceState = {
  method: null,
  pdfContent: null,
  manualDescription: '',
  manualKeyPoints: '',
  additionalContext: '',
  uploadedFileName: null,
  analysisInfo: null,
  editedContent: null,
  editedFields: [],
}

const initialAutoCreate: AutoCreateState = {
  isWizardOpen: false,
  currentStep: 'kit-selection',
  selectedKit: null,
  contentSource: { ...initialContentSource },
  selectedAssets: [],
  generationProgress: {
    total: 0,
    completed: 0,
    failed: [],
  },
}

const getDefaultAssetSettings = (templateType?: TemplateType) => ({
  eyebrow: templateType === 'website-webinar' ? 'Webinar' : templateType === 'website-press-release' ? 'NEWS' : templateType === 'website-thumbnail' ? 'EBOOK' : templateType === 'website-event-listing' ? 'LIVE EVENT' : templateType === 'website-report' ? 'REPORT' : 'Eyebrow',
  solution: templateType === 'website-webinar' ? 'safety' : templateType === 'website-press-release' ? 'health' : 'environmental',
  logoColor: templateType === 'website-webinar' || templateType === 'website-report' ? 'white' as const : 'black' as const,
  showEyebrow: true,
  showSubhead: templateType === 'website-press-release' ? false : true,
  showBody: true,
  ebookVariant: 'image' as const,
  reportVariant: 'image' as const,
  thumbnailImageUrl: null,
  thumbnailImagePosition: { x: 0, y: 0 },
  thumbnailImageZoom: 1,
  subheading: '',
  showLightHeader: true,
  showSubheading: false,
  showSolutionSet: true,
  showGridDetail2: true,
  gridDetail1Text: templateType === 'website-event-listing' ? '' : 'Date: January 1st, 2026',
  gridDetail2Text: templateType === 'website-event-listing' ? '' : 'Date: January 1st, 2026',
  gridDetail3Type: 'cta' as const,
  gridDetail3Text: templateType === 'website-event-listing' ? '' : 'Responsive',
  gridDetail4Type: 'cta' as const,
  gridDetail4Text: 'Join the event',
  showRow3: true,
  showRow4: true,
  metadata: 'Day / Month | 00:00',
  ctaText: 'Responsive',
  colorStyle: '1' as const,
  headingSize: 'L' as const,
  alignment: 'left' as const,
  ctaStyle: 'link' as const,
  showMetadata: true,
  showCta: true,
  layout: 'even' as const,
  newsletterImageSize: 'none' as const,
  newsletterImageUrl: null,
  newsletterImagePosition: { x: 0, y: 0 },
  newsletterImageZoom: 1,
  speakerCount: 3 as const,
  speaker1Name: 'Firstname Lastname',
  speaker1Role: 'Role, Company',
  speaker1ImageUrl: '',
  speaker1ImagePosition: { x: 0, y: 0 },
  speaker1ImageZoom: 1,
  speaker2Name: 'Firstname Lastname',
  speaker2Role: 'Role, Company',
  speaker2ImageUrl: '',
  speaker2ImagePosition: { x: 0, y: 0 },
  speaker2ImageZoom: 1,
  speaker3Name: 'Firstname Lastname',
  speaker3Role: 'Role, Company',
  speaker3ImageUrl: '',
  speaker3ImagePosition: { x: 0, y: 0 },
  speaker3ImageZoom: 1,
  // Website Webinar specific
  webinarVariant: 'image' as const,
  showSpeaker1: true,
  showSpeaker2: true,
  showSpeaker3: true,
  // Website Event Listing specific
  eventListingVariant: 'orange' as const,
  // Website Floating Banner specific
  floatingBannerVariant: 'dark' as const,
  // Image effects
  grayscale: false,
})

export const useStore = create<AppState>()(subscribeWithSelector((set, get) => ({
  // Current screen
  currentScreen: 'select',

  // Content mode
  contentMode: 'verbatim',

  // Verbatim copy
  verbatimCopy: { ...initialVerbatimCopy },

  // Generation context
  generationContext: '',
  pdfContent: null,
  contextFile: null,

  // Final copy
  finalCopy: null,
  generatedVariations: null,
  isGenerating: false,

  // Multi-asset selection
  selectedAssets: [],
  currentAssetIndex: 0,

  // Design settings (shared across assets)
  templateType: 'website-thumbnail',
  thumbnailImageUrl: null,
  // Per-template image settings (decoupled per template)
  thumbnailImageSettings: {} as ThumbnailImageSettings,
  eyebrow: 'Eyebrow',
  solution: 'environmental',
  logoColor: 'black',
  showEyebrow: true,
  showSubhead: true,
  showBody: true,

  // Email Grid specific settings
  subheading: '',
  showLightHeader: true,
  showSubheading: false,
  showSolutionSet: true,
  showGridDetail2: true,
  gridDetail1Text: 'Date: January 1st, 2026',
  gridDetail2Text: 'Date: January 1st, 2026',
  gridDetail3Type: 'cta',
  gridDetail3Text: 'Responsive',

  // Social Grid Detail specific settings
  gridDetail4Type: 'cta',
  gridDetail4Text: 'Join the event',
  showRow3: true,
  showRow4: true,

  // Social Dark Gradient specific settings
  metadata: 'Day / Month | 00:00',
  ctaText: 'Responsive',
  colorStyle: '1',
  headingSize: 'L',
  alignment: 'left',
  ctaStyle: 'link',
  showMetadata: true,
  showCta: true,

  // Social Image specific settings
  layout: 'even',

  // Newsletter Dark Gradient specific settings
  newsletterImageSize: 'none',
  newsletterImageUrl: null,
  newsletterImagePosition: { x: 0, y: 0 },
  newsletterImageZoom: 1,

  // Email Speakers specific settings
  speakerCount: 3,
  speaker1Name: 'Firstname Lastname',
  speaker1Role: 'Role, Company',
  speaker1ImageUrl: '',
  speaker1ImagePosition: { x: 0, y: 0 },
  speaker1ImageZoom: 1,
  speaker2Name: 'Firstname Lastname',
  speaker2Role: 'Role, Company',
  speaker2ImageUrl: '',
  speaker2ImagePosition: { x: 0, y: 0 },
  speaker2ImageZoom: 1,
  speaker3Name: 'Firstname Lastname',
  speaker3Role: 'Role, Company',
  speaker3ImageUrl: '',
  speaker3ImagePosition: { x: 0, y: 0 },
  speaker3ImageZoom: 1,
  // Website Webinar specific
  webinarVariant: 'image',
  showSpeaker1: true,
  showSpeaker2: true,
  showSpeaker3: true,
  // Website eBook Listing specific
  ebookVariant: 'image',
  // Website Report specific
  reportVariant: 'image',
  // Website Event Listing specific
  eventListingVariant: 'orange',
  // Website Floating Banner specific
  floatingBannerVariant: 'dark',
  // Image effects
  grayscale: false,

  // Export queue
  exportQueue: [],
  editingQueueItemId: null as string | null,

  // Auto-Create state (formerly Quick Start)
  autoCreate: { ...initialAutoCreate },
  generatedAssets: {},

  // Backwards compatibility alias
  get quickStart() { return get().autoCreate },

  // Actions
  setCurrentScreen: (screen: AppScreen) => set({ currentScreen: screen }),
  setContentMode: (mode: ContentMode) => set({ contentMode: mode }),
  setVerbatimCopy: (copy: Partial<CopyContent>) =>
    set((state) => ({ verbatimCopy: { ...state.verbatimCopy, ...copy } })),
  setGenerationContext: (context: string) => set({ generationContext: context }),
  setPdfContent: (content: string | null) => set({ pdfContent: content }),
  setContextFile: (file: File | null) => set({ contextFile: file }),
  setFinalCopy: (copy: CopyContent | null) => set({ finalCopy: copy }),
  setGeneratedVariations: (variations) => set({ generatedVariations: variations }),
  setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),
  setTemplateType: (type: TemplateType) => set({ templateType: type }),
  setThumbnailImageUrl: (url: string | null) => set({ thumbnailImageUrl: url }),
  // Per-template image settings
  setThumbnailImageSettings: (templateType: TemplateType, settings: ImageSettings) => {
    set((state) => ({
      thumbnailImageSettings: {
        ...state.thumbnailImageSettings,
        [templateType]: settings,
      },
    }))
  },
  getThumbnailImageSettings: (templateType: TemplateType): ImageSettings => {
    const state = get()
    return state.thumbnailImageSettings[templateType] ?? { position: { x: 0, y: 0 }, zoom: 1 }
  },
  setEyebrow: (eyebrow: string) => set({ eyebrow }),
  setSolution: (solution: string) => set({ solution }),
  setLogoColor: (color: 'black' | 'orange' | 'white') => set({ logoColor: color }),
  setShowEyebrow: (show: boolean) => set({ showEyebrow: show }),
  setShowSubhead: (show: boolean) => set({ showSubhead: show }),
  setShowBody: (show: boolean) => set({ showBody: show }),

  // Email Grid specific actions
  setSubheading: (subheading: string) => set({ subheading }),
  setShowLightHeader: (show: boolean) => set({ showLightHeader: show }),
  setShowSubheading: (show: boolean) => set({ showSubheading: show }),
  setShowSolutionSet: (show: boolean) => set({ showSolutionSet: show }),
  setShowGridDetail2: (show: boolean) => set({ showGridDetail2: show }),
  setGridDetail1Text: (text: string) => set({ gridDetail1Text: text }),
  setGridDetail2Text: (text: string) => set({ gridDetail2Text: text }),
  setGridDetail3Type: (type: 'data' | 'cta') => set({ gridDetail3Type: type }),
  setGridDetail3Text: (text: string) => set({ gridDetail3Text: text }),

  // Social Grid Detail specific actions
  setGridDetail4Type: (type: 'data' | 'cta') => set({ gridDetail4Type: type }),
  setGridDetail4Text: (text: string) => set({ gridDetail4Text: text }),
  setShowRow3: (show: boolean) => set({ showRow3: show }),
  setShowRow4: (show: boolean) => set({ showRow4: show }),

  // Social Dark Gradient specific actions
  setMetadata: (metadata: string) => set({ metadata }),
  setCtaText: (text: string) => set({ ctaText: text }),
  setColorStyle: (style: '1' | '2' | '3' | '4') => set({ colorStyle: style }),
  setHeadingSize: (size: 'S' | 'M' | 'L') => set({ headingSize: size }),
  setAlignment: (alignment: 'left' | 'center') => set({ alignment }),
  setCtaStyle: (style: 'link' | 'button') => set({ ctaStyle: style }),
  setShowMetadata: (show: boolean) => set({ showMetadata: show }),
  setShowCta: (show: boolean) => set({ showCta: show }),

  // Social Image specific actions
  setLayout: (layout: 'even' | 'more-image' | 'more-text') => set({ layout }),

  // Newsletter Dark Gradient specific actions
  setNewsletterImageSize: (newsletterImageSize: 'none' | 'small' | 'large') => set({ newsletterImageSize }),
  setNewsletterImageUrl: (newsletterImageUrl: string | null) => set({ newsletterImageUrl }),
  setNewsletterImagePosition: (newsletterImagePosition: { x: number; y: number }) => set({ newsletterImagePosition }),
  setNewsletterImageZoom: (newsletterImageZoom: number) => set({ newsletterImageZoom }),

  // Email Speakers specific actions
  setSpeakerCount: (speakerCount: 1 | 2 | 3) => set({ speakerCount }),
  setSpeaker1Name: (speaker1Name: string) => set({ speaker1Name }),
  setSpeaker1Role: (speaker1Role: string) => set({ speaker1Role }),
  setSpeaker1ImageUrl: (speaker1ImageUrl: string) => set({ speaker1ImageUrl }),
  setSpeaker1ImagePosition: (speaker1ImagePosition: { x: number; y: number }) => set({ speaker1ImagePosition }),
  setSpeaker1ImageZoom: (speaker1ImageZoom: number) => set({ speaker1ImageZoom }),
  setSpeaker2Name: (speaker2Name: string) => set({ speaker2Name }),
  setSpeaker2Role: (speaker2Role: string) => set({ speaker2Role }),
  setSpeaker2ImageUrl: (speaker2ImageUrl: string) => set({ speaker2ImageUrl }),
  setSpeaker2ImagePosition: (speaker2ImagePosition: { x: number; y: number }) => set({ speaker2ImagePosition }),
  setSpeaker2ImageZoom: (speaker2ImageZoom: number) => set({ speaker2ImageZoom }),
  setSpeaker3Name: (speaker3Name: string) => set({ speaker3Name }),
  setSpeaker3Role: (speaker3Role: string) => set({ speaker3Role }),
  setSpeaker3ImageUrl: (speaker3ImageUrl: string) => set({ speaker3ImageUrl }),
  setSpeaker3ImagePosition: (speaker3ImagePosition: { x: number; y: number }) => set({ speaker3ImagePosition }),
  setSpeaker3ImageZoom: (speaker3ImageZoom: number) => set({ speaker3ImageZoom }),
  // Website Webinar specific
  setWebinarVariant: (webinarVariant: 'none' | 'image' | 'speakers') => set({ webinarVariant }),
  setShowSpeaker1: (showSpeaker1: boolean) => set({ showSpeaker1 }),
  setShowSpeaker2: (showSpeaker2: boolean) => set({ showSpeaker2 }),
  setShowSpeaker3: (showSpeaker3: boolean) => set({ showSpeaker3 }),
  // Website eBook Listing specific
  setEbookVariant: (ebookVariant: 'image' | 'none') => set({ ebookVariant }),
  // Website Report specific
  setReportVariant: (reportVariant: 'image' | 'none') => set({ reportVariant }),
  // Website Event Listing specific
  setEventListingVariant: (eventListingVariant: 'orange' | 'light' | 'dark-gradient') => set({ eventListingVariant }),
  // Website Floating Banner specific
  setFloatingBannerVariant: (floatingBannerVariant: 'white' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2') => set({ floatingBannerVariant }),
  // Image effects
  setGrayscale: (grayscale: boolean) => set({ grayscale }),

  // Multi-asset actions
  setSelectedAssets: (assets: TemplateType[]) => set({ selectedAssets: assets }),
  toggleAssetSelection: (asset: TemplateType) => {
    const { selectedAssets } = get()
    if (selectedAssets.includes(asset)) {
      set({ selectedAssets: selectedAssets.filter((a) => a !== asset) })
    } else {
      set({ selectedAssets: [...selectedAssets, asset] })
    }
  },
  goToAsset: (index: number) => {
    const { selectedAssets } = get()
    if (index >= 0 && index < selectedAssets.length) {
      set({
        currentAssetIndex: index,
        templateType: selectedAssets[index],
      })
    }
  },

  // Flow actions
  proceedToEditor: () => {
    const { selectedAssets } = get()
    if (selectedAssets.length > 0) {
      set({
        currentScreen: 'editor',
        currentAssetIndex: 0,
        templateType: selectedAssets[0],
      })
    }
  },

  // Navigate directly to editor with a single template (for single-click)
  goToEditorWithTemplate: (templateType: TemplateType) => {
    const defaults = getDefaultAssetSettings(templateType)
    set({
      currentScreen: 'editor',
      selectedAssets: [templateType],
      currentAssetIndex: 0,
      templateType: templateType,
      // Apply template-specific defaults
      eyebrow: defaults.eyebrow,
      gridDetail1Text: defaults.gridDetail1Text,
      gridDetail2Text: defaults.gridDetail2Text,
      gridDetail3Text: defaults.gridDetail3Text,
      gridDetail4Text: defaults.gridDetail4Text,
    })
  },

  // Export queue actions
  addToQueue: () => {
    const state = get()
    // Get per-template image settings
    const imageSettings = state.thumbnailImageSettings[state.templateType] ?? { position: { x: 0, y: 0 }, zoom: 1 }
    const newAsset: QueuedAsset = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateType: state.templateType,
      headline: state.verbatimCopy.headline,
      subhead: state.verbatimCopy.subhead,
      body: state.verbatimCopy.body,
      eyebrow: state.eyebrow,
      solution: state.solution,
      logoColor: state.logoColor,
      showEyebrow: state.showEyebrow,
      showSubhead: state.showSubhead,
      showBody: state.showBody,
      thumbnailImageUrl: state.thumbnailImageUrl,
      thumbnailImagePosition: imageSettings.position,
      thumbnailImageZoom: imageSettings.zoom,
      subheading: state.subheading,
      showLightHeader: state.showLightHeader,
      showSubheading: state.showSubheading,
      showSolutionSet: state.showSolutionSet,
      showGridDetail2: state.showGridDetail2,
      gridDetail1Text: state.gridDetail1Text,
      gridDetail2Text: state.gridDetail2Text,
      gridDetail3Type: state.gridDetail3Type,
      gridDetail3Text: state.gridDetail3Text,
      // Social Grid Detail fields
      gridDetail4Type: state.gridDetail4Type,
      gridDetail4Text: state.gridDetail4Text,
      showRow3: state.showRow3,
      showRow4: state.showRow4,
      // Social Dark Gradient fields
      metadata: state.metadata,
      ctaText: state.ctaText,
      colorStyle: state.colorStyle,
      headingSize: state.headingSize,
      alignment: state.alignment,
      ctaStyle: state.ctaStyle,
      showMetadata: state.showMetadata,
      showCta: state.showCta,
      // Social Image fields
      layout: state.layout,
      // Newsletter Dark Gradient fields
      newsletterImageSize: state.newsletterImageSize,
      newsletterImageUrl: state.newsletterImageUrl,
      newsletterImagePosition: state.newsletterImagePosition,
      newsletterImageZoom: state.newsletterImageZoom,
      // Email Speakers fields
      speakerCount: state.speakerCount,
      speaker1Name: state.speaker1Name,
      speaker1Role: state.speaker1Role,
      speaker1ImageUrl: state.speaker1ImageUrl,
      speaker1ImagePosition: state.speaker1ImagePosition,
      speaker1ImageZoom: state.speaker1ImageZoom,
      speaker2Name: state.speaker2Name,
      speaker2Role: state.speaker2Role,
      speaker2ImageUrl: state.speaker2ImageUrl,
      speaker2ImagePosition: state.speaker2ImagePosition,
      speaker2ImageZoom: state.speaker2ImageZoom,
      speaker3Name: state.speaker3Name,
      speaker3Role: state.speaker3Role,
      speaker3ImageUrl: state.speaker3ImageUrl,
      speaker3ImagePosition: state.speaker3ImagePosition,
      speaker3ImageZoom: state.speaker3ImageZoom,
      webinarVariant: state.webinarVariant,
      showSpeaker1: state.showSpeaker1,
      showSpeaker2: state.showSpeaker2,
      showSpeaker3: state.showSpeaker3,
      ebookVariant: state.ebookVariant,
      reportVariant: state.reportVariant,
      eventListingVariant: state.eventListingVariant,
      floatingBannerVariant: state.floatingBannerVariant,
      grayscale: state.grayscale,
      sourceAssetIndex: state.currentAssetIndex,
    }
    set({ exportQueue: [...state.exportQueue, newAsset] })
  },

  removeFromQueue: (id: string) => {
    const { exportQueue } = get()
    set({ exportQueue: exportQueue.filter((asset) => asset.id !== id) })
  },

  clearQueue: () => {
    set({ exportQueue: [] })
  },

  editQueuedAsset: (id: string) => {
    const state = get()
    const asset = state.exportQueue.find((a) => a.id === id)
    if (!asset) return

    // Load the asset's settings into the editor state, including per-template image settings
    set({
      currentScreen: 'editor',
      templateType: asset.templateType,
      selectedAssets: [asset.templateType],
      currentAssetIndex: 0,
      verbatimCopy: {
        headline: asset.headline,
        subhead: asset.subhead,
        body: asset.body,
        cta: '',
      },
      eyebrow: asset.eyebrow,
      solution: asset.solution,
      logoColor: asset.logoColor,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead,
      showBody: asset.showBody,
      thumbnailImageUrl: asset.thumbnailImageUrl,
      // Store per-template image settings
      thumbnailImageSettings: {
        ...state.thumbnailImageSettings,
        [asset.templateType]: {
          position: asset.thumbnailImagePosition,
          zoom: asset.thumbnailImageZoom,
        },
      },
      subheading: asset.subheading,
      showLightHeader: asset.showLightHeader,
      showSubheading: asset.showSubheading,
      showSolutionSet: asset.showSolutionSet,
      showGridDetail2: asset.showGridDetail2,
      gridDetail1Text: asset.gridDetail1Text,
      gridDetail2Text: asset.gridDetail2Text,
      gridDetail3Type: asset.gridDetail3Type,
      gridDetail3Text: asset.gridDetail3Text,
      // Social Grid Detail fields
      gridDetail4Type: asset.gridDetail4Type,
      gridDetail4Text: asset.gridDetail4Text,
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      // Social Dark Gradient fields
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      // Social Image fields
      layout: asset.layout,
      // Newsletter Dark Gradient fields
      newsletterImageSize: asset.newsletterImageSize,
      newsletterImageUrl: asset.newsletterImageUrl,
      newsletterImagePosition: asset.newsletterImagePosition,
      newsletterImageZoom: asset.newsletterImageZoom,
      // Email Speakers fields
      speakerCount: asset.speakerCount,
      speaker1Name: asset.speaker1Name,
      speaker1Role: asset.speaker1Role,
      speaker1ImageUrl: asset.speaker1ImageUrl,
      speaker1ImagePosition: asset.speaker1ImagePosition,
      speaker1ImageZoom: asset.speaker1ImageZoom,
      speaker2Name: asset.speaker2Name,
      speaker2Role: asset.speaker2Role,
      speaker2ImageUrl: asset.speaker2ImageUrl,
      speaker2ImagePosition: asset.speaker2ImagePosition,
      speaker2ImageZoom: asset.speaker2ImageZoom,
      speaker3Name: asset.speaker3Name,
      speaker3Role: asset.speaker3Role,
      speaker3ImageUrl: asset.speaker3ImageUrl,
      speaker3ImagePosition: asset.speaker3ImagePosition,
      speaker3ImageZoom: asset.speaker3ImageZoom,
      webinarVariant: asset.webinarVariant,
      ebookVariant: asset.ebookVariant,
      reportVariant: asset.reportVariant,
      eventListingVariant: asset.eventListingVariant,
      floatingBannerVariant: asset.floatingBannerVariant,
      grayscale: asset.grayscale,
      // Track that we're editing from queue
      editingQueueItemId: id,
    })
  },

  saveQueuedAssetEdit: () => {
    const state = get()
    const editingId = state.editingQueueItemId
    if (!editingId) return

    // Get the original queue item to preserve its sourceAssetIndex
    const originalItem = state.exportQueue.find(item => item.id === editingId)
    if (!originalItem) return

    // Get current image settings for this template
    const imageSettings = state.thumbnailImageSettings[state.templateType] || { position: { x: 0, y: 0 }, zoom: 1 }

    // Build updated asset from current editor state
    const updatedAsset: QueuedAsset = {
      id: editingId,
      sourceAssetIndex: originalItem.sourceAssetIndex,
      templateType: state.templateType,
      headline: state.verbatimCopy.headline,
      subhead: state.verbatimCopy.subhead,
      body: state.verbatimCopy.body,
      eyebrow: state.eyebrow,
      solution: state.solution,
      logoColor: state.logoColor,
      showEyebrow: state.showEyebrow,
      showSubhead: state.showSubhead,
      showBody: state.showBody,
      thumbnailImageUrl: state.thumbnailImageUrl,
      thumbnailImagePosition: imageSettings.position,
      thumbnailImageZoom: imageSettings.zoom,
      subheading: state.subheading,
      showLightHeader: state.showLightHeader,
      showSubheading: state.showSubheading,
      showSolutionSet: state.showSolutionSet,
      showGridDetail2: state.showGridDetail2,
      gridDetail1Text: state.gridDetail1Text,
      gridDetail2Text: state.gridDetail2Text,
      gridDetail3Type: state.gridDetail3Type,
      gridDetail3Text: state.gridDetail3Text,
      gridDetail4Type: state.gridDetail4Type,
      gridDetail4Text: state.gridDetail4Text,
      showRow3: state.showRow3,
      showRow4: state.showRow4,
      metadata: state.metadata,
      ctaText: state.ctaText,
      colorStyle: state.colorStyle,
      headingSize: state.headingSize,
      alignment: state.alignment,
      ctaStyle: state.ctaStyle,
      showMetadata: state.showMetadata,
      showCta: state.showCta,
      layout: state.layout,
      newsletterImageSize: state.newsletterImageSize,
      newsletterImageUrl: state.newsletterImageUrl,
      newsletterImagePosition: state.newsletterImagePosition,
      newsletterImageZoom: state.newsletterImageZoom,
      speakerCount: state.speakerCount,
      speaker1Name: state.speaker1Name,
      speaker1Role: state.speaker1Role,
      speaker1ImageUrl: state.speaker1ImageUrl,
      speaker1ImagePosition: state.speaker1ImagePosition,
      speaker1ImageZoom: state.speaker1ImageZoom,
      speaker2Name: state.speaker2Name,
      speaker2Role: state.speaker2Role,
      speaker2ImageUrl: state.speaker2ImageUrl,
      speaker2ImagePosition: state.speaker2ImagePosition,
      speaker2ImageZoom: state.speaker2ImageZoom,
      speaker3Name: state.speaker3Name,
      speaker3Role: state.speaker3Role,
      speaker3ImageUrl: state.speaker3ImageUrl,
      speaker3ImagePosition: state.speaker3ImagePosition,
      speaker3ImageZoom: state.speaker3ImageZoom,
      webinarVariant: state.webinarVariant,
      showSpeaker1: state.showSpeaker1,
      showSpeaker2: state.showSpeaker2,
      showSpeaker3: state.showSpeaker3,
      ebookVariant: state.ebookVariant,
      reportVariant: state.reportVariant,
      eventListingVariant: state.eventListingVariant,
      floatingBannerVariant: state.floatingBannerVariant,
      grayscale: state.grayscale,
    }

    // Update the queue item and return to queue
    set({
      exportQueue: state.exportQueue.map(item =>
        item.id === editingId ? updatedAsset : item
      ),
      editingQueueItemId: null,
      currentScreen: 'queue',
    })
  },

  cancelQueueEdit: () => {
    set({
      editingQueueItemId: null,
      currentScreen: 'queue',
    })
  },

  goToQueue: () => {
    set({ currentScreen: 'queue' })
  },

  // Auto-Create wizard actions
  openAutoCreateWizard: () => {
    set({
      autoCreate: {
        ...initialAutoCreate,
        isWizardOpen: true,
      },
    })
  },

  closeAutoCreateWizard: () => {
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        isWizardOpen: false,
      },
    }))
  },

  setAutoCreateStep: (step: WizardStep) => {
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        currentStep: step,
      },
    }))
  },

  setSelectedKit: (kit: KitType | null) => {
    const kitConfig = kit ? KIT_CONFIGS[kit] : null
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        selectedKit: kit,
        selectedAssets: kitConfig?.recommendedAssets || [],
      },
    }))
  },

  setAutoCreateContentSource: (source: Partial<ContentSourceState>) => {
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        contentSource: {
          ...state.autoCreate.contentSource,
          ...source,
        },
      },
    }))
  },

  setAutoCreateAssets: (assets: TemplateType[]) => {
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        selectedAssets: assets,
      },
    }))
  },

  toggleAutoCreateAsset: (asset: TemplateType) => {
    set((state) => {
      const { selectedAssets } = state.autoCreate
      const newAssets = selectedAssets.includes(asset)
        ? selectedAssets.filter((a) => a !== asset)
        : [...selectedAssets, asset]
      return {
        autoCreate: {
          ...state.autoCreate,
          selectedAssets: newAssets,
        },
      }
    })
  },

  resetAutoCreate: () => {
    set({
      autoCreate: { ...initialAutoCreate },
      generatedAssets: {},
    })
  },

  // Auto-Create flow navigation
  startAutoCreateWithKit: (kit: KitType) => {
    const kitConfig = KIT_CONFIGS[kit]
    set({
      currentScreen: 'auto-create-content',
      autoCreate: {
        ...initialAutoCreate,
        selectedKit: kit,
        selectedAssets: kitConfig?.recommendedAssets || [],
        currentStep: 'content-source',
      },
    })
  },

  goToAutoCreateContent: () => {
    set({ currentScreen: 'auto-create-content' })
  },

  goToAutoCreateAssets: () => {
    set({ currentScreen: 'auto-create-assets' })
  },

  skipToAssetEditor: () => {
    // Skip content input and go directly to editor with all kit assets
    const state = get()
    const { selectedAssets } = state.autoCreate
    if (selectedAssets.length > 0) {
      // Create generatedAssets entries so AutoCreateEditor is shown
      const timestamp = Date.now()
      const initialAssets: Record<string, GeneratedAsset> = {}
      selectedAssets.forEach((templateType, i) => {
        const id = `skip-${timestamp}-${i}`
        initialAssets[id] = {
          id,
          templateType,
          status: 'complete', // Mark as complete since user will write copy manually
          error: null,
          copy: { headline: '', subhead: '', body: '', cta: '' },
          variations: null,
          ...getDefaultAssetSettings(templateType),
        }
      })

      set({
        currentScreen: 'editor',
        selectedAssets: selectedAssets,
        currentAssetIndex: 0,
        templateType: selectedAssets[0],
        generatedAssets: initialAssets,
      })

      // Save draft so editor page doesn't redirect
      get().saveDraft()
    }
  },

  // Backwards compatibility aliases
  openQuickStartWizard: () => get().openAutoCreateWizard(),
  closeQuickStartWizard: () => get().closeAutoCreateWizard(),
  setQuickStartStep: (step: WizardStep) => get().setAutoCreateStep(step),
  setQuickStartContentSource: (source: Partial<ContentSourceState>) => get().setAutoCreateContentSource(source),
  setQuickStartAssets: (assets: TemplateType[]) => get().setAutoCreateAssets(assets),
  toggleQuickStartAsset: (asset: TemplateType) => get().toggleAutoCreateAsset(asset),
  resetQuickStart: () => get().resetAutoCreate(),

  // Auto-Create generation actions
  startAutoCreateGeneration: async () => {
    const state = get()
    const { selectedAssets, contentSource } = state.autoCreate

    if (selectedAssets.length === 0) return

    // Build context from content sources
    let context = ''
    if (contentSource.pdfContent) {
      context += `Document:\n${contentSource.pdfContent}\n\n`
    }
    if (contentSource.manualDescription) {
      context += `Description:\n${contentSource.manualDescription}\n\n`
    }
    if (contentSource.manualKeyPoints) {
      context += `Key points:\n${contentSource.manualKeyPoints}\n\n`
    }
    if (contentSource.additionalContext) {
      context += `Notes:\n${contentSource.additionalContext}\n\n`
    }

    // Set initial progress
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        currentStep: 'generating',
        generationProgress: {
          total: selectedAssets.length,
          completed: 0,
          failed: [],
        },
      },
    }))

    // Create initial asset entries
    const timestamp = Date.now()
    const assetIds = selectedAssets.map((templateType, i) => `qs-${timestamp}-${i}`)

    const initialAssets: Record<string, GeneratedAsset> = {}
    selectedAssets.forEach((templateType, i) => {
      initialAssets[assetIds[i]] = {
        id: assetIds[i],
        templateType,
        status: 'pending',
        error: null,
        copy: { headline: '', subhead: '', body: '', cta: '' },
        variations: null,
        ...getDefaultAssetSettings(templateType),
      }
    })
    set({ generatedAssets: initialAssets })

    // Fire parallel API calls
    const results = await Promise.allSettled(
      selectedAssets.map(async (templateType, i) => {
        const id = assetIds[i]

        // Mark as generating
        set((state) => ({
          generatedAssets: {
            ...state.generatedAssets,
            [id]: {
              ...state.generatedAssets[id],
              status: 'generating',
            },
          },
        }))

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context, templateType }),
          })

          if (!response.ok) {
            throw new Error(`Generation failed: ${response.status}`)
          }

          const data = await response.json()

          // Update asset with generated copy
          set((state) => ({
            generatedAssets: {
              ...state.generatedAssets,
              [id]: {
                ...state.generatedAssets[id],
                status: 'complete',
                copy: {
                  headline: data.copy?.headline || '',
                  subhead: data.copy?.subhead || '',
                  body: data.copy?.body || '',
                  cta: data.copy?.cta || '',
                },
                variations: data.variations || null,
              },
            },
            autoCreate: {
              ...state.autoCreate,
              generationProgress: {
                ...state.autoCreate.generationProgress,
                completed: state.autoCreate.generationProgress.completed + 1,
              },
            },
          }))

          return { id, success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          set((state) => ({
            generatedAssets: {
              ...state.generatedAssets,
              [id]: {
                ...state.generatedAssets[id],
                status: 'error',
                error: errorMessage,
              },
            },
            autoCreate: {
              ...state.autoCreate,
              generationProgress: {
                ...state.autoCreate.generationProgress,
                completed: state.autoCreate.generationProgress.completed + 1,
                failed: [...state.autoCreate.generationProgress.failed, id],
              },
            },
          }))

          return { id, success: false, error: errorMessage }
        }
      })
    )

    // Mark as complete
    set((state) => ({
      autoCreate: {
        ...state.autoCreate,
        currentStep: 'complete',
      },
    }))
  },

  updateGeneratedAsset: (id: string, updates: Partial<GeneratedAsset>) => {
    set((state) => ({
      generatedAssets: {
        ...state.generatedAssets,
        [id]: {
          ...state.generatedAssets[id],
          ...updates,
        },
      },
    }))
  },

  // Multi-asset editor actions
  loadGeneratedAssetIntoEditor: (assetId: string) => {
    const state = get()
    const asset = state.generatedAssets[assetId]
    if (!asset) return

    set({
      templateType: asset.templateType,
      verbatimCopy: { ...asset.copy },
      eyebrow: asset.eyebrow,
      solution: asset.solution,
      logoColor: asset.logoColor,
      showEyebrow: asset.showEyebrow,
      showSubhead: asset.showSubhead,
      showBody: asset.showBody,
      thumbnailImageUrl: asset.thumbnailImageUrl,
      // Store per-template image settings
      thumbnailImageSettings: {
        ...state.thumbnailImageSettings,
        [asset.templateType]: {
          position: asset.thumbnailImagePosition,
          zoom: asset.thumbnailImageZoom,
        },
      },
      subheading: asset.subheading,
      showLightHeader: asset.showLightHeader,
      showSubheading: asset.showSubheading,
      showSolutionSet: asset.showSolutionSet,
      showGridDetail2: asset.showGridDetail2,
      gridDetail1Text: asset.gridDetail1Text,
      gridDetail2Text: asset.gridDetail2Text,
      gridDetail3Type: asset.gridDetail3Type,
      gridDetail3Text: asset.gridDetail3Text,
      gridDetail4Type: asset.gridDetail4Type,
      gridDetail4Text: asset.gridDetail4Text,
      showRow3: asset.showRow3,
      showRow4: asset.showRow4,
      metadata: asset.metadata,
      ctaText: asset.ctaText,
      colorStyle: asset.colorStyle,
      headingSize: asset.headingSize,
      alignment: asset.alignment,
      ctaStyle: asset.ctaStyle,
      showMetadata: asset.showMetadata,
      showCta: asset.showCta,
      layout: asset.layout,
      newsletterImageSize: asset.newsletterImageSize,
      newsletterImageUrl: asset.newsletterImageUrl,
      newsletterImagePosition: asset.newsletterImagePosition,
      newsletterImageZoom: asset.newsletterImageZoom,
      speakerCount: asset.speakerCount,
      speaker1Name: asset.speaker1Name,
      speaker1Role: asset.speaker1Role,
      speaker1ImageUrl: asset.speaker1ImageUrl,
      speaker1ImagePosition: asset.speaker1ImagePosition,
      speaker1ImageZoom: asset.speaker1ImageZoom,
      speaker2Name: asset.speaker2Name,
      speaker2Role: asset.speaker2Role,
      speaker2ImageUrl: asset.speaker2ImageUrl,
      speaker2ImagePosition: asset.speaker2ImagePosition,
      speaker2ImageZoom: asset.speaker2ImageZoom,
      speaker3Name: asset.speaker3Name,
      speaker3Role: asset.speaker3Role,
      speaker3ImageUrl: asset.speaker3ImageUrl,
      speaker3ImagePosition: asset.speaker3ImagePosition,
      speaker3ImageZoom: asset.speaker3ImageZoom,
      webinarVariant: asset.webinarVariant,
      ebookVariant: asset.ebookVariant,
      reportVariant: asset.reportVariant,
      eventListingVariant: asset.eventListingVariant,
      floatingBannerVariant: asset.floatingBannerVariant,
      grayscale: asset.grayscale,
      generatedVariations: asset.variations,
    })
  },

  saveCurrentAssetState: () => {
    // This would be called to save edits back to generatedAssets
    // Implementation depends on which asset is currently being edited
  },

  proceedToAutoCreateEditor: () => {
    const state = get()
    const assetIds = Object.keys(state.generatedAssets)

    if (assetIds.length > 0) {
      // Load the first asset into the editor
      const firstAssetId = assetIds[0]
      get().loadGeneratedAssetIntoEditor(firstAssetId)

      set({
        currentScreen: 'auto-create-editor',
        autoCreate: {
          ...state.autoCreate,
          isWizardOpen: false,
        },
      })
    }
  },

  // Backwards compatibility alias
  proceedToQuickStartEditor: () => get().proceedToAutoCreateEditor(),

  // Retry a single failed asset
  retryFailedAsset: async (assetId: string) => {
    const state = get()
    const asset = state.generatedAssets[assetId]
    if (!asset || asset.status !== 'error') return

    const { contentSource } = state.autoCreate

    // Build context
    let context = ''
    if (contentSource.pdfContent) {
      context += `Document:\n${contentSource.pdfContent}\n\n`
    }
    if (contentSource.manualDescription) {
      context += `Description:\n${contentSource.manualDescription}\n\n`
    }
    if (contentSource.manualKeyPoints) {
      context += `Key points:\n${contentSource.manualKeyPoints}\n\n`
    }
    if (contentSource.additionalContext) {
      context += `Notes:\n${contentSource.additionalContext}\n\n`
    }

    // Mark as generating
    set((state) => ({
      generatedAssets: {
        ...state.generatedAssets,
        [assetId]: {
          ...state.generatedAssets[assetId],
          status: 'generating',
          error: null,
        },
      },
    }))

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, templateType: asset.templateType }),
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`)
      }

      const data = await response.json()

      // Update asset with generated copy
      set((state) => ({
        generatedAssets: {
          ...state.generatedAssets,
          [assetId]: {
            ...state.generatedAssets[assetId],
            status: 'complete',
            error: null,
            copy: {
              headline: data.copy?.headline || '',
              subhead: data.copy?.subhead || '',
              body: data.copy?.body || '',
              cta: data.copy?.cta || '',
            },
            variations: data.variations || null,
          },
        },
        autoCreate: {
          ...state.autoCreate,
          generationProgress: {
            ...state.autoCreate.generationProgress,
            failed: state.autoCreate.generationProgress.failed.filter(id => id !== assetId),
          },
        },
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set((state) => ({
        generatedAssets: {
          ...state.generatedAssets,
          [assetId]: {
            ...state.generatedAssets[assetId],
            status: 'error',
            error: errorMessage,
          },
        },
      }))
    }
  },

  // Add new assets and generate copy for them using stored content source
  addAndGenerateAssets: async (templateTypes: TemplateType[]) => {
    if (templateTypes.length === 0) return []

    const state = get()
    const { contentSource } = state.autoCreate

    // Build context from stored content source
    let context = ''
    if (contentSource.pdfContent) {
      context += `Document:\n${contentSource.pdfContent}\n\n`
    }
    if (contentSource.manualDescription) {
      context += `Description:\n${contentSource.manualDescription}\n\n`
    }
    if (contentSource.manualKeyPoints) {
      context += `Key points:\n${contentSource.manualKeyPoints}\n\n`
    }
    if (contentSource.additionalContext) {
      context += `Notes:\n${contentSource.additionalContext}\n\n`
    }

    // Create initial assets with 'generating' status
    const timestamp = Date.now()
    const newAssetIds: string[] = []
    const initialAssets: Record<string, GeneratedAsset> = {}

    templateTypes.forEach((templateType, i) => {
      const id = `new-${timestamp}-${i}`
      newAssetIds.push(id)
      initialAssets[id] = {
        id,
        templateType,
        status: 'generating',
        error: null,
        copy: { headline: '', subhead: '', body: '', cta: '' },
        variations: null,
        ...getDefaultAssetSettings(templateType),
      }
    })

    // Add to existing generated assets
    set((state) => ({
      generatedAssets: { ...state.generatedAssets, ...initialAssets }
    }))

    // Fire parallel API calls to generate copy
    await Promise.allSettled(
      templateTypes.map(async (templateType, i) => {
        const id = newAssetIds[i]

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context, templateType }),
          })

          if (!response.ok) {
            throw new Error(`Generation failed: ${response.status}`)
          }

          const data = await response.json()

          // Update asset with generated copy
          set((state) => ({
            generatedAssets: {
              ...state.generatedAssets,
              [id]: {
                ...state.generatedAssets[id],
                status: 'complete',
                copy: {
                  headline: data.copy?.headline || '',
                  subhead: data.copy?.subhead || '',
                  body: data.copy?.body || '',
                  cta: data.copy?.cta || '',
                },
                variations: data.copy?.variations || null,
              },
            },
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set((state) => ({
            generatedAssets: {
              ...state.generatedAssets,
              [id]: {
                ...state.generatedAssets[id],
                status: 'error',
                error: errorMessage,
              },
            },
          }))
        }
      })
    )

    return newAssetIds
  },

  // Backwards compatibility alias
  startQuickStartGeneration: async () => get().startAutoCreateGeneration(),

  addAllGeneratedToQueue: () => {
    const state = get()
    const newQueueItems: QueuedAsset[] = []

    Object.values(state.generatedAssets).forEach((asset) => {
      if (asset.status === 'complete') {
        newQueueItems.push({
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateType: asset.templateType,
          headline: asset.copy.headline,
          subhead: asset.copy.subhead,
          body: asset.copy.body,
          eyebrow: asset.eyebrow,
          solution: asset.solution,
          logoColor: asset.logoColor,
          showEyebrow: asset.showEyebrow,
          showSubhead: asset.showSubhead,
          showBody: asset.showBody,
          thumbnailImageUrl: asset.thumbnailImageUrl,
          thumbnailImagePosition: asset.thumbnailImagePosition,
          thumbnailImageZoom: asset.thumbnailImageZoom,
          subheading: asset.subheading,
          showLightHeader: asset.showLightHeader,
          showSubheading: asset.showSubheading,
          showSolutionSet: asset.showSolutionSet,
          showGridDetail2: asset.showGridDetail2,
          gridDetail1Text: asset.gridDetail1Text,
          gridDetail2Text: asset.gridDetail2Text,
          gridDetail3Type: asset.gridDetail3Type,
          gridDetail3Text: asset.gridDetail3Text,
          gridDetail4Type: asset.gridDetail4Type,
          gridDetail4Text: asset.gridDetail4Text,
          showRow3: asset.showRow3,
          showRow4: asset.showRow4,
          metadata: asset.metadata,
          ctaText: asset.ctaText,
          colorStyle: asset.colorStyle,
          headingSize: asset.headingSize,
          alignment: asset.alignment,
          ctaStyle: asset.ctaStyle,
          showMetadata: asset.showMetadata,
          showCta: asset.showCta,
          layout: asset.layout,
          newsletterImageSize: asset.newsletterImageSize,
          newsletterImageUrl: asset.newsletterImageUrl,
          newsletterImagePosition: asset.newsletterImagePosition,
          newsletterImageZoom: asset.newsletterImageZoom,
          speakerCount: asset.speakerCount,
          speaker1Name: asset.speaker1Name,
          speaker1Role: asset.speaker1Role,
          speaker1ImageUrl: asset.speaker1ImageUrl,
          speaker1ImagePosition: asset.speaker1ImagePosition,
          speaker1ImageZoom: asset.speaker1ImageZoom,
          speaker2Name: asset.speaker2Name,
          speaker2Role: asset.speaker2Role,
          speaker2ImageUrl: asset.speaker2ImageUrl,
          speaker2ImagePosition: asset.speaker2ImagePosition,
          speaker2ImageZoom: asset.speaker2ImageZoom,
          speaker3Name: asset.speaker3Name,
          speaker3Role: asset.speaker3Role,
          speaker3ImageUrl: asset.speaker3ImageUrl,
          speaker3ImagePosition: asset.speaker3ImagePosition,
          speaker3ImageZoom: asset.speaker3ImageZoom,
          webinarVariant: asset.webinarVariant,
          showSpeaker1: asset.showSpeaker1,
          showSpeaker2: asset.showSpeaker2,
          showSpeaker3: asset.showSpeaker3,
          ebookVariant: asset.ebookVariant,
          eventListingVariant: asset.eventListingVariant,
          reportVariant: asset.reportVariant,
          floatingBannerVariant: asset.floatingBannerVariant,
          grayscale: asset.grayscale,
          sourceAssetIndex: 0,
        })
      }
    })

    set((prevState) => ({
      exportQueue: [...prevState.exportQueue, ...newQueueItems],
    }))
  },

  reset: () =>
    set({
      currentScreen: 'select',
      contentMode: 'verbatim',
      verbatimCopy: { ...initialVerbatimCopy },
      generationContext: '',
      pdfContent: null,
      contextFile: null,
      finalCopy: null,
      generatedVariations: null,
      isGenerating: false,
      selectedAssets: [],
      currentAssetIndex: 0,
      templateType: 'website-thumbnail',
      thumbnailImageUrl: null,
      thumbnailImageSettings: {},
      eyebrow: 'Eyebrow',
      solution: 'environmental',
      logoColor: 'black',
      showEyebrow: true,
      showSubhead: true,
      showBody: true,
      subheading: '',
      showLightHeader: true,
      showSubheading: false,
      showSolutionSet: true,
      showGridDetail2: true,
      gridDetail1Text: 'Date: January 1st, 2026',
      gridDetail2Text: 'Date: January 1st, 2026',
      gridDetail3Type: 'cta',
      gridDetail3Text: 'Responsive',
      // Social Grid Detail defaults
      gridDetail4Type: 'cta',
      gridDetail4Text: 'Join the event',
      showRow3: true,
      showRow4: true,
      // Social Dark Gradient defaults
      metadata: 'Day / Month | 00:00',
      ctaText: 'Responsive',
      colorStyle: '1',
      headingSize: 'L',
      alignment: 'left',
      ctaStyle: 'link',
      showMetadata: true,
      showCta: true,
      // Social Image defaults
      layout: 'even',
      // Newsletter Dark Gradient defaults
      newsletterImageSize: 'none',
      newsletterImageUrl: null,
      newsletterImagePosition: { x: 0, y: 0 },
      newsletterImageZoom: 1,
      // Email Speakers defaults
      speakerCount: 3,
      speaker1Name: 'Firstname Lastname',
      speaker1Role: 'Role, Company',
      speaker1ImageUrl: '',
      speaker1ImagePosition: { x: 0, y: 0 },
      speaker1ImageZoom: 1,
      speaker2Name: 'Firstname Lastname',
      speaker2Role: 'Role, Company',
      speaker2ImageUrl: '',
      speaker2ImagePosition: { x: 0, y: 0 },
      speaker2ImageZoom: 1,
      speaker3Name: 'Firstname Lastname',
      speaker3Role: 'Role, Company',
      speaker3ImageUrl: '',
      speaker3ImagePosition: { x: 0, y: 0 },
      speaker3ImageZoom: 1,
      webinarVariant: 'image',
      showSpeaker1: true,
      showSpeaker2: true,
      showSpeaker3: true,
      ebookVariant: 'image',
      reportVariant: 'image',
      eventListingVariant: 'orange',
      floatingBannerVariant: 'dark',
      grayscale: false,
      exportQueue: [],
      // Auto-Create defaults
      autoCreate: { ...initialAutoCreate },
      generatedAssets: {},
    }),

  // Draft persistence actions
  saveDraft: () => {
    const state = get()
    saveDraftToStorage({
      selectedAssets: state.selectedAssets,
      currentAssetIndex: state.currentAssetIndex,
      templateType: state.templateType,
      verbatimCopy: state.verbatimCopy,
      generatedAssets: state.generatedAssets,
      autoCreate: state.autoCreate,
      exportQueue: state.exportQueue,
      eyebrow: state.eyebrow,
      solution: state.solution,
      logoColor: state.logoColor,
      showEyebrow: state.showEyebrow,
      showSubhead: state.showSubhead,
      showBody: state.showBody,
      thumbnailImageUrl: state.thumbnailImageUrl,
      thumbnailImageSettings: state.thumbnailImageSettings,
      subheading: state.subheading,
      showLightHeader: state.showLightHeader,
      showSubheading: state.showSubheading,
      showSolutionSet: state.showSolutionSet,
      showGridDetail2: state.showGridDetail2,
      gridDetail1Text: state.gridDetail1Text,
      gridDetail2Text: state.gridDetail2Text,
      gridDetail3Type: state.gridDetail3Type,
      gridDetail3Text: state.gridDetail3Text,
      gridDetail4Type: state.gridDetail4Type,
      gridDetail4Text: state.gridDetail4Text,
      showRow3: state.showRow3,
      showRow4: state.showRow4,
      metadata: state.metadata,
      ctaText: state.ctaText,
      colorStyle: state.colorStyle,
      headingSize: state.headingSize,
      alignment: state.alignment,
      ctaStyle: state.ctaStyle,
      showMetadata: state.showMetadata,
      showCta: state.showCta,
      layout: state.layout,
      newsletterImageSize: state.newsletterImageSize,
      newsletterImageUrl: state.newsletterImageUrl,
      newsletterImagePosition: state.newsletterImagePosition,
      newsletterImageZoom: state.newsletterImageZoom,
      speakerCount: state.speakerCount,
      speaker1Name: state.speaker1Name,
      speaker1Role: state.speaker1Role,
      speaker1ImageUrl: state.speaker1ImageUrl,
      speaker1ImagePosition: state.speaker1ImagePosition,
      speaker1ImageZoom: state.speaker1ImageZoom,
      speaker2Name: state.speaker2Name,
      speaker2Role: state.speaker2Role,
      speaker2ImageUrl: state.speaker2ImageUrl,
      speaker2ImagePosition: state.speaker2ImagePosition,
      speaker2ImageZoom: state.speaker2ImageZoom,
      speaker3Name: state.speaker3Name,
      speaker3Role: state.speaker3Role,
      speaker3ImageUrl: state.speaker3ImageUrl,
      speaker3ImagePosition: state.speaker3ImagePosition,
      speaker3ImageZoom: state.speaker3ImageZoom,
      webinarVariant: state.webinarVariant,
      showSpeaker1: state.showSpeaker1,
      showSpeaker2: state.showSpeaker2,
      showSpeaker3: state.showSpeaker3,
      ebookVariant: state.ebookVariant,
      reportVariant: state.reportVariant,
      eventListingVariant: state.eventListingVariant,
      floatingBannerVariant: state.floatingBannerVariant,
      grayscale: state.grayscale,
      generatedVariations: state.generatedVariations,
    })
  },

  loadDraft: () => {
    const draft = loadDraftFromStorage()
    if (!draft) return false

    set({
      selectedAssets: draft.selectedAssets,
      currentAssetIndex: draft.currentAssetIndex,
      templateType: draft.templateType,
      verbatimCopy: draft.verbatimCopy,
      generatedAssets: draft.generatedAssets,
      autoCreate: draft.autoCreate,
      exportQueue: draft.exportQueue,
      eyebrow: draft.eyebrow,
      solution: draft.solution,
      logoColor: draft.logoColor,
      showEyebrow: draft.showEyebrow,
      showSubhead: draft.showSubhead,
      showBody: draft.showBody,
      thumbnailImageUrl: draft.thumbnailImageUrl,
      thumbnailImageSettings: draft.thumbnailImageSettings ?? {},
      subheading: draft.subheading,
      showLightHeader: draft.showLightHeader,
      showSubheading: draft.showSubheading,
      showSolutionSet: draft.showSolutionSet,
      showGridDetail2: draft.showGridDetail2,
      gridDetail1Text: draft.gridDetail1Text,
      gridDetail2Text: draft.gridDetail2Text,
      gridDetail3Type: draft.gridDetail3Type,
      gridDetail3Text: draft.gridDetail3Text,
      gridDetail4Type: draft.gridDetail4Type,
      gridDetail4Text: draft.gridDetail4Text,
      showRow3: draft.showRow3,
      showRow4: draft.showRow4,
      metadata: draft.metadata,
      ctaText: draft.ctaText,
      colorStyle: draft.colorStyle,
      headingSize: draft.headingSize,
      alignment: draft.alignment,
      ctaStyle: draft.ctaStyle,
      showMetadata: draft.showMetadata,
      showCta: draft.showCta,
      layout: draft.layout,
      newsletterImageSize: draft.newsletterImageSize,
      newsletterImageUrl: draft.newsletterImageUrl,
      newsletterImagePosition: draft.newsletterImagePosition,
      newsletterImageZoom: draft.newsletterImageZoom,
      speakerCount: draft.speakerCount,
      speaker1Name: draft.speaker1Name,
      speaker1Role: draft.speaker1Role,
      speaker1ImageUrl: draft.speaker1ImageUrl,
      speaker1ImagePosition: draft.speaker1ImagePosition,
      speaker1ImageZoom: draft.speaker1ImageZoom,
      speaker2Name: draft.speaker2Name,
      speaker2Role: draft.speaker2Role,
      speaker2ImageUrl: draft.speaker2ImageUrl,
      speaker2ImagePosition: draft.speaker2ImagePosition,
      speaker2ImageZoom: draft.speaker2ImageZoom,
      speaker3Name: draft.speaker3Name,
      speaker3Role: draft.speaker3Role,
      speaker3ImageUrl: draft.speaker3ImageUrl,
      speaker3ImagePosition: draft.speaker3ImagePosition,
      speaker3ImageZoom: draft.speaker3ImageZoom,
      webinarVariant: draft.webinarVariant,
      showSpeaker1: draft.showSpeaker1 ?? true,
      showSpeaker2: draft.showSpeaker2 ?? true,
      showSpeaker3: draft.showSpeaker3 ?? true,
      ebookVariant: draft.ebookVariant ?? 'image',
      reportVariant: draft.reportVariant ?? 'image',
      eventListingVariant: draft.eventListingVariant ?? 'orange',
      floatingBannerVariant: draft.floatingBannerVariant ?? 'dark',
      grayscale: draft.grayscale ?? false,
      generatedVariations: draft.generatedVariations,
    })
    return true
  },

  clearDraft: () => {
    clearDraftStorage()
  },
})))
