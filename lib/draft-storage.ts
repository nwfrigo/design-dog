'use client'

import type { TemplateType, CopyContent, GeneratedAsset, AutoCreateState, QueuedAsset, ThumbnailImageSettings } from '@/types'

const DRAFT_KEY = 'design-dog-active-draft'

export interface DraftState {
  version: number
  savedAt: number
  // Editor state
  selectedAssets: TemplateType[]
  currentAssetIndex: number
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
  // Website Event Listing specific
  eventListingVariant: 'orange' | 'light' | 'dark-gradient'
  // Image effects
  grayscale: boolean
  generatedVariations: { headlines: string[]; ctas: string[] } | null
}

const CURRENT_VERSION = 1

export function saveDraftToStorage(state: Partial<DraftState>): void {
  if (typeof window === 'undefined') return

  try {
    const draft: DraftState = {
      version: CURRENT_VERSION,
      savedAt: Date.now(),
      selectedAssets: state.selectedAssets || [],
      currentAssetIndex: state.currentAssetIndex || 0,
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
      eventListingVariant: state.eventListingVariant || 'orange',
      grayscale: state.grayscale ?? false,
      generatedVariations: state.generatedVariations || null,
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

    return hasAssets || hasQueue || hasContent
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

    return Math.max(generatedCount, selectedCount) + queueCount
  } catch {
    return 0
  }
}
