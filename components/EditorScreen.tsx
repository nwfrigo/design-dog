'use client'

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import { useStore } from '@/store'
import { WebsiteThumbnail } from './templates/WebsiteThumbnail'
import { WebsitePressRelease } from './templates/WebsitePressRelease'
import { WebsiteWebinar } from './templates/WebsiteWebinar'
import { WebsiteEventListing } from './templates/WebsiteEventListing'
import { EmailGrid, type GridDetail } from './templates/EmailGrid'
import { EmailImage } from './templates/EmailImage'
import { SocialDarkGradient } from './templates/SocialDarkGradient'
import { EmailDarkGradient } from './templates/EmailDarkGradient'
import { EmailSpeakers } from './templates/EmailSpeakers'
import { SocialBlueGradient } from './templates/SocialBlueGradient'
import { SocialImage } from './templates/SocialImage'
import { SocialGridDetail, type GridDetailRow } from './templates/SocialGridDetail'
import { NewsletterDarkGradient } from './templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from './templates/NewsletterBlueGradient'
import { NewsletterLight } from './templates/NewsletterLight'
import { NewsletterTopBanner } from './templates/NewsletterTopBanner'
import { WebsiteReport } from './templates/WebsiteReport'
import { WebsiteFloatingBanner } from './templates/WebsiteFloatingBanner'
import { WebsiteFloatingBannerMobile } from './templates/WebsiteFloatingBannerMobile'
import { Page1Cover, Page2Body, Page3BenefitsFeatures } from './templates/SolutionOverviewPdf'
import { solutionCategories, heroImages, ctaOptions, benefitIcons, type SolutionCategory } from '@/config/solution-overview-assets'
import { ImageLibraryModal } from './ImageLibraryModal'
import { SolutionOverviewImageLibraryModal } from './SolutionOverviewImageLibraryModal'
import { IconPickerModal, getIconByName } from './IconPickerModal'
import { TemplateRenderer, PreviewModal } from './TemplateTile'
import { ZoomableImage } from './ZoomableImage'
import { ImageCropModal } from './ImageCropModal'
import type { TemplateInfo } from '@/lib/template-config'
import {
  fetchColorsConfig,
  fetchTypographyConfig,
  type ColorsConfig,
  type TypographyConfig
} from '@/lib/brand-config'
import { CHANNELS, TEMPLATE_DIMENSIONS, TEMPLATE_LABELS } from '@/lib/template-config'
import type { TemplateType } from '@/types'

// Eye icon for visibility toggle
function EyeIcon({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        visible ? 'text-gray-500' : 'text-gray-300'
      }`}
      title={visible ? 'Hide in preview' : 'Show in preview'}
    >
      {visible ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
    </button>
  )
}

export function EditorScreen() {
  const {
    selectedAssets,
    setSelectedAssets,
    currentAssetIndex,
    goToAsset,
    reset,
    setCurrentScreen,
    // Content
    contentMode,
    setContentMode,
    verbatimCopy,
    setVerbatimCopy,
    generationContext,
    setGenerationContext,
    pdfContent,
    setPdfContent,
    contextFile,
    setContextFile,
    finalCopy,
    setFinalCopy,
    setGeneratedVariations,
    isGenerating,
    setIsGenerating,
    // Shared settings
    thumbnailImageUrl,
    setThumbnailImageUrl,
    // Per-template image settings
    thumbnailImageSettings,
    setThumbnailImageSettings,
    getThumbnailImageSettings,
    eyebrow,
    setEyebrow,
    solution,
    setSolution,
    logoColor,
    setLogoColor,
    showEyebrow,
    setShowEyebrow,
    showSubhead,
    setShowSubhead,
    showBody,
    setShowBody,
    // Email Grid specific
    subheading,
    setSubheading,
    showLightHeader,
    setShowLightHeader,
    showSubheading,
    setShowSubheading,
    showSolutionSet,
    setShowSolutionSet,
    showGridDetail2,
    setShowGridDetail2,
    gridDetail1Text,
    setGridDetail1Text,
    gridDetail2Text,
    setGridDetail2Text,
    gridDetail3Type,
    setGridDetail3Type,
    gridDetail3Text,
    setGridDetail3Text,
    // Social Dark Gradient specific
    metadata,
    setMetadata,
    ctaText,
    setCtaText,
    colorStyle,
    setColorStyle,
    headingSize,
    setHeadingSize,
    alignment,
    setAlignment,
    ctaStyle,
    setCtaStyle,
    showMetadata,
    setShowMetadata,
    showCta,
    setShowCta,
    // Social Image specific
    layout,
    setLayout,
    // Newsletter Dark Gradient specific
    newsletterImageSize,
    setNewsletterImageSize,
    newsletterImageUrl,
    setNewsletterImageUrl,
    newsletterImagePosition,
    setNewsletterImagePosition,
    newsletterImageZoom,
    setNewsletterImageZoom,
    // Social Grid Detail specific
    gridDetail4Type,
    setGridDetail4Type,
    gridDetail4Text,
    setGridDetail4Text,
    showRow3,
    setShowRow3,
    showRow4,
    setShowRow4,
    // Email Speakers specific
    speakerCount,
    setSpeakerCount,
    speaker1Name,
    setSpeaker1Name,
    speaker1Role,
    setSpeaker1Role,
    speaker1ImageUrl,
    setSpeaker1ImageUrl,
    speaker1ImagePosition,
    setSpeaker1ImagePosition,
    speaker1ImageZoom,
    setSpeaker1ImageZoom,
    speaker2Name,
    setSpeaker2Name,
    speaker2Role,
    setSpeaker2Role,
    speaker2ImageUrl,
    setSpeaker2ImageUrl,
    speaker2ImagePosition,
    setSpeaker2ImagePosition,
    speaker2ImageZoom,
    setSpeaker2ImageZoom,
    speaker3Name,
    setSpeaker3Name,
    speaker3Role,
    setSpeaker3Role,
    speaker3ImageUrl,
    setSpeaker3ImageUrl,
    speaker3ImagePosition,
    setSpeaker3ImagePosition,
    speaker3ImageZoom,
    setSpeaker3ImageZoom,
    // Website Webinar
    webinarVariant,
    setWebinarVariant,
    showSpeaker1,
    showSpeaker2,
    showSpeaker3,
    setShowSpeaker1,
    setShowSpeaker2,
    setShowSpeaker3,
    // Website eBook Listing
    ebookVariant,
    setEbookVariant,
    // Website Report
    reportVariant,
    setReportVariant,
    // Website Event Listing
    eventListingVariant,
    setEventListingVariant,
    // Website Floating Banner
    floatingBannerVariant,
    setFloatingBannerVariant,
    // Website Floating Banner Mobile
    floatingBannerMobileVariant,
    setFloatingBannerMobileVariant,
    floatingBannerMobileArrowType,
    setFloatingBannerMobileArrowType,
    // Newsletter Top Banner
    newsletterTopBannerVariant,
    setNewsletterTopBannerVariant,
    // Image effects
    grayscale,
    setGrayscale,
    // Solution Overview PDF - Page 1
    solutionOverviewSolution,
    setSolutionOverviewSolution,
    solutionOverviewSolutionName,
    setSolutionOverviewSolutionName,
    solutionOverviewTagline,
    setSolutionOverviewTagline,
    solutionOverviewCurrentPage,
    setSolutionOverviewCurrentPage,
    // Solution Overview PDF - Page 2
    solutionOverviewHeroImageId,
    setSolutionOverviewHeroImageId,
    solutionOverviewHeroImageUrl,
    setSolutionOverviewHeroImageUrl,
    solutionOverviewHeroImagePosition,
    setSolutionOverviewHeroImagePosition,
    solutionOverviewHeroImageZoom,
    setSolutionOverviewHeroImageZoom,
    solutionOverviewHeroImageGrayscale,
    setSolutionOverviewHeroImageGrayscale,
    solutionOverviewPage2Header,
    setSolutionOverviewPage2Header,
    solutionOverviewSectionHeader,
    setSolutionOverviewSectionHeader,
    solutionOverviewIntroParagraph,
    setSolutionOverviewIntroParagraph,
    solutionOverviewKeySolutions,
    setSolutionOverviewKeySolution,
    solutionOverviewQuoteText,
    setSolutionOverviewQuoteText,
    solutionOverviewQuoteName,
    setSolutionOverviewQuoteName,
    solutionOverviewQuoteTitle,
    setSolutionOverviewQuoteTitle,
    solutionOverviewQuoteCompany,
    setSolutionOverviewQuoteCompany,
    // Solution Overview PDF specific - Page 3
    solutionOverviewBenefits,
    setSolutionOverviewBenefit,
    addSolutionOverviewBenefit,
    removeSolutionOverviewBenefit,
    solutionOverviewFeatures,
    setSolutionOverviewFeature,
    addSolutionOverviewFeature,
    removeSolutionOverviewFeature,
    solutionOverviewScreenshotUrl,
    setSolutionOverviewScreenshotUrl,
    solutionOverviewScreenshotPosition,
    setSolutionOverviewScreenshotPosition,
    solutionOverviewScreenshotZoom,
    setSolutionOverviewScreenshotZoom,
    solutionOverviewScreenshotGrayscale,
    setSolutionOverviewScreenshotGrayscale,
    solutionOverviewCtaOption,
    setSolutionOverviewCtaOption,
    solutionOverviewCtaUrl,
    setSolutionOverviewCtaUrl,
    // Queue
    addToQueue,
    exportQueue,
    goToQueue,
    // Edit from queue
    editingQueueItemId,
    saveQueuedAssetEdit,
    cancelQueueEdit,
    // Template type fallback
    templateType,
    // Generated assets (for auto-create mode detection)
    generatedAssets,
  } = useStore()

  // Check if we're in auto-create mode (sidebar handles navigation, not tabs)
  const isAutoCreateMode = Object.keys(generatedAssets).length > 0

  // Check if we're editing an item from the queue
  const isEditingFromQueue = !!editingQueueItemId

  // Brand config state
  const [colorsConfig, setColorsConfig] = useState<ColorsConfig | null>(null)
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  // Export state
  const [exportScale, setExportScale] = useState(2)
  const [showScaleDropdown, setShowScaleDropdown] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [isImageDragging, setIsImageDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Add asset modal state
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [pendingAssets, setPendingAssets] = useState<TemplateType[]>([])
  const [modalExpandedChannels, setModalExpandedChannels] = useState<Set<string>>(new Set(['email']))
  const [modalPreviewTemplate, setModalPreviewTemplate] = useState<TemplateInfo | null>(null)

  // Image library modal state
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [activeSpeakerForImage, setActiveSpeakerForImage] = useState<1 | 2 | 3 | null>(null)
  const [selectingNewsletterImage, setSelectingNewsletterImage] = useState(false)

  // Solution Overview hero image library modal state
  const [showHeroImageLibrary, setShowHeroImageLibrary] = useState(false)

  // Icon library modal state for benefit icons
  const [showIconLibrary, setShowIconLibrary] = useState(false)
  const [activeBenefitForIcon, setActiveBenefitForIcon] = useState<number | null>(null)

  // Image crop modal state
  const [showCropModal, setShowCropModal] = useState(false)
  const [showNewsletterCropModal, setShowNewsletterCropModal] = useState(false)
  const [showSOHeroCropModal, setShowSOHeroCropModal] = useState(false)
  const [showSOScreenshotCropModal, setShowSOScreenshotCropModal] = useState(false)

  // Queue feedback state
  const [showQueuedFeedback, setShowQueuedFeedback] = useState(false)

  // Cancel confirmation modal state (for edit-from-queue mode)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // PDF preview zoom and fullscreen state
  const [pdfPreviewZoom, setPdfPreviewZoom] = useState(150)
  const [showPdfFullscreen, setShowPdfFullscreen] = useState(false)
  const [showPdfAllPagesPreview, setShowPdfAllPagesPreview] = useState(false)

  // Floating banner preview container ref and width for responsive scaling
  const floatingBannerContainerRef = useRef<HTMLDivElement>(null)
  const [floatingBannerContainerWidth, setFloatingBannerContainerWidth] = useState(0)

  // In auto-create mode, use templateType directly (sidebar handles selection)
  // In regular mode, use selectedAssets array with tabs
  const currentTemplate = isAutoCreateMode ? templateType : (selectedAssets[currentAssetIndex] || templateType)
  const dimensions = TEMPLATE_DIMENSIONS[currentTemplate] || { width: 1200, height: 628 }

  // Get per-template image settings for the current template
  const currentImageSettings = getThumbnailImageSettings(currentTemplate)
  const thumbnailImagePosition = currentImageSettings.position
  const thumbnailImageZoom = currentImageSettings.zoom

  // Calculate preview scale for large templates
  const getPreviewScale = () => {
    if (currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-grid-detail') {
      return 0.6 // Scale down 1200px to ~720px
    }
    if (currentTemplate === 'website-floating-banner') {
      // Use responsive scale based on measured container width (minus padding)
      if (floatingBannerContainerWidth > 0) {
        const availableWidth = floatingBannerContainerWidth - 48 // Account for p-6 padding (24px * 2)
        return availableWidth / 2256
      }
      return 0.28 // Fallback scale
    }
    return 1
  }
  const previewScale = getPreviewScale()

  // Load brand config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const [colors, typography] = await Promise.all([
          fetchColorsConfig(),
          fetchTypographyConfig(),
        ])
        setColorsConfig(colors)
        setTypographyConfig(typography)
      } catch (error) {
        console.error('Failed to load brand config:', error)
      } finally {
        setConfigLoading(false)
      }
    }
    loadConfig()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowScaleDropdown(false)
    if (showScaleDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showScaleDropdown])

  // Measure floating banner container width for responsive scaling
  // useLayoutEffect ensures measurement happens before paint
  useLayoutEffect(() => {
    if (currentTemplate !== 'website-floating-banner') return

    const container = floatingBannerContainerRef.current
    if (!container) return

    const updateWidth = () => {
      const width = container.clientWidth
      console.log('Floating banner container width:', width)
      setFloatingBannerContainerWidth(width)
    }

    // Initial measurement
    updateWidth()

    // Observe resize
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [currentTemplate])

  // ESC key handler for PDF fullscreen/preview modes
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPdfFullscreen) setShowPdfFullscreen(false)
        if (showPdfAllPagesPreview) setShowPdfAllPagesPreview(false)
      }
    }
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [showPdfFullscreen, showPdfAllPagesPreview])

  // Handle file upload for context - uses Vercel Blob to bypass serverless size limits
  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setUploadError('Only PDF files are supported')
      return
    }

    // Check file size (25MB limit for Claude's document API)
    const maxFileSizeMB = 25
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      const actualSizeMB = (file.size / 1024 / 1024).toFixed(1)
      setUploadError(`File too large (${actualSizeMB}MB). Maximum size is ${maxFileSizeMB}MB. Try compressing your PDF or provide key details manually.`)
      return
    }

    setUploadError(null)
    setIsUploading(true)
    setContextFile(file)

    try {
      // Step 1: Upload PDF directly to Vercel Blob (bypasses serverless function body limit)
      const blob = await upload(`pdfs/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-pdf',
      })

      // Step 2: Analyze PDF using the blob URL
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl: blob.url, fileSize: file.size }),
      })

      const data = await response.json()

      if (response.ok) {
        // Build context string from extracted content
        const extracted = data.extracted
        if (extracted) {
          let contextParts = []
          if (extracted.title) contextParts.push(`Title: ${extracted.title}`)
          if (extracted.mainMessage) contextParts.push(`Main Message: ${extracted.mainMessage}`)
          if (extracted.keyPoints?.length > 0) contextParts.push(`Key Points:\n- ${extracted.keyPoints.join('\n- ')}`)
          if (extracted.callToAction) contextParts.push(`Call to Action: ${extracted.callToAction}`)
          if (extracted.rawSummary) contextParts.push(`\nDocument Summary:\n${extracted.rawSummary}`)
          setPdfContent(contextParts.join('\n\n'))
        } else {
          setPdfContent(data.text || `[Uploaded PDF: ${file.name}]`)
        }
      } else {
        throw new Error(data.error || 'Failed to analyze PDF')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      setContextFile(null)
      setPdfContent(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFileUpload(file)
  }, [])

  // Handle image upload for thumbnail - convert to data URL for export compatibility
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setThumbnailImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [setThumbnailImageUrl])

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsImageDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }, [handleImageUpload])

  const handleGenerate = async () => {
    if (!generationContext.trim() && !pdfContent) return

    setIsGenerating(true)
    setGenerationError(null)

    let fullContext = ''
    if (generationContext.trim()) {
      fullContext += `User notes: ${generationContext.trim()}\n\n`
    }
    if (pdfContent) {
      fullContext += `Document content:\n${pdfContent}`
    }

    // Get the current template type for copy constraints
    const templateType = selectedAssets[currentAssetIndex]

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: fullContext, templateType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      const generatedCopy = {
        headline: data.copy.headline,
        subhead: data.copy.subhead || '',
        body: data.copy.body || '',
        cta: data.copy.cta,
      }

      setFinalCopy(generatedCopy)
      setVerbatimCopy(generatedCopy)

      if (data.copy.variations) {
        setGeneratedVariations(data.copy.variations)
      }

      setContentMode('verbatim')
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const exportParams: Record<string, unknown> = {
        template: currentTemplate,
        scale: exportScale,
        eyebrow,
        headline: verbatimCopy.headline,
        subhead: verbatimCopy.subhead,
        body: verbatimCopy.body,
        solution,
        logoColor,
        showEyebrow,
      }

      if (currentTemplate === 'website-thumbnail') {
        exportParams.imageUrl = thumbnailImageUrl
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.variant = ebookVariant
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showCta = showCta
        exportParams.ctaText = ctaText
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'website-press-release') {
        exportParams.imageUrl = thumbnailImageUrl
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.ctaText = ctaText
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'website-event-listing') {
        exportParams.variant = eventListingVariant
        exportParams.gridDetail1Text = gridDetail1Text
        exportParams.gridDetail2Text = gridDetail2Text
        exportParams.gridDetail3Text = gridDetail3Text
        exportParams.gridDetail4Text = gridDetail4Text
        exportParams.showRow3 = showRow3
        exportParams.showRow4 = showRow4
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.ctaText = ctaText
      } else if (currentTemplate === 'email-grid') {
        exportParams.subheading = subheading
        exportParams.showLightHeader = showLightHeader
        exportParams.showHeavyHeader = false
        exportParams.showSubheading = showSubheading
        exportParams.showBody = showBody
        exportParams.showSolutionSet = showSolutionSet
        exportParams.showGridDetail2 = showGridDetail2
        exportParams.gridDetail1Type = 'data'
        exportParams.gridDetail1Text = gridDetail1Text
        exportParams.gridDetail2Type = 'data'
        exportParams.gridDetail2Text = gridDetail2Text
        exportParams.gridDetail3Type = gridDetail3Type
        exportParams.gridDetail3Text = gridDetail3Text
      } else if (currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient') {
        exportParams.metadata = metadata
        exportParams.ctaText = ctaText
        exportParams.colorStyle = colorStyle
        exportParams.headingSize = headingSize
        exportParams.alignment = alignment
        exportParams.ctaStyle = ctaStyle
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showMetadata = showMetadata
        exportParams.showCta = showCta
      } else if (currentTemplate === 'social-image') {
        exportParams.metadata = metadata
        exportParams.ctaText = ctaText
        exportParams.imageUrl = thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.layout = layout
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showMetadata = showMetadata
        exportParams.showCta = showCta
        exportParams.showSolutionSet = showSolutionSet
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'social-grid-detail') {
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showSolutionSet = showSolutionSet
        exportParams.gridDetail1Text = gridDetail1Text
        exportParams.gridDetail2Text = gridDetail2Text
        exportParams.gridDetail3Type = gridDetail3Type
        exportParams.gridDetail3Text = gridDetail3Text
        exportParams.gridDetail4Type = gridDetail4Type
        exportParams.gridDetail4Text = gridDetail4Text
        exportParams.showRow3 = showRow3
        exportParams.showRow4 = showRow4
      } else if (currentTemplate === 'email-image') {
        exportParams.ctaText = ctaText
        exportParams.imageUrl = thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.layout = layout
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.showSolutionSet = showSolutionSet
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'email-dark-gradient') {
        exportParams.ctaText = ctaText
        exportParams.colorStyle = colorStyle
        exportParams.alignment = alignment
        exportParams.ctaStyle = ctaStyle
        exportParams.showEyebrow = showEyebrow && !!eyebrow
        exportParams.showSubheading = showSubhead && !!verbatimCopy.subhead
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
      } else if (currentTemplate === 'email-speakers') {
        exportParams.ctaText = ctaText
        exportParams.showEyebrow = showEyebrow && !!eyebrow
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.showSolutionSet = showSolutionSet
        exportParams.speakerCount = speakerCount
        exportParams.speaker1Name = speaker1Name
        exportParams.speaker1Role = speaker1Role
        exportParams.speaker1ImageUrl = speaker1ImageUrl
        exportParams.speaker1ImagePositionX = speaker1ImagePosition.x
        exportParams.speaker1ImagePositionY = speaker1ImagePosition.y
        exportParams.speaker1ImageZoom = speaker1ImageZoom
        exportParams.speaker2Name = speaker2Name
        exportParams.speaker2Role = speaker2Role
        exportParams.speaker2ImageUrl = speaker2ImageUrl
        exportParams.speaker2ImagePositionX = speaker2ImagePosition.x
        exportParams.speaker2ImagePositionY = speaker2ImagePosition.y
        exportParams.speaker2ImageZoom = speaker2ImageZoom
        exportParams.speaker3Name = speaker3Name
        exportParams.speaker3Role = speaker3Role
        exportParams.speaker3ImageUrl = speaker3ImageUrl
        exportParams.speaker3ImagePositionX = speaker3ImagePosition.x
        exportParams.speaker3ImagePositionY = speaker3ImagePosition.y
        exportParams.speaker3ImageZoom = speaker3ImageZoom
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'newsletter-dark-gradient' || currentTemplate === 'newsletter-blue-gradient') {
        exportParams.ctaText = ctaText
        exportParams.colorStyle = colorStyle
        exportParams.imageSize = newsletterImageSize
        exportParams.newsletterImageUrl = newsletterImageUrl
        exportParams.newsletterImagePositionX = newsletterImagePosition.x
        exportParams.newsletterImagePositionY = newsletterImagePosition.y
        exportParams.newsletterImageZoom = newsletterImageZoom
        exportParams.showEyebrow = showEyebrow && !!eyebrow
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'newsletter-light') {
        exportParams.ctaText = ctaText
        exportParams.imageSize = newsletterImageSize
        exportParams.newsletterImageUrl = newsletterImageUrl
        exportParams.newsletterImagePositionX = newsletterImagePosition.x
        exportParams.newsletterImagePositionY = newsletterImagePosition.y
        exportParams.newsletterImageZoom = newsletterImageZoom
        exportParams.showEyebrow = showEyebrow && !!eyebrow
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'newsletter-top-banner') {
        exportParams.variant = newsletterTopBannerVariant
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
      } else if (currentTemplate === 'website-report') {
        exportParams.imageUrl = thumbnailImageUrl
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.variant = reportVariant
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showCta = showCta
        exportParams.ctaText = ctaText
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'website-webinar') {
        exportParams.variant = webinarVariant
        exportParams.imageUrl = thumbnailImageUrl
        exportParams.imagePositionX = thumbnailImagePosition.x
        exportParams.imagePositionY = thumbnailImagePosition.y
        exportParams.imageZoom = thumbnailImageZoom
        exportParams.showEyebrow = showEyebrow && !!eyebrow
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showBody = showBody && !!verbatimCopy.body
        exportParams.showCta = showCta
        exportParams.ctaText = ctaText
        exportParams.speakerCount = speakerCount
        exportParams.speaker1Name = speaker1Name
        exportParams.speaker1Role = speaker1Role
        exportParams.speaker1ImageUrl = speaker1ImageUrl
        exportParams.speaker1ImagePositionX = speaker1ImagePosition.x
        exportParams.speaker1ImagePositionY = speaker1ImagePosition.y
        exportParams.speaker1ImageZoom = speaker1ImageZoom
        exportParams.speaker2Name = speaker2Name
        exportParams.speaker2Role = speaker2Role
        exportParams.speaker2ImageUrl = speaker2ImageUrl
        exportParams.speaker2ImagePositionX = speaker2ImagePosition.x
        exportParams.speaker2ImagePositionY = speaker2ImagePosition.y
        exportParams.speaker2ImageZoom = speaker2ImageZoom
        exportParams.speaker3Name = speaker3Name
        exportParams.speaker3Role = speaker3Role
        exportParams.speaker3ImageUrl = speaker3ImageUrl
        exportParams.speaker3ImagePositionX = speaker3ImagePosition.x
        exportParams.speaker3ImagePositionY = speaker3ImagePosition.y
        exportParams.speaker3ImageZoom = speaker3ImageZoom
        exportParams.showSpeaker1 = showSpeaker1
        exportParams.showSpeaker2 = showSpeaker2
        exportParams.showSpeaker3 = showSpeaker3
        exportParams.grayscale = grayscale
      } else if (currentTemplate === 'website-floating-banner') {
        exportParams.variant = floatingBannerVariant
        exportParams.cta = ctaText
      } else if (currentTemplate === 'website-floating-banner-mobile') {
        exportParams.variant = floatingBannerMobileVariant
        exportParams.arrowType = floatingBannerMobileArrowType
        exportParams.cta = ctaText
      } else if (currentTemplate === 'solution-overview-pdf') {
        // Page 1 params
        exportParams.solutionOverviewSolution = solutionOverviewSolution
        exportParams.solutionName = solutionOverviewSolutionName
        exportParams.tagline = solutionOverviewTagline
        exportParams.page = 'all' // Export all pages for PDF
        // Page 2 params
        exportParams.heroImageId = solutionOverviewHeroImageId
        exportParams.heroImageUrl = solutionOverviewHeroImageUrl
        exportParams.heroImagePositionX = solutionOverviewHeroImagePosition.x
        exportParams.heroImagePositionY = solutionOverviewHeroImagePosition.y
        exportParams.heroImageZoom = solutionOverviewHeroImageZoom
        exportParams.page2Header = solutionOverviewPage2Header
        exportParams.sectionHeader = solutionOverviewSectionHeader
        exportParams.introParagraph = solutionOverviewIntroParagraph
        exportParams.keySolutions = solutionOverviewKeySolutions
        exportParams.quoteText = solutionOverviewQuoteText
        exportParams.quoteName = solutionOverviewQuoteName
        exportParams.quoteTitle = solutionOverviewQuoteTitle
        exportParams.quoteCompany = solutionOverviewQuoteCompany
        // Page 3 params
        exportParams.benefits = solutionOverviewBenefits
        exportParams.features = solutionOverviewFeatures
        exportParams.screenshotUrl = solutionOverviewScreenshotUrl
        exportParams.screenshotPositionX = solutionOverviewScreenshotPosition.x
        exportParams.screenshotPositionY = solutionOverviewScreenshotPosition.y
        exportParams.screenshotZoom = solutionOverviewScreenshotZoom
        exportParams.ctaOption = solutionOverviewCtaOption
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportParams),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${currentTemplate}-${exportScale}x.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Loading state
  if (configLoading || !colorsConfig || !typographyConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading brand configuration...</div>
      </div>
    )
  }

  const solutionOptions = Object.entries(colorsConfig.solutions).map(([key, value]) => ({
    key,
    label: value.label,
    color: value.color,
  }))

  // Build grid details for EmailGrid
  const gridDetail1: GridDetail = { type: 'data', text: gridDetail1Text }
  const gridDetail2: GridDetail = { type: 'data', text: gridDetail2Text }
  const gridDetail3: GridDetail = { type: gridDetail3Type, text: gridDetail3Text }

  // Helper to get display label with numbering for duplicates
  const getAssetLabel = (assetType: TemplateType, index: number) => {
    // Special case for Solution Overview PDF - show dynamic name
    if (assetType === 'solution-overview-pdf') {
      return `Solution Overview - ${solutionOverviewSolutionName || 'Untitled'}`
    }

    const baseLabel = TEMPLATE_LABELS[assetType]
    const sameTypeCount = selectedAssets.filter(a => a === assetType).length
    if (sameTypeCount <= 1) return baseLabel

    // Find which occurrence this is (1st, 2nd, etc.)
    let occurrence = 0
    for (let i = 0; i <= index; i++) {
      if (selectedAssets[i] === assetType) occurrence++
    }
    return `${baseLabel} ${occurrence}`
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - only show in regular mode, not auto-create mode */}
      {!isAutoCreateMode && (
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {selectedAssets.map((asset, index) => (
              <button
                key={`${asset}-${index}`}
                onClick={() => goToAsset(index)}
                className={`px-4 py-2.5 text-sm font-medium border-t border-l border-r rounded-t-lg -mb-px transition-colors ${
                  index === currentAssetIndex
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } ${index > 0 ? '-ml-px' : ''}`}
              >
                {getAssetLabel(asset, index)}
              </button>
            ))}
            {/* Add Asset Button - hide for solution-overview-pdf */}
            {currentTemplate !== 'solution-overview-pdf' && (
              <button
                onClick={() => {
                  setPendingAssets([])
                  setShowAddAssetModal(true)
                }}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Add asset"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddAssetModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Assets</h3>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {CHANNELS.map((channel) => {
                  const hasTemplates = channel.templates.length > 0
                  if (!hasTemplates) return null

                  return (
                    <div key={channel.id}>
                      {/* Channel label */}
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {channel.label}
                      </h4>

                      {/* Template cards grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-4">
                        {channel.templates.map((template) => {
                          const isSelected = pendingAssets.includes(template.type)
                          const existingCount = selectedAssets.filter(a => a === template.type).length
                          const targetWidth = 200
                          const previewScale = targetWidth / template.width
                          const previewHeight = Math.round(template.height * previewScale)

                          return (
                            <div
                              key={template.type}
                              onClick={() => {
                                if (isSelected) {
                                  const idx = pendingAssets.indexOf(template.type)
                                  if (idx !== -1) {
                                    const newPending = [...pendingAssets]
                                    newPending.splice(idx, 1)
                                    setPendingAssets(newPending)
                                  }
                                } else {
                                  setPendingAssets([...pendingAssets, template.type])
                                }
                              }}
                              className={`
                                group relative flex flex-col rounded-lg overflow-hidden transition-all duration-200 cursor-pointer
                                border-[0.75px]
                                ${isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                }
                              `}
                            >
                              {/* Preview area */}
                              <div
                                className="relative overflow-hidden bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center"
                                style={{ height: previewHeight + 24, padding: 12 }}
                              >
                                {/* Scaled template preview */}
                                <div
                                  className="rounded overflow-hidden shadow-sm bg-white"
                                  style={{
                                    width: targetWidth,
                                    height: previewHeight,
                                    position: 'relative',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {colorsConfig && typographyConfig ? (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: template.width,
                                        height: template.height,
                                        transform: `scale(${previewScale})`,
                                        transformOrigin: 'top left',
                                      }}
                                    >
                                      <TemplateRenderer
                                        templateType={template.type}
                                        colors={colorsConfig}
                                        typography={typographyConfig}
                                        scale={1}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                                      style={{ width: targetWidth, height: previewHeight }}
                                    />
                                  )}
                                </div>

                                {/* Checkbox in top right corner */}
                                <div
                                  className={`
                                    absolute top-3 right-3 w-6 h-6 rounded cursor-pointer transition-all duration-150
                                    flex items-center justify-center
                                    ${isSelected
                                      ? 'bg-blue-500'
                                      : 'bg-gray-700/60 hover:bg-gray-600/80'
                                    }
                                  `}
                                >
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Info area */}
                              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium truncate block ${
                                    isSelected
                                      ? 'text-blue-700 dark:text-blue-300'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}>
                                    {template.label.replace(/^(Email|Social|Website|Newsletter)\s*-?\s*/, '')}
                                  </span>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                    {template.dimensions}
                                  </span>
                                  {existingCount > 0 && (
                                    <span className="text-[10px] text-blue-500 ml-2">
                                      ({existingCount} in project)
                                    </span>
                                  )}
                                </div>

                                {/* Preview button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setModalPreviewTemplate(template)
                                  }}
                                  className="flex-shrink-0 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400
                                    hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30
                                    rounded transition-colors"
                                >
                                  Preview
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingAssets.length > 0) {
                    const newAssets = [...selectedAssets, ...pendingAssets]
                    setSelectedAssets(newAssets)
                    goToAsset(selectedAssets.length)
                    setShowAddAssetModal(false)
                  }
                }}
                disabled={pendingAssets.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg
                  hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Add {pendingAssets.length > 0 ? `(${pendingAssets.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview for Add Asset Modal */}
      {modalPreviewTemplate && colorsConfig && typographyConfig && (
        <PreviewModal
          template={modalPreviewTemplate}
          colors={colorsConfig}
          typography={typographyConfig}
          onClose={() => setModalPreviewTemplate(null)}
        />
      )}

      {/* Image Library Modal */}
      {showImageLibrary && (
        <ImageLibraryModal
          onSelect={(url) => {
            if (activeSpeakerForImage === 1) {
              setSpeaker1ImageUrl(url)
            } else if (activeSpeakerForImage === 2) {
              setSpeaker2ImageUrl(url)
            } else if (activeSpeakerForImage === 3) {
              setSpeaker3ImageUrl(url)
            } else if (selectingNewsletterImage) {
              setNewsletterImageUrl(url)
            } else {
              setThumbnailImageUrl(url)
            }
            setShowImageLibrary(false)
            setActiveSpeakerForImage(null)
            setSelectingNewsletterImage(false)
          }}
          onClose={() => {
            setShowImageLibrary(false)
            setActiveSpeakerForImage(null)
            setSelectingNewsletterImage(false)
          }}
        />
      )}

      {/* Solution Overview Hero Image Library Modal */}
      {showHeroImageLibrary && (
        <SolutionOverviewImageLibraryModal
          solution={solutionOverviewSolution}
          onSelect={(url) => {
            setSolutionOverviewHeroImageUrl(url)
            setShowHeroImageLibrary(false)
          }}
          onClose={() => setShowHeroImageLibrary(false)}
        />
      )}

      {/* Icon Picker Modal for benefit icons */}
      {showIconLibrary && (
        <IconPickerModal
          value={activeBenefitForIcon !== null ? solutionOverviewBenefits[activeBenefitForIcon]?.icon : undefined}
          onChange={(iconName) => {
            if (activeBenefitForIcon !== null) {
              const benefit = solutionOverviewBenefits[activeBenefitForIcon]
              if (benefit) {
                setSolutionOverviewBenefit(activeBenefitForIcon, { ...benefit, icon: iconName })
              }
            }
            setShowIconLibrary(false)
            setActiveBenefitForIcon(null)
          }}
          onClose={() => {
            setShowIconLibrary(false)
            setActiveBenefitForIcon(null)
          }}
        />
      )}

      {/* Image Crop Modal */}
      {thumbnailImageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={thumbnailImageUrl}
          // Frame dimensions based on current template and layout
          // These match the actual image container dimensions in each template
          frameWidth={
            currentTemplate === 'website-thumbnail' ? 320 :
            currentTemplate === 'email-image' ? (layout === 'even' ? 250 : layout === 'more-image' ? 320 : 180) :
            currentTemplate === 'social-image' ? (layout === 'even' ? 488 : layout === 'more-image' ? 600 : 376) :
            currentTemplate === 'website-webinar' ? 333 :
            currentTemplate === 'website-press-release' ? 338 :
            currentTemplate === 'website-report' ? 320 :
            320 // default
          }
          frameHeight={
            currentTemplate === 'website-thumbnail' ? 386 :
            currentTemplate === 'email-image' ? 300 :
            currentTemplate === 'social-image' ? 628 :
            currentTemplate === 'website-webinar' ? 450 :
            currentTemplate === 'website-press-release' ? 450 :
            currentTemplate === 'website-report' ? 386 :
            300 // default
          }
          initialPosition={thumbnailImagePosition}
          initialZoom={thumbnailImageZoom}
          onSave={(position, zoom) => {
            setThumbnailImageSettings(currentTemplate, { position, zoom })
          }}
        />
      )}

      {/* Newsletter Image Crop Modal */}
      {newsletterImageUrl && (
        <ImageCropModal
          isOpen={showNewsletterCropModal}
          onClose={() => setShowNewsletterCropModal(false)}
          imageSrc={newsletterImageUrl}
          // Frame dimensions based on newsletter image size
          frameWidth={newsletterImageSize === 'small' ? 234 : 317}
          frameHeight={newsletterImageSize === 'small' ? 132 : 179}
          initialPosition={newsletterImagePosition}
          initialZoom={newsletterImageZoom}
          onSave={(position, zoom) => {
            setNewsletterImagePosition(position)
            setNewsletterImageZoom(zoom)
          }}
        />
      )}

      {/* Solution Overview Hero Image Crop Modal */}
      {solutionOverviewHeroImageUrl && (
        <ImageCropModal
          isOpen={showSOHeroCropModal}
          onClose={() => setShowSOHeroCropModal(false)}
          imageSrc={solutionOverviewHeroImageUrl}
          frameWidth={382}
          frameHeight={180}
          initialPosition={solutionOverviewHeroImagePosition}
          initialZoom={solutionOverviewHeroImageZoom}
          onSave={(position, zoom) => {
            setSolutionOverviewHeroImagePosition(position)
            setSolutionOverviewHeroImageZoom(zoom)
          }}
        />
      )}

      {/* Solution Overview Screenshot Crop Modal */}
      {solutionOverviewScreenshotUrl && (
        <ImageCropModal
          isOpen={showSOScreenshotCropModal}
          onClose={() => setShowSOScreenshotCropModal(false)}
          imageSrc={solutionOverviewScreenshotUrl}
          frameWidth={230}
          frameHeight={230}
          initialPosition={solutionOverviewScreenshotPosition}
          initialZoom={solutionOverviewScreenshotZoom}
          onSave={(position, zoom) => {
            setSolutionOverviewScreenshotPosition(position)
            setSolutionOverviewScreenshotZoom(zoom)
          }}
        />
      )}

      <div className="flex gap-8">
        {/* Left: Editor */}
        <div className="w-[340px] flex-shrink-0 space-y-5">
          {/* Mode Toggle - hidden for solution-overview-pdf */}
          {currentTemplate !== 'solution-overview-pdf' && (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setContentMode('verbatim')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  contentMode === 'verbatim'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Direct Edit
              </button>
              <button
                onClick={() => setContentMode('generate')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  contentMode === 'generate'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 18 17" fill="none">
                  <path d="M9 0C9 0 9.25863 4.53698 11.2274 6.39636C13.1961 8.25574 18 8.5 18 8.5C18 8.5 13.1961 8.74426 11.2274 10.6036C9.25863 12.463 9 17 9 17C9 17 8.74137 12.463 6.77261 10.6036C4.80386 8.74426 0 8.5 0 8.5C0 8.5 4.80386 8.25574 6.77261 6.39636C8.74137 4.53698 9 0 9 0Z" fill="#D35F0B"/>
                </svg>
                Generate
              </button>
            </div>
          )}

          {/* Template Options */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex gap-3">
              {/* Logo Color - Orange/White for Social Dark, none for Social Blue (always white), none for Email Dark Gradient (always white), none for Newsletter templates, none for Website Webinar (always white), none for Website Event Listing (variant-driven), none for Website Floating Banner (variant-driven), Black/Orange for others */}
              {currentTemplate !== 'social-blue-gradient' && currentTemplate !== 'email-dark-gradient' && currentTemplate !== 'newsletter-dark-gradient' && currentTemplate !== 'newsletter-blue-gradient' && currentTemplate !== 'newsletter-light' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'website-webinar' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-report' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'solution-overview-pdf' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logo</label>
                {currentTemplate === 'social-dark-gradient' ? (
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setLogoColor('orange')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'orange'
                          ? 'bg-white dark:bg-gray-900 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      style={{ color: logoColor === 'orange' ? colorsConfig.brand.primary : undefined }}
                    >
                      Orange
                    </button>
                    <button
                      onClick={() => setLogoColor('white')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'white'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      White
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setLogoColor('black')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'black'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Black
                    </button>
                    <button
                      onClick={() => setLogoColor('orange')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'orange'
                          ? 'bg-white dark:bg-gray-900 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      style={{ color: logoColor === 'orange' ? colorsConfig.brand.primary : undefined }}
                    >
                      Orange
                    </button>
                  </div>
                )}
              </div>
              )}

              {/* Category - Not shown for Social Dark Gradient, Social Blue Gradient, Email Dark Gradient, Newsletter templates, Website Event Listing, Website Floating Banner, or Solution Overview PDF */}
              {(currentTemplate !== 'social-dark-gradient' && currentTemplate !== 'social-blue-gradient' && currentTemplate !== 'email-dark-gradient' && currentTemplate !== 'newsletter-dark-gradient' && currentTemplate !== 'newsletter-blue-gradient' && currentTemplate !== 'newsletter-light' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'solution-overview-pdf') && (
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
                    >
                      {solutionOptions.map(({ key, label }) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Email Dark Gradient Variant Controls */}
            {currentTemplate === 'email-dark-gradient' && (
              <>
                {/* Color Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color Style</label>
                  <div className="flex gap-2">
                    {(['1', '2', '3', '4'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setColorStyle(style)}
                        className={`flex-1 h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          colorStyle === style
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`/assets/backgrounds/social-dark-gradient-${style}.png`}
                          alt={`Style ${style}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alignment</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setAlignment('left')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'left'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setAlignment('center')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'center'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* CTA Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CTA Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setCtaStyle('link')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'link'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setCtaStyle('button')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'button'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Button
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Newsletter Dark Gradient Variant Controls */}
            {currentTemplate === 'newsletter-dark-gradient' && (
              <>
                {/* Color Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Background</label>
                  <div className="flex gap-2">
                    {(['1', '2', '3', '4'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setColorStyle(style)}
                        className={`flex-1 h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          colorStyle === style
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`/assets/backgrounds/newsletter-dark-gradient-${style}.png`}
                          alt={`Style ${style}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Image Size</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Image Upload - only show when image size is not 'none' */}
                {newsletterImageSize !== 'none' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image</label>
                    {newsletterImageUrl ? (
                      <div className="relative">
                        {/* Image preview - click to adjust */}
                        <div
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                          style={{ width: 240, height: 135 }}
                        >
                          <img
                            src={newsletterImageUrl}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${50 - newsletterImagePosition.x}% ${50 - newsletterImagePosition.y}%`,
                              transform: newsletterImageZoom !== 1 ? `scale(${newsletterImageZoom})` : undefined,
                            }}
                          />
                        </div>
                        {/* Adjust button */}
                        <button
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                        >
                          Adjust
                        </button>
                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setNewsletterImageUrl(null)
                            setNewsletterImageZoom(1)
                            setNewsletterImagePosition({ x: 0, y: 0 })
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = () => setNewsletterImageUrl(reader.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Drop or upload
                          </label>
                        </div>
                        {/* Library box */}
                        <button
                          onClick={() => { setSelectingNewsletterImage(true); setShowImageLibrary(true) }}
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                        >
                          <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose from library
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Newsletter Blue Gradient Variant Controls */}
            {currentTemplate === 'newsletter-blue-gradient' && (
              <>
                {/* Color Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Background</label>
                  <div className="flex gap-2">
                    {(['1', '2', '3', '4'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setColorStyle(style)}
                        className={`flex-1 h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          colorStyle === style
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`/assets/backgrounds/newsletter-blue-gradient-${style}.png`}
                          alt={`Style ${style}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Image Size</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Image Upload - only show when image size is not 'none' */}
                {newsletterImageSize !== 'none' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image</label>
                    {newsletterImageUrl ? (
                      <div className="relative">
                        {/* Image preview - click to adjust */}
                        <div
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                          style={{ width: 240, height: 135 }}
                        >
                          <img
                            src={newsletterImageUrl}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${50 - newsletterImagePosition.x}% ${50 - newsletterImagePosition.y}%`,
                              transform: newsletterImageZoom !== 1 ? `scale(${newsletterImageZoom})` : undefined,
                            }}
                          />
                        </div>
                        {/* Adjust button */}
                        <button
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                        >
                          Adjust
                        </button>
                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setNewsletterImageUrl(null)
                            setNewsletterImageZoom(1)
                            setNewsletterImagePosition({ x: 0, y: 0 })
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = () => setNewsletterImageUrl(reader.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Drop or upload
                          </label>
                        </div>
                        {/* Library box */}
                        <button
                          onClick={() => { setSelectingNewsletterImage(true); setShowImageLibrary(true) }}
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                        >
                          <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose from library
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Newsletter Light Variant Controls */}
            {currentTemplate === 'newsletter-light' && (
              <>
                {/* Image Size */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Image Size</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Image Upload - only show when image size is not 'none' */}
                {newsletterImageSize !== 'none' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image</label>
                    {newsletterImageUrl ? (
                      <div className="relative">
                        {/* Image preview - click to adjust */}
                        <div
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                          style={{ width: 240, height: 135 }}
                        >
                          <img
                            src={newsletterImageUrl}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${50 - newsletterImagePosition.x}% ${50 - newsletterImagePosition.y}%`,
                              transform: newsletterImageZoom !== 1 ? `scale(${newsletterImageZoom})` : undefined,
                            }}
                          />
                        </div>
                        {/* Adjust button */}
                        <button
                          onClick={() => setShowNewsletterCropModal(true)}
                          className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                        >
                          Adjust
                        </button>
                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setNewsletterImageUrl(null)
                            setNewsletterImageZoom(1)
                            setNewsletterImagePosition({ x: 0, y: 0 })
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = () => setNewsletterImageUrl(reader.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Drop or upload
                          </label>
                        </div>
                        {/* Library box */}
                        <button
                          onClick={() => { setSelectingNewsletterImage(true); setShowImageLibrary(true) }}
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                        >
                          <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose from library
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Newsletter Top Banner Variant Controls */}
            {currentTemplate === 'newsletter-top-banner' && (
              <>
                {/* Dark/Light Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Theme</label>
                  <div className="flex gap-2">
                    {(['dark', 'light'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setNewsletterTopBannerVariant(variant)}
                        className={`flex-1 h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          newsletterTopBannerVariant === variant
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`/assets/backgrounds/newsletter_header_background_${variant}.png`}
                          alt={`${variant} theme`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email Speakers Controls */}
            {currentTemplate === 'email-speakers' && (
              <div className="space-y-3">
                {/* Speaker Count */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Number of Speakers</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {([1, 2, 3] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => setSpeakerCount(count)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          speakerCount === count
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website eBook Listing Controls */}
            {currentTemplate === 'website-thumbnail' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Layout</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {(['image', 'none'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setEbookVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          ebookVariant === variant
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {variant === 'image' ? 'Image' : 'None'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website Webinar Controls */}
            {currentTemplate === 'website-webinar' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Right Side Content</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {(['none', 'image', 'speakers'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setWebinarVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          webinarVariant === variant
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {variant === 'none' ? 'None' : variant === 'image' ? 'Image' : 'Speakers'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website Event Listing Controls */}
            {currentTemplate === 'website-event-listing' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {(['orange', 'light', 'dark-gradient'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setEventListingVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          eventListingVariant === variant
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {variant === 'orange' ? 'Orange' : variant === 'light' ? 'Light' : 'Dark'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website Report Controls */}
            {currentTemplate === 'website-report' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Layout</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {(['image', 'none'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setReportVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          reportVariant === variant
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {variant === 'image' ? 'Image' : 'None'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website Floating Banner Variant Controls */}
            {currentTemplate === 'website-floating-banner' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Style</label>
                  <select
                    value={floatingBannerVariant}
                    onChange={(e) => setFloatingBannerVariant(e.target.value as typeof floatingBannerVariant)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="white">White</option>
                    <option value="orange">Orange</option>
                    <option value="dark">Dark</option>
                    <option value="blue-gradient-1">Blue Gradient 1</option>
                    <option value="blue-gradient-2">Blue Gradient 2</option>
                    <option value="dark-gradient-1">Dark Gradient 1</option>
                    <option value="dark-gradient-2">Dark Gradient 2</option>
                  </select>
                </div>
              </div>
            )}

            {/* Website Floating Banner Mobile Variant Controls */}
            {currentTemplate === 'website-floating-banner-mobile' && (
              <div className="space-y-3">
                {/* Variant */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Style</label>
                  <select
                    value={floatingBannerMobileVariant}
                    onChange={(e) => setFloatingBannerMobileVariant(e.target.value as typeof floatingBannerMobileVariant)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="orange">Orange</option>
                    <option value="dark">Dark</option>
                    <option value="blue-gradient-1">Blue Gradient 1</option>
                    <option value="blue-gradient-2">Blue Gradient 2</option>
                    <option value="dark-gradient-1">Dark Gradient 1</option>
                    <option value="dark-gradient-2">Dark Gradient 2</option>
                  </select>
                </div>
                {/* Arrow Type */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CTA Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setFloatingBannerMobileArrowType('text')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        floatingBannerMobileArrowType === 'text'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Text + Arrow
                    </button>
                    <button
                      onClick={() => setFloatingBannerMobileArrowType('arrow')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        floatingBannerMobileArrowType === 'arrow'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Arrow Only
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Solution Overview PDF Controls */}
            {currentTemplate === 'solution-overview-pdf' && (
              <div className="space-y-4">
                {/* Page 1 Controls (Cover) */}
                {solutionOverviewCurrentPage === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Page</h4>

                    {/* Solution Category */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Solution Category</label>
                      <select
                        value={solutionOverviewSolution}
                        onChange={(e) => setSolutionOverviewSolution(e.target.value as SolutionCategory)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(solutionCategories).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Solution Name */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Solution Name</label>
                      <input
                        type="text"
                        value={solutionOverviewSolutionName}
                        onChange={(e) => setSolutionOverviewSolutionName(e.target.value)}
                        placeholder="Employee Health Essentials"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="mt-1 text-xs text-gray-400 text-right">
                        {solutionOverviewSolutionName.length}/60
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={solutionOverviewTagline}
                        onChange={(e) => setSolutionOverviewTagline(e.target.value)}
                        placeholder="Built for Healthcare. Ready for You."
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="mt-1 text-xs text-gray-400 text-right">
                        {solutionOverviewTagline.length}/80
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 2 Controls (Body) */}
                {solutionOverviewCurrentPage === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Body Page</h4>

                    {/* Hero Image Upload */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hero Image</label>
                      {!solutionOverviewHeroImageUrl ? (
                        <div className="flex gap-2">
                          {/* Upload box */}
                          <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file && file.type.startsWith('image/')) {
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      setSolutionOverviewHeroImageUrl(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                                className="hidden"
                              />
                              <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Drop or upload
                            </label>
                          </div>
                          {/* Library box */}
                          <button
                            onClick={() => setShowHeroImageLibrary(true)}
                            className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                              hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                              flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                          >
                            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Choose from library
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Image preview - click to adjust */}
                          <div className="relative">
                            <div
                              onClick={() => setShowSOHeroCropModal(true)}
                              className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                              style={{ width: 280, height: 132 }}
                            >
                              <img
                                src={solutionOverviewHeroImageUrl}
                                alt="Hero image"
                                className="w-full h-full object-cover"
                                style={{
                                  objectPosition: `${50 - solutionOverviewHeroImagePosition.x}% ${50 - solutionOverviewHeroImagePosition.y}%`,
                                  transform: solutionOverviewHeroImageZoom !== 1 ? `scale(${solutionOverviewHeroImageZoom})` : undefined,
                                }}
                              />
                            </div>
                            {/* Adjust button */}
                            <button
                              onClick={() => setShowSOHeroCropModal(true)}
                              className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                            >
                              Adjust
                            </button>
                          </div>
                          {/* Grayscale toggle */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">Grayscale</label>
                            <button
                              onClick={() => setSolutionOverviewHeroImageGrayscale(!solutionOverviewHeroImageGrayscale)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                solutionOverviewHeroImageGrayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  solutionOverviewHeroImageGrayscale ? 'translate-x-4' : ''
                                }`}
                              />
                            </button>
                          </div>
                          {/* Replace/Remove buttons */}
                          <div className="flex gap-2">
                            {/* Replace with upload */}
                            <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                              <label className="flex items-center justify-center gap-1 h-8 cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file && file.type.startsWith('image/')) {
                                      const reader = new FileReader()
                                      reader.onload = () => {
                                        setSolutionOverviewHeroImageUrl(reader.result as string)
                                        setSolutionOverviewHeroImagePosition({ x: 0, y: 0 })
                                        setSolutionOverviewHeroImageZoom(1)
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                  className="hidden"
                                />
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload new
                              </label>
                            </div>
                            {/* Replace from library */}
                            <button
                              onClick={() => setShowHeroImageLibrary(true)}
                              className="flex-1 flex items-center justify-center gap-1 h-8 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              From library
                            </button>
                            {/* Remove button */}
                            <button
                              onClick={() => {
                                setSolutionOverviewHeroImageUrl(null)
                                setSolutionOverviewHeroImagePosition({ x: 0, y: 0 })
                                setSolutionOverviewHeroImageZoom(1)
                                setSolutionOverviewHeroImageGrayscale(false)
                              }}
                              className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                              title="Remove image"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page 2 Header (H1 in header band) */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Page Header</label>
                      <input
                        type="text"
                        value={solutionOverviewPage2Header}
                        onChange={(e) => setSolutionOverviewPage2Header(e.target.value)}
                        placeholder="Employee Health Essentials"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="mt-1 text-xs text-gray-400 text-right">
                        {solutionOverviewPage2Header.length}/60
                      </div>
                    </div>

                    {/* Section Header */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Section Header</label>
                      <textarea
                        value={solutionOverviewSectionHeader}
                        onChange={(e) => setSolutionOverviewSectionHeader(e.target.value)}
                        placeholder="Streamline Employee Health.\nStrengthen Compliance."
                        rows={2}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                      />
                      <div className="mt-1 text-xs text-gray-400 text-right">
                        {solutionOverviewSectionHeader.length}/80
                      </div>
                    </div>

                    {/* Intro Paragraph */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Intro Paragraph</label>
                      <textarea
                        value={solutionOverviewIntroParagraph}
                        onChange={(e) => setSolutionOverviewIntroParagraph(e.target.value)}
                        placeholder="Enter introduction text..."
                        rows={7}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                      />
                      <div className={`mt-1 text-xs text-right ${solutionOverviewIntroParagraph.length > 500 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {solutionOverviewIntroParagraph.length}/500
                      </div>
                    </div>

                    {/* Key Solutions */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Key Solutions (6 items)</label>
                      <div className="space-y-2">
                        {solutionOverviewKeySolutions.map((solution, index) => (
                          <input
                            key={index}
                            type="text"
                            value={solution}
                            onChange={(e) => setSolutionOverviewKeySolution(index, e.target.value)}
                            placeholder={`Solution ${index + 1}`}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Quote Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <label className="block text-xs text-gray-500 mb-2">Quote Section</label>

                      {/* Quote Text */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Quote</label>
                        <textarea
                          value={solutionOverviewQuoteText}
                          onChange={(e) => setSolutionOverviewQuoteText(e.target.value)}
                          placeholder="Enter customer quote..."
                          rows={4}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                        />
                        <div className={`mt-1 text-xs text-right ${solutionOverviewQuoteText.length > 350 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {solutionOverviewQuoteText.length}/350
                        </div>
                      </div>

                      {/* Quote Attribution - vertical stack */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={solutionOverviewQuoteName}
                            onChange={(e) => setSolutionOverviewQuoteName(e.target.value)}
                            placeholder="Firstname Lastname"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={solutionOverviewQuoteTitle}
                            onChange={(e) => setSolutionOverviewQuoteTitle(e.target.value)}
                            placeholder="Job Title"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Organization</label>
                          <input
                            type="text"
                            value={solutionOverviewQuoteCompany}
                            onChange={(e) => setSolutionOverviewQuoteCompany(e.target.value)}
                            placeholder="Company Name"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 3 Controls (Benefits & Features) */}
                {solutionOverviewCurrentPage === 3 && (
                  <div className="space-y-4">
                    {/* Key Benefits Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Benefits</h4>
                        <span className="text-xs text-gray-400">{solutionOverviewBenefits.length}/7</span>
                      </div>
                      <div className="space-y-3">
                        {solutionOverviewBenefits.map((benefit, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                            {/* Row 1: Icon picker + Title + X button */}
                            <div className="flex items-center gap-2">
                              {/* Icon Picker - same height as input */}
                              {(() => {
                                const IconComponent = benefit.icon ? getIconByName(benefit.icon) : null
                                return (
                                  <button
                                    onClick={() => {
                                      setActiveBenefitForIcon(index)
                                      setShowIconLibrary(true)
                                    }}
                                    className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                                    title={benefit.icon ? `Icon: ${benefit.icon.replace(/-/g, ' ')}` : 'Select icon'}
                                  >
                                    {IconComponent ? (
                                      <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                      </svg>
                                    )}
                                  </button>
                                )
                              })()}
                              {/* Title input */}
                              <input
                                type="text"
                                value={benefit.title}
                                onChange={(e) => setSolutionOverviewBenefit(index, { ...benefit, title: e.target.value })}
                                placeholder="Benefit title"
                                className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {/* X button - only show when more than 3 benefits */}
                              {solutionOverviewBenefits.length > 3 && (
                                <button
                                  onClick={() => removeSolutionOverviewBenefit(index)}
                                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                  title="Remove benefit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {/* Row 2: Description - full width */}
                            <textarea
                              value={benefit.description}
                              onChange={(e) => setSolutionOverviewBenefit(index, { ...benefit, description: e.target.value })}
                              placeholder="Description"
                              rows={4}
                              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                          </div>
                        ))}
                      </div>
                      {solutionOverviewBenefits.length < 7 && (
                        <button
                          onClick={addSolutionOverviewBenefit}
                          className="mt-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          + Add Benefit
                        </button>
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image</h4>
                      {!solutionOverviewScreenshotUrl ? (
                        <label className="block w-full aspect-[200/120] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader()
                                reader.onload = () => {
                                  setSolutionOverviewScreenshotUrl(reader.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">Upload Product Image</span>
                          </div>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          {/* Image preview - click to adjust */}
                          <div className="relative">
                            <div
                              onClick={() => setShowSOScreenshotCropModal(true)}
                              className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                              style={{ width: 168, height: 168 }}
                            >
                              <img
                                src={solutionOverviewScreenshotUrl}
                                alt="Product image"
                                className="w-full h-full object-cover"
                                style={{
                                  objectPosition: `${50 - solutionOverviewScreenshotPosition.x}% ${50 - solutionOverviewScreenshotPosition.y}%`,
                                  transform: solutionOverviewScreenshotZoom !== 1 ? `scale(${solutionOverviewScreenshotZoom})` : undefined,
                                }}
                              />
                            </div>
                            {/* Adjust button */}
                            <button
                              onClick={() => setShowSOScreenshotCropModal(true)}
                              className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                            >
                              Adjust
                            </button>
                            {/* Remove button */}
                            <button
                              onClick={() => {
                                setSolutionOverviewScreenshotUrl(null)
                                setSolutionOverviewScreenshotPosition({ x: 0, y: 0 })
                                setSolutionOverviewScreenshotZoom(1)
                                setSolutionOverviewScreenshotGrayscale(false)
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                              title="Remove image"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {/* Grayscale toggle */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">Grayscale</label>
                            <button
                              onClick={() => setSolutionOverviewScreenshotGrayscale(!solutionOverviewScreenshotGrayscale)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                solutionOverviewScreenshotGrayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  solutionOverviewScreenshotGrayscale ? 'translate-x-4' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Powerful Features Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Powerful Features</h4>
                        <span className="text-xs text-gray-400">{solutionOverviewFeatures.length} features</span>
                      </div>
                      <div className="space-y-3">
                        {solutionOverviewFeatures.map((feature, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={feature.title}
                                  onChange={(e) => setSolutionOverviewFeature(index, { ...feature, title: e.target.value })}
                                  placeholder="Feature title"
                                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <textarea
                                  value={feature.description}
                                  onChange={(e) => setSolutionOverviewFeature(index, { ...feature, description: e.target.value })}
                                  placeholder="Description"
                                  rows={3}
                                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                              </div>
                              {solutionOverviewFeatures.length > 1 && (
                                <button
                                  onClick={() => removeSolutionOverviewFeature(index)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Remove feature"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addSolutionOverviewFeature}
                        className="mt-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        + Add Feature
                      </button>
                    </div>

                    {/* CTA Option */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Call to Action</h4>
                      <select
                        value={solutionOverviewCtaOption}
                        onChange={(e) => setSolutionOverviewCtaOption(e.target.value as 'demo' | 'learn' | 'start' | 'contact')}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ctaOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CTA Link URL</label>
                        <input
                          type="url"
                          value={solutionOverviewCtaUrl}
                          onChange={(e) => setSolutionOverviewCtaUrl(e.target.value)}
                          placeholder="https://cority.com/request-demo"
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                        <p className="mt-1 text-xs text-gray-400">This link will be clickable in the exported PDF</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Dark Gradient and Social Blue Gradient Variant Controls */}
            {(currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient') && (
              <>
                {/* Color Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color Style</label>
                  <div className="flex gap-2">
                    {(['1', '2', '3', '4'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setColorStyle(style)}
                        className={`flex-1 h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          colorStyle === style
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`/assets/backgrounds/${currentTemplate === 'social-blue-gradient' ? 'social-blue-gradient' : 'social-dark-gradient'}-${style}.png`}
                          alt={`Style ${style}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alignment</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setAlignment('left')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'left'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setAlignment('center')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'center'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* Heading Size */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Heading Size</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    {(['S', 'M', 'L'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setHeadingSize(size)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          headingSize === size
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CTA Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setCtaStyle('link')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'link'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setCtaStyle('button')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'button'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Button
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Social Image and Email Image Layout Controls */}
            {(currentTemplate === 'social-image' || currentTemplate === 'email-image') && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Layout</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setLayout('more-text')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'more-text'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      More Text
                    </button>
                    <button
                      onClick={() => setLayout('even')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'even'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Even
                    </button>
                    <button
                      onClick={() => setLayout('more-image')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'more-image'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      More Image
                    </button>
                  </div>
                </div>

              </>
            )}


            {/* Image - Website Thumbnail (image variant), Email Image, Social Image, Website Webinar (image variant), Website Press Release, and Website Report (image variant) */}
            {((currentTemplate === 'website-thumbnail' && ebookVariant === 'image') || currentTemplate === 'email-image' || currentTemplate === 'social-image' || (currentTemplate === 'website-webinar' && webinarVariant === 'image') || currentTemplate === 'website-press-release' || (currentTemplate === 'website-report' && reportVariant === 'image')) && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Image</label>
                {thumbnailImageUrl ? (
                  <div className="relative">
                    {/* Image preview - click to adjust */}
                    <div
                      onClick={() => setShowCropModal(true)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                      style={{ width: 240, height: 135 }}
                    >
                      <img
                        src={thumbnailImageUrl}
                        alt="Selected image"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${50 - thumbnailImagePosition.x}% ${50 - thumbnailImagePosition.y}%`,
                          transform: thumbnailImageZoom !== 1 ? `scale(${thumbnailImageZoom})` : undefined,
                        }}
                      />
                    </div>
                    {/* Adjust button */}
                    <button
                      onClick={() => setShowCropModal(true)}
                      className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                    >
                      Adjust
                    </button>
                    {/* Remove button */}
                    <button
                      onClick={() => {
                        setThumbnailImageUrl(null)
                        setThumbnailImageSettings(currentTemplate, { position: { x: 0, y: 0 }, zoom: 1 })
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {/* Upload box */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsImageDragging(true) }}
                      onDragLeave={(e) => { e.preventDefault(); setIsImageDragging(false) }}
                      onDrop={handleImageDrop}
                      className={`flex-1 border-2 border-dashed rounded-lg h-16 transition-colors ${
                        isImageDragging
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          className="hidden"
                        />
                        <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Drop or upload
                      </label>
                    </div>
                    {/* Library box */}
                    <button
                      onClick={() => setShowImageLibrary(true)}
                      className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                        hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                        flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose from library
                    </button>
                  </div>
                )}
                {/* Grayscale toggle - only show when image is selected */}
                {thumbnailImageUrl && (
                  <div className="flex items-center justify-between mt-3">
                    <label className="text-xs text-gray-500">Grayscale</label>
                    <button
                      onClick={() => setGrayscale(!grayscale)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          grayscale ? 'translate-x-4' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Edit Mode */}
          {contentMode === 'verbatim' && (
            <div className="space-y-4">
              {/* Eyebrow - not shown for email-image, social-image, solution-overview-pdf (they don't use it) */}
              {currentTemplate !== 'email-image' && currentTemplate !== 'social-image' && currentTemplate !== 'solution-overview-pdf' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Eyebrow
                    </label>
                    <EyeIcon visible={showEyebrow} onClick={() => setShowEyebrow(!showEyebrow)} />
                  </div>
                  <input
                    type="text"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="e.g., EBOOK, WEBINAR"
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${!showEyebrow ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* Light Header - Email Grid only */}
              {currentTemplate === 'email-grid' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Light Header
                    </label>
                    <EyeIcon visible={showLightHeader} onClick={() => setShowLightHeader(!showLightHeader)} />
                  </div>
                </div>
              )}

              {/* Headline - not shown for solution-overview-pdf (has its own fields) */}
              {currentTemplate !== 'solution-overview-pdf' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Headline
                  </label>
                </div>
                <input
                  type="text"
                  value={verbatimCopy.headline}
                  onChange={(e) => setVerbatimCopy({ headline: e.target.value })}
                  placeholder="Headline"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              )}

              {/* Subhead / Subheading */}
              {(currentTemplate === 'website-thumbnail' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-image' || currentTemplate === 'email-dark-gradient' || currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {(currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-thumbnail' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') ? 'Subheader' : 'Subhead'}
                    </label>
                    <EyeIcon visible={showSubhead} onClick={() => setShowSubhead(!showSubhead)} />
                  </div>
                  <textarea
                    value={verbatimCopy.subhead}
                    onChange={(e) => setVerbatimCopy({ subhead: e.target.value })}
                    placeholder={(currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-thumbnail' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') ? 'Subheader text' : 'Supporting subheadline'}
                    rows={2}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                      ${!showSubhead ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {currentTemplate === 'email-grid' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Subheading
                    </label>
                    <EyeIcon visible={showSubheading} onClick={() => setShowSubheading(!showSubheading)} />
                  </div>
                  <input
                    type="text"
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    placeholder="Optional subheading"
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${!showSubheading ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* Body - not shown for templates that don't use it */}
              {currentTemplate !== 'website-thumbnail' && currentTemplate !== 'social-image' && currentTemplate !== 'social-grid-detail' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'solution-overview-pdf' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Body Copy
                    </label>
                    <EyeIcon visible={showBody} onClick={() => setShowBody(!showBody)} />
                  </div>
                  <textarea
                    value={verbatimCopy.body}
                    onChange={(e) => setVerbatimCopy({ body: e.target.value })}
                    placeholder="Body text"
                    rows={3}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                      ${!showBody ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* CTA Text - Website Webinar, Website Thumbnail, Website Press Release, Website Report (with show/hide toggle) */}
              {(currentTemplate === 'website-webinar' || currentTemplate === 'website-thumbnail' || currentTemplate === 'website-press-release' || currentTemplate === 'website-report') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      CTA Text
                    </label>
                    <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                  </div>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Responsive"
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${!showCta ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* CTA Text - Website Floating Banner (no show/hide toggle) */}
              {(currentTemplate === 'website-floating-banner' || currentTemplate === 'website-floating-banner-mobile') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Learn More"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Grid Details - Email Grid only */}
              {currentTemplate === 'email-grid' && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grid Details</h4>

                  {/* Detail 1 - Always data */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Detail 1 (Data)</label>
                    <input
                      type="text"
                      value={gridDetail1Text}
                      onChange={(e) => setGridDetail1Text(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900"
                    />
                  </div>

                  {/* Detail 2 - Always data, with show/hide */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-500">Detail 2 (Data)</label>
                      <EyeIcon visible={showGridDetail2} onClick={() => setShowGridDetail2(!showGridDetail2)} />
                    </div>
                    <input
                      type="text"
                      value={gridDetail2Text}
                      onChange={(e) => setGridDetail2Text(e.target.value)}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 ${!showGridDetail2 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Detail 3 - Data or CTA dropdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs text-gray-500">Detail 3</label>
                      <select
                        value={gridDetail3Type}
                        onChange={(e) => setGridDetail3Type(e.target.value as 'data' | 'cta')}
                        className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded
                          bg-white dark:bg-gray-900"
                      >
                        <option value="data">Data</option>
                        <option value="cta">CTA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={gridDetail3Text}
                      onChange={(e) => setGridDetail3Text(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              )}

              {/* Social Dark Gradient and Social Blue Gradient Content Fields */}
              {(currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient') && (
                <div className="space-y-4">
                  {/* Metadata */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Metadata
                      </label>
                      <EyeIcon visible={showMetadata} onClick={() => setShowMetadata(!showMetadata)} />
                    </div>
                    <input
                      type="text"
                      value={metadata}
                      onChange={(e) => setMetadata(e.target.value)}
                      placeholder="e.g., Day / Month | 00:00"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showMetadata ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Learn More"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Social Image Content Fields */}
              {currentTemplate === 'social-image' && (
                <div className="space-y-4">
                  {/* Metadata */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Metadata
                      </label>
                      <EyeIcon visible={showMetadata} onClick={() => setShowMetadata(!showMetadata)} />
                    </div>
                    <input
                      type="text"
                      value={metadata}
                      onChange={(e) => setMetadata(e.target.value)}
                      placeholder="e.g., Day / Month | 00:00"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showMetadata ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Learn More"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Email Image Content Fields */}
              {currentTemplate === 'email-image' && (
                <div className="space-y-4">
                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Responsive"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Email Dark Gradient Content Fields */}
              {currentTemplate === 'email-dark-gradient' && (
                <div className="space-y-4">
                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Responsive"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Newsletter Dark Gradient Content Fields */}
              {currentTemplate === 'newsletter-dark-gradient' && (
                <div className="space-y-4">
                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Responsive"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Newsletter Blue Gradient Content Fields */}
              {currentTemplate === 'newsletter-blue-gradient' && (
                <div className="space-y-4">
                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Responsive"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Newsletter Light Content Fields */}
              {currentTemplate === 'newsletter-light' && (
                <div className="space-y-4">
                  {/* CTA Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CTA Text
                      </label>
                      <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                    </div>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Responsive"
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Email Speakers and Website Webinar (speakers variant) Content Fields */}
              {(currentTemplate === 'email-speakers' || (currentTemplate === 'website-webinar' && webinarVariant === 'speakers')) && (
                <div className="space-y-4">
                  {/* CTA Text - only for email-speakers (website-webinar has its own CTA section) */}
                  {currentTemplate === 'email-speakers' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          CTA Text
                        </label>
                        <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
                      </div>
                      <input
                        type="text"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="e.g., Responsive"
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${!showCta ? 'opacity-50' : ''}`}
                      />
                    </div>
                  )}

                  {/* Speaker 1 */}
                  <div className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker1 ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 1</label>
                      {currentTemplate === 'website-webinar' && (
                        <EyeIcon visible={showSpeaker1} onClick={() => setShowSpeaker1(!showSpeaker1)} />
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden cursor-pointer relative"
                          onClick={() => { setActiveSpeakerForImage(1); setShowImageLibrary(true) }}
                          style={{ backgroundImage: speaker1ImageUrl ? `url(${speaker1ImageUrl})` : undefined, backgroundSize: `${speaker1ImageZoom * 100}%`, backgroundPosition: `${50 + speaker1ImagePosition.x}% ${50 + speaker1ImagePosition.y}%` }}
                        >
                          {!speaker1ImageUrl && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
                          )}
                        </div>
                        {speaker1ImageUrl && (
                          <div className="mt-1 flex flex-col gap-1">
                            <input
                              type="range"
                              min="1"
                              max="3"
                              step="0.1"
                              value={speaker1ImageZoom}
                              onChange={(e) => setSpeaker1ImageZoom(parseFloat(e.target.value))}
                              className="w-12 h-1"
                              title="Zoom"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={speaker1Name}
                          onChange={(e) => setSpeaker1Name(e.target.value)}
                          placeholder="Name"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                        />
                        <input
                          type="text"
                          value={speaker1Role}
                          onChange={(e) => setSpeaker1Role(e.target.value)}
                          placeholder="Role, Company"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Speaker 2 */}
                  {(currentTemplate === 'website-webinar' || speakerCount >= 2) && (
                    <div className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker2 ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 2</label>
                        {currentTemplate === 'website-webinar' && (
                          <EyeIcon visible={showSpeaker2} onClick={() => setShowSpeaker2(!showSpeaker2)} />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden cursor-pointer relative"
                            onClick={() => { setActiveSpeakerForImage(2); setShowImageLibrary(true) }}
                            style={{ backgroundImage: speaker2ImageUrl ? `url(${speaker2ImageUrl})` : undefined, backgroundSize: `${speaker2ImageZoom * 100}%`, backgroundPosition: `${50 + speaker2ImagePosition.x}% ${50 + speaker2ImagePosition.y}%` }}
                          >
                            {!speaker2ImageUrl && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
                            )}
                          </div>
                          {speaker2ImageUrl && (
                            <div className="mt-1 flex flex-col gap-1">
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={speaker2ImageZoom}
                                onChange={(e) => setSpeaker2ImageZoom(parseFloat(e.target.value))}
                                className="w-12 h-1"
                                title="Zoom"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={speaker2Name}
                            onChange={(e) => setSpeaker2Name(e.target.value)}
                            placeholder="Name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          />
                          <input
                            type="text"
                            value={speaker2Role}
                            onChange={(e) => setSpeaker2Role(e.target.value)}
                            placeholder="Role, Company"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Speaker 3 */}
                  {(currentTemplate === 'website-webinar' || speakerCount >= 3) && (
                    <div className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker3 ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 3</label>
                        {currentTemplate === 'website-webinar' && (
                          <EyeIcon visible={showSpeaker3} onClick={() => setShowSpeaker3(!showSpeaker3)} />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden cursor-pointer relative"
                            onClick={() => { setActiveSpeakerForImage(3); setShowImageLibrary(true) }}
                            style={{ backgroundImage: speaker3ImageUrl ? `url(${speaker3ImageUrl})` : undefined, backgroundSize: `${speaker3ImageZoom * 100}%`, backgroundPosition: `${50 + speaker3ImagePosition.x}% ${50 + speaker3ImagePosition.y}%` }}
                          >
                            {!speaker3ImageUrl && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
                            )}
                          </div>
                          {speaker3ImageUrl && (
                            <div className="mt-1 flex flex-col gap-1">
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={speaker3ImageZoom}
                                onChange={(e) => setSpeaker3ImageZoom(parseFloat(e.target.value))}
                                className="w-12 h-1"
                                title="Zoom"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={speaker3Name}
                            onChange={(e) => setSpeaker3Name(e.target.value)}
                            placeholder="Name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          />
                          <input
                            type="text"
                            value={speaker3Role}
                            onChange={(e) => setSpeaker3Role(e.target.value)}
                            placeholder="Role, Company"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Grid Detail Content Fields */}
              {currentTemplate === 'social-grid-detail' && (
                <div className="space-y-4">
                  {/* Subhead */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Subhead
                      </label>
                      <EyeIcon visible={showSubhead} onClick={() => setShowSubhead(!showSubhead)} />
                    </div>
                    <textarea
                      value={verbatimCopy.subhead}
                      onChange={(e) => setVerbatimCopy({ subhead: e.target.value })}
                      placeholder="This is your subheader or description text..."
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                        ${!showSubhead ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Grid Details */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Grid Details
                    </label>

                    {/* Row 1 */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Row 1</label>
                      <input
                        type="text"
                        value={gridDetail1Text}
                        onChange={(e) => setGridDetail1Text(e.target.value)}
                        placeholder="Date: January 1st, 2026"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Row 2 */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Row 2</label>
                      <input
                        type="text"
                        value={gridDetail2Text}
                        onChange={(e) => setGridDetail2Text(e.target.value)}
                        placeholder="Time: Midnight, EST"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Row 3 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Row 3</label>
                          <select
                            value={gridDetail3Type}
                            onChange={(e) => setGridDetail3Type(e.target.value as 'data' | 'cta')}
                            className="text-xs px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded
                              bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                          >
                            <option value="data">Data</option>
                            <option value="cta">CTA</option>
                          </select>
                        </div>
                        <EyeIcon visible={showRow3} onClick={() => setShowRow3(!showRow3)} />
                      </div>
                      <input
                        type="text"
                        value={gridDetail3Text}
                        onChange={(e) => setGridDetail3Text(e.target.value)}
                        placeholder={gridDetail3Type === 'cta' ? 'Join the event' : 'Place: Wherever'}
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${!showRow3 ? 'opacity-50' : ''}`}
                      />
                    </div>

                    {/* Row 4 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Row 4</label>
                          <select
                            value={gridDetail4Type}
                            onChange={(e) => setGridDetail4Type(e.target.value as 'data' | 'cta')}
                            className="text-xs px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded
                              bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                          >
                            <option value="data">Data</option>
                            <option value="cta">CTA</option>
                          </select>
                        </div>
                        <EyeIcon visible={showRow4} onClick={() => setShowRow4(!showRow4)} />
                      </div>
                      <input
                        type="text"
                        value={gridDetail4Text}
                        onChange={(e) => setGridDetail4Text(e.target.value)}
                        placeholder={gridDetail4Type === 'cta' ? 'Join the event' : 'Additional info'}
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${!showRow4 ? 'opacity-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Website Event Listing Content Fields */}
              {currentTemplate === 'website-event-listing' && (
                <div className="space-y-4">
                  {/* Subhead */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Subhead
                      </label>
                      <EyeIcon visible={showSubhead} onClick={() => setShowSubhead(!showSubhead)} />
                    </div>
                    <textarea
                      value={verbatimCopy.subhead}
                      onChange={(e) => setVerbatimCopy({ subhead: e.target.value })}
                      placeholder="This is your subheader or description text..."
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                        ${!showSubhead ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Grid Details */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Grid Details
                    </label>

                    {/* Row 1 - always visible */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Row 1</label>
                      <input
                        type="text"
                        value={gridDetail1Text}
                        onChange={(e) => setGridDetail1Text(e.target.value)}
                        placeholder="Add Details or Hide Me"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Row 2 - hideable */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Row 2</label>
                        <EyeIcon visible={showRow3} onClick={() => setShowRow3(!showRow3)} />
                      </div>
                      <input
                        type="text"
                        value={gridDetail2Text}
                        onChange={(e) => setGridDetail2Text(e.target.value)}
                        placeholder="Add Details or Hide Me"
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${!showRow3 ? 'opacity-50' : ''}`}
                      />
                    </div>

                    {/* Row 3 - hideable */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Row 3</label>
                        <EyeIcon visible={showRow4} onClick={() => setShowRow4(!showRow4)} />
                      </div>
                      <input
                        type="text"
                        value={gridDetail3Text}
                        onChange={(e) => setGridDetail3Text(e.target.value)}
                        placeholder="Add Details or Hide Me"
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${!showRow4 ? 'opacity-50' : ''}`}
                      />
                    </div>

                    {/* Row 4 (CTA) - always visible */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Row 4 (CTA)</label>
                      <input
                        type="text"
                        value={gridDetail4Text}
                        onChange={(e) => setGridDetail4Text(e.target.value)}
                        placeholder="Join the event"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Mode */}
          {contentMode === 'generate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  What are you promoting?
                </label>
                <textarea
                  value={generationContext}
                  onChange={(e) => setGenerationContext(e.target.value)}
                  placeholder="Describe the content, product, or offer..."
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* File drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-3 text-center text-sm transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing PDF...</span>
                  </div>
                ) : contextFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{contextFile.name}</span>
                      <button
                        onClick={() => { setContextFile(null); setPdfContent(null) }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    {pdfContent && (
                      <span className="text-xs text-green-600">
                        {pdfContent.length.toLocaleString()} chars extracted
                      </span>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer text-gray-600 dark:text-gray-400">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    Or <span className="text-blue-600 hover:text-blue-700">upload a PDF</span>
                  </label>
                )}
              </div>

              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

              <button
                onClick={handleGenerate}
                disabled={(!generationContext.trim() && !pdfContent) || isGenerating || isUploading}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg
                  hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                  flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Copy'
                )}
              </button>

              {generationError && <p className="text-sm text-red-600">{generationError}</p>}
            </div>
          )}

        </div>

        {/* Right: Preview with Actions */}
        <div className="flex-1 flex flex-col sticky top-0 self-start">
          {/* Action Bar - above preview */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Scale Selector - hide for solution-overview-pdf */}
              {currentTemplate !== 'solution-overview-pdf' && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowScaleDropdown(!showScaleDropdown) }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400
                      bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md
                      hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {exportScale}x
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showScaleDropdown && (
                    <div className="absolute left-0 mt-1 w-16 bg-white dark:bg-gray-800 border border-gray-200
                      dark:border-gray-700 rounded-md shadow-lg overflow-hidden z-10">
                      {[1, 2, 3].map((scale) => (
                        <button
                          key={scale}
                          onClick={(e) => { e.stopPropagation(); setExportScale(scale); setShowScaleDropdown(false) }}
                          className={`w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700
                            ${exportScale === scale ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                          {scale}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Export Button - hide for solution-overview-pdf */}
              {currentTemplate !== 'solution-overview-pdf' && (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
                    bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  Export
                </button>
              )}

              {/* Add to Queue Button - hide when editing from queue, hide for solution-overview-pdf */}
              {!isEditingFromQueue && currentTemplate !== 'solution-overview-pdf' && (
                <button
                  onClick={() => {
                    addToQueue()
                    setShowQueuedFeedback(true)
                    setTimeout(() => setShowQueuedFeedback(false), 2000)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md
                    hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                    border border-gray-200 dark:border-gray-700"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Queue
                </button>
              )}

              {/* PDF Preview and Export buttons - only for solution-overview-pdf */}
              {currentTemplate === 'solution-overview-pdf' && (
                <>
                  <button
                    onClick={() => setShowPdfAllPagesPreview(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md
                      hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                      border border-gray-200 dark:border-gray-700"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <button
                    onClick={() => setCurrentScreen('solution-overview-export')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
                      bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Review & Export
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* PDF Page Picker and Zoom Controls - only for solution-overview-pdf */}
              {currentTemplate === 'solution-overview-pdf' && (
                <div className="flex items-center gap-3 ml-2">
                  {/* Page Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Page</span>
                    <div className="flex">
                      {([1, 2, 3] as const).map((page, idx) => (
                        <button
                          key={page}
                          onClick={() => setSolutionOverviewCurrentPage(page)}
                          className={`w-7 h-7 text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600 ${
                            idx === 0 ? 'rounded-l' : ''
                          } ${idx === 2 ? 'rounded-r' : ''} ${idx > 0 ? '-ml-px' : ''} ${
                            solutionOverviewCurrentPage === page
                              ? 'bg-blue-500 text-white border-blue-500 z-10 relative'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPdfPreviewZoom(Math.max(75, pdfPreviewZoom - 25))}
                      disabled={pdfPreviewZoom <= 75}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-800"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <select
                      value={pdfPreviewZoom}
                      onChange={(e) => setPdfPreviewZoom(Number(e.target.value))}
                      className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 focus:outline-none cursor-pointer"
                    >
                      <option value={200}>200%</option>
                      <option value={175}>175%</option>
                      <option value={150}>150%</option>
                      <option value={125}>125%</option>
                      <option value={100}>100%</option>
                      <option value={75}>75%</option>
                    </select>
                    <button
                      onClick={() => setPdfPreviewZoom(Math.min(200, pdfPreviewZoom + 25))}
                      disabled={pdfPreviewZoom >= 200}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowPdfFullscreen(true)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-r bg-white dark:bg-gray-800 ml-1"
                      title="Fullscreen preview (ESC to exit)"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Asset Button - hide when editing from queue */}
            {selectedAssets.length > 1 && !isEditingFromQueue && (
              <button
                onClick={() => {
                  const newAssets = selectedAssets.filter((_, i) => i !== currentAssetIndex)
                  setSelectedAssets(newAssets)
                  if (currentAssetIndex >= newAssets.length) {
                    goToAsset(newAssets.length - 1)
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium
                  text-gray-500 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400
                  transition-colors"
                title="Delete this asset"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>

          {/* Queue feedback toast */}
          {showQueuedFeedback && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200
              dark:border-green-800 rounded-md text-green-700 dark:text-green-400 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added to queue ({exportQueue.length} total)
            </div>
          )}

          {/* Preview */}
          <div
            className={`flex items-start flex-1 bg-gray-100 dark:bg-transparent rounded-xl p-6 ${
              currentTemplate === 'website-floating-banner' || currentTemplate === 'website-floating-banner-mobile' ? 'justify-start' : 'justify-center'
            }`}
          >
            {/* Floating banner (desktop) uses a special responsive container */}
            {currentTemplate === 'website-floating-banner' ? (
              <div
                ref={floatingBannerContainerRef}
                className="ring-1 ring-gray-300/50 dark:ring-gray-700/50 rounded-sm w-full"
                style={{
                  position: 'relative',
                  height: floatingBannerContainerWidth > 0
                    ? Math.round(floatingBannerContainerWidth * (100 / 2256))
                    : 50,
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 2256,
                  height: 100,
                  transform: floatingBannerContainerWidth > 0
                    ? `scale(${floatingBannerContainerWidth / 2256})`
                    : 'scale(0.5)',
                  transformOrigin: 'top left',
                }}>
                  <WebsiteFloatingBanner
                    eyebrow={eyebrow}
                    headline={verbatimCopy.headline || 'Headline'}
                    cta={ctaText || 'Learn More'}
                    showEyebrow={showEyebrow}
                    variant={floatingBannerVariant}
                    colors={colorsConfig}
                    typography={typographyConfig}
                    scale={1}
                  />
                </div>
              </div>
            ) : currentTemplate === 'solution-overview-pdf' ? (
              /* PDF Preview - simple container matching page dimensions */
              <div
                className="ring-1 ring-gray-300/50 dark:ring-gray-700/50 rounded-sm shadow-lg"
                style={{
                  width: 612 * (pdfPreviewZoom / 100),
                  height: 792 * (pdfPreviewZoom / 100),
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 612,
                  height: 792,
                  transform: `scale(${pdfPreviewZoom / 100})`,
                  transformOrigin: 'top left',
                }}>
              {solutionOverviewCurrentPage === 1 && (
                <Page1Cover
                  solution={solutionOverviewSolution}
                  solutionName={solutionOverviewSolutionName}
                  tagline={solutionOverviewTagline}
                  scale={1}
                />
              )}
              {solutionOverviewCurrentPage === 2 && (
                <Page2Body
                  solution={solutionOverviewSolution}
                  page2Header={solutionOverviewPage2Header}
                  heroImageUrl={solutionOverviewHeroImageUrl || heroImages.find(img => img.id === solutionOverviewHeroImageId)?.src}
                  heroImagePosition={solutionOverviewHeroImagePosition}
                  heroImageZoom={solutionOverviewHeroImageZoom}
                  heroImageGrayscale={solutionOverviewHeroImageGrayscale}
                  sectionHeader={solutionOverviewSectionHeader}
                  introParagraph={solutionOverviewIntroParagraph}
                  keySolutions={solutionOverviewKeySolutions}
                  quoteText={solutionOverviewQuoteText}
                  quoteName={solutionOverviewQuoteName}
                  quoteTitle={solutionOverviewQuoteTitle}
                  quoteCompany={solutionOverviewQuoteCompany}
                  scale={1}
                />
              )}
              {solutionOverviewCurrentPage === 3 && (
                <Page3BenefitsFeatures
                  solution={solutionOverviewSolution}
                  solutionName={solutionOverviewSolutionName}
                  benefits={solutionOverviewBenefits}
                  features={solutionOverviewFeatures}
                  screenshotUrl={solutionOverviewScreenshotUrl}
                  screenshotPosition={solutionOverviewScreenshotPosition}
                  screenshotZoom={solutionOverviewScreenshotZoom}
                  screenshotGrayscale={solutionOverviewScreenshotGrayscale}
                  ctaOption={solutionOverviewCtaOption}
                  ctaUrl={solutionOverviewCtaUrl}
                  scale={1}
                />
              )}
                </div>
              </div>
            ) : (
            <div className="flex flex-col">
              <div
                className="ring-1 ring-gray-300/50 dark:ring-gray-700/50 rounded-sm"
                style={{
                  width: dimensions.width * previewScale,
                  height: dimensions.height * previewScale,
                  overflow: 'hidden',
                }}
              >
              <div style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                width: dimensions.width,
                height: dimensions.height,
              }}>
              {currentTemplate === 'website-thumbnail' && (
                <WebsiteThumbnail
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Lightweight header.'}
                  subhead={verbatimCopy.subhead}
                  cta={ctaText || 'Responsive'}
                  solution={solution}
                  variant={ebookVariant}
                  imageUrl={thumbnailImageUrl || undefined}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showCta={showCta}
                  grayscale={grayscale}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'website-press-release' && (
                <WebsitePressRelease
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Lightweight header.'}
                  subhead={verbatimCopy.subhead}
                  body={verbatimCopy.body}
                  cta={ctaText || 'Responsive'}
                  solution={solution}
                  imageUrl={thumbnailImageUrl || undefined}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'website-webinar' && (
                <WebsiteWebinar
                  eyebrow={eyebrow || 'Webinar'}
                  headline={verbatimCopy.headline || 'Lightweight header.'}
                  subhead={verbatimCopy.subhead}
                  body={verbatimCopy.body}
                  cta={ctaText || 'Responsive'}
                  solution={solution}
                  variant={webinarVariant}
                  imageUrl={thumbnailImageUrl || undefined}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  speakerCount={speakerCount}
                  speaker1={{
                    name: speaker1Name,
                    role: speaker1Role,
                    imageUrl: speaker1ImageUrl,
                    imagePosition: speaker1ImagePosition,
                    imageZoom: speaker1ImageZoom,
                  }}
                  speaker2={{
                    name: speaker2Name,
                    role: speaker2Role,
                    imageUrl: speaker2ImageUrl,
                    imagePosition: speaker2ImagePosition,
                    imageZoom: speaker2ImageZoom,
                  }}
                  speaker3={{
                    name: speaker3Name,
                    role: speaker3Role,
                    imageUrl: speaker3ImageUrl,
                    imagePosition: speaker3ImagePosition,
                    imageZoom: speaker3ImageZoom,
                  }}
                  showSpeaker1={showSpeaker1}
                  showSpeaker2={showSpeaker2}
                  showSpeaker3={showSpeaker3}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'website-event-listing' && (
                <WebsiteEventListing
                  eyebrow={eyebrow || 'LIVE EVENT'}
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead}
                  cta={ctaText || 'Responsive'}
                  variant={eventListingVariant}
                  gridDetail1Text={gridDetail1Text || 'Add Details or Hide Me'}
                  gridDetail2Text={gridDetail2Text || 'Add Details or Hide Me'}
                  gridDetail3Text={gridDetail3Text || 'Add Details or Hide Me'}
                  gridDetail4Text={gridDetail4Text || 'Add Details or Hide Me'}
                  showRow3={showRow3}
                  showRow4={showRow4}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'website-report' && (
                <WebsiteReport
                  eyebrow={eyebrow || 'REPORT'}
                  headline={verbatimCopy.headline || 'Lightweight header.'}
                  subhead={verbatimCopy.subhead}
                  cta={ctaText || 'Responsive'}
                  solution={solution}
                  variant={reportVariant}
                  imageUrl={thumbnailImageUrl || undefined}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showCta={showCta}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-grid' && (
                <EmailGrid
                  headline={verbatimCopy.headline || 'Headline'}
                  body={verbatimCopy.body}
                  eyebrow={eyebrow}
                  subheading={subheading}
                  showEyebrow={showEyebrow}
                  showLightHeader={showLightHeader}
                  showHeavyHeader={false}
                  showSubheading={showSubheading}
                  showBody={showBody}
                  showSolutionSet={showSolutionSet}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showGridDetail2={showGridDetail2}
                  gridDetail1={gridDetail1}
                  gridDetail2={gridDetail2}
                  gridDetail3={gridDetail3}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-dark-gradient' && (
                <SocialDarkGradient
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead}
                  body={verbatimCopy.body}
                  metadata={metadata}
                  ctaText={ctaText}
                  colorStyle={colorStyle}
                  headingSize={headingSize}
                  alignment={alignment}
                  ctaStyle={ctaStyle}
                  logoColor={logoColor === 'black' ? 'white' : logoColor}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-blue-gradient' && (
                <SocialBlueGradient
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead}
                  body={verbatimCopy.body}
                  metadata={metadata}
                  ctaText={ctaText}
                  colorStyle={colorStyle}
                  headingSize={headingSize}
                  alignment={alignment}
                  ctaStyle={ctaStyle}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-image' && (
                <SocialImage
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead}
                  metadata={metadata}
                  ctaText={ctaText}
                  imageUrl={thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  layout={layout}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-grid-detail' && (
                <SocialGridDetail
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead || 'This is your subheader or description text. Keep it to two lines if you can.'}
                  eyebrow={eyebrow || "Don't miss this."}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showSolutionSet={showSolutionSet}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showRow3={showRow3}
                  showRow4={showRow4}
                  gridDetail1={{ type: 'data', text: gridDetail1Text }}
                  gridDetail2={{ type: 'data', text: gridDetail2Text }}
                  gridDetail3={{ type: gridDetail3Type, text: gridDetail3Text }}
                  gridDetail4={{ type: gridDetail4Type, text: gridDetail4Text }}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-image' && (
                <EmailImage
                  headline={verbatimCopy.headline || 'Headline'}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
                  ctaText={ctaText}
                  imageUrl={thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  layout={layout}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-dark-gradient' && (
                <EmailDarkGradient
                  headline={verbatimCopy.headline || 'Headline'}
                  eyebrow={eyebrow}
                  subheading={verbatimCopy.subhead}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
                  ctaText={ctaText}
                  colorStyle={colorStyle}
                  alignment={alignment}
                  ctaStyle={ctaStyle}
                  showEyebrow={showEyebrow && !!eyebrow}
                  showSubheading={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'newsletter-dark-gradient' && (
                <NewsletterDarkGradient
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
                  ctaText={ctaText}
                  colorStyle={colorStyle}
                  imageSize={newsletterImageSize}
                  imageUrl={newsletterImageUrl}
                  imagePosition={newsletterImagePosition}
                  imageZoom={newsletterImageZoom}
                  showEyebrow={showEyebrow && !!eyebrow}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'newsletter-blue-gradient' && (
                <NewsletterBlueGradient
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
                  ctaText={ctaText}
                  colorStyle={colorStyle}
                  imageSize={newsletterImageSize}
                  imageUrl={newsletterImageUrl}
                  imagePosition={newsletterImagePosition}
                  imageZoom={newsletterImageZoom}
                  showEyebrow={showEyebrow && !!eyebrow}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'newsletter-light' && (
                <NewsletterLight
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
                  ctaText={ctaText}
                  imageSize={newsletterImageSize}
                  imageUrl={newsletterImageUrl}
                  imagePosition={newsletterImagePosition}
                  imageZoom={newsletterImageZoom}
                  showEyebrow={showEyebrow && !!eyebrow}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'newsletter-top-banner' && (
                <NewsletterTopBanner
                  eyebrow={eyebrow || 'Month | Year'}
                  headline={verbatimCopy.headline || 'EHS+ Newsletter'}
                  subhead={verbatimCopy.subhead || ''}
                  variant={newsletterTopBannerVariant}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-speakers' && (
                <EmailSpeakers
                  headline={verbatimCopy.headline || 'Headline'}
                  eyebrow={eyebrow}
                  body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing'}
                  ctaText={ctaText}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showEyebrow={showEyebrow && !!eyebrow}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  speakerCount={speakerCount}
                  speaker1={{
                    name: speaker1Name,
                    role: speaker1Role,
                    imageUrl: speaker1ImageUrl,
                    imagePosition: speaker1ImagePosition,
                    imageZoom: speaker1ImageZoom,
                  }}
                  speaker2={{
                    name: speaker2Name,
                    role: speaker2Role,
                    imageUrl: speaker2ImageUrl,
                    imagePosition: speaker2ImagePosition,
                    imageZoom: speaker2ImageZoom,
                  }}
                  speaker3={{
                    name: speaker3Name,
                    role: speaker3Role,
                    imageUrl: speaker3ImageUrl,
                    imagePosition: speaker3ImagePosition,
                    imageZoom: speaker3ImageZoom,
                  }}
                  grayscale={grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'website-floating-banner-mobile' && (
                <WebsiteFloatingBannerMobile
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Headline'}
                  cta={ctaText || 'Learn More'}
                  showEyebrow={showEyebrow}
                  variant={floatingBannerMobileVariant}
                  arrowType={floatingBannerMobileArrowType}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              </div>
              </div>
            </div>
            )}

            {/* Save & Cancel buttons when editing from queue */}
            {isEditingFromQueue && (
              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                    bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                    border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQueuedAssetEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg
                    hover:bg-blue-600 transition-colors"
                >
                  Save & Return to Queue
                </button>
              </div>
            )}
          </div>

          {/* Cancel confirmation modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
              <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Discard changes?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Your changes will not be saved. The original asset will remain in the queue.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                      bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                      border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelConfirm(false)
                      cancelQueueEdit()
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg
                      hover:bg-red-600 transition-colors"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PDF Fullscreen Preview Modal (single page) */}
          {showPdfFullscreen && currentTemplate === 'solution-overview-pdf' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              {/* Close button */}
              <button
                onClick={() => setShowPdfFullscreen(false)}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                title="Close (ESC)"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* ESC hint */}
              <div className="absolute top-4 left-4 text-white/50 text-sm">
                Press ESC to exit
              </div>
              {/* PDF Content - scrollable */}
              <div
                className="max-h-[90vh] overflow-auto rounded-lg shadow-2xl"
                style={{ maxWidth: '90vw' }}
              >
                {solutionOverviewCurrentPage === 1 && (
                  <Page1Cover
                    solution={solutionOverviewSolution}
                    solutionName={solutionOverviewSolutionName}
                    tagline={solutionOverviewTagline}
                    scale={1}
                  />
                )}
                {solutionOverviewCurrentPage === 2 && (
                  <Page2Body
                    solution={solutionOverviewSolution}
                    page2Header={solutionOverviewPage2Header}
                    heroImageUrl={solutionOverviewHeroImageUrl || heroImages.find(img => img.id === solutionOverviewHeroImageId)?.src}
                    heroImagePosition={solutionOverviewHeroImagePosition}
                    heroImageZoom={solutionOverviewHeroImageZoom}
                    heroImageGrayscale={solutionOverviewHeroImageGrayscale}
                    sectionHeader={solutionOverviewSectionHeader}
                    introParagraph={solutionOverviewIntroParagraph}
                    keySolutions={solutionOverviewKeySolutions}
                    quoteText={solutionOverviewQuoteText}
                    quoteName={solutionOverviewQuoteName}
                    quoteTitle={solutionOverviewQuoteTitle}
                    quoteCompany={solutionOverviewQuoteCompany}
                    scale={1}
                  />
                )}
                {solutionOverviewCurrentPage === 3 && (
                  <Page3BenefitsFeatures
                    solution={solutionOverviewSolution}
                    solutionName={solutionOverviewSolutionName}
                    benefits={solutionOverviewBenefits}
                    features={solutionOverviewFeatures}
                    screenshotUrl={solutionOverviewScreenshotUrl}
                    screenshotPosition={solutionOverviewScreenshotPosition}
                    screenshotZoom={solutionOverviewScreenshotZoom}
                    screenshotGrayscale={solutionOverviewScreenshotGrayscale}
                    ctaOption={solutionOverviewCtaOption}
                    ctaUrl={solutionOverviewCtaUrl}
                    scale={1}
                  />
                )}
              </div>
            </div>
          )}

          {/* PDF All Pages Preview Modal (3-page scrollable) */}
          {showPdfAllPagesPreview && currentTemplate === 'solution-overview-pdf' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              {/* Close button */}
              <button
                onClick={() => setShowPdfAllPagesPreview(false)}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
                title="Close (ESC)"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* ESC hint */}
              <div className="absolute top-4 left-4 text-white/50 text-sm z-10">
                Press ESC to exit
              </div>
              {/* All 3 pages - scrollable */}
              <div
                className="max-h-[90vh] overflow-auto rounded-lg shadow-2xl"
                style={{ maxWidth: '90vw' }}
              >
                <div className="flex flex-col gap-4 p-4">
                  {/* Page 1 */}
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <Page1Cover
                      solution={solutionOverviewSolution}
                      solutionName={solutionOverviewSolutionName}
                      tagline={solutionOverviewTagline}
                      scale={1}
                    />
                  </div>
                  {/* Page 2 */}
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <Page2Body
                      solution={solutionOverviewSolution}
                      page2Header={solutionOverviewPage2Header}
                      heroImageUrl={solutionOverviewHeroImageUrl || heroImages.find(img => img.id === solutionOverviewHeroImageId)?.src}
                      heroImagePosition={solutionOverviewHeroImagePosition}
                      heroImageZoom={solutionOverviewHeroImageZoom}
                      heroImageGrayscale={solutionOverviewHeroImageGrayscale}
                      sectionHeader={solutionOverviewSectionHeader}
                      introParagraph={solutionOverviewIntroParagraph}
                      keySolutions={solutionOverviewKeySolutions}
                      quoteText={solutionOverviewQuoteText}
                      quoteName={solutionOverviewQuoteName}
                      quoteTitle={solutionOverviewQuoteTitle}
                      quoteCompany={solutionOverviewQuoteCompany}
                      scale={1}
                    />
                  </div>
                  {/* Page 3 */}
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <Page3BenefitsFeatures
                      solution={solutionOverviewSolution}
                      solutionName={solutionOverviewSolutionName}
                      benefits={solutionOverviewBenefits}
                      features={solutionOverviewFeatures}
                      screenshotUrl={solutionOverviewScreenshotUrl}
                      screenshotPosition={solutionOverviewScreenshotPosition}
                      screenshotZoom={solutionOverviewScreenshotZoom}
                      screenshotGrayscale={solutionOverviewScreenshotGrayscale}
                      ctaOption={solutionOverviewCtaOption}
                      ctaUrl={solutionOverviewCtaUrl}
                      scale={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
