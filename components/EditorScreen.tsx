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
import { SocialImageMeddbase } from './templates/SocialImageMeddbase'
import { EmailProductRelease } from './templates/EmailProductRelease'
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
import { heroImages } from '@/config/solution-overview-assets'
import { ImageLibraryModal } from './ImageLibraryModal'
import { SolutionOverviewEditorControls } from './editors/SolutionOverviewEditor'
import { SpeakerEditorControls } from './editors/SpeakerEditor'
import { TemplateRenderer, PreviewModal } from './TemplateTile'
import { ZoomableImage } from './ZoomableImage'
import { ImageCropModal } from './ImageCropModal'
import { SimpleRichTextEditor } from './SimpleRichTextEditor'
import { buildExportParams, type ExportParamState } from '@/lib/export-params'
import { EyeIcon } from './shared/EyeIcon'
import type { TemplateInfo } from '@/lib/template-config'
import {
  fetchColorsConfig,
  fetchTypographyConfig,
  type ColorsConfig,
  type TypographyConfig
} from '@/lib/brand-config'
import { CHANNELS, TEMPLATE_DIMENSIONS, TEMPLATE_LABELS } from '@/lib/template-config'
import { ToggleSwitch } from '@/components/shared/ToggleSwitch'
import { ImagePreviewWithCrop } from '@/components/shared/ImagePreviewWithCrop'
import type { TemplateType } from '@/types'

// Headline font size configuration per template
const HEADLINE_SIZE_CONFIG: Record<string, { default: number; min: number; max: number; step: number }> = {
  'email-image': { default: 38, min: 16, max: 50, step: 2 },
  'social-image-meddbase': { default: 84, min: 40, max: 120, step: 4 },
  'email-grid': { default: 38, min: 16, max: 50, step: 2 },
  'email-speakers': { default: 38, min: 16, max: 50, step: 2 },
  'email-dark-gradient': { default: 38, min: 16, max: 50, step: 2 },
  'website-thumbnail': { default: 35, min: 16, max: 54, step: 2 },
  'website-press-release': { default: 35, min: 16, max: 50, step: 2 },
  'website-webinar': { default: 35, min: 16, max: 54, step: 2 },
  'website-event-listing': { default: 58, min: 30, max: 80, step: 2 },
  'website-report': { default: 35, min: 16, max: 54, step: 2 },
  'website-floating-banner': { default: 33, min: 16, max: 44, step: 1 },
  'website-floating-banner-mobile': { default: 14, min: 8, max: 20, step: 1 },
  'social-dark-gradient': { default: 84, min: 40, max: 140, step: 4 },
  'social-blue-gradient': { default: 84, min: 40, max: 140, step: 4 },
  'social-image': { default: 84, min: 40, max: 120, step: 4 },
  'social-grid-detail': { default: 84, min: 40, max: 120, step: 4 },
  'newsletter-dark-gradient': { default: 24, min: 12, max: 36, step: 1 },
  'newsletter-blue-gradient': { default: 24, min: 12, max: 36, step: 1 },
  'newsletter-light': { default: 24, min: 12, max: 36, step: 1 },
  'social-carousel': { default: 112, min: 40, max: 140, step: 4 },
}

// Bottom spacing drag handle for email-dark-gradient (reuses StackerSpacingHandle visual style)
function BottomSpacingHandle({ spacing, onChange, scale }: {
  spacing: number
  onChange: (value: number) => void
  scale: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartSpacing = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartSpacing.current = spacing
  }, [spacing])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current
      const deltaPx = deltaY / scale
      // Negative delta = drag up = increase spacing (push text up from bottom)
      const newSpacing = Math.round(Math.max(0, Math.min(100, dragStartSpacing.current - deltaPx)))
      onChange(newSpacing)
    }
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onChange, scale])

  const showUI = isHovered || isDragging
  const minInteractiveHeight = 12

  return (
    <div
      style={{
        height: Math.max(spacing * scale, minInteractiveHeight),
        marginTop: -(Math.max(spacing * scale, minInteractiveHeight)),
        position: 'relative',
        cursor: isDragging ? 'ns-resize' : 'default',
        zIndex: 10,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {showUI && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {/* Dashed guide lines */}
          <div style={{ position: 'absolute', top: 0, left: 8, right: 8, borderTop: '1px dashed #EC4899', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 8, right: 8, borderTop: '1px dashed #EC4899', opacity: 0.5 }} />
          {/* Pink pill with px value */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              pointerEvents: 'auto',
              cursor: 'ns-resize',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 0L6 2.5H2L4 0Z" fill="currentColor" />
              <path d="M4 8L6 5.5H2L4 8Z" fill="currentColor" />
            </svg>
            {spacing}px
          </div>
        </div>
      )}
    </div>
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
    showHeadline,
    setShowHeadline,
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
    // Manual text size
    headlineFontSize,
    setHeadlineFontSize,
    // Email Dark Gradient spacing
    bottomSpacing,
    setBottomSpacing,
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
    addSolutionOverviewKeySolution,
    removeSolutionOverviewKeySolution,
    solutionOverviewQuoteText,
    setSolutionOverviewQuoteText,
    solutionOverviewQuoteName,
    setSolutionOverviewQuoteName,
    solutionOverviewQuoteTitle,
    setSolutionOverviewQuoteTitle,
    solutionOverviewQuoteCompany,
    setSolutionOverviewQuoteCompany,
    // Solution Overview PDF specific - Page 2 Stats
    solutionOverviewStat1Value,
    setSolutionOverviewStat1Value,
    solutionOverviewStat1Label,
    setSolutionOverviewStat1Label,
    solutionOverviewStat2Value,
    setSolutionOverviewStat2Value,
    solutionOverviewStat2Label,
    setSolutionOverviewStat2Label,
    solutionOverviewStat3Value,
    setSolutionOverviewStat3Value,
    solutionOverviewStat3Label,
    setSolutionOverviewStat3Label,
    solutionOverviewStat4Value,
    setSolutionOverviewStat4Value,
    solutionOverviewStat4Label,
    setSolutionOverviewStat4Label,
    solutionOverviewStat5Value,
    setSolutionOverviewStat5Value,
    solutionOverviewStat5Label,
    setSolutionOverviewStat5Label,
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
  const [selectingSOScreenshot, setSelectingSOScreenshot] = useState(false)

  // Image crop modal state
  const [showCropModal, setShowCropModal] = useState(false)
  const [showNewsletterCropModal, setShowNewsletterCropModal] = useState(false)

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
    if (currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || currentTemplate === 'social-grid-detail') {
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

  // Handle image upload for thumbnail - upload to Vercel Blob for export compatibility
  // This avoids 413 Payload Too Large errors when exporting large images
  const [isImageUploading, setIsImageUploading] = useState(false)

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return

    setIsImageUploading(true)
    try {
      // Get file extension from name or mime type
      const ext = file.name.split('.').pop() || file.type.split('/')[1] || 'png'
      const filename = `images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      // Upload to Vercel Blob
      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-image',
      })

      // Store the Blob URL instead of data URL
      setThumbnailImageUrl(blob.url)
    } catch (error) {
      console.error('Image upload failed:', error)
      // Fallback to data URL for local development without Blob token
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setThumbnailImageUrl(dataUrl)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsImageUploading(false)
    }
  }, [setThumbnailImageUrl])

  const handleImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsImageDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleImageUpload(file)
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
      const paramState: ExportParamState = {
        eyebrow,
        verbatimCopy,
        solution,
        logoColor,
        showEyebrow,
        showHeadline,
        headlineFontSize,
        bottomSpacing,
        thumbnailImageUrl,
        thumbnailImagePosition,
        thumbnailImageZoom,
        grayscale,
        showSubhead,
        showBody,
        showCta,
        showMetadata,
        showSolutionSet,
        showLightHeader,
        showSubheading,
        showGridDetail2,
        showRow3,
        showRow4,
        showSpeaker1,
        showSpeaker2,
        showSpeaker3,
        ctaText,
        metadata,
        subheading,
        ebookVariant,
        webinarVariant,
        reportVariant,
        eventListingVariant,
        floatingBannerVariant,
        floatingBannerMobileVariant,
        floatingBannerMobileArrowType,
        newsletterTopBannerVariant,
        colorStyle,
        headingSize,
        alignment,
        ctaStyle,
        layout,
        gridDetail1Text,
        gridDetail2Text,
        gridDetail3Type,
        gridDetail3Text,
        gridDetail4Type,
        gridDetail4Text,
        newsletterImageSize,
        newsletterImageUrl,
        newsletterImagePosition,
        newsletterImageZoom,
        speakerCount,
        speaker1Name,
        speaker1Role,
        speaker1ImageUrl,
        speaker1ImagePosition,
        speaker1ImageZoom,
        speaker2Name,
        speaker2Role,
        speaker2ImageUrl,
        speaker2ImagePosition,
        speaker2ImageZoom,
        speaker3Name,
        speaker3Role,
        speaker3ImageUrl,
        speaker3ImagePosition,
        speaker3ImageZoom,
        solutionOverviewSolution,
        solutionOverviewSolutionName,
        solutionOverviewTagline,
        solutionOverviewHeroImageId,
        solutionOverviewHeroImageUrl,
        solutionOverviewHeroImagePosition,
        solutionOverviewHeroImageZoom,
        solutionOverviewPage2Header,
        solutionOverviewSectionHeader,
        solutionOverviewIntroParagraph,
        solutionOverviewKeySolutions,
        solutionOverviewQuoteText,
        solutionOverviewQuoteName,
        solutionOverviewQuoteTitle,
        solutionOverviewQuoteCompany,
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
        solutionOverviewBenefits,
        solutionOverviewFeatures,
        solutionOverviewScreenshotUrl,
        solutionOverviewScreenshotPosition,
        solutionOverviewScreenshotZoom,
        solutionOverviewCtaOption,
      }

      const exportParams = buildExportParams(currentTemplate, exportScale, paramState)

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
        <div className="flex items-center border-b border-gray-200 dark:border-line-subtle">
          <div className="flex">
            {selectedAssets.map((asset, index) => (
              <button
                key={`${asset}-${index}`}
                onClick={() => goToAsset(index)}
                className={`px-4 py-2.5 text-sm font-medium border-t border-l border-r rounded-t-lg -mb-px transition-colors ${
                  index === currentAssetIndex
                    ? 'border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary'
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
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover rounded-lg transition-colors"
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
          <div className="relative bg-white dark:bg-surface-primary rounded-xl shadow-xl w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-line-subtle flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-content-primary">Add Assets</h3>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-content-primary transition-colors"
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
                      <h4 className="text-sm font-medium text-gray-500 dark:text-content-secondary mb-3">
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
                                  : 'border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                }
                              `}
                            >
                              {/* Preview area */}
                              <div
                                className="relative overflow-hidden bg-gray-100 dark:bg-surface-secondary flex items-center justify-center"
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
                                      className="bg-gray-200 dark:bg-surface-tertiary animate-pulse rounded"
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
                              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-line-subtle flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium truncate block ${
                                    isSelected
                                      ? 'text-blue-700 dark:text-blue-300'
                                      : 'text-gray-900 dark:text-content-primary'
                                  }`}>
                                    {template.label.replace(/^(Email|Social|Website|Newsletter)\s*-?\s*/, '')}
                                  </span>
                                  <span className="text-[10px] text-gray-400 dark:text-content-secondary font-mono">
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
                                  className="flex-shrink-0 px-2 py-1 text-xs font-medium text-gray-500 dark:text-content-secondary
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
            <div className="px-6 py-4 border-t border-gray-100 dark:border-line-subtle flex gap-3">
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-content-secondary
                  bg-gray-100 dark:bg-surface-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
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
                  hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-btn-primary-disabled disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
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
            } else if (selectingSOScreenshot) {
              setSolutionOverviewScreenshotUrl(url)
            } else {
              setThumbnailImageUrl(url)
            }
            setShowImageLibrary(false)
            setActiveSpeakerForImage(null)
            setSelectingNewsletterImage(false)
            setSelectingSOScreenshot(false)
          }}
          onClose={() => {
            setShowImageLibrary(false)
            setActiveSpeakerForImage(null)
            setSelectingNewsletterImage(false)
            setSelectingSOScreenshot(false)
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
            (currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase') ? (layout === 'even' ? 488 : layout === 'more-image' ? 600 : 376) :
            currentTemplate === 'website-webinar' ? 333 :
            currentTemplate === 'website-press-release' ? 338 :
            currentTemplate === 'website-report' ? 320 :
            currentTemplate === 'email-product-release' ? 331 :
            320 // default
          }
          frameHeight={
            currentTemplate === 'website-thumbnail' ? 386 :
            currentTemplate === 'email-image' ? 300 :
            (currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase') ? 628 :
            currentTemplate === 'website-webinar' ? 450 :
            currentTemplate === 'website-press-release' ? 450 :
            currentTemplate === 'website-report' ? 386 :
            currentTemplate === 'email-product-release' ? 184 :
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

      <div className="flex gap-8 h-[calc(100vh-180px)]">
        {/* Left: Editor */}
        <div className="w-[340px] flex-shrink-0 space-y-5 overflow-y-auto">
          {/* Mode Toggle - hidden for solution-overview-pdf */}
          {currentTemplate !== 'solution-overview-pdf' && (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-surface-secondary rounded-lg">
              <button
                onClick={() => setContentMode('verbatim')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  contentMode === 'verbatim'
                    ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                    : 'text-gray-600 dark:text-content-secondary hover:text-gray-900'
                }`}
              >
                Direct Edit
              </button>
              <button
                onClick={() => setContentMode('generate')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  contentMode === 'generate'
                    ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                    : 'text-gray-600 dark:text-content-secondary hover:text-gray-900'
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
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-surface-secondary rounded-lg">
            <div className="flex gap-3">
              {/* Logo Color - Orange/White for Social Dark, none for Social Blue (always white), none for Email Dark Gradient (always white), none for Newsletter templates, none for Website Webinar (always white), none for Website Event Listing (variant-driven), none for Website Floating Banner (variant-driven), Black/Orange for others */}
              {currentTemplate !== 'social-blue-gradient' && currentTemplate !== 'email-dark-gradient' && currentTemplate !== 'newsletter-dark-gradient' && currentTemplate !== 'newsletter-blue-gradient' && currentTemplate !== 'newsletter-light' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'website-webinar' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-report' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'solution-overview-pdf' && currentTemplate !== 'email-product-release' && currentTemplate !== 'social-image-meddbase' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logo</label>
                {currentTemplate === 'social-dark-gradient' ? (
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setLogoColor('orange')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'orange'
                          ? 'bg-white dark:bg-surface-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                      style={{ color: logoColor === 'orange' ? colorsConfig.brand.primary : undefined }}
                    >
                      Orange
                    </button>
                    <button
                      onClick={() => setLogoColor('white')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'white'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      White
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setLogoColor('black')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'black'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Black
                    </button>
                    <button
                      onClick={() => setLogoColor('orange')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        logoColor === 'orange'
                          ? 'bg-white dark:bg-surface-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
              {(currentTemplate !== 'social-dark-gradient' && currentTemplate !== 'social-blue-gradient' && currentTemplate !== 'email-dark-gradient' && currentTemplate !== 'newsletter-dark-gradient' && currentTemplate !== 'newsletter-blue-gradient' && currentTemplate !== 'newsletter-light' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'solution-overview-pdf' && currentTemplate !== 'email-product-release') && (
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary appearance-none cursor-pointer"
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
                            : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setAlignment('left')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'left'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setAlignment('center')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'center'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* CTA Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CTA Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setCtaStyle('link')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'link'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setCtaStyle('button')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'button'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
                            : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
                      <ImagePreviewWithCrop
                        imageUrl={newsletterImageUrl}
                        imagePosition={newsletterImagePosition}
                        imageZoom={newsletterImageZoom}
                        onAdjust={() => setShowNewsletterCropModal(true)}
                        onRemove={() => {
                          setNewsletterImageUrl(null)
                          setNewsletterImageZoom(1)
                          setNewsletterImagePosition({ x: 0, y: 0 })
                        }}
                      />
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
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
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-line-focus transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
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
                            : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
                      <ImagePreviewWithCrop
                        imageUrl={newsletterImageUrl}
                        imagePosition={newsletterImagePosition}
                        imageZoom={newsletterImageZoom}
                        onAdjust={() => setShowNewsletterCropModal(true)}
                        onRemove={() => {
                          setNewsletterImageUrl(null)
                          setNewsletterImageZoom(1)
                          setNewsletterImagePosition({ x: 0, y: 0 })
                        }}
                      />
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
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
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-line-focus transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setNewsletterImageSize('none')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'none'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('small')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'small'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setNewsletterImageSize('large')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        newsletterImageSize === 'large'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
                      <ImagePreviewWithCrop
                        imageUrl={newsletterImageUrl}
                        imagePosition={newsletterImagePosition}
                        imageZoom={newsletterImageZoom}
                        onAdjust={() => setShowNewsletterCropModal(true)}
                        onRemove={() => {
                          setNewsletterImageUrl(null)
                          setNewsletterImageZoom(1)
                          setNewsletterImagePosition({ x: 0, y: 0 })
                        }}
                      />
                    ) : (
                      <div className="flex gap-2">
                        {/* Upload box */}
                        <div
                          className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400"
                        >
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
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
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16
                            hover:border-gray-400 dark:hover:border-line-focus transition-colors
                            flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
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
                            : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    {([1, 2, 3] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => setSpeakerCount(count)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          speakerCount === count
                            ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                            : 'text-gray-600 dark:text-content-secondary'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    {(['image', 'none'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setEbookVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          ebookVariant === variant
                            ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                            : 'text-gray-600 dark:text-content-secondary'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    {(['none', 'image', 'speakers'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setWebinarVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          webinarVariant === variant
                            ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                            : 'text-gray-600 dark:text-content-secondary'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    {(['orange', 'light', 'dark-gradient'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setEventListingVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          eventListingVariant === variant
                            ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                            : 'text-gray-600 dark:text-content-secondary'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    {(['image', 'none'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setReportVariant(variant)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          reportVariant === variant
                            ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                            : 'text-gray-600 dark:text-content-secondary'
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setFloatingBannerMobileArrowType('text')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        floatingBannerMobileArrowType === 'text'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Text + Arrow
                    </button>
                    <button
                      onClick={() => setFloatingBannerMobileArrowType('arrow')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        floatingBannerMobileArrowType === 'arrow'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
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
              <SolutionOverviewEditorControls
                solutionOverviewSolution={solutionOverviewSolution}
                setSolutionOverviewSolution={setSolutionOverviewSolution}
                solutionOverviewSolutionName={solutionOverviewSolutionName}
                setSolutionOverviewSolutionName={setSolutionOverviewSolutionName}
                solutionOverviewTagline={solutionOverviewTagline}
                setSolutionOverviewTagline={setSolutionOverviewTagline}
                solutionOverviewCurrentPage={solutionOverviewCurrentPage}
                solutionOverviewHeroImageUrl={solutionOverviewHeroImageUrl}
                setSolutionOverviewHeroImageUrl={setSolutionOverviewHeroImageUrl}
                solutionOverviewHeroImagePosition={solutionOverviewHeroImagePosition}
                setSolutionOverviewHeroImagePosition={setSolutionOverviewHeroImagePosition}
                solutionOverviewHeroImageZoom={solutionOverviewHeroImageZoom}
                setSolutionOverviewHeroImageZoom={setSolutionOverviewHeroImageZoom}
                solutionOverviewHeroImageGrayscale={solutionOverviewHeroImageGrayscale}
                setSolutionOverviewHeroImageGrayscale={setSolutionOverviewHeroImageGrayscale}
                solutionOverviewPage2Header={solutionOverviewPage2Header}
                setSolutionOverviewPage2Header={setSolutionOverviewPage2Header}
                solutionOverviewSectionHeader={solutionOverviewSectionHeader}
                setSolutionOverviewSectionHeader={setSolutionOverviewSectionHeader}
                solutionOverviewIntroParagraph={solutionOverviewIntroParagraph}
                setSolutionOverviewIntroParagraph={setSolutionOverviewIntroParagraph}
                solutionOverviewKeySolutions={solutionOverviewKeySolutions}
                setSolutionOverviewKeySolution={setSolutionOverviewKeySolution}
                addSolutionOverviewKeySolution={addSolutionOverviewKeySolution}
                removeSolutionOverviewKeySolution={removeSolutionOverviewKeySolution}
                solutionOverviewQuoteText={solutionOverviewQuoteText}
                setSolutionOverviewQuoteText={setSolutionOverviewQuoteText}
                solutionOverviewQuoteName={solutionOverviewQuoteName}
                setSolutionOverviewQuoteName={setSolutionOverviewQuoteName}
                solutionOverviewQuoteTitle={solutionOverviewQuoteTitle}
                setSolutionOverviewQuoteTitle={setSolutionOverviewQuoteTitle}
                solutionOverviewQuoteCompany={solutionOverviewQuoteCompany}
                setSolutionOverviewQuoteCompany={setSolutionOverviewQuoteCompany}
                solutionOverviewStat1Value={solutionOverviewStat1Value}
                setSolutionOverviewStat1Value={setSolutionOverviewStat1Value}
                solutionOverviewStat1Label={solutionOverviewStat1Label}
                setSolutionOverviewStat1Label={setSolutionOverviewStat1Label}
                solutionOverviewStat2Value={solutionOverviewStat2Value}
                setSolutionOverviewStat2Value={setSolutionOverviewStat2Value}
                solutionOverviewStat2Label={solutionOverviewStat2Label}
                setSolutionOverviewStat2Label={setSolutionOverviewStat2Label}
                solutionOverviewStat3Value={solutionOverviewStat3Value}
                setSolutionOverviewStat3Value={setSolutionOverviewStat3Value}
                solutionOverviewStat3Label={solutionOverviewStat3Label}
                setSolutionOverviewStat3Label={setSolutionOverviewStat3Label}
                solutionOverviewStat4Value={solutionOverviewStat4Value}
                setSolutionOverviewStat4Value={setSolutionOverviewStat4Value}
                solutionOverviewStat4Label={solutionOverviewStat4Label}
                setSolutionOverviewStat4Label={setSolutionOverviewStat4Label}
                solutionOverviewStat5Value={solutionOverviewStat5Value}
                setSolutionOverviewStat5Value={setSolutionOverviewStat5Value}
                solutionOverviewStat5Label={solutionOverviewStat5Label}
                setSolutionOverviewStat5Label={setSolutionOverviewStat5Label}
                solutionOverviewBenefits={solutionOverviewBenefits}
                setSolutionOverviewBenefit={setSolutionOverviewBenefit}
                addSolutionOverviewBenefit={addSolutionOverviewBenefit}
                removeSolutionOverviewBenefit={removeSolutionOverviewBenefit}
                solutionOverviewFeatures={solutionOverviewFeatures}
                setSolutionOverviewFeature={setSolutionOverviewFeature}
                addSolutionOverviewFeature={addSolutionOverviewFeature}
                removeSolutionOverviewFeature={removeSolutionOverviewFeature}
                solutionOverviewScreenshotUrl={solutionOverviewScreenshotUrl}
                setSolutionOverviewScreenshotUrl={setSolutionOverviewScreenshotUrl}
                solutionOverviewScreenshotPosition={solutionOverviewScreenshotPosition}
                setSolutionOverviewScreenshotPosition={setSolutionOverviewScreenshotPosition}
                solutionOverviewScreenshotZoom={solutionOverviewScreenshotZoom}
                setSolutionOverviewScreenshotZoom={setSolutionOverviewScreenshotZoom}
                solutionOverviewScreenshotGrayscale={solutionOverviewScreenshotGrayscale}
                setSolutionOverviewScreenshotGrayscale={setSolutionOverviewScreenshotGrayscale}
                solutionOverviewCtaOption={solutionOverviewCtaOption}
                setSolutionOverviewCtaOption={setSolutionOverviewCtaOption}
                solutionOverviewCtaUrl={solutionOverviewCtaUrl}
                setSolutionOverviewCtaUrl={setSolutionOverviewCtaUrl}
                setShowImageLibrary={setShowImageLibrary}
                setSelectingSOScreenshot={setSelectingSOScreenshot}
              />
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
                            : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setAlignment('left')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'left'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setAlignment('center')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        alignment === 'center'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* CTA Style */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CTA Style</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setCtaStyle('link')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'link'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setCtaStyle('button')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        ctaStyle === 'button'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Button
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Social Image and Email Image Layout Controls */}
            {(currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || currentTemplate === 'email-image') && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Layout</label>
                  <div className="flex gap-1 p-1 bg-gray-200 dark:bg-surface-tertiary rounded-lg">
                    <button
                      onClick={() => setLayout('more-text')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'more-text'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      More Text
                    </button>
                    <button
                      onClick={() => setLayout('even')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'even'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      Even
                    </button>
                    <button
                      onClick={() => setLayout('more-image')}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        layout === 'more-image'
                          ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    >
                      More Image
                    </button>
                  </div>
                </div>

              </>
            )}


            {/* Image - Website Thumbnail (image variant), Email Image, Email Product Release, Social Image, Website Webinar (image variant), Website Press Release, and Website Report (image variant) */}
            {((currentTemplate === 'website-thumbnail' && ebookVariant === 'image') || currentTemplate === 'email-image' || currentTemplate === 'email-product-release' || currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || (currentTemplate === 'website-webinar' && webinarVariant === 'image') || currentTemplate === 'website-press-release' || (currentTemplate === 'website-report' && reportVariant === 'image')) && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Image</label>
                {thumbnailImageUrl ? (
                  <ImagePreviewWithCrop
                    imageUrl={thumbnailImageUrl}
                    imagePosition={thumbnailImagePosition}
                    imageZoom={thumbnailImageZoom}
                    onAdjust={() => setShowCropModal(true)}
                    onRemove={() => {
                      setThumbnailImageUrl(null)
                      setThumbnailImageSettings(currentTemplate, { position: { x: 0, y: 0 }, zoom: 1 })
                    }}
                  />
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
                          : 'border-gray-300 dark:border-line-subtle'
                      }`}
                    >
                      <label className={`flex flex-col items-center justify-center h-full text-xs text-gray-500 dark:text-content-secondary ${isImageUploading ? 'cursor-wait' : 'cursor-pointer'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          className="hidden"
                          disabled={isImageUploading}
                        />
                        {isImageUploading ? (
                          <>
                            <svg className="w-4 h-4 mb-1 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Drop or upload
                          </>
                        )}
                      </label>
                    </div>
                    {/* Library box */}
                    <button
                      onClick={() => setShowImageLibrary(true)}
                      className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16
                        hover:border-gray-400 dark:hover:border-line-focus transition-colors
                        flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
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
                  <ToggleSwitch
                    label="Grayscale"
                    checked={grayscale}
                    onChange={() => setGrayscale(!grayscale)}
                    className="mt-3"
                  />
                )}
              </div>
            )}
          </div>

          {/* Direct Edit Mode */}
          {contentMode === 'verbatim' && (
            <div className="space-y-4">
              {/* Eyebrow - not shown for email-image, social-image, solution-overview-pdf (they don't use it) */}
              {currentTemplate !== 'email-image' && currentTemplate !== 'social-image' && currentTemplate !== 'social-image-meddbase' && currentTemplate !== 'solution-overview-pdf' && (
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
                    placeholder={currentTemplate === 'email-product-release' ? 'Product Release' : 'e.g., EBOOK, WEBINAR'}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                      bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                  <EyeIcon visible={showHeadline} onClick={() => setShowHeadline(!showHeadline)} />
                </div>
                {/* Rich text editor for social templates with rich text support */}
                {(currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || currentTemplate === 'email-image' || currentTemplate === 'email-speakers' || currentTemplate === 'email-dark-gradient') ? (
                  <SimpleRichTextEditor
                    content={verbatimCopy.headline}
                    onChange={(html) => setVerbatimCopy({ headline: html })}
                    placeholder="Headline"
                    singleLine={false}
                    onFontSizeUp={HEADLINE_SIZE_CONFIG[currentTemplate] ? () => {
                      const cfg = HEADLINE_SIZE_CONFIG[currentTemplate]
                      const effective = headlineFontSize ?? cfg.default
                      setHeadlineFontSize(Math.min(effective + cfg.step, cfg.max))
                    } : undefined}
                    onFontSizeDown={HEADLINE_SIZE_CONFIG[currentTemplate] ? () => {
                      const cfg = HEADLINE_SIZE_CONFIG[currentTemplate]
                      const effective = headlineFontSize ?? cfg.default
                      setHeadlineFontSize(Math.max(effective - cfg.step, cfg.min))
                    } : undefined}
                    fontSizeAtMax={HEADLINE_SIZE_CONFIG[currentTemplate] ? (headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) >= HEADLINE_SIZE_CONFIG[currentTemplate].max : false}
                    fontSizeAtMin={HEADLINE_SIZE_CONFIG[currentTemplate] ? (headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) <= HEADLINE_SIZE_CONFIG[currentTemplate].min : false}
                  />
                ) : (
                  <div className="flex gap-1.5 items-start">
                    <input
                      type="text"
                      value={verbatimCopy.headline}
                      onChange={(e) => setVerbatimCopy({ headline: e.target.value })}
                      placeholder="Headline"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {HEADLINE_SIZE_CONFIG[currentTemplate] && (
                      <div className="flex gap-0.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const cfg = HEADLINE_SIZE_CONFIG[currentTemplate]
                            const effective = headlineFontSize ?? cfg.default
                            setHeadlineFontSize(Math.min(effective + cfg.step, cfg.max))
                          }}
                          disabled={(headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) >= HEADLINE_SIZE_CONFIG[currentTemplate].max}
                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
                            (headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) >= HEADLINE_SIZE_CONFIG[currentTemplate].max
                              ? 'opacity-30 cursor-not-allowed'
                              : 'text-gray-500 dark:text-content-secondary'
                          }`}
                          title="Increase text size"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <text x="0" y="13" fontSize="13" fontWeight="500" fontFamily="system-ui">A</text>
                            <path d="M12.5 3 L14.5 0.5 L16.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2, 1.5)" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cfg = HEADLINE_SIZE_CONFIG[currentTemplate]
                            const effective = headlineFontSize ?? cfg.default
                            setHeadlineFontSize(Math.max(effective - cfg.step, cfg.min))
                          }}
                          disabled={(headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) <= HEADLINE_SIZE_CONFIG[currentTemplate].min}
                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
                            (headlineFontSize ?? HEADLINE_SIZE_CONFIG[currentTemplate].default) <= HEADLINE_SIZE_CONFIG[currentTemplate].min
                              ? 'opacity-30 cursor-not-allowed'
                              : 'text-gray-500 dark:text-content-secondary'
                          }`}
                          title="Decrease text size"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <text x="0" y="13" fontSize="10" fontWeight="500" fontFamily="system-ui">A</text>
                            <path d="M10.5 0.5 L12.5 3 L14.5 0.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2, 1.5)" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Subhead / Subheading */}
              {(currentTemplate === 'website-thumbnail' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || currentTemplate === 'email-dark-gradient' || currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {(currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-thumbnail' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') ? 'Subheader' : 'Subhead'}
                    </label>
                    <EyeIcon visible={showSubhead} onClick={() => setShowSubhead(!showSubhead)} />
                  </div>
                  {/* Rich text editor for templates with rich text support */}
                  {(currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase' || currentTemplate === 'email-dark-gradient') ? (
                    <div className={!showSubhead ? 'opacity-50' : ''}>
                      <SimpleRichTextEditor
                        content={verbatimCopy.subhead}
                        onChange={(html) => setVerbatimCopy({ subhead: html })}
                        placeholder="Supporting subheadline"
                      />
                    </div>
                  ) : (
                    <textarea
                      value={verbatimCopy.subhead}
                      onChange={(e) => setVerbatimCopy({ subhead: e.target.value })}
                      placeholder={(currentTemplate === 'website-webinar' || currentTemplate === 'website-press-release' || currentTemplate === 'website-thumbnail' || currentTemplate === 'website-report' || currentTemplate === 'newsletter-top-banner') ? 'Subheader text' : 'Supporting subheadline'}
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                        ${!showSubhead ? 'opacity-50' : ''}`}
                    />
                  )}
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
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                      bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${!showSubheading ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* Body - not shown for templates that don't use it */}
              {currentTemplate !== 'website-thumbnail' && currentTemplate !== 'social-image' && currentTemplate !== 'social-image-meddbase' && currentTemplate !== 'social-grid-detail' && currentTemplate !== 'website-event-listing' && currentTemplate !== 'website-floating-banner' && currentTemplate !== 'website-floating-banner-mobile' && currentTemplate !== 'newsletter-top-banner' && currentTemplate !== 'solution-overview-pdf' && currentTemplate !== 'email-product-release' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Body Copy
                    </label>
                    <EyeIcon visible={showBody} onClick={() => setShowBody(!showBody)} />
                  </div>
                  {/* Rich text editor for templates with rich text support */}
                  {(currentTemplate === 'social-blue-gradient' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'email-image' || currentTemplate === 'email-speakers' || currentTemplate === 'email-dark-gradient') ? (
                    <div className={!showBody ? 'opacity-50' : ''}>
                      <SimpleRichTextEditor
                        content={verbatimCopy.body}
                        onChange={(html) => setVerbatimCopy({ body: html })}
                        placeholder="Body text"
                      />
                    </div>
                  ) : (
                    <textarea
                      value={verbatimCopy.body}
                      onChange={(e) => setVerbatimCopy({ body: e.target.value })}
                      placeholder="Body text"
                      rows={3}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                        ${!showBody ? 'opacity-50' : ''}`}
                    />
                  )}
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
                    className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                      bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                      bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Grid Details - Email Grid only */}
              {currentTemplate === 'email-grid' && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-line-subtle">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grid Details</h4>

                  {/* Detail 1 - Always data */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Detail 1 (Data)</label>
                    <input
                      type="text"
                      value={gridDetail1Text}
                      onChange={(e) => setGridDetail1Text(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary"
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary ${!showGridDetail2 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Detail 3 - Data or CTA dropdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs text-gray-500">Detail 3</label>
                      <select
                        value={gridDetail3Type}
                        onChange={(e) => setGridDetail3Type(e.target.value as 'data' | 'cta')}
                        className="px-2 py-0.5 text-xs border border-gray-300 dark:border-line-subtle rounded
                          bg-white dark:bg-surface-primary"
                      >
                        <option value="data">Data</option>
                        <option value="cta">CTA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={gridDetail3Text}
                      onChange={(e) => setGridDetail3Text(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary"
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Social Image Content Fields */}
              {(currentTemplate === 'social-image' || currentTemplate === 'social-image-meddbase') && (
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${!showCta ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Email Speakers and Website Webinar (speakers variant) Content Fields */}
              {(currentTemplate === 'email-speakers' || (currentTemplate === 'website-webinar' && webinarVariant === 'speakers')) && (
                <SpeakerEditorControls
                  currentTemplate={currentTemplate}
                  ctaText={ctaText}
                  setCtaText={setCtaText}
                  showCta={showCta}
                  setShowCta={setShowCta}
                  speakerCount={speakerCount}
                  showSpeaker1={showSpeaker1}
                  showSpeaker2={showSpeaker2}
                  showSpeaker3={showSpeaker3}
                  setShowSpeaker1={setShowSpeaker1}
                  setShowSpeaker2={setShowSpeaker2}
                  setShowSpeaker3={setShowSpeaker3}
                  speaker1Name={speaker1Name}
                  setSpeaker1Name={setSpeaker1Name}
                  speaker1Role={speaker1Role}
                  setSpeaker1Role={setSpeaker1Role}
                  speaker1ImageUrl={speaker1ImageUrl}
                  speaker1ImagePosition={speaker1ImagePosition}
                  speaker1ImageZoom={speaker1ImageZoom}
                  setSpeaker1ImageZoom={setSpeaker1ImageZoom}
                  speaker2Name={speaker2Name}
                  setSpeaker2Name={setSpeaker2Name}
                  speaker2Role={speaker2Role}
                  setSpeaker2Role={setSpeaker2Role}
                  speaker2ImageUrl={speaker2ImageUrl}
                  speaker2ImagePosition={speaker2ImagePosition}
                  speaker2ImageZoom={speaker2ImageZoom}
                  setSpeaker2ImageZoom={setSpeaker2ImageZoom}
                  speaker3Name={speaker3Name}
                  setSpeaker3Name={setSpeaker3Name}
                  speaker3Role={speaker3Role}
                  setSpeaker3Role={setSpeaker3Role}
                  speaker3ImageUrl={speaker3ImageUrl}
                  speaker3ImagePosition={speaker3ImagePosition}
                  speaker3ImageZoom={speaker3ImageZoom}
                  setSpeaker3ImageZoom={setSpeaker3ImageZoom}
                  setActiveSpeakerForImage={setActiveSpeakerForImage}
                  setShowImageLibrary={setShowImageLibrary}
                />
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                            className="text-xs px-1.5 py-0.5 border border-gray-300 dark:border-line-subtle rounded
                              bg-white dark:bg-surface-primary text-gray-600 dark:text-content-secondary"
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
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                            className="text-xs px-1.5 py-0.5 border border-gray-300 dark:border-line-subtle rounded
                              bg-white dark:bg-surface-primary text-gray-600 dark:text-content-secondary"
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
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                        bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                          bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
                    bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
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
                    : 'border-gray-300 dark:border-line-subtle'
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
                      <span className="text-gray-700 dark:text-content-secondary">{contextFile.name}</span>
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
                  <label className="cursor-pointer text-gray-600 dark:text-content-secondary">
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
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Action Bar - above preview */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Scale Selector - hide for solution-overview-pdf */}
              {currentTemplate !== 'solution-overview-pdf' && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowScaleDropdown(!showScaleDropdown) }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-content-secondary
                      bg-gray-100 dark:bg-surface-secondary border border-gray-200 dark:border-line-subtle rounded-md
                      hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
                  >
                    {exportScale}x
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showScaleDropdown && (
                    <div className="absolute left-0 mt-1 w-16 bg-white dark:bg-surface-secondary border border-gray-200
                      dark:border-line-subtle rounded-md shadow-lg overflow-hidden z-10">
                      {[1, 2, 3].map((scale) => (
                        <button
                          key={scale}
                          onClick={(e) => { e.stopPropagation(); setExportScale(scale); setShowScaleDropdown(false) }}
                          className={`w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-interactive-hover
                            ${exportScale === scale ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-content-secondary'}`}
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
                    text-gray-600 dark:text-content-secondary bg-gray-100 dark:bg-surface-secondary rounded-md
                    hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors
                    border border-gray-200 dark:border-line-subtle"
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
                      text-gray-600 dark:text-content-secondary bg-gray-100 dark:bg-surface-secondary rounded-md
                      hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors
                      border border-gray-200 dark:border-line-subtle"
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
                    <span className="text-xs text-gray-500 dark:text-content-secondary mr-1">Page</span>
                    <div className="flex">
                      {([1, 2, 3] as const).map((page, idx) => (
                        <button
                          key={page}
                          onClick={() => setSolutionOverviewCurrentPage(page)}
                          className={`w-7 h-7 text-xs font-medium transition-colors border border-gray-300 dark:border-line-subtle ${
                            idx === 0 ? 'rounded-l' : ''
                          } ${idx === 2 ? 'rounded-r' : ''} ${idx > 0 ? '-ml-px' : ''} ${
                            solutionOverviewCurrentPage === page
                              ? 'bg-blue-500 text-white border-blue-500 z-10 relative'
                              : 'bg-white dark:bg-surface-secondary text-gray-600 dark:text-content-secondary hover:bg-gray-50 dark:hover:bg-interactive-hover'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-300 dark:bg-surface-tertiary" />

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPdfPreviewZoom(Math.max(75, pdfPreviewZoom - 25))}
                      disabled={pdfPreviewZoom <= 75}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-line-subtle rounded-l bg-white dark:bg-surface-secondary"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <select
                      value={pdfPreviewZoom}
                      onChange={(e) => setPdfPreviewZoom(Number(e.target.value))}
                      className="h-7 px-2 text-xs text-gray-600 dark:text-content-secondary bg-white dark:bg-surface-secondary border-y border-gray-300 dark:border-line-subtle focus:outline-none cursor-pointer"
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
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-line-subtle bg-white dark:bg-surface-secondary"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowPdfFullscreen(true)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary border border-gray-300 dark:border-line-subtle rounded-r bg-white dark:bg-surface-secondary ml-1"
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
                  text-gray-500 hover:text-red-600 dark:text-content-secondary dark:hover:text-red-400
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
                className="ring-1 ring-gray-300/50 dark:ring-line-subtle/50 rounded-sm w-full"
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
                    showHeadline={showHeadline}
                    variant={floatingBannerVariant}
                    headlineFontSize={headlineFontSize ?? undefined}
                    colors={colorsConfig}
                    typography={typographyConfig}
                    scale={1}
                  />
                </div>
              </div>
            ) : currentTemplate === 'solution-overview-pdf' ? (
              /* PDF Preview - simple container matching page dimensions */
              <div
                className="ring-1 ring-gray-300/50 dark:ring-line-subtle/50 rounded-sm shadow-lg"
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
                  stat1Value={solutionOverviewStat1Value}
                  stat1Label={solutionOverviewStat1Label}
                  stat2Value={solutionOverviewStat2Value}
                  stat2Label={solutionOverviewStat2Label}
                  stat3Value={solutionOverviewStat3Value}
                  stat3Label={solutionOverviewStat3Label}
                  stat4Value={solutionOverviewStat4Value}
                  stat4Label={solutionOverviewStat4Label}
                  stat5Value={solutionOverviewStat5Value}
                  stat5Label={solutionOverviewStat5Label}
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
                className="ring-1 ring-gray-300/50 dark:ring-line-subtle/50 rounded-sm"
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
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
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
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
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
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
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-image-meddbase' && (
                <SocialImageMeddbase
                  headline={verbatimCopy.headline || 'Headline'}
                  subhead={verbatimCopy.subhead}
                  metadata={metadata}
                  ctaText={ctaText}
                  imageUrl={thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
                  layout={layout}
                  solution={solution}
                  showHeadline={showHeadline}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-product-release' && (
                <EmailProductRelease
                  eyebrow={eyebrow || 'Product Release'}
                  headline={verbatimCopy.headline || 'GX2 2026.1'}
                  imageUrl={thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  imagePosition={thumbnailImagePosition}
                  imageZoom={thumbnailImageZoom}
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
                  showHeadline={showHeadline}
                  showSubheading={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  headlineFontSize={headlineFontSize ?? undefined}
                  bottomSpacing={showCta ? 0 : bottomSpacing}
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
                  showHeadline={showHeadline}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  showBody={showBody && !!verbatimCopy.body}
                  showCta={showCta}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
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
                  showHeadline={showHeadline}
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
                  headlineFontSize={headlineFontSize ?? undefined}
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
                  showHeadline={showHeadline}
                  variant={floatingBannerMobileVariant}
                  arrowType={floatingBannerMobileArrowType}
                  headlineFontSize={headlineFontSize ?? undefined}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              </div>
              </div>

              {/* Bottom spacing handle for email-dark-gradient when CTA is hidden */}
              {currentTemplate === 'email-dark-gradient' && !showCta && (
                <BottomSpacingHandle
                  spacing={bottomSpacing}
                  onChange={setBottomSpacing}
                  scale={previewScale}
                />
              )}
            </div>
            )}

            {/* Save & Cancel buttons when editing from queue */}
            {isEditingFromQueue && (
              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-content-secondary
                    bg-gray-100 dark:bg-surface-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover
                    border border-gray-200 dark:border-line-subtle transition-colors"
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
              <div className="relative bg-white dark:bg-surface-primary rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-content-primary mb-2">
                  Discard changes?
                </h3>
                <p className="text-sm text-gray-600 dark:text-content-secondary mb-6">
                  Your changes will not be saved. The original asset will remain in the queue.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-content-secondary
                      bg-gray-100 dark:bg-surface-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover
                      border border-gray-200 dark:border-line-subtle transition-colors"
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
                    stat1Value={solutionOverviewStat1Value}
                    stat1Label={solutionOverviewStat1Label}
                    stat2Value={solutionOverviewStat2Value}
                    stat2Label={solutionOverviewStat2Label}
                    stat3Value={solutionOverviewStat3Value}
                    stat3Label={solutionOverviewStat3Label}
                    stat4Value={solutionOverviewStat4Value}
                    stat4Label={solutionOverviewStat4Label}
                    stat5Value={solutionOverviewStat5Value}
                    stat5Label={solutionOverviewStat5Label}
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
                      stat1Value={solutionOverviewStat1Value}
                      stat1Label={solutionOverviewStat1Label}
                      stat2Value={solutionOverviewStat2Value}
                      stat2Label={solutionOverviewStat2Label}
                      stat3Value={solutionOverviewStat3Value}
                      stat3Label={solutionOverviewStat3Label}
                      stat4Value={solutionOverviewStat4Value}
                      stat4Label={solutionOverviewStat4Label}
                      stat5Value={solutionOverviewStat5Value}
                      stat5Label={solutionOverviewStat5Label}
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
