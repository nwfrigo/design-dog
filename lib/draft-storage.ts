'use client'

import type { TemplateType, CopyContent, ManualAssetSettings, QueuedAsset, ThumbnailImageSettings, FaqPage, SolutionCategory, SolutionOverviewPage, SolutionOverviewCtaOption, AppScreen, SolutionOverviewBenefit, SolutionOverviewFeature, StackerModule, StackerLogoChipModule, StackerHeaderModule, StackerFooterModule, CarouselSlide, LogoColor, ColorStyle, HeadingSize, TextAlignment, CtaStyle, ImageLayout, NewsletterImageSize, GridDetailType, SpeakerCount, ImageVariant, WebinarVariant, EventListingVariant, CustomerLibraryVariant, FloatingBannerVariant, FloatingBannerMobileVariant, FloatingBannerMobileArrowType, NewsletterTopBannerVariant, TemplateTheme, StackAlign, CustomSizeDocument, ExecutiveOverviewDocument } from '@/types'
import { UNIVERSAL_FALLBACK_FLAGS } from './template-defaults'

const DRAFT_KEY = 'design-dog-active-draft'

/**
 * Multi-draft store: each identity keeps a LIST of drafts (a draft = a
 * project), newest first, under `design-dog-drafts::<name>`. A fresh project
 * gets a fresh id (the store assigns one when the user leaves the template
 * picker); auto-save upserts the entry for the ACTIVE id, so parallel drafts
 * no longer overwrite each other. Capped at MAX_DRAFTS, oldest falls off.
 *
 * Identity comes straight from localStorage (`design-dog-user`) so this stays
 * a pure lib module. Migration adopts both earlier shapes — the original
 * single bare key and the interim per-user single key — into the list so
 * nobody loses in-flight work.
 */
export type DraftEntry = { id: string; draft: DraftState }

const DRAFTS_KEY = 'design-dog-drafts'
const MAX_DRAFTS = 20

export function newDraftId(): string {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function draftsKey(): string {
  if (typeof window === 'undefined') return DRAFTS_KEY
  const user = localStorage.getItem('design-dog-user')
  return user ? `${DRAFTS_KEY}::${user}` : DRAFTS_KEY
}

function readEntries(): DraftEntry[] {
  if (typeof window === 'undefined') return []
  try {
    migrateLegacyDraft()
    const stored = localStorage.getItem(draftsKey())
    if (!stored) return []
    const parsed = JSON.parse(stored) as { entries?: DraftEntry[] }
    const entries = Array.isArray(parsed.entries) ? parsed.entries : []
    // Version-gate per entry — one stale draft shouldn't nuke the list.
    return entries
      .filter((e) => e && e.id && e.draft && e.draft.version === CURRENT_VERSION)
      .sort((a, b) => (b.draft.savedAt ?? 0) - (a.draft.savedAt ?? 0))
  } catch {
    return []
  }
}

function writeEntries(entries: DraftEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    const capped = entries
      .sort((a, b) => (b.draft.savedAt ?? 0) - (a.draft.savedAt ?? 0))
      .slice(0, MAX_DRAFTS)
    localStorage.setItem(draftsKey(), JSON.stringify({ entries: capped }))
  } catch (error) {
    console.error('Failed to write drafts:', error)
  }
}

function migrateLegacyDraft(): void {
  if (typeof window === 'undefined') return
  try {
    const listKey = draftsKey()
    if (localStorage.getItem(listKey) !== null) return
    const user = localStorage.getItem('design-dog-user')
    const candidates = [user ? `${DRAFT_KEY}::${user}` : null, DRAFT_KEY].filter(Boolean) as string[]
    for (const key of candidates) {
      const legacy = localStorage.getItem(key)
      if (!legacy) continue
      try {
        const draft = JSON.parse(legacy) as DraftState
        if (draft.version === CURRENT_VERSION) {
          localStorage.setItem(listKey, JSON.stringify({ entries: [{ id: newDraftId(), draft }] }))
        }
      } catch { /* unparseable legacy draft — drop it */ }
      localStorage.removeItem(key)
      return
    }
  } catch {
    /* migration is best-effort */
  }
}

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
  // Export queue
  exportQueue: QueuedAsset[]
  // Design settings
  eyebrow: string
  solution: string
  logoColor: LogoColor
  showEyebrow: boolean
  showHeadline: boolean
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
  gridDetail3Type: GridDetailType
  gridDetail3Text: string
  gridDetail4Type: GridDetailType
  gridDetail4Text: string
  showGridDetail3: boolean
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
  // Customer Library specific
  customerLibraryVariant: CustomerLibraryVariant
  // Website Floating Banner specific
  floatingBannerVariant: FloatingBannerVariant
  // Website Floating Banner Mobile specific
  floatingBannerMobileVariant: FloatingBannerMobileVariant
  floatingBannerMobileArrowType: FloatingBannerMobileArrowType
  // Newsletter Top Banner specific
  newsletterTopBannerVariant: NewsletterTopBannerVariant
  // Template theme
  theme: TemplateTheme
  // Image effects
  grayscale: boolean
  // Manual text size
  headlineFontSize?: number | null
  subheadFontSize?: number | null
  stackAlign: StackAlign
  // Bundled per-template gap overrides. Legacy per-template fields are
  // kept as optional so old localStorage drafts hydrate cleanly via the
  // store's migration shim; new saves only write `templateGaps`.
  templateGaps: Partial<Record<TemplateType, Record<string, number>>>
  emailDarkGradientGaps?: Record<string, number>
  emailSpeakersGaps?: Record<string, number>
  websitePressReleaseGaps?: Record<string, number>
  socialDarkGradientGaps?: Record<string, number>
  lineHeights: Record<string, number>
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
  faqBlockSpacing: Record<string, number>
  // Solution Overview PDF
  solutionOverviewSolution: SolutionCategory
  solutionOverviewSolutionName: string
  solutionOverviewTagline: string
  solutionOverviewCurrentPage: SolutionOverviewPage
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
  solutionOverviewCtaOption: SolutionOverviewCtaOption
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
  // Stacker PDF
  stackerDocumentTitle: string | null
  stackerSourceContent: string | null
  stackerLogoChipModule: StackerLogoChipModule
  stackerHeaderModule: StackerHeaderModule
  stackerContentModules: StackerModule[]
  stackerFooterModule: StackerFooterModule
  stackerModuleSpacing: Record<string, number>
  stackerFooterHidden: boolean
  stackerDarkMode: boolean
  // Social Carousel
  carouselSlides: CarouselSlide[]
  carouselCurrentSlideIndex: number
  // Custom Size
  customSizeDocument: CustomSizeDocument | null
  // Executive Overview
  executiveOverviewDocument: ExecutiveOverviewDocument | null
}

// Bumped to 2 for the 1.5 Auto-Create sunset — drafts saved against
// the prior shape carry now-removed fields (generatedAssets, autoCreate,
// etc.) and are cleared on next load.
const CURRENT_VERSION = 2

/** Draft-shape version, exported so export-time snapshots can be stamped with
 *  the shape they were captured under (My Work clone refuses a mismatch
 *  gracefully instead of restoring an incompatible shape). */
export const DRAFT_SHAPE_VERSION = CURRENT_VERSION

export function saveDraftToStorage(state: Partial<DraftState>, draftId?: string): void {
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
      exportQueue: state.exportQueue || [],
      // Text fields persist as-is (empty when unset). The template
      // renders the canonical placeholder via its own
      // `value || 'Canonical'` fallback — no fallback injected here.
      eyebrow: state.eyebrow ?? '',
      solution: state.solution || 'environmental',
      logoColor: state.logoColor || 'black',
      // Visibility flags fall back to UNIVERSAL canonical when the
      // saved field is undefined. Single source of truth.
      showEyebrow: state.showEyebrow ?? UNIVERSAL_FALLBACK_FLAGS.showEyebrow,
      showHeadline: state.showHeadline ?? UNIVERSAL_FALLBACK_FLAGS.showHeadline,
      showSubhead: state.showSubhead ?? UNIVERSAL_FALLBACK_FLAGS.showSubhead,
      showBody: state.showBody ?? UNIVERSAL_FALLBACK_FLAGS.showBody,
      thumbnailImageUrl: state.thumbnailImageUrl || null,
      thumbnailImageSettings: state.thumbnailImageSettings || {},
      subheading: state.subheading ?? '',
      showLightHeader: state.showLightHeader ?? UNIVERSAL_FALLBACK_FLAGS.showLightHeader,
      showSubheading: state.showSubheading ?? UNIVERSAL_FALLBACK_FLAGS.showSubheading,
      showSolutionSet: state.showSolutionSet ?? UNIVERSAL_FALLBACK_FLAGS.showSolutionSet,
      showGridDetail2: state.showGridDetail2 ?? UNIVERSAL_FALLBACK_FLAGS.showGridDetail2,
      gridDetail1Text: state.gridDetail1Text ?? '',
      gridDetail2Text: state.gridDetail2Text ?? '',
      gridDetail3Type: state.gridDetail3Type || 'cta',
      gridDetail3Text: state.gridDetail3Text ?? '',
      gridDetail4Type: state.gridDetail4Type || 'cta',
      gridDetail4Text: state.gridDetail4Text ?? '',
      showGridDetail3: state.showGridDetail3 ?? UNIVERSAL_FALLBACK_FLAGS.showGridDetail3,
      metadata: state.metadata ?? '',
      ctaText: state.ctaText ?? '',
      colorStyle: state.colorStyle || '1',
      headingSize: state.headingSize || 'L',
      alignment: state.alignment || 'left',
      ctaStyle: state.ctaStyle || 'link',
      showMetadata: state.showMetadata ?? UNIVERSAL_FALLBACK_FLAGS.showMetadata,
      showCta: state.showCta ?? UNIVERSAL_FALLBACK_FLAGS.showCta,
      layout: state.layout || 'even',
      newsletterImageSize: state.newsletterImageSize || 'none',
      speakerCount: state.speakerCount || 3,
      // Speaker text fields persist as-is. Templates render
      // 'Firstname Lastname' / 'Role, Company' canonical placeholders.
      speaker1Name: state.speaker1Name ?? '',
      speaker1Role: state.speaker1Role ?? '',
      speaker1ImageUrl: state.speaker1ImageUrl || '',
      speaker1ImagePosition: state.speaker1ImagePosition || { x: 0, y: 0 },
      speaker1ImageZoom: state.speaker1ImageZoom || 1,
      speaker2Name: state.speaker2Name ?? '',
      speaker2Role: state.speaker2Role ?? '',
      speaker2ImageUrl: state.speaker2ImageUrl || '',
      speaker2ImagePosition: state.speaker2ImagePosition || { x: 0, y: 0 },
      speaker2ImageZoom: state.speaker2ImageZoom || 1,
      speaker3Name: state.speaker3Name ?? '',
      speaker3Role: state.speaker3Role ?? '',
      speaker3ImageUrl: state.speaker3ImageUrl || '',
      speaker3ImagePosition: state.speaker3ImagePosition || { x: 0, y: 0 },
      speaker3ImageZoom: state.speaker3ImageZoom || 1,
      webinarVariant: state.webinarVariant || 'image',
      showSpeaker1: state.showSpeaker1 ?? UNIVERSAL_FALLBACK_FLAGS.showSpeaker1,
      showSpeaker2: state.showSpeaker2 ?? UNIVERSAL_FALLBACK_FLAGS.showSpeaker2,
      showSpeaker3: state.showSpeaker3 ?? UNIVERSAL_FALLBACK_FLAGS.showSpeaker3,
      ebookVariant: state.ebookVariant || 'image',
      reportVariant: state.reportVariant || 'image',
      eventListingVariant: state.eventListingVariant || 'orange',
      customerLibraryVariant: state.customerLibraryVariant || 'dark',
      floatingBannerVariant: state.floatingBannerVariant || 'dark',
      floatingBannerMobileVariant: state.floatingBannerMobileVariant || 'light',
      floatingBannerMobileArrowType: state.floatingBannerMobileArrowType || 'text',
      newsletterTopBannerVariant: state.newsletterTopBannerVariant || 'dark',
      theme: state.theme || 'light',
      grayscale: state.grayscale ?? false,
      headlineFontSize: state.headlineFontSize ?? null,
      subheadFontSize: state.subheadFontSize ?? null,
      stackAlign: state.stackAlign ?? 'top',
      templateGaps: state.templateGaps ?? {},
      lineHeights: state.lineHeights ?? {},
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
      faqBlockSpacing: state.faqBlockSpacing ?? {},
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
      // Stacker PDF
      stackerDocumentTitle: state.stackerDocumentTitle || null,
      stackerSourceContent: state.stackerSourceContent ?? null,
      stackerLogoChipModule: state.stackerLogoChipModule || {
        id: 'logo-chip-default',
        type: 'logo-chip',
        showChips: true,
        activeCategories: ['safety'],
      },
      stackerHeaderModule: state.stackerHeaderModule || {
        id: 'header-default',
        type: 'header',
        heading: 'Document Title',
        headingSize: 'h1',
        subheader: '',
        showSubheader: false,
        cta: 'Learn More',
        ctaUrl: '',
        showCta: false,
      },
      stackerContentModules: state.stackerContentModules || [],
      stackerFooterModule: state.stackerFooterModule || {
        id: 'footer-default',
        type: 'footer',
        stat1Value: '27,000+',
        stat1Label: 'customers across the globe',
        stat2Value: '2M+',
        stat2Label: 'end users across the globe',
        stat3Value: '6B+',
        stat3Label: 'safety interactions processed',
        stat4Value: '350+',
        stat4Label: 'experts ready to help',
        stat5Value: '80+',
        stat5Label: 'countries using our solutions',
      },
      stackerModuleSpacing: state.stackerModuleSpacing || {},
      stackerFooterHidden: state.stackerFooterHidden ?? false,
      stackerDarkMode: state.stackerDarkMode ?? false,
      // Social Carousel
      carouselSlides: state.carouselSlides || [],
      carouselCurrentSlideIndex: state.carouselCurrentSlideIndex ?? 0,
      // Custom Size
      customSizeDocument: state.customSizeDocument ?? null,
      // Executive Overview
      executiveOverviewDocument: state.executiveOverviewDocument ?? null,
    }

    // Upsert into the multi-draft list. No id (legacy caller) → update the
    // newest entry, creating one if the list is empty.
    const entries = readEntries()
    const id = draftId ?? entries[0]?.id ?? newDraftId()
    const idx = entries.findIndex((e) => e.id === id)
    if (idx >= 0) entries[idx] = { id, draft }
    else entries.unshift({ id, draft })
    writeEntries(entries)
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

/** Newest draft (banner + legacy callers). */
export function loadDraftFromStorage(): DraftState | null {
  return readEntries()[0]?.draft ?? null
}

/** All of this identity's drafts, newest first (My Work sidebar). */
export function listDrafts(): DraftEntry[] {
  return readEntries()
}

export function loadDraftById(id: string): DraftState | null {
  return readEntries().find((e) => e.id === id)?.draft ?? null
}

export function deleteDraftById(id: string): void {
  writeEntries(readEntries().filter((e) => e.id !== id))
}

/** Id of the newest draft — what the banner's Start Over targets. */
export function newestDraftId(): string | null {
  return readEntries()[0]?.id ?? null
}

/** Legacy signature: clears the NEWEST draft (the one the banner shows).
 *  Sidebar deletes pass an explicit id via deleteDraftById. */
export function clearDraft(): void {
  const newest = readEntries()[0]
  if (newest) deleteDraftById(newest.id)
}

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const draft = readEntries()[0]?.draft
    if (!draft) return false

    // Check if draft has any actual content
    const hasAssets = draft.selectedAssets.length > 0
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
    // Check for Stacker content (has content modules or custom title)
    const isStacker = draft.templateType === 'stacker-pdf' ||
      draft.currentScreen === 'stacker-editor' ||
      draft.currentScreen === 'stacker-export' ||
      draft.currentScreen === 'stacker-setup'
    const hasStackerModules = !!(draft.stackerContentModules && draft.stackerContentModules.length > 0)
    const hasStackerTitle = !!(draft.stackerDocumentTitle && draft.stackerDocumentTitle !== null)
    const hasStackerContent = isStacker || hasStackerModules || hasStackerTitle
    // Check for Social Carousel content
    const isCarousel = draft.templateType === 'social-carousel' ||
      draft.currentScreen === 'social-carousel-editor'
    const hasCarouselSlides = !!(draft.carouselSlides && draft.carouselSlides.length > 0)
    const hasCarouselContent = isCarousel || hasCarouselSlides

    return hasAssets || hasQueue || hasContent || hasFaqContent || hasSolutionOverviewContent || hasStackerContent || hasCarouselContent
  } catch {
    return false
  }
}

export function getDraftAssetCount(): number {
  if (typeof window === 'undefined') return 0

  try {
    const draft = readEntries()[0]?.draft
    if (!draft) return 0
    const selectedCount = draft.selectedAssets.length
    const queueCount = draft.exportQueue.length

    // If queue has items, show queue count only (selectedAssets is stale context)
    // Otherwise show the active editing count
    return queueCount > 0 ? queueCount : selectedCount
  } catch {
    return 0
  }
}
