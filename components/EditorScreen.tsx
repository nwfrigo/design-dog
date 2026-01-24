'use client'

import { useState, useCallback, useEffect } from 'react'
import { useStore } from '@/store'
import { WebsiteThumbnail } from './templates/WebsiteThumbnail'
import { EmailGrid, type GridDetail } from './templates/EmailGrid'
import { SocialDarkGradient } from './templates/SocialDarkGradient'
import { SocialImage } from './templates/SocialImage'
import { SocialGridDetail, type GridDetailRow } from './templates/SocialGridDetail'
import { ImageLibraryModal } from './ImageLibraryModal'
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
    // Social Grid Detail specific
    gridDetail4Type,
    setGridDetail4Type,
    gridDetail4Text,
    setGridDetail4Text,
    showRow3,
    setShowRow3,
    showRow4,
    setShowRow4,
    // Queue
    addToQueue,
    exportQueue,
  } = useStore()

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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Add asset modal state
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [pendingAssets, setPendingAssets] = useState<TemplateType[]>([])
  const [modalExpandedChannels, setModalExpandedChannels] = useState<Set<string>>(new Set(['email']))

  // Image library modal state
  const [showImageLibrary, setShowImageLibrary] = useState(false)

  // Queue feedback state
  const [showQueuedFeedback, setShowQueuedFeedback] = useState(false)

  const currentTemplate = selectedAssets[currentAssetIndex]
  const dimensions = TEMPLATE_DIMENSIONS[currentTemplate]

  // Calculate preview scale for large templates
  const getPreviewScale = () => {
    if (currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-image' || currentTemplate === 'social-grid-detail') {
      return 0.6 // Scale down 1200px to ~720px
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

  // Handle file upload for context
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported')
      return
    }

    setUploadError(null)
    setContextFile(file)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPdfContent(data.content)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      setContextFile(null)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFileUpload(file)
  }, [])

  // Handle image upload for thumbnail
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const objectUrl = URL.createObjectURL(file)
    setThumbnailImageUrl(objectUrl)
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

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: fullContext }),
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
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showBody = showBody && !!verbatimCopy.body
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
      } else if (currentTemplate === 'social-dark-gradient') {
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
        exportParams.imageUrl = thumbnailImageUrl || '/assets/images/social-image-placeholder.png'
        exportParams.layout = layout
        exportParams.showSubhead = showSubhead && !!verbatimCopy.subhead
        exportParams.showMetadata = showMetadata
        exportParams.showCta = showCta
        exportParams.showSolutionSet = showSolutionSet
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
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
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

        {/* Add Asset Tab */}
        <button
          onClick={() => { setPendingAssets([]); setShowAddAssetModal(true) }}
          className="px-3 py-2.5 text-sm font-medium border-transparent text-gray-400 hover:text-gray-600
            dark:text-gray-500 dark:hover:text-gray-400 transition-colors -ml-px"
          title="Add Asset"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddAssetModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-[450px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Assets</h3>
            <div className="space-y-2 mb-6">
              {CHANNELS.map((channel) => {
                const isExpanded = modalExpandedChannels.has(channel.id)
                const hasTemplates = channel.templates.length > 0
                const pendingInChannel = channel.templates.filter(t =>
                  pendingAssets.includes(t.type)
                ).length

                return (
                  <div key={channel.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Channel Header */}
                    <button
                      onClick={() => {
                        setModalExpandedChannels(prev => {
                          const next = new Set(prev)
                          if (next.has(channel.id)) {
                            next.delete(channel.id)
                          } else {
                            next.add(channel.id)
                          }
                          return next
                        })
                      }}
                      disabled={!hasTemplates}
                      className={`w-full px-3 py-2.5 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50
                        ${hasTemplates ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-default opacity-60'}
                        transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''} ${!hasTemplates ? 'opacity-0' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {channel.label}
                        </span>
                        {!hasTemplates && (
                          <span className="text-xs text-gray-400">Coming soon</span>
                        )}
                      </div>
                      {pendingInChannel > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {pendingInChannel}
                        </span>
                      )}
                    </button>

                    {/* Templates List */}
                    {isExpanded && hasTemplates && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {channel.templates.map((template) => {
                          const countInPending = pendingAssets.filter(t => t === template.type).length
                          const existingCount = selectedAssets.filter(a => a === template.type).length
                          return (
                            <div
                              key={template.type}
                              className="flex items-center gap-3 p-3 pl-10 border-b last:border-b-0 border-gray-100 dark:border-gray-800"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {template.label}
                                </div>
                                <div className="text-xs text-gray-500 truncate">{template.description}</div>
                                {existingCount > 0 && (
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {existingCount} already in project
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    if (countInPending > 0) {
                                      const idx = pendingAssets.lastIndexOf(template.type)
                                      if (idx !== -1) {
                                        const newPending = [...pendingAssets]
                                        newPending.splice(idx, 1)
                                        setPendingAssets(newPending)
                                      }
                                    }
                                  }}
                                  disabled={countInPending === 0}
                                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300
                                    dark:border-gray-600 text-gray-600 dark:text-gray-400 disabled:opacity-30
                                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="w-5 text-center text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {countInPending}
                                </span>
                                <button
                                  onClick={() => setPendingAssets([...pendingAssets, template.type])}
                                  className="w-6 h-6 flex items-center justify-center rounded-full border border-blue-500
                                    text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
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
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                  hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add {pendingAssets.length > 0 ? `(${pendingAssets.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Library Modal */}
      {showImageLibrary && (
        <ImageLibraryModal
          onSelect={(url) => {
            setThumbnailImageUrl(url)
            setShowImageLibrary(false)
          }}
          onClose={() => setShowImageLibrary(false)}
        />
      )}

      <div className="flex gap-8">
        {/* Left: Editor */}
        <div className="w-[340px] flex-shrink-0 space-y-5">
          {/* Mode Toggle */}
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

          {/* Template Options */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex gap-3">
              {/* Logo Color - Orange/White for Social, Black/Orange for others */}
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

              {/* Category - Not shown for Social Dark Gradient */}
              {(currentTemplate !== 'social-dark-gradient') && (
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

            {/* Social Dark Gradient Variant Controls */}
            {currentTemplate === 'social-dark-gradient' && (
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

            {/* Social Image Layout Controls */}
            {currentTemplate === 'social-image' && (
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


            {/* Image - Website Thumbnail and Social Image */}
            {(currentTemplate === 'website-thumbnail' || currentTemplate === 'social-image') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Image</label>
                {thumbnailImageUrl ? (
                  <div className="relative h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img
                      src={thumbnailImageUrl}
                      alt="Selected image"
                      className="w-full h-full object-cover filter grayscale"
                    />
                    <button
                      onClick={() => setThumbnailImageUrl(null)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
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
              </div>
            )}
          </div>

          {/* Direct Edit Mode */}
          {contentMode === 'verbatim' && (
            <div className="space-y-4">
              {/* Eyebrow */}
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

              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Headline <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={verbatimCopy.headline}
                  onChange={(e) => setVerbatimCopy({ headline: e.target.value })}
                  placeholder="Your main headline"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Subhead / Subheading */}
              {(currentTemplate === 'website-thumbnail' || currentTemplate === 'social-dark-gradient' || currentTemplate === 'social-image') && (
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
                    placeholder="Supporting subheadline"
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

              {/* Body */}
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

              {/* Solution Pill - Email Grid only */}
              {currentTemplate === 'email-grid' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Solution Pill
                    </label>
                    <EyeIcon visible={showSolutionSet} onClick={() => setShowSolutionSet(!showSolutionSet)} />
                  </div>
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

              {/* Social Dark Gradient Content Fields */}
              {currentTemplate === 'social-dark-gradient' && (
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
                {contextFile ? (
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
                disabled={(!generationContext.trim() && !pdfContent) || isGenerating}
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
        <div className="flex-1 flex flex-col">
          {/* Action Bar - above preview */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Scale Selector */}
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

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting || !verbatimCopy.headline}
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

              {/* Add to Queue Button */}
              <button
                onClick={() => {
                  addToQueue()
                  setShowQueuedFeedback(true)
                  setTimeout(() => setShowQueuedFeedback(false), 2000)
                }}
                disabled={!verbatimCopy.headline}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                  text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md
                  hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors
                  border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Queue
              </button>
            </div>

            {/* Delete Asset Button */}
            {selectedAssets.length > 1 && (
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
          <div className="flex items-start justify-center flex-1">
            <div style={{
              width: dimensions.width * previewScale,
              height: dimensions.height * previewScale,
              overflow: 'hidden',
            }}>
              <div style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                width: dimensions.width,
                height: dimensions.height,
              }}>
              {currentTemplate === 'website-thumbnail' && (
                <WebsiteThumbnail
                  eyebrow={eyebrow}
                  headline={verbatimCopy.headline || 'Your headline here'}
                  subhead={verbatimCopy.subhead}
                  body={verbatimCopy.body}
                  solution={solution}
                  imageUrl={thumbnailImageUrl || undefined}
                  showEyebrow={showEyebrow}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showBody={showBody && !!verbatimCopy.body}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'email-grid' && (
                <EmailGrid
                  headline={verbatimCopy.headline || 'Your headline here'}
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
                  headline={verbatimCopy.headline || 'Room for a great headline.'}
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
              {currentTemplate === 'social-image' && (
                <SocialImage
                  headline={verbatimCopy.headline || 'Room for a great headline.'}
                  subhead={verbatimCopy.subhead}
                  metadata={metadata}
                  ctaText={ctaText}
                  imageUrl={thumbnailImageUrl || '/assets/images/social-image-placeholder.png'}
                  layout={layout}
                  solution={solution}
                  logoColor={logoColor === 'white' ? 'black' : logoColor}
                  showSubhead={showSubhead && !!verbatimCopy.subhead}
                  showMetadata={showMetadata}
                  showCta={showCta}
                  showSolutionSet={showSolutionSet}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {currentTemplate === 'social-grid-detail' && (
                <SocialGridDetail
                  headline={verbatimCopy.headline || 'Room for a great headline.'}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
