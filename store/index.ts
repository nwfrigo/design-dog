import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AppState, CopyContent, ManualAssetSettings, AppScreen, ContentMode, TemplateType, QueuedAsset, AutoCreateState, ContentSourceState, WizardStep, GeneratedAsset, ImageSettings, ThumbnailImageSettings, SolutionOverviewBenefit, SolutionOverviewFeature, SolutionCategory, FaqPage, FaqContentBlock } from '@/types'
import type { KitType } from '@/config/kit-configs'
import { KIT_CONFIGS } from '@/config/kit-configs'
import { saveDraftToStorage, loadDraftFromStorage, clearDraft as clearDraftStorage, type DraftState } from '@/lib/draft-storage'

const initialVerbatimCopy: CopyContent = {
  headline: '',
  subhead: '',
  body: '',
  cta: '',
}

// Generate unique IDs for FAQ blocks
const generateFaqId = () => Math.random().toString(36).substring(2, 9)

// Default FAQ content
const createDefaultFaqPages = (): FaqPage[] => [{
  id: generateFaqId(),
  blocks: [
    {
      type: 'heading',
      id: generateFaqId(),
      text: 'Page headings look like this',
    },
    {
      type: 'qa',
      id: generateFaqId(),
      question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed mi sit amet?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed mi sit amet odio viverra eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
    },
    {
      type: 'qa',
      id: generateFaqId(),
      question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      answer: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<ul>
<li>ipsum primis in faucibus. Morbi sed</li>
<li>ipsum primis in faucibus. Morbi sed</li>
<li>ipsum primis in faucibus. Morbi sed</li>
</ul>
<p>Amet, consectetur adipiscing elit. Ut sed mi sit <a href="#">hyperlink</a> viverra eleifend.</p>`,
    },
  ] as FaqContentBlock[],
}]

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
  eyebrow: templateType === 'website-webinar' ? 'Webinar' : templateType === 'website-press-release' ? 'NEWS' : templateType === 'website-thumbnail' ? 'EBOOK' : templateType === 'website-event-listing' ? 'LIVE EVENT' : templateType === 'website-report' ? 'REPORT' : templateType === 'email-product-release' ? 'Product Release' : 'Eyebrow',
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
  newsletterImageSize: 'small' as const,
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
  webinarVariant: 'speakers' as const,
  showSpeaker1: true,
  showSpeaker2: true,
  showSpeaker3: true,
  // Website Event Listing specific
  eventListingVariant: 'orange' as const,
  // Website Floating Banner specific
  floatingBannerVariant: 'dark' as const,
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: 'light' as const,
  floatingBannerMobileArrowType: 'text' as const,
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: 'dark' as const,
  // Image effects
  grayscale: false,
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: 'health' as const,
  solutionOverviewSolutionName: 'Solution Name Goes Here',
  solutionOverviewTagline: 'Subheader Goes Here',
  solutionOverviewCurrentPage: 1 as const,
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: 'placeholder',
  solutionOverviewHeroImageUrl: null,
  solutionOverviewHeroImagePosition: { x: 0, y: 0 },
  solutionOverviewHeroImageZoom: 1,
  solutionOverviewHeroImageGrayscale: false,
  solutionOverviewPage2Header: 'Heading 1',
  solutionOverviewSectionHeader: 'Heading 2',
  solutionOverviewIntroParagraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt diam pretium aliquet. Fusce sit amet orci iaculis justo dictum bibendum at venenatis justo. Aenean ac sodales tellus.\n\nAenean nulla augue, posuere in libero in, accumsan tempor erat. Phasellus aliquet diam dui, ac fermentum',
  solutionOverviewKeySolutions: ['Solution Name', 'Solution Name', 'Solution Name', 'Solution Name'],
  solutionOverviewQuoteText: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt, Phasellus aliquet diam dui, ac fermentum"',
  solutionOverviewQuoteName: 'Firstname Lastname',
  solutionOverviewQuoteTitle: 'Job title',
  solutionOverviewQuoteCompany: 'Organization',
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: [
    { icon: 'streamline', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'compliance', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'visibility', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'security', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'time', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
  ],
  solutionOverviewFeatures: [
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
  ],
  solutionOverviewScreenshotUrl: null,
  solutionOverviewScreenshotPosition: { x: 0, y: 0 },
  solutionOverviewScreenshotZoom: 1,
  solutionOverviewScreenshotGrayscale: false,
  solutionOverviewCtaOption: 'demo' as const,
  solutionOverviewCtaUrl: '',
  // Solution Overview PDF - Page 2 Stats
  solutionOverviewStat1Value: '20+',
  solutionOverviewStat1Label: 'Awards',
  solutionOverviewStat2Value: '350+',
  solutionOverviewStat2Label: 'Experts',
  solutionOverviewStat3Value: '100%',
  solutionOverviewStat3Label: 'Deployment',
  solutionOverviewStat4Value: '2M+',
  solutionOverviewStat4Label: 'End Users',
  solutionOverviewStat5Value: '1.2K',
  solutionOverviewStat5Label: 'Clients',
  // FAQ PDF specific
  faqTitle: 'Title Goes Here',
  faqCoverSubheader: 'Frequently Asked Questions',
  faqPages: createDefaultFaqPages(),
  faqCoverSolution: 'safety' as SolutionCategory | 'none',
  faqCoverImageUrl: null as string | null,
  faqCoverImagePosition: { x: 0, y: 0 },
  faqCoverImageZoom: 1,
  faqCoverImageGrayscale: false,
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
  // Per-asset copy for manual mode (keyed by index)
  manualAssetCopies: {} as Record<number, CopyContent>,
  // Per-asset settings for manual mode (eyebrow, ctaText, grid details, images)
  manualAssetSettings: {} as Record<number, ManualAssetSettings>,

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
  newsletterImageSize: 'small',
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
  webinarVariant: 'speakers',
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
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: 'light',
  floatingBannerMobileArrowType: 'text',
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: 'dark',
  // Image effects
  grayscale: false,
  // Solution Overview PDF specific - Page 1
  solutionOverviewSolution: 'health' as const,
  solutionOverviewSolutionName: 'Solution Name Goes Here',
  solutionOverviewTagline: 'Subheader Goes Here',
  solutionOverviewCurrentPage: 1 as const,
  // Solution Overview PDF specific - Page 2
  solutionOverviewHeroImageId: 'placeholder',
  solutionOverviewHeroImageUrl: null,
  solutionOverviewHeroImagePosition: { x: 0, y: 0 },
  solutionOverviewHeroImageZoom: 1,
  solutionOverviewHeroImageGrayscale: false,
  solutionOverviewPage2Header: 'Heading 1',
  solutionOverviewSectionHeader: 'Heading 2',
  solutionOverviewIntroParagraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt diam pretium aliquet. Fusce sit amet orci iaculis justo dictum bibendum at venenatis justo. Aenean ac sodales tellus.\n\nAenean nulla augue, posuere in libero in, accumsan tempor erat. Phasellus aliquet diam dui, ac fermentum',
  solutionOverviewKeySolutions: ['Solution Name', 'Solution Name', 'Solution Name', 'Solution Name'],
  solutionOverviewQuoteText: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt, Phasellus aliquet diam dui, ac fermentum"',
  solutionOverviewQuoteName: 'Firstname Lastname',
  solutionOverviewQuoteTitle: 'Job title',
  solutionOverviewQuoteCompany: 'Organization',
  // Solution Overview PDF specific - Page 3
  solutionOverviewBenefits: [
    { icon: 'streamline', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'compliance', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'visibility', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'security', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
    { icon: 'time', title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.' },
  ],
  solutionOverviewFeatures: [
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
    { title: 'Item Header Goes Here', description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.' },
  ],
  solutionOverviewScreenshotUrl: null as string | null,
  solutionOverviewScreenshotPosition: { x: 0, y: 0 },
  solutionOverviewScreenshotZoom: 1,
  solutionOverviewScreenshotGrayscale: false,
  solutionOverviewCtaOption: 'demo' as 'demo' | 'learn' | 'start' | 'contact',
  solutionOverviewCtaUrl: '',
  // Solution Overview PDF - Page 2 Stats
  solutionOverviewStat1Value: '20+',
  solutionOverviewStat1Label: 'Awards',
  solutionOverviewStat2Value: '350+',
  solutionOverviewStat2Label: 'Experts',
  solutionOverviewStat3Value: '100%',
  solutionOverviewStat3Label: 'Deployment',
  solutionOverviewStat4Value: '2M+',
  solutionOverviewStat4Label: 'End Users',
  solutionOverviewStat5Value: '1.2K',
  solutionOverviewStat5Label: 'Clients',

  // FAQ PDF specific
  faqTitle: 'Title Goes Here',
  faqCoverSubheader: 'Frequently Asked Questions',
  faqPages: createDefaultFaqPages(),
  faqCoverSolution: 'safety' as SolutionCategory | 'none',
  faqCoverImageUrl: null as string | null,
  faqCoverImagePosition: { x: 0, y: 0 },
  faqCoverImageZoom: 1,
  faqCoverImageGrayscale: false,

  // Stacker PDF state
  stackerGeneratedModules: null,
  stackerDocumentTitle: null,

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
  // Website Floating Banner Mobile specific
  setFloatingBannerMobileVariant: (floatingBannerMobileVariant: 'light' | 'orange' | 'dark' | 'blue-gradient-1' | 'blue-gradient-2' | 'dark-gradient-1' | 'dark-gradient-2') => set({ floatingBannerMobileVariant }),
  setFloatingBannerMobileArrowType: (floatingBannerMobileArrowType: 'text' | 'arrow') => set({ floatingBannerMobileArrowType }),
  // Newsletter Top Banner specific
  setNewsletterTopBannerVariant: (newsletterTopBannerVariant: 'dark' | 'light') => set({ newsletterTopBannerVariant }),
  // Image effects
  setGrayscale: (grayscale: boolean) => set({ grayscale }),

  // Solution Overview PDF specific - Page 1
  setSolutionOverviewSolution: (solutionOverviewSolution: SolutionCategory) => set({ solutionOverviewSolution }),
  setSolutionOverviewSolutionName: (solutionOverviewSolutionName: string) => set({ solutionOverviewSolutionName }),
  setSolutionOverviewTagline: (solutionOverviewTagline: string) => set({ solutionOverviewTagline }),
  setSolutionOverviewCurrentPage: (solutionOverviewCurrentPage: 1 | 2 | 3) => set({ solutionOverviewCurrentPage }),
  // Solution Overview PDF specific - Page 2
  setSolutionOverviewHeroImageId: (solutionOverviewHeroImageId: string) => set({ solutionOverviewHeroImageId }),
  setSolutionOverviewHeroImageUrl: (solutionOverviewHeroImageUrl: string | null) => set({ solutionOverviewHeroImageUrl }),
  setSolutionOverviewHeroImagePosition: (solutionOverviewHeroImagePosition: { x: number; y: number }) => set({ solutionOverviewHeroImagePosition }),
  setSolutionOverviewHeroImageZoom: (solutionOverviewHeroImageZoom: number) => set({ solutionOverviewHeroImageZoom }),
  setSolutionOverviewHeroImageGrayscale: (solutionOverviewHeroImageGrayscale: boolean) => set({ solutionOverviewHeroImageGrayscale }),
  setSolutionOverviewPage2Header: (solutionOverviewPage2Header: string) => set({ solutionOverviewPage2Header }),
  setSolutionOverviewSectionHeader: (solutionOverviewSectionHeader: string) => set({ solutionOverviewSectionHeader }),
  setSolutionOverviewIntroParagraph: (solutionOverviewIntroParagraph: string) => set({ solutionOverviewIntroParagraph }),
  setSolutionOverviewKeySolutions: (solutionOverviewKeySolutions: string[]) => set({ solutionOverviewKeySolutions }),
  setSolutionOverviewKeySolution: (index: number, value: string) => {
    const { solutionOverviewKeySolutions } = get()
    const newSolutions = [...solutionOverviewKeySolutions]
    newSolutions[index] = value
    set({ solutionOverviewKeySolutions: newSolutions })
  },
  addSolutionOverviewKeySolution: () => {
    const { solutionOverviewKeySolutions } = get()
    set({ solutionOverviewKeySolutions: [...solutionOverviewKeySolutions, 'Solution Name'] })
  },
  removeSolutionOverviewKeySolution: (index: number) => {
    const { solutionOverviewKeySolutions } = get()
    const newSolutions = solutionOverviewKeySolutions.filter((_, i) => i !== index)
    set({ solutionOverviewKeySolutions: newSolutions })
  },
  setSolutionOverviewQuoteText: (solutionOverviewQuoteText: string) => set({ solutionOverviewQuoteText }),
  setSolutionOverviewQuoteName: (solutionOverviewQuoteName: string) => set({ solutionOverviewQuoteName }),
  setSolutionOverviewQuoteTitle: (solutionOverviewQuoteTitle: string) => set({ solutionOverviewQuoteTitle }),
  setSolutionOverviewQuoteCompany: (solutionOverviewQuoteCompany: string) => set({ solutionOverviewQuoteCompany }),
  // Solution Overview PDF specific - Page 3
  setSolutionOverviewBenefits: (solutionOverviewBenefits) => set({ solutionOverviewBenefits }),
  setSolutionOverviewBenefit: (index: number, benefit) => {
    const { solutionOverviewBenefits } = get()
    const newBenefits = [...solutionOverviewBenefits]
    newBenefits[index] = benefit
    set({ solutionOverviewBenefits: newBenefits })
  },
  addSolutionOverviewBenefit: () => {
    const { solutionOverviewBenefits } = get()
    if (solutionOverviewBenefits.length < 7) {
      set({
        solutionOverviewBenefits: [
          ...solutionOverviewBenefits,
          { icon: 'new', title: 'New Benefit', description: 'Description of the benefit.' }
        ]
      })
    }
  },
  removeSolutionOverviewBenefit: (index: number) => {
    const { solutionOverviewBenefits } = get()
    if (solutionOverviewBenefits.length > 3) {
      set({
        solutionOverviewBenefits: solutionOverviewBenefits.filter((_, i) => i !== index)
      })
    }
  },
  setSolutionOverviewFeatures: (solutionOverviewFeatures) => set({ solutionOverviewFeatures }),
  setSolutionOverviewFeature: (index: number, feature) => {
    const { solutionOverviewFeatures } = get()
    const newFeatures = [...solutionOverviewFeatures]
    newFeatures[index] = feature
    set({ solutionOverviewFeatures: newFeatures })
  },
  addSolutionOverviewFeature: () => {
    const { solutionOverviewFeatures } = get()
    set({
      solutionOverviewFeatures: [
        ...solutionOverviewFeatures,
        { title: 'New Feature', description: 'Description of the feature.' }
      ]
    })
  },
  removeSolutionOverviewFeature: (index: number) => {
    const { solutionOverviewFeatures } = get()
    if (solutionOverviewFeatures.length > 1) {
      set({
        solutionOverviewFeatures: solutionOverviewFeatures.filter((_, i) => i !== index)
      })
    }
  },
  setSolutionOverviewScreenshotUrl: (solutionOverviewScreenshotUrl: string | null) => set({ solutionOverviewScreenshotUrl }),
  setSolutionOverviewScreenshotPosition: (solutionOverviewScreenshotPosition: { x: number; y: number }) => set({ solutionOverviewScreenshotPosition }),
  setSolutionOverviewScreenshotZoom: (solutionOverviewScreenshotZoom: number) => set({ solutionOverviewScreenshotZoom }),
  setSolutionOverviewScreenshotGrayscale: (solutionOverviewScreenshotGrayscale: boolean) => set({ solutionOverviewScreenshotGrayscale }),
  setSolutionOverviewCtaOption: (solutionOverviewCtaOption: 'demo' | 'learn' | 'start' | 'contact') => set({ solutionOverviewCtaOption }),
  setSolutionOverviewCtaUrl: (solutionOverviewCtaUrl: string) => set({ solutionOverviewCtaUrl }),
  // Solution Overview PDF - Page 2 Stats setters
  setSolutionOverviewStat1Value: (solutionOverviewStat1Value: string) => set({ solutionOverviewStat1Value }),
  setSolutionOverviewStat1Label: (solutionOverviewStat1Label: string) => set({ solutionOverviewStat1Label }),
  setSolutionOverviewStat2Value: (solutionOverviewStat2Value: string) => set({ solutionOverviewStat2Value }),
  setSolutionOverviewStat2Label: (solutionOverviewStat2Label: string) => set({ solutionOverviewStat2Label }),
  setSolutionOverviewStat3Value: (solutionOverviewStat3Value: string) => set({ solutionOverviewStat3Value }),
  setSolutionOverviewStat3Label: (solutionOverviewStat3Label: string) => set({ solutionOverviewStat3Label }),
  setSolutionOverviewStat4Value: (solutionOverviewStat4Value: string) => set({ solutionOverviewStat4Value }),
  setSolutionOverviewStat4Label: (solutionOverviewStat4Label: string) => set({ solutionOverviewStat4Label }),
  setSolutionOverviewStat5Value: (solutionOverviewStat5Value: string) => set({ solutionOverviewStat5Value }),
  setSolutionOverviewStat5Label: (solutionOverviewStat5Label: string) => set({ solutionOverviewStat5Label }),

  // FAQ PDF setters
  setFaqTitle: (faqTitle: string) => set({ faqTitle }),
  setFaqCoverSubheader: (faqCoverSubheader: string) => set({ faqCoverSubheader }),
  setFaqPages: (faqPages: FaqPage[]) => set({ faqPages }),
  setFaqCoverSolution: (faqCoverSolution: SolutionCategory | 'none') => set({ faqCoverSolution }),
  setFaqCoverImageUrl: (faqCoverImageUrl: string | null) => set({ faqCoverImageUrl }),
  setFaqCoverImagePosition: (faqCoverImagePosition: { x: number; y: number }) => set({ faqCoverImagePosition }),
  setFaqCoverImageZoom: (faqCoverImageZoom: number) => set({ faqCoverImageZoom }),
  setFaqCoverImageGrayscale: (faqCoverImageGrayscale: boolean) => set({ faqCoverImageGrayscale }),
  resetFaqToDefaults: () => set({
    faqTitle: 'Title Goes Here',
    faqCoverSubheader: 'Frequently Asked Questions',
    faqPages: createDefaultFaqPages(),
    faqCoverSolution: 'safety',
    faqCoverImageUrl: null,
    faqCoverImagePosition: { x: 0, y: 0 },
    faqCoverImageZoom: 1,
    faqCoverImageGrayscale: false,
  }),

  // Stacker PDF actions
  setStackerGeneratedModules: (modules) => set({ stackerGeneratedModules: modules }),
  setStackerDocumentTitle: (title) => set({ stackerDocumentTitle: title }),
  clearStackerGenerated: () => set({ stackerGeneratedModules: null, stackerDocumentTitle: null }),

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
    const state = get()
    const { selectedAssets, currentAssetIndex, verbatimCopy, manualAssetCopies, manualAssetSettings, eyebrow, ctaText, gridDetail1Text, gridDetail2Text, gridDetail3Text, gridDetail4Text, thumbnailImageUrl, thumbnailImageSettings, templateType, showBody, metadata, speaker1Name, speaker1Role, speaker1ImageUrl, speaker1ImagePosition, speaker1ImageZoom, speaker2Name, speaker2Role, speaker2ImageUrl, speaker2ImagePosition, speaker2ImageZoom, speaker3Name, speaker3Role, speaker3ImageUrl, speaker3ImagePosition, speaker3ImageZoom, ebookVariant, reportVariant, webinarVariant, eventListingVariant, floatingBannerVariant, floatingBannerMobileVariant, floatingBannerMobileArrowType, newsletterTopBannerVariant, showSpeaker1, showSpeaker2, showSpeaker3, grayscale, solutionOverviewSolution, solutionOverviewSolutionName, solutionOverviewTagline, solutionOverviewCurrentPage, solutionOverviewHeroImageId, solutionOverviewHeroImageUrl, solutionOverviewHeroImagePosition, solutionOverviewHeroImageZoom, solutionOverviewHeroImageGrayscale, solutionOverviewPage2Header, solutionOverviewSectionHeader, solutionOverviewIntroParagraph, solutionOverviewKeySolutions, solutionOverviewQuoteText, solutionOverviewQuoteName, solutionOverviewQuoteTitle, solutionOverviewQuoteCompany, solutionOverviewBenefits, solutionOverviewFeatures, solutionOverviewScreenshotUrl, solutionOverviewScreenshotPosition, solutionOverviewScreenshotZoom, solutionOverviewScreenshotGrayscale, solutionOverviewCtaOption, solutionOverviewCtaUrl, solutionOverviewStat1Value, solutionOverviewStat1Label, solutionOverviewStat2Value, solutionOverviewStat2Label, solutionOverviewStat3Value, solutionOverviewStat3Label, solutionOverviewStat4Value, solutionOverviewStat4Label, solutionOverviewStat5Value, solutionOverviewStat5Label } = state
    if (index >= 0 && index < selectedAssets.length) {
      // Get current image position/zoom from per-template settings
      // IMPORTANT: Use selectedAssets[currentAssetIndex] (the actual current template), NOT templateType
      const currentTemplateType = selectedAssets[currentAssetIndex]
      const currentImageSettings = thumbnailImageSettings[currentTemplateType] || { position: { x: 0, y: 0 }, zoom: 1 }

      // Save current asset's copy before switching
      const updatedCopies = {
        ...manualAssetCopies,
        [currentAssetIndex]: { ...verbatimCopy },
      }

      // Save current asset's settings before switching
      const currentSettings: ManualAssetSettings = {
        eyebrow,
        ctaText,
        gridDetail1Text,
        gridDetail2Text,
        gridDetail3Text,
        gridDetail4Text,
        thumbnailImageUrl,
        thumbnailImagePosition: { ...currentImageSettings.position },
        thumbnailImageZoom: currentImageSettings.zoom,
        showBody,
        metadata,
        speaker1Name,
        speaker1Role,
        speaker1ImageUrl,
        speaker1ImagePosition: { ...speaker1ImagePosition },
        speaker1ImageZoom,
        speaker2Name,
        speaker2Role,
        speaker2ImageUrl,
        speaker2ImagePosition: { ...speaker2ImagePosition },
        speaker2ImageZoom,
        speaker3Name,
        speaker3Role,
        speaker3ImageUrl,
        speaker3ImagePosition: { ...speaker3ImagePosition },
        speaker3ImageZoom,
        // Template variants
        ebookVariant,
        reportVariant,
        webinarVariant,
        eventListingVariant,
        floatingBannerVariant,
        floatingBannerMobileVariant,
        floatingBannerMobileArrowType,
        newsletterTopBannerVariant,
        showSpeaker1,
        showSpeaker2,
        showSpeaker3,
        grayscale,
        // Solution Overview PDF specific - Page 1
        solutionOverviewSolution,
        solutionOverviewSolutionName,
        solutionOverviewTagline,
        solutionOverviewCurrentPage,
        // Solution Overview PDF specific - Page 2
        solutionOverviewHeroImageId,
        solutionOverviewHeroImageUrl,
        solutionOverviewHeroImagePosition,
        solutionOverviewHeroImageZoom,
        solutionOverviewHeroImageGrayscale,
        solutionOverviewPage2Header,
        solutionOverviewSectionHeader,
        solutionOverviewIntroParagraph,
        solutionOverviewKeySolutions,
        solutionOverviewQuoteText,
        solutionOverviewQuoteName,
        solutionOverviewQuoteTitle,
        solutionOverviewQuoteCompany,
        // Solution Overview PDF specific - Page 3
        solutionOverviewBenefits,
        solutionOverviewFeatures,
        solutionOverviewScreenshotUrl,
        solutionOverviewScreenshotPosition,
        solutionOverviewScreenshotZoom,
        solutionOverviewScreenshotGrayscale,
        solutionOverviewCtaOption,
        solutionOverviewCtaUrl,
        // Solution Overview PDF specific - Page 2 Stats
        solutionOverviewStat1Value,
        solutionOverviewStat1Label,
        solutionOverviewStat2Value,
        solutionOverviewStat2Label,
        solutionOverviewStat3Value,
        solutionOverviewStat3Label,
        solutionOverviewStat4Value,
        solutionOverviewStat4Label,
        solutionOverviewStat5Value,
        solutionOverviewStat5Label,
      }
      const updatedSettings = {
        ...manualAssetSettings,
        [currentAssetIndex]: currentSettings,
      }

      // Load target asset's copy (or keep current copy for text fields - helpful starting point)
      const targetCopy = updatedCopies[index] || verbatimCopy

      // Load target asset's settings (or use defaults for new assets)
      // Note: Images default to placeholder for new assets, not copied from previous
      const targetTemplateDefaults = getDefaultAssetSettings(selectedAssets[index])
      const defaultSettings: ManualAssetSettings = {
        eyebrow: verbatimCopy.headline ? eyebrow : 'Eyebrow', // Keep eyebrow if has content, else default
        ctaText: 'Responsive',
        gridDetail1Text: 'Date: January 1st, 2026',
        gridDetail2Text: 'Date: January 1st, 2026',
        gridDetail3Text: 'Responsive',
        gridDetail4Text: 'Join the event',
        thumbnailImageUrl: null, // Always default placeholder for new assets
        thumbnailImagePosition: { x: 0, y: 0 },
        thumbnailImageZoom: 1,
        showBody: true,
        metadata: 'Day / Month | 00:00',
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
        // Template variants - use template-specific defaults
        ebookVariant: targetTemplateDefaults.ebookVariant,
        reportVariant: targetTemplateDefaults.reportVariant,
        webinarVariant: targetTemplateDefaults.webinarVariant,
        eventListingVariant: targetTemplateDefaults.eventListingVariant,
        floatingBannerVariant: targetTemplateDefaults.floatingBannerVariant,
        floatingBannerMobileVariant: targetTemplateDefaults.floatingBannerMobileVariant,
        floatingBannerMobileArrowType: targetTemplateDefaults.floatingBannerMobileArrowType,
        newsletterTopBannerVariant: targetTemplateDefaults.newsletterTopBannerVariant,
        showSpeaker1: targetTemplateDefaults.showSpeaker1,
        showSpeaker2: targetTemplateDefaults.showSpeaker2,
        showSpeaker3: targetTemplateDefaults.showSpeaker3,
        grayscale: targetTemplateDefaults.grayscale,
        // Solution Overview PDF specific - Page 1
        solutionOverviewSolution: targetTemplateDefaults.solutionOverviewSolution,
        solutionOverviewSolutionName: targetTemplateDefaults.solutionOverviewSolutionName,
        solutionOverviewTagline: targetTemplateDefaults.solutionOverviewTagline,
        solutionOverviewCurrentPage: targetTemplateDefaults.solutionOverviewCurrentPage,
        // Solution Overview PDF specific - Page 2
        solutionOverviewHeroImageId: targetTemplateDefaults.solutionOverviewHeroImageId,
        solutionOverviewHeroImageUrl: targetTemplateDefaults.solutionOverviewHeroImageUrl,
        solutionOverviewHeroImagePosition: targetTemplateDefaults.solutionOverviewHeroImagePosition,
        solutionOverviewHeroImageZoom: targetTemplateDefaults.solutionOverviewHeroImageZoom,
        solutionOverviewHeroImageGrayscale: targetTemplateDefaults.solutionOverviewHeroImageGrayscale,
        solutionOverviewPage2Header: targetTemplateDefaults.solutionOverviewPage2Header,
        solutionOverviewSectionHeader: targetTemplateDefaults.solutionOverviewSectionHeader,
        solutionOverviewIntroParagraph: targetTemplateDefaults.solutionOverviewIntroParagraph,
        solutionOverviewKeySolutions: targetTemplateDefaults.solutionOverviewKeySolutions,
        solutionOverviewQuoteText: targetTemplateDefaults.solutionOverviewQuoteText,
        solutionOverviewQuoteName: targetTemplateDefaults.solutionOverviewQuoteName,
        solutionOverviewQuoteTitle: targetTemplateDefaults.solutionOverviewQuoteTitle,
        solutionOverviewQuoteCompany: targetTemplateDefaults.solutionOverviewQuoteCompany,
        // Solution Overview PDF specific - Page 3
        solutionOverviewBenefits: targetTemplateDefaults.solutionOverviewBenefits,
        solutionOverviewFeatures: targetTemplateDefaults.solutionOverviewFeatures,
        solutionOverviewScreenshotUrl: targetTemplateDefaults.solutionOverviewScreenshotUrl,
        solutionOverviewScreenshotPosition: targetTemplateDefaults.solutionOverviewScreenshotPosition,
        solutionOverviewScreenshotZoom: targetTemplateDefaults.solutionOverviewScreenshotZoom,
        solutionOverviewScreenshotGrayscale: targetTemplateDefaults.solutionOverviewScreenshotGrayscale,
        solutionOverviewCtaOption: targetTemplateDefaults.solutionOverviewCtaOption,
        solutionOverviewCtaUrl: targetTemplateDefaults.solutionOverviewCtaUrl,
        solutionOverviewStat1Value: targetTemplateDefaults.solutionOverviewStat1Value,
        solutionOverviewStat1Label: targetTemplateDefaults.solutionOverviewStat1Label,
        solutionOverviewStat2Value: targetTemplateDefaults.solutionOverviewStat2Value,
        solutionOverviewStat2Label: targetTemplateDefaults.solutionOverviewStat2Label,
        solutionOverviewStat3Value: targetTemplateDefaults.solutionOverviewStat3Value,
        solutionOverviewStat3Label: targetTemplateDefaults.solutionOverviewStat3Label,
        solutionOverviewStat4Value: targetTemplateDefaults.solutionOverviewStat4Value,
        solutionOverviewStat4Label: targetTemplateDefaults.solutionOverviewStat4Label,
        solutionOverviewStat5Value: targetTemplateDefaults.solutionOverviewStat5Value,
        solutionOverviewStat5Label: targetTemplateDefaults.solutionOverviewStat5Label,
      }
      const targetSettings = updatedSettings[index] || defaultSettings

      // Get target template type
      const targetTemplateType = selectedAssets[index]

      // Build updated thumbnailImageSettings with target asset's image position/zoom
      const updatedThumbnailImageSettings = {
        ...thumbnailImageSettings,
        [targetTemplateType]: {
          position: { ...targetSettings.thumbnailImagePosition },
          zoom: targetSettings.thumbnailImageZoom,
        },
      }

      set({
        currentAssetIndex: index,
        templateType: targetTemplateType,
        manualAssetCopies: updatedCopies,
        manualAssetSettings: updatedSettings,
        verbatimCopy: { ...targetCopy },
        eyebrow: targetSettings.eyebrow,
        ctaText: targetSettings.ctaText,
        gridDetail1Text: targetSettings.gridDetail1Text,
        gridDetail2Text: targetSettings.gridDetail2Text,
        gridDetail3Text: targetSettings.gridDetail3Text,
        gridDetail4Text: targetSettings.gridDetail4Text,
        thumbnailImageUrl: targetSettings.thumbnailImageUrl,
        thumbnailImageSettings: updatedThumbnailImageSettings,
        showBody: targetSettings.showBody,
        metadata: targetSettings.metadata,
        speaker1Name: targetSettings.speaker1Name,
        speaker1Role: targetSettings.speaker1Role,
        speaker1ImageUrl: targetSettings.speaker1ImageUrl,
        speaker1ImagePosition: { ...targetSettings.speaker1ImagePosition },
        speaker1ImageZoom: targetSettings.speaker1ImageZoom,
        speaker2Name: targetSettings.speaker2Name,
        speaker2Role: targetSettings.speaker2Role,
        speaker2ImageUrl: targetSettings.speaker2ImageUrl,
        speaker2ImagePosition: { ...targetSettings.speaker2ImagePosition },
        speaker2ImageZoom: targetSettings.speaker2ImageZoom,
        speaker3Name: targetSettings.speaker3Name,
        speaker3Role: targetSettings.speaker3Role,
        speaker3ImageUrl: targetSettings.speaker3ImageUrl,
        speaker3ImagePosition: { ...targetSettings.speaker3ImagePosition },
        speaker3ImageZoom: targetSettings.speaker3ImageZoom,
        // Template variants
        ebookVariant: targetSettings.ebookVariant,
        reportVariant: targetSettings.reportVariant,
        webinarVariant: targetSettings.webinarVariant,
        eventListingVariant: targetSettings.eventListingVariant,
        floatingBannerVariant: targetSettings.floatingBannerVariant,
        floatingBannerMobileVariant: targetSettings.floatingBannerMobileVariant,
        floatingBannerMobileArrowType: targetSettings.floatingBannerMobileArrowType,
        newsletterTopBannerVariant: targetSettings.newsletterTopBannerVariant,
        showSpeaker1: targetSettings.showSpeaker1,
        showSpeaker2: targetSettings.showSpeaker2,
        showSpeaker3: targetSettings.showSpeaker3,
        grayscale: targetSettings.grayscale,
        // Solution Overview PDF specific - Page 1
        solutionOverviewSolution: targetSettings.solutionOverviewSolution,
        solutionOverviewSolutionName: targetSettings.solutionOverviewSolutionName,
        solutionOverviewTagline: targetSettings.solutionOverviewTagline,
        solutionOverviewCurrentPage: targetSettings.solutionOverviewCurrentPage,
        // Solution Overview PDF specific - Page 2
        solutionOverviewHeroImageId: targetSettings.solutionOverviewHeroImageId,
        solutionOverviewHeroImageUrl: targetSettings.solutionOverviewHeroImageUrl,
        solutionOverviewHeroImagePosition: targetSettings.solutionOverviewHeroImagePosition,
        solutionOverviewHeroImageZoom: targetSettings.solutionOverviewHeroImageZoom,
        solutionOverviewHeroImageGrayscale: targetSettings.solutionOverviewHeroImageGrayscale,
        solutionOverviewPage2Header: targetSettings.solutionOverviewPage2Header,
        solutionOverviewSectionHeader: targetSettings.solutionOverviewSectionHeader,
        solutionOverviewIntroParagraph: targetSettings.solutionOverviewIntroParagraph,
        solutionOverviewKeySolutions: targetSettings.solutionOverviewKeySolutions,
        solutionOverviewQuoteText: targetSettings.solutionOverviewQuoteText,
        solutionOverviewQuoteName: targetSettings.solutionOverviewQuoteName,
        solutionOverviewQuoteTitle: targetSettings.solutionOverviewQuoteTitle,
        solutionOverviewQuoteCompany: targetSettings.solutionOverviewQuoteCompany,
        // Solution Overview PDF specific - Page 3
        solutionOverviewBenefits: targetSettings.solutionOverviewBenefits,
        solutionOverviewFeatures: targetSettings.solutionOverviewFeatures,
        solutionOverviewScreenshotUrl: targetSettings.solutionOverviewScreenshotUrl,
        solutionOverviewScreenshotPosition: targetSettings.solutionOverviewScreenshotPosition,
        solutionOverviewScreenshotZoom: targetSettings.solutionOverviewScreenshotZoom,
        solutionOverviewScreenshotGrayscale: targetSettings.solutionOverviewScreenshotGrayscale,
        solutionOverviewCtaOption: targetSettings.solutionOverviewCtaOption,
        solutionOverviewCtaUrl: targetSettings.solutionOverviewCtaUrl,
        // Solution Overview PDF specific - Page 2 Stats
        solutionOverviewStat1Value: targetSettings.solutionOverviewStat1Value,
        solutionOverviewStat1Label: targetSettings.solutionOverviewStat1Label,
        solutionOverviewStat2Value: targetSettings.solutionOverviewStat2Value,
        solutionOverviewStat2Label: targetSettings.solutionOverviewStat2Label,
        solutionOverviewStat3Value: targetSettings.solutionOverviewStat3Value,
        solutionOverviewStat3Label: targetSettings.solutionOverviewStat3Label,
        solutionOverviewStat4Value: targetSettings.solutionOverviewStat4Value,
        solutionOverviewStat4Label: targetSettings.solutionOverviewStat4Label,
        solutionOverviewStat5Value: targetSettings.solutionOverviewStat5Value,
        solutionOverviewStat5Label: targetSettings.solutionOverviewStat5Label,
        // Reset generation state when switching assets - each asset has its own generation context
        pdfContent: null,
        generationContext: '',
        contextFile: null,
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
    // Determine current template: in auto-create mode use templateType, in manual mode use selectedAssets
    const isAutoCreateMode = Object.keys(state.generatedAssets).length > 0
    const currentTemplate = isAutoCreateMode
      ? state.templateType
      : (state.selectedAssets[state.currentAssetIndex] || state.templateType)
    // Get per-template image settings using the correct template
    const imageSettings = state.thumbnailImageSettings[currentTemplate] ?? { position: { x: 0, y: 0 }, zoom: 1 }

    const newAsset: QueuedAsset = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateType: currentTemplate,
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
      floatingBannerMobileVariant: state.floatingBannerMobileVariant,
      floatingBannerMobileArrowType: state.floatingBannerMobileArrowType,
      newsletterTopBannerVariant: state.newsletterTopBannerVariant,
      grayscale: state.grayscale,
      // Solution Overview PDF specific - Page 1
      solutionOverviewSolution: state.solutionOverviewSolution,
      solutionOverviewSolutionName: state.solutionOverviewSolutionName,
      solutionOverviewTagline: state.solutionOverviewTagline,
      // Solution Overview PDF specific - Page 2
      solutionOverviewHeroImageId: state.solutionOverviewHeroImageId,
      solutionOverviewHeroImageUrl: state.solutionOverviewHeroImageUrl,
      solutionOverviewHeroImagePosition: state.solutionOverviewHeroImagePosition,
      solutionOverviewHeroImageZoom: state.solutionOverviewHeroImageZoom,
      solutionOverviewHeroImageGrayscale: state.solutionOverviewHeroImageGrayscale,
      solutionOverviewPage2Header: state.solutionOverviewPage2Header,
      solutionOverviewSectionHeader: state.solutionOverviewSectionHeader,
      solutionOverviewIntroParagraph: state.solutionOverviewIntroParagraph,
      solutionOverviewKeySolutions: state.solutionOverviewKeySolutions,
      solutionOverviewQuoteText: state.solutionOverviewQuoteText,
      solutionOverviewQuoteName: state.solutionOverviewQuoteName,
      solutionOverviewQuoteTitle: state.solutionOverviewQuoteTitle,
      solutionOverviewQuoteCompany: state.solutionOverviewQuoteCompany,
      // Solution Overview PDF specific - Page 3
      solutionOverviewBenefits: state.solutionOverviewBenefits,
      solutionOverviewFeatures: state.solutionOverviewFeatures,
      solutionOverviewScreenshotUrl: state.solutionOverviewScreenshotUrl,
      solutionOverviewScreenshotPosition: state.solutionOverviewScreenshotPosition,
      solutionOverviewScreenshotZoom: state.solutionOverviewScreenshotZoom,
      solutionOverviewScreenshotGrayscale: state.solutionOverviewScreenshotGrayscale,
      solutionOverviewCtaOption: state.solutionOverviewCtaOption,
      solutionOverviewCtaUrl: state.solutionOverviewCtaUrl,
      // Solution Overview PDF specific - Page 2 Stats
      solutionOverviewStat1Value: state.solutionOverviewStat1Value,
      solutionOverviewStat1Label: state.solutionOverviewStat1Label,
      solutionOverviewStat2Value: state.solutionOverviewStat2Value,
      solutionOverviewStat2Label: state.solutionOverviewStat2Label,
      solutionOverviewStat3Value: state.solutionOverviewStat3Value,
      solutionOverviewStat3Label: state.solutionOverviewStat3Label,
      solutionOverviewStat4Value: state.solutionOverviewStat4Value,
      solutionOverviewStat4Label: state.solutionOverviewStat4Label,
      solutionOverviewStat5Value: state.solutionOverviewStat5Value,
      solutionOverviewStat5Label: state.solutionOverviewStat5Label,
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
      floatingBannerMobileVariant: asset.floatingBannerMobileVariant,
      floatingBannerMobileArrowType: asset.floatingBannerMobileArrowType,
      newsletterTopBannerVariant: asset.newsletterTopBannerVariant,
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
      floatingBannerMobileVariant: state.floatingBannerMobileVariant,
      floatingBannerMobileArrowType: state.floatingBannerMobileArrowType,
      newsletterTopBannerVariant: state.newsletterTopBannerVariant,
      grayscale: state.grayscale,
      // Solution Overview PDF specific - Page 1
      solutionOverviewSolution: state.solutionOverviewSolution,
      solutionOverviewSolutionName: state.solutionOverviewSolutionName,
      solutionOverviewTagline: state.solutionOverviewTagline,
      // Solution Overview PDF specific - Page 2
      solutionOverviewHeroImageId: state.solutionOverviewHeroImageId,
      solutionOverviewHeroImageUrl: state.solutionOverviewHeroImageUrl,
      solutionOverviewHeroImagePosition: state.solutionOverviewHeroImagePosition,
      solutionOverviewHeroImageZoom: state.solutionOverviewHeroImageZoom,
      solutionOverviewHeroImageGrayscale: state.solutionOverviewHeroImageGrayscale,
      solutionOverviewPage2Header: state.solutionOverviewPage2Header,
      solutionOverviewSectionHeader: state.solutionOverviewSectionHeader,
      solutionOverviewIntroParagraph: state.solutionOverviewIntroParagraph,
      solutionOverviewKeySolutions: state.solutionOverviewKeySolutions,
      solutionOverviewQuoteText: state.solutionOverviewQuoteText,
      solutionOverviewQuoteName: state.solutionOverviewQuoteName,
      solutionOverviewQuoteTitle: state.solutionOverviewQuoteTitle,
      solutionOverviewQuoteCompany: state.solutionOverviewQuoteCompany,
      // Solution Overview PDF specific - Page 3
      solutionOverviewBenefits: state.solutionOverviewBenefits,
      solutionOverviewFeatures: state.solutionOverviewFeatures,
      solutionOverviewScreenshotUrl: state.solutionOverviewScreenshotUrl,
      solutionOverviewScreenshotPosition: state.solutionOverviewScreenshotPosition,
      solutionOverviewScreenshotZoom: state.solutionOverviewScreenshotZoom,
      solutionOverviewScreenshotGrayscale: state.solutionOverviewScreenshotGrayscale,
      solutionOverviewCtaOption: state.solutionOverviewCtaOption,
      solutionOverviewCtaUrl: state.solutionOverviewCtaUrl,
      // Solution Overview PDF specific - Page 2 Stats
      solutionOverviewStat1Value: state.solutionOverviewStat1Value,
      solutionOverviewStat1Label: state.solutionOverviewStat1Label,
      solutionOverviewStat2Value: state.solutionOverviewStat2Value,
      solutionOverviewStat2Label: state.solutionOverviewStat2Label,
      solutionOverviewStat3Value: state.solutionOverviewStat3Value,
      solutionOverviewStat3Label: state.solutionOverviewStat3Label,
      solutionOverviewStat4Value: state.solutionOverviewStat4Value,
      solutionOverviewStat4Label: state.solutionOverviewStat4Label,
      solutionOverviewStat5Value: state.solutionOverviewStat5Value,
      solutionOverviewStat5Label: state.solutionOverviewStat5Label,
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
      floatingBannerMobileVariant: asset.floatingBannerMobileVariant,
      floatingBannerMobileArrowType: asset.floatingBannerMobileArrowType,
      newsletterTopBannerVariant: asset.newsletterTopBannerVariant,
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
          floatingBannerMobileVariant: asset.floatingBannerMobileVariant,
          floatingBannerMobileArrowType: asset.floatingBannerMobileArrowType,
          newsletterTopBannerVariant: asset.newsletterTopBannerVariant,
          grayscale: asset.grayscale,
          // Solution Overview PDF specific - Page 1
          solutionOverviewSolution: asset.solutionOverviewSolution,
          solutionOverviewSolutionName: asset.solutionOverviewSolutionName,
          solutionOverviewTagline: asset.solutionOverviewTagline,
          // Solution Overview PDF specific - Page 2
          solutionOverviewHeroImageId: asset.solutionOverviewHeroImageId,
          solutionOverviewHeroImageUrl: asset.solutionOverviewHeroImageUrl,
          solutionOverviewHeroImagePosition: asset.solutionOverviewHeroImagePosition,
          solutionOverviewHeroImageZoom: asset.solutionOverviewHeroImageZoom,
          solutionOverviewHeroImageGrayscale: asset.solutionOverviewHeroImageGrayscale,
          solutionOverviewPage2Header: asset.solutionOverviewPage2Header,
          solutionOverviewSectionHeader: asset.solutionOverviewSectionHeader,
          solutionOverviewIntroParagraph: asset.solutionOverviewIntroParagraph,
          solutionOverviewKeySolutions: asset.solutionOverviewKeySolutions,
          solutionOverviewQuoteText: asset.solutionOverviewQuoteText,
          solutionOverviewQuoteName: asset.solutionOverviewQuoteName,
          solutionOverviewQuoteTitle: asset.solutionOverviewQuoteTitle,
          solutionOverviewQuoteCompany: asset.solutionOverviewQuoteCompany,
          // Solution Overview PDF specific - Page 3
          solutionOverviewBenefits: asset.solutionOverviewBenefits,
          solutionOverviewFeatures: asset.solutionOverviewFeatures,
          solutionOverviewScreenshotUrl: asset.solutionOverviewScreenshotUrl,
          solutionOverviewScreenshotPosition: asset.solutionOverviewScreenshotPosition,
          solutionOverviewScreenshotZoom: asset.solutionOverviewScreenshotZoom,
          solutionOverviewScreenshotGrayscale: asset.solutionOverviewScreenshotGrayscale,
          solutionOverviewCtaOption: asset.solutionOverviewCtaOption,
          solutionOverviewCtaUrl: asset.solutionOverviewCtaUrl || '',
          // Solution Overview PDF specific - Page 2 Stats
          solutionOverviewStat1Value: asset.solutionOverviewStat1Value,
          solutionOverviewStat1Label: asset.solutionOverviewStat1Label,
          solutionOverviewStat2Value: asset.solutionOverviewStat2Value,
          solutionOverviewStat2Label: asset.solutionOverviewStat2Label,
          solutionOverviewStat3Value: asset.solutionOverviewStat3Value,
          solutionOverviewStat3Label: asset.solutionOverviewStat3Label,
          solutionOverviewStat4Value: asset.solutionOverviewStat4Value,
          solutionOverviewStat4Label: asset.solutionOverviewStat4Label,
          solutionOverviewStat5Value: asset.solutionOverviewStat5Value,
          solutionOverviewStat5Label: asset.solutionOverviewStat5Label,
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
      manualAssetCopies: {},
      manualAssetSettings: {},
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
      newsletterImageSize: 'small',
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
      webinarVariant: 'speakers',
      showSpeaker1: true,
      showSpeaker2: true,
      showSpeaker3: true,
      ebookVariant: 'image',
      reportVariant: 'image',
      eventListingVariant: 'orange',
      floatingBannerVariant: 'dark',
      floatingBannerMobileVariant: 'light',
      floatingBannerMobileArrowType: 'text',
      newsletterTopBannerVariant: 'dark',
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
      currentScreen: state.currentScreen,
      selectedAssets: state.selectedAssets,
      currentAssetIndex: state.currentAssetIndex,
      manualAssetCopies: state.manualAssetCopies,
      manualAssetSettings: state.manualAssetSettings,
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
      floatingBannerMobileVariant: state.floatingBannerMobileVariant,
      floatingBannerMobileArrowType: state.floatingBannerMobileArrowType,
      newsletterTopBannerVariant: state.newsletterTopBannerVariant,
      grayscale: state.grayscale,
      generatedVariations: state.generatedVariations,
      // FAQ PDF
      faqTitle: state.faqTitle,
      faqCoverSubheader: state.faqCoverSubheader,
      faqPages: state.faqPages,
      faqCoverSolution: state.faqCoverSolution,
      faqCoverImageUrl: state.faqCoverImageUrl,
      faqCoverImagePosition: state.faqCoverImagePosition,
      faqCoverImageZoom: state.faqCoverImageZoom,
      faqCoverImageGrayscale: state.faqCoverImageGrayscale,
      // Solution Overview PDF
      solutionOverviewSolution: state.solutionOverviewSolution,
      solutionOverviewSolutionName: state.solutionOverviewSolutionName,
      solutionOverviewTagline: state.solutionOverviewTagline,
      solutionOverviewCurrentPage: state.solutionOverviewCurrentPage,
      solutionOverviewHeroImageId: state.solutionOverviewHeroImageId,
      solutionOverviewHeroImageUrl: state.solutionOverviewHeroImageUrl,
      solutionOverviewHeroImagePosition: state.solutionOverviewHeroImagePosition,
      solutionOverviewHeroImageZoom: state.solutionOverviewHeroImageZoom,
      solutionOverviewHeroImageGrayscale: state.solutionOverviewHeroImageGrayscale,
      solutionOverviewPage2Header: state.solutionOverviewPage2Header,
      solutionOverviewSectionHeader: state.solutionOverviewSectionHeader,
      solutionOverviewIntroParagraph: state.solutionOverviewIntroParagraph,
      solutionOverviewKeySolutions: state.solutionOverviewKeySolutions,
      solutionOverviewQuoteText: state.solutionOverviewQuoteText,
      solutionOverviewQuoteName: state.solutionOverviewQuoteName,
      solutionOverviewQuoteTitle: state.solutionOverviewQuoteTitle,
      solutionOverviewQuoteCompany: state.solutionOverviewQuoteCompany,
      solutionOverviewBenefits: state.solutionOverviewBenefits,
      solutionOverviewFeatures: state.solutionOverviewFeatures,
      solutionOverviewScreenshotUrl: state.solutionOverviewScreenshotUrl,
      solutionOverviewScreenshotPosition: state.solutionOverviewScreenshotPosition,
      solutionOverviewScreenshotZoom: state.solutionOverviewScreenshotZoom,
      solutionOverviewScreenshotGrayscale: state.solutionOverviewScreenshotGrayscale,
      solutionOverviewCtaOption: state.solutionOverviewCtaOption,
      solutionOverviewCtaUrl: state.solutionOverviewCtaUrl,
      solutionOverviewStat1Value: state.solutionOverviewStat1Value,
      solutionOverviewStat1Label: state.solutionOverviewStat1Label,
      solutionOverviewStat2Value: state.solutionOverviewStat2Value,
      solutionOverviewStat2Label: state.solutionOverviewStat2Label,
      solutionOverviewStat3Value: state.solutionOverviewStat3Value,
      solutionOverviewStat3Label: state.solutionOverviewStat3Label,
      solutionOverviewStat4Value: state.solutionOverviewStat4Value,
      solutionOverviewStat4Label: state.solutionOverviewStat4Label,
      solutionOverviewStat5Value: state.solutionOverviewStat5Value,
      solutionOverviewStat5Label: state.solutionOverviewStat5Label,
    })
  },

  loadDraft: () => {
    const draft = loadDraftFromStorage()
    if (!draft) return false

    set({
      currentScreen: draft.currentScreen || 'select',
      selectedAssets: draft.selectedAssets,
      currentAssetIndex: draft.currentAssetIndex,
      manualAssetCopies: draft.manualAssetCopies || {},
      manualAssetSettings: draft.manualAssetSettings || {},
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
      floatingBannerMobileVariant: draft.floatingBannerMobileVariant ?? 'light',
      floatingBannerMobileArrowType: draft.floatingBannerMobileArrowType ?? 'text',
      grayscale: draft.grayscale ?? false,
      generatedVariations: draft.generatedVariations,
      // FAQ PDF
      faqTitle: draft.faqTitle ?? 'Title Goes Here',
      faqCoverSubheader: draft.faqCoverSubheader ?? 'Frequently Asked Questions',
      faqPages: draft.faqPages ?? createDefaultFaqPages(),
      faqCoverSolution: draft.faqCoverSolution ?? 'safety',
      faqCoverImageUrl: draft.faqCoverImageUrl ?? null,
      faqCoverImagePosition: draft.faqCoverImagePosition ?? { x: 0, y: 0 },
      faqCoverImageZoom: draft.faqCoverImageZoom ?? 1,
      faqCoverImageGrayscale: draft.faqCoverImageGrayscale ?? false,
      // Solution Overview PDF
      solutionOverviewSolution: draft.solutionOverviewSolution ?? 'health',
      solutionOverviewSolutionName: draft.solutionOverviewSolutionName ?? 'Solution Name Goes Here',
      solutionOverviewTagline: draft.solutionOverviewTagline ?? 'Subheader Goes Here',
      solutionOverviewCurrentPage: draft.solutionOverviewCurrentPage ?? 1,
      solutionOverviewHeroImageId: draft.solutionOverviewHeroImageId ?? 'placeholder',
      solutionOverviewHeroImageUrl: draft.solutionOverviewHeroImageUrl ?? null,
      solutionOverviewHeroImagePosition: draft.solutionOverviewHeroImagePosition ?? { x: 0, y: 0 },
      solutionOverviewHeroImageZoom: draft.solutionOverviewHeroImageZoom ?? 1,
      solutionOverviewHeroImageGrayscale: draft.solutionOverviewHeroImageGrayscale ?? false,
      solutionOverviewPage2Header: draft.solutionOverviewPage2Header ?? 'Heading 1',
      solutionOverviewSectionHeader: draft.solutionOverviewSectionHeader ?? 'Heading 2',
      solutionOverviewIntroParagraph: draft.solutionOverviewIntroParagraph ?? '',
      solutionOverviewKeySolutions: draft.solutionOverviewKeySolutions ?? ['Solution Name', 'Solution Name', 'Solution Name', 'Solution Name'],
      solutionOverviewQuoteText: draft.solutionOverviewQuoteText ?? '',
      solutionOverviewQuoteName: draft.solutionOverviewQuoteName ?? 'Firstname Lastname',
      solutionOverviewQuoteTitle: draft.solutionOverviewQuoteTitle ?? 'Job title',
      solutionOverviewQuoteCompany: draft.solutionOverviewQuoteCompany ?? 'Organization',
      solutionOverviewBenefits: draft.solutionOverviewBenefits ?? [],
      solutionOverviewFeatures: draft.solutionOverviewFeatures ?? [],
      solutionOverviewScreenshotUrl: draft.solutionOverviewScreenshotUrl ?? null,
      solutionOverviewScreenshotPosition: draft.solutionOverviewScreenshotPosition ?? { x: 0, y: 0 },
      solutionOverviewScreenshotZoom: draft.solutionOverviewScreenshotZoom ?? 1,
      solutionOverviewScreenshotGrayscale: draft.solutionOverviewScreenshotGrayscale ?? false,
      solutionOverviewCtaOption: draft.solutionOverviewCtaOption ?? 'demo',
      solutionOverviewCtaUrl: draft.solutionOverviewCtaUrl ?? '',
      solutionOverviewStat1Value: draft.solutionOverviewStat1Value ?? '20+',
      solutionOverviewStat1Label: draft.solutionOverviewStat1Label ?? 'Awards',
      solutionOverviewStat2Value: draft.solutionOverviewStat2Value ?? '350+',
      solutionOverviewStat2Label: draft.solutionOverviewStat2Label ?? 'Experts',
      solutionOverviewStat3Value: draft.solutionOverviewStat3Value ?? '100%',
      solutionOverviewStat3Label: draft.solutionOverviewStat3Label ?? 'Deployment',
      solutionOverviewStat4Value: draft.solutionOverviewStat4Value ?? '2M+',
      solutionOverviewStat4Label: draft.solutionOverviewStat4Label ?? 'End Users',
      solutionOverviewStat5Value: draft.solutionOverviewStat5Value ?? '1.2K',
      solutionOverviewStat5Label: draft.solutionOverviewStat5Label ?? 'Clients',
    })
    return true
  },

  clearDraft: () => {
    clearDraftStorage()
  },
})))
