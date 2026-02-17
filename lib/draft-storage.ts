'use client'

import type { TemplateType, CopyContent, ManualAssetSettings, GeneratedAsset, AutoCreateState, QueuedAsset, ThumbnailImageSettings, FaqPage, SolutionCategory, AppScreen, SolutionOverviewBenefit, SolutionOverviewFeature } from '@/types'

const DRAFT_KEY = 'design-dog-active-draft'

export interface DraftState {
  version: number
  savedAt: number
  // Current screen for proper navigation on resume
  currentScreen: AppScreen
  // Editor state
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  manualAssetCopies: Record<number, CopyContent>
  manualAssetSettings: Record<number, ManualAssetSettings>
  templateType: TemplateType
  verbatimCopy: CopyContent
  // Generated assets (for auto-create flow)
  generatedAssets: Record<string, GeneratedAsset>
  autoCreate: AutoCreateState
  // Export queue
  exportQueue: QueuedAsset[]
  // Design settings
  eyebrow: string
  solution: string
  logoColor: 'black' | 'orange' | 'white'
  showEyebrow: boolean
  showSubhead: boolean
  showBody: boolean
  thumbnailImageUrl: string | null
  // Per-template image settings (decoupled per template)
  thumbnailImageSettings: ThumbnailImageSettings
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
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: 'dark' | 'light'
  // Image effects
  grayscale: boolean
  generatedVariations: { headlines: string[]; ctas: string[] } | null
  // FAQ PDF
  faqTitle: string
  faqCoverSubheader: string
  faqPages: FaqPage[]
  faqCoverSolution: SolutionCategory | 'none'
  faqCoverImageUrl: string | null
  faqCoverImagePosition: { x: number; y: number }
  faqCoverImageZoom: number
  faqCoverImageGrayscale: boolean
  // Solution Overview PDF
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewCurrentPage: 1 | 2 | 3
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
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  solutionOverviewFeatures: SolutionOverviewFeature[]
  solutionOverviewScreenshotUrl: string | null
  solutionOverviewScreenshotPosition: { x: number; y: number }
  solutionOverviewScreenshotZoom: number
  solutionOverviewScreenshotGrayscale: boolean
  solutionOverviewCtaOption: 'demo' | 'learn' | 'start' | 'contact'
  solutionOverviewCtaUrl: string
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
}

const CURRENT_VERSION = 1

export function saveDraftToStorage(state: Partial<DraftState>): void {
  if (typeof window === 'undefined') return

  try {
    const draft: DraftState = {
      version: CURRENT_VERSION,
      savedAt: Date.now(),
      currentScreen: state.currentScreen || 'select',
      selectedAssets: state.selectedAssets || [],
      currentAssetIndex: state.currentAssetIndex || 0,
      manualAssetCopies: state.manualAssetCopies || {},
      manualAssetSettings: state.manualAssetSettings || {},
      templateType: state.templateType || 'website-thumbnail',
      verbatimCopy: state.verbatimCopy || { headline: '', subhead: '', body: '', cta: '' },
      generatedAssets: state.generatedAssets || {},
      autoCreate: state.autoCreate || {
        isWizardOpen: false,
        currentStep: 'kit-selection',
        selectedKit: null,
        contentSource: {
          method: null,
          pdfContent: null,
          manualDescription: '',
          manualKeyPoints: '',
          additionalContext: '',
          uploadedFileName: null,
          analysisInfo: null,
          editedContent: null,
          editedFields: [],
        },
        selectedAssets: [],
        generationProgress: { total: 0, completed: 0, failed: [] },
      },
      exportQueue: state.exportQueue || [],
      eyebrow: state.eyebrow ?? 'Eyebrow',
      solution: state.solution || 'environmental',
      logoColor: state.logoColor || 'black',
      showEyebrow: state.showEyebrow ?? true,
      showSubhead: state.showSubhead ?? true,
      showBody: state.showBody ?? true,
      thumbnailImageUrl: state.thumbnailImageUrl || null,
      thumbnailImageSettings: state.thumbnailImageSettings || {},
      subheading: state.subheading ?? '',
      showLightHeader: state.showLightHeader ?? true,
      showSubheading: state.showSubheading ?? false,
      showSolutionSet: state.showSolutionSet ?? true,
      showGridDetail2: state.showGridDetail2 ?? true,
      gridDetail1Text: state.gridDetail1Text ?? 'Date: January 1st, 2026',
      gridDetail2Text: state.gridDetail2Text ?? 'Date: January 1st, 2026',
      gridDetail3Type: state.gridDetail3Type || 'cta',
      gridDetail3Text: state.gridDetail3Text ?? 'Responsive',
      gridDetail4Type: state.gridDetail4Type || 'cta',
      gridDetail4Text: state.gridDetail4Text ?? 'Join the event',
      showRow3: state.showRow3 ?? true,
      showRow4: state.showRow4 ?? true,
      metadata: state.metadata || 'Day / Month | 00:00',
      ctaText: state.ctaText || 'Responsive',
      colorStyle: state.colorStyle || '1',
      headingSize: state.headingSize || 'L',
      alignment: state.alignment || 'left',
      ctaStyle: state.ctaStyle || 'link',
      showMetadata: state.showMetadata ?? true,
      showCta: state.showCta ?? true,
      layout: state.layout || 'even',
      newsletterImageSize: state.newsletterImageSize || 'none',
      newsletterImageUrl: state.newsletterImageUrl || null,
      newsletterImagePosition: state.newsletterImagePosition || { x: 0, y: 0 },
      newsletterImageZoom: state.newsletterImageZoom ?? 1,
      speakerCount: state.speakerCount || 3,
      speaker1Name: state.speaker1Name || 'Firstname Lastname',
      speaker1Role: state.speaker1Role || 'Role, Company',
      speaker1ImageUrl: state.speaker1ImageUrl || '',
      speaker1ImagePosition: state.speaker1ImagePosition || { x: 0, y: 0 },
      speaker1ImageZoom: state.speaker1ImageZoom || 1,
      speaker2Name: state.speaker2Name || 'Firstname Lastname',
      speaker2Role: state.speaker2Role || 'Role, Company',
      speaker2ImageUrl: state.speaker2ImageUrl || '',
      speaker2ImagePosition: state.speaker2ImagePosition || { x: 0, y: 0 },
      speaker2ImageZoom: state.speaker2ImageZoom || 1,
      speaker3Name: state.speaker3Name || 'Firstname Lastname',
      speaker3Role: state.speaker3Role || 'Role, Company',
      speaker3ImageUrl: state.speaker3ImageUrl || '',
      speaker3ImagePosition: state.speaker3ImagePosition || { x: 0, y: 0 },
      speaker3ImageZoom: state.speaker3ImageZoom || 1,
      webinarVariant: state.webinarVariant || 'image',
      showSpeaker1: state.showSpeaker1 ?? true,
      showSpeaker2: state.showSpeaker2 ?? true,
      showSpeaker3: state.showSpeaker3 ?? true,
      ebookVariant: state.ebookVariant || 'image',
      reportVariant: state.reportVariant || 'image',
      eventListingVariant: state.eventListingVariant || 'orange',
      floatingBannerVariant: state.floatingBannerVariant || 'dark',
      floatingBannerMobileVariant: state.floatingBannerMobileVariant || 'light',
      floatingBannerMobileArrowType: state.floatingBannerMobileArrowType || 'text',
      newsletterTopBannerVariant: state.newsletterTopBannerVariant || 'dark',
      grayscale: state.grayscale ?? false,
      generatedVariations: state.generatedVariations || null,
      // FAQ PDF
      faqTitle: state.faqTitle || 'Title Goes Here',
      faqCoverSubheader: state.faqCoverSubheader || 'Frequently Asked Questions',
      faqPages: state.faqPages || [],
      faqCoverSolution: state.faqCoverSolution || 'safety',
      faqCoverImageUrl: state.faqCoverImageUrl || null,
      faqCoverImagePosition: state.faqCoverImagePosition || { x: 0, y: 0 },
      faqCoverImageZoom: state.faqCoverImageZoom ?? 1,
      faqCoverImageGrayscale: state.faqCoverImageGrayscale ?? false,
      // Solution Overview PDF
      solutionOverviewSolution: state.solutionOverviewSolution || 'health',
      solutionOverviewSolutionName: state.solutionOverviewSolutionName || 'Solution Name Goes Here',
      solutionOverviewTagline: state.solutionOverviewTagline || 'Subheader Goes Here',
      solutionOverviewCurrentPage: state.solutionOverviewCurrentPage || 1,
      solutionOverviewHeroImageId: state.solutionOverviewHeroImageId || 'placeholder',
      solutionOverviewHeroImageUrl: state.solutionOverviewHeroImageUrl || null,
      solutionOverviewHeroImagePosition: state.solutionOverviewHeroImagePosition || { x: 0, y: 0 },
      solutionOverviewHeroImageZoom: state.solutionOverviewHeroImageZoom ?? 1,
      solutionOverviewHeroImageGrayscale: state.solutionOverviewHeroImageGrayscale ?? false,
      solutionOverviewPage2Header: state.solutionOverviewPage2Header || 'Heading 1',
      solutionOverviewSectionHeader: state.solutionOverviewSectionHeader || 'Heading 2',
      solutionOverviewIntroParagraph: state.solutionOverviewIntroParagraph || '',
      solutionOverviewKeySolutions: state.solutionOverviewKeySolutions || ['Solution Name', 'Solution Name', 'Solution Name', 'Solution Name'],
      solutionOverviewQuoteText: state.solutionOverviewQuoteText || '',
      solutionOverviewQuoteName: state.solutionOverviewQuoteName || 'Firstname Lastname',
      solutionOverviewQuoteTitle: state.solutionOverviewQuoteTitle || 'Job title',
      solutionOverviewQuoteCompany: state.solutionOverviewQuoteCompany || 'Organization',
      solutionOverviewBenefits: state.solutionOverviewBenefits || [],
      solutionOverviewFeatures: state.solutionOverviewFeatures || [],
      solutionOverviewScreenshotUrl: state.solutionOverviewScreenshotUrl || null,
      solutionOverviewScreenshotPosition: state.solutionOverviewScreenshotPosition || { x: 0, y: 0 },
      solutionOverviewScreenshotZoom: state.solutionOverviewScreenshotZoom ?? 1,
      solutionOverviewScreenshotGrayscale: state.solutionOverviewScreenshotGrayscale ?? false,
      solutionOverviewCtaOption: state.solutionOverviewCtaOption || 'demo',
      solutionOverviewCtaUrl: state.solutionOverviewCtaUrl || '',
      solutionOverviewStat1Value: state.solutionOverviewStat1Value || '20+',
      solutionOverviewStat1Label: state.solutionOverviewStat1Label || 'Awards',
      solutionOverviewStat2Value: state.solutionOverviewStat2Value || '350+',
      solutionOverviewStat2Label: state.solutionOverviewStat2Label || 'Experts',
      solutionOverviewStat3Value: state.solutionOverviewStat3Value || '100%',
      solutionOverviewStat3Label: state.solutionOverviewStat3Label || 'Deployment',
      solutionOverviewStat4Value: state.solutionOverviewStat4Value || '2M+',
      solutionOverviewStat4Label: state.solutionOverviewStat4Label || 'End Users',
      solutionOverviewStat5Value: state.solutionOverviewStat5Value || '1.2K',
      solutionOverviewStat5Label: state.solutionOverviewStat5Label || 'Clients',
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

export function loadDraftFromStorage(): DraftState | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    if (!stored) return null

    const draft = JSON.parse(stored) as DraftState

    // Version check - if version mismatch, clear and return null
    if (draft.version !== CURRENT_VERSION) {
      clearDraft()
      return null
    }

    return draft
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    if (!stored) return false

    const draft = JSON.parse(stored) as DraftState

    // Check if draft has any actual content
    const hasAssets = draft.selectedAssets.length > 0 || Object.keys(draft.generatedAssets).length > 0
    const hasQueue = draft.exportQueue.length > 0
    const hasContent = draft.verbatimCopy.headline.length > 0 || draft.verbatimCopy.body.length > 0
    // Check for FAQ content (has pages with blocks)
    const hasFaqContent = draft.faqPages && draft.faqPages.length > 0 && draft.faqPages.some(p => p.blocks.length > 0)
    // Check for Solution Overview content (templateType or currentScreen indicates SO, or has custom content)
    const isSolutionOverview = draft.templateType === 'solution-overview-pdf' ||
      draft.currentScreen === 'solution-overview-export' ||
      draft.currentScreen === 'solution-overview-setup'
    const hasCustomSolutionOverviewName = !!(draft.solutionOverviewSolutionName && draft.solutionOverviewSolutionName !== 'Solution Name Goes Here')
    const hasSolutionOverviewContent = isSolutionOverview || hasCustomSolutionOverviewName

    return hasAssets || hasQueue || hasContent || hasFaqContent || hasSolutionOverviewContent
  } catch {
    return false
  }
}

export function getDraftAssetCount(): number {
  if (typeof window === 'undefined') return 0

  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    if (!stored) return 0

    const draft = JSON.parse(stored) as DraftState
    const generatedCount = Object.keys(draft.generatedAssets).length
    const selectedCount = draft.selectedAssets.length
    const queueCount = draft.exportQueue.length

    // If queue has items, show queue count only (selectedAssets is stale context)
    // Otherwise show the active editing count
    return queueCount > 0 ? queueCount : Math.max(generatedCount, selectedCount)
  } catch {
    return 0
  }
}
