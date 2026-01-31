import { create } from 'zustand'
import type { AppState, CopyContent, AppScreen, ContentMode, TemplateType, QueuedAsset } from '@/types'

const initialVerbatimCopy: CopyContent = {
  headline: '',
  subhead: '',
  body: '',
  cta: '',
}

export const useStore = create<AppState>((set, get) => ({
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

  // Export queue
  exportQueue: [],

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

  // Export queue actions
  addToQueue: () => {
    const state = get()
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
    const { exportQueue } = get()
    const asset = exportQueue.find((a) => a.id === id)
    if (!asset) return

    // Load the asset's settings into the editor state
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
    })

    // Remove the asset from queue since it's being edited
    set({ exportQueue: exportQueue.filter((a) => a.id !== id) })
  },

  goToQueue: () => {
    set({ currentScreen: 'queue' })
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
      exportQueue: [],
    }),
}))
