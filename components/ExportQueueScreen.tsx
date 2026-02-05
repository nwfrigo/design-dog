'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import type { QueuedAsset, TemplateType } from '@/types'
import { WebsiteThumbnail } from './templates/WebsiteThumbnail'
import { WebsitePressRelease } from './templates/WebsitePressRelease'
import { WebsiteWebinar } from './templates/WebsiteWebinar'
import { WebsiteReport } from './templates/WebsiteReport'
import { WebsiteEventListing } from './templates/WebsiteEventListing'
import { WebsiteFloatingBanner } from './templates/WebsiteFloatingBanner'
import { WebsiteFloatingBannerMobile } from './templates/WebsiteFloatingBannerMobile'
import { EmailGrid, type GridDetail } from './templates/EmailGrid'
import { EmailImage } from './templates/EmailImage'
import { SocialDarkGradient } from './templates/SocialDarkGradient'
import { SocialBlueGradient } from './templates/SocialBlueGradient'
import { SocialImage } from './templates/SocialImage'
import { SocialGridDetail, type GridDetailRow } from './templates/SocialGridDetail'
import { EmailDarkGradient } from './templates/EmailDarkGradient'
import { EmailSpeakers } from './templates/EmailSpeakers'
import { NewsletterDarkGradient } from './templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from './templates/NewsletterBlueGradient'
import { NewsletterLight } from './templates/NewsletterLight'
import {
  fetchColorsConfig,
  fetchTypographyConfig,
  type ColorsConfig,
  type TypographyConfig
} from '@/lib/brand-config'
import { CHANNELS, TEMPLATE_DIMENSIONS } from '@/lib/template-config'

type ExportScale = '1x' | '2x'

export function ExportQueueScreen() {
  const {
    exportQueue,
    removeFromQueue,
    clearQueue,
    editQueuedAsset,
    setCurrentScreen,
    selectedAssets,
    setSelectedAssets,
    goToAsset,
  } = useStore()

  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportingAll, setExportingAll] = useState(false)
  const [exportAllScale, setExportAllScale] = useState<ExportScale>('2x')
  const [previewAsset, setPreviewAsset] = useState<QueuedAsset | null>(null)
  const [showNewAssetModal, setShowNewAssetModal] = useState(false)
  const [pendingAssets, setPendingAssets] = useState<TemplateType[]>([])
  const [modalExpandedChannels, setModalExpandedChannels] = useState<Set<string>>(new Set(['email']))

  // Brand config state
  const [colorsConfig, setColorsConfig] = useState<ColorsConfig | null>(null)
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig | null>(null)

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
      }
    }
    loadConfig()
  }, [])

  const getTemplateName = (type: string) => {
    switch (type) {
      case 'website-thumbnail':
        return 'Website - eBook Featured Image'
      case 'website-press-release':
        return 'Website - Press Release Featured Image'
      case 'email-grid':
        return 'Email - Grid Details'
      default:
        return type
    }
  }

  const handleExportSingle = async (asset: QueuedAsset, scale: ExportScale) => {
    setExportingId(asset.id)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: asset.templateType,
          scale: scale === '2x' ? 2 : 1,
          headline: asset.headline,
          subhead: asset.subhead,
          body: asset.body,
          eyebrow: asset.eyebrow,
          solution: asset.solution,
          logoColor: asset.logoColor,
          showEyebrow: asset.showEyebrow,
          showSubhead: asset.showSubhead,
          showBody: asset.showBody,
          imageUrl: asset.thumbnailImageUrl,
          imagePositionX: asset.thumbnailImagePosition?.x,
          imagePositionY: asset.thumbnailImagePosition?.y,
          imageZoom: asset.thumbnailImageZoom,
          // Website thumbnail specific
          ebookVariant: asset.ebookVariant,
          subheading: asset.subheading,
          showLightHeader: asset.showLightHeader,
          showSubheading: asset.showSubheading,
          showSolutionSet: asset.showSolutionSet,
          showGridDetail2: asset.showGridDetail2,
          gridDetail1Text: asset.gridDetail1Text,
          gridDetail2Text: asset.gridDetail2Text,
          gridDetail3Type: asset.gridDetail3Type,
          gridDetail3Text: asset.gridDetail3Text,
          // Social image specific
          layout: asset.layout,
          metadata: asset.metadata,
          ctaText: asset.ctaText,
          showMetadata: asset.showMetadata,
          showCta: asset.showCta,
          // Social grid detail specific
          gridDetail4Type: asset.gridDetail4Type,
          gridDetail4Text: asset.gridDetail4Text,
          showRow3: asset.showRow3,
          showRow4: asset.showRow4,
          // Email dark gradient specific
          colorStyle: asset.colorStyle,
          alignment: asset.alignment,
          ctaStyle: asset.ctaStyle,
          // Newsletter dark gradient specific
          imageSize: asset.newsletterImageSize,
          newsletterImageUrl: asset.newsletterImageUrl,
          newsletterImagePositionX: asset.newsletterImagePosition?.x,
          newsletterImagePositionY: asset.newsletterImagePosition?.y,
          newsletterImageZoom: asset.newsletterImageZoom,
          // Template variant (determined by template type)
          variant: asset.templateType === 'website-floating-banner' ? asset.floatingBannerVariant
            : asset.templateType === 'website-floating-banner-mobile' ? asset.floatingBannerMobileVariant
            : asset.templateType === 'website-event-listing' ? asset.eventListingVariant
            : asset.templateType === 'website-report' ? asset.reportVariant
            : asset.templateType === 'website-thumbnail' ? asset.ebookVariant
            : asset.webinarVariant,
          // Email speakers and website webinar specific
          speakerCount: asset.speakerCount,
          speaker1Name: asset.speaker1Name,
          speaker1Role: asset.speaker1Role,
          speaker1ImageUrl: asset.speaker1ImageUrl,
          speaker1ImagePositionX: asset.speaker1ImagePosition?.x,
          speaker1ImagePositionY: asset.speaker1ImagePosition?.y,
          speaker1ImageZoom: asset.speaker1ImageZoom,
          speaker2Name: asset.speaker2Name,
          speaker2Role: asset.speaker2Role,
          speaker2ImageUrl: asset.speaker2ImageUrl,
          speaker2ImagePositionX: asset.speaker2ImagePosition?.x,
          speaker2ImagePositionY: asset.speaker2ImagePosition?.y,
          speaker2ImageZoom: asset.speaker2ImageZoom,
          speaker3Name: asset.speaker3Name,
          speaker3Role: asset.speaker3Role,
          speaker3ImageUrl: asset.speaker3ImageUrl,
          speaker3ImagePositionX: asset.speaker3ImagePosition?.x,
          speaker3ImagePositionY: asset.speaker3ImagePosition?.y,
          speaker3ImageZoom: asset.speaker3ImageZoom,
          showSpeaker1: asset.showSpeaker1,
          showSpeaker2: asset.showSpeaker2,
          showSpeaker3: asset.showSpeaker3,
          // Website floating banner mobile specific
          arrowType: asset.floatingBannerMobileArrowType,
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${asset.templateType}-${asset.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExportingId(null)
    }
  }

  const handleExportAll = async () => {
    if (exportQueue.length === 0) return

    setExportingAll(true)
    try {
      for (const asset of exportQueue) {
        await handleExportSingle(asset, exportAllScale)
      }
    } finally {
      setExportingAll(false)
    }
  }

  const handleAddNewAssets = () => {
    if (pendingAssets.length > 0) {
      const currentLength = selectedAssets.length
      const newAssets = [...selectedAssets, ...pendingAssets]
      setSelectedAssets(newAssets)
      goToAsset(currentLength)
      setCurrentScreen('editor')
      setShowNewAssetModal(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Export Queue
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {exportQueue.length} {exportQueue.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>

        {exportQueue.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearQueue}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </button>

            <div className="flex items-center gap-2">
              <select
                value={exportAllScale}
                onChange={(e) => setExportAllScale(e.target.value as ExportScale)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="1x">1x</option>
                <option value="2x">2x</option>
              </select>

              <button
                onClick={handleExportAll}
                disabled={exportingAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400
                  text-white rounded-lg font-medium transition-colors"
              >
                {exportingAll ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  'Export All'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Queue List */}
      {exportQueue.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No assets in queue
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add assets to the queue from the editor to export them here.
          </p>
          <button
            onClick={() => setCurrentScreen('select')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
              text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Go to Editor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {exportQueue.map((asset) => (
            <QueueItem
              key={asset.id}
              asset={asset}
              isExporting={exportingId === asset.id}
              onExport={(scale) => handleExportSingle(asset, scale)}
              onEdit={() => editQueuedAsset(asset.id)}
              onRemove={() => removeFromQueue(asset.id)}
              onPreview={() => setPreviewAsset(asset)}
              getTemplateName={getTemplateName}
              colorsConfig={colorsConfig}
              typographyConfig={typographyConfig}
            />
          ))}
        </div>
      )}

      {/* New Asset Modal */}
      {showNewAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewAssetModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-[450px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Assets</h3>
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
                          return (
                            <div
                              key={template.type}
                              className="flex items-center gap-3 p-3 pl-10 border-b last:border-b-0 border-gray-100 dark:border-gray-800"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {template.label}
                                </div>
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
                onClick={() => setShowNewAssetModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewAssets}
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

      {/* Preview Modal */}
      {previewAsset && colorsConfig && typographyConfig && (
        <PreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          colorsConfig={colorsConfig}
          typographyConfig={typographyConfig}
        />
      )}
    </div>
  )
}

interface QueueItemProps {
  asset: QueuedAsset
  isExporting: boolean
  onExport: (scale: ExportScale) => void
  onEdit: () => void
  onRemove: () => void
  onPreview: () => void
  getTemplateName: (type: string) => string
  colorsConfig: ColorsConfig | null
  typographyConfig: TypographyConfig | null
}

function QueueItem({
  asset,
  isExporting,
  onExport,
  onEdit,
  onRemove,
  onPreview,
  getTemplateName,
  colorsConfig,
  typographyConfig,
}: QueueItemProps) {
  const [scale, setScale] = useState<ExportScale>('2x')

  const dimensions = TEMPLATE_DIMENSIONS[asset.templateType]
  const thumbnailScale = 0.12 // Scale down to fit in thumbnail area

  // Build text fields list based on what has content
  const textFields: { label: string; value: string }[] = []

  if (asset.eyebrow && asset.showEyebrow) {
    textFields.push({ label: 'Eyebrow', value: asset.eyebrow })
  }
  if (asset.headline) {
    textFields.push({ label: 'Headline', value: asset.headline })
  }
  if (asset.subhead && asset.showSubhead) {
    textFields.push({ label: 'Subhead', value: asset.subhead })
  }
  if (asset.subheading && asset.showSubheading) {
    textFields.push({ label: 'Subheading', value: asset.subheading })
  }
  if (asset.body && asset.showBody) {
    textFields.push({ label: 'Body', value: asset.body })
  }
  if (asset.templateType === 'email-grid') {
    if (asset.gridDetail1Text) {
      textFields.push({ label: 'Detail 1', value: asset.gridDetail1Text })
    }
    if (asset.gridDetail2Text && asset.showGridDetail2) {
      textFields.push({ label: 'Detail 2', value: asset.gridDetail2Text })
    }
    if (asset.gridDetail3Text) {
      textFields.push({ label: 'Detail 3', value: asset.gridDetail3Text })
    }
  }
  if (asset.templateType === 'social-dark-gradient' || asset.templateType === 'social-blue-gradient') {
    if (asset.metadata && asset.showMetadata) {
      textFields.push({ label: 'Metadata', value: asset.metadata })
    }
    if (asset.ctaText && asset.showCta) {
      textFields.push({ label: 'CTA', value: asset.ctaText })
    }
  }
  if (asset.templateType === 'social-image') {
    if (asset.metadata && asset.showMetadata) {
      textFields.push({ label: 'Metadata', value: asset.metadata })
    }
    if (asset.ctaText && asset.showCta) {
      textFields.push({ label: 'CTA', value: asset.ctaText })
    }
  }
  if (asset.templateType === 'social-grid-detail') {
    if (asset.gridDetail1Text) {
      textFields.push({ label: 'Row 1', value: asset.gridDetail1Text })
    }
    if (asset.gridDetail2Text) {
      textFields.push({ label: 'Row 2', value: asset.gridDetail2Text })
    }
    if (asset.gridDetail3Text && asset.showRow3) {
      textFields.push({ label: 'Row 3', value: asset.gridDetail3Text })
    }
    if (asset.gridDetail4Text && asset.showRow4) {
      textFields.push({ label: 'Row 4', value: asset.gridDetail4Text })
    }
  }
  if (asset.templateType === 'email-image') {
    if (asset.ctaText && asset.showCta) {
      textFields.push({ label: 'CTA', value: asset.ctaText })
    }
  }

  // Build grid details for EmailGrid
  const gridDetail1: GridDetail = { type: 'data', text: asset.gridDetail1Text }
  const gridDetail2: GridDetail = { type: 'data', text: asset.gridDetail2Text }
  const gridDetail3: GridDetail = { type: asset.gridDetail3Type, text: asset.gridDetail3Text }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-4">
        {/* Preview thumbnail - renders actual asset */}
        <button
          onClick={onPreview}
          className="relative group flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700
            hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer [&_*]:!text-left"
          style={{
            width: dimensions.width * thumbnailScale,
            height: dimensions.height * thumbnailScale
          }}
        >
          {colorsConfig && typographyConfig ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `scale(${thumbnailScale})`,
                transformOrigin: 'top left',
                width: dimensions.width,
                height: dimensions.height,
              }}
            >
              {asset.templateType === 'website-thumbnail' && (
                <WebsiteThumbnail
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Lightweight header.'}
                  subhead={asset.subhead}
                  cta={asset.ctaText || 'Responsive'}
                  solution={asset.solution}
                  variant={asset.ebookVariant}
                  imageUrl={asset.thumbnailImageUrl || undefined}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showCta={asset.showCta}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-press-release' && (
                <WebsitePressRelease
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Lightweight header.'}
                  subhead={asset.subhead}
                  body={asset.body}
                  cta={asset.ctaText || 'Responsive'}
                  solution={asset.solution}
                  imageUrl={asset.thumbnailImageUrl || undefined}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-webinar' && (
                <WebsiteWebinar
                  eyebrow={asset.eyebrow || 'Webinar'}
                  headline={asset.headline || 'Lightweight header.'}
                  subhead={asset.subhead}
                  body={asset.body}
                  cta={asset.ctaText || 'Responsive'}
                  solution={asset.solution}
                  variant={asset.webinarVariant}
                  imageUrl={asset.thumbnailImageUrl || undefined}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta}
                  speakerCount={asset.speakerCount}
                  speaker1={{
                    name: asset.speaker1Name,
                    role: asset.speaker1Role,
                    imageUrl: asset.speaker1ImageUrl,
                    imagePosition: asset.speaker1ImagePosition,
                    imageZoom: asset.speaker1ImageZoom,
                  }}
                  speaker2={{
                    name: asset.speaker2Name,
                    role: asset.speaker2Role,
                    imageUrl: asset.speaker2ImageUrl,
                    imagePosition: asset.speaker2ImagePosition,
                    imageZoom: asset.speaker2ImageZoom,
                  }}
                  speaker3={{
                    name: asset.speaker3Name,
                    role: asset.speaker3Role,
                    imageUrl: asset.speaker3ImageUrl,
                    imagePosition: asset.speaker3ImagePosition,
                    imageZoom: asset.speaker3ImageZoom,
                  }}
                  showSpeaker1={asset.showSpeaker1}
                  showSpeaker2={asset.showSpeaker2}
                  showSpeaker3={asset.showSpeaker3}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'email-grid' && (
                <EmailGrid
                  headline={asset.headline || 'Headline'}
                  body={asset.body}
                  eyebrow={asset.eyebrow}
                  subheading={asset.subheading}
                  showEyebrow={asset.showEyebrow}
                  showLightHeader={asset.showLightHeader}
                  showHeavyHeader={false}
                  showSubheading={asset.showSubheading}
                  showBody={asset.showBody}
                  showSolutionSet={asset.showSolutionSet}
                  solution={asset.solution}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  showGridDetail2={asset.showGridDetail2}
                  gridDetail1={gridDetail1}
                  gridDetail2={gridDetail2}
                  gridDetail3={gridDetail3}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'email-image' && (
                <EmailImage
                  headline={asset.headline || 'Headline'}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  layout={asset.layout || 'even'}
                  solution={asset.solution}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  showSolutionSet={asset.showSolutionSet !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'social-dark-gradient' && (
                <SocialDarkGradient
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Headline'}
                  subhead={asset.subhead}
                  body={asset.body}
                  metadata={asset.metadata}
                  ctaText={asset.ctaText}
                  colorStyle={asset.colorStyle}
                  headingSize={asset.headingSize}
                  alignment={asset.alignment}
                  ctaStyle={asset.ctaStyle}
                  logoColor={asset.logoColor === 'black' ? 'white' : asset.logoColor}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showBody={asset.showBody && !!asset.body}
                  showMetadata={asset.showMetadata}
                  showCta={asset.showCta}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'social-blue-gradient' && (
                <SocialBlueGradient
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Headline'}
                  subhead={asset.subhead}
                  body={asset.body}
                  metadata={asset.metadata}
                  ctaText={asset.ctaText}
                  colorStyle={asset.colorStyle}
                  headingSize={asset.headingSize}
                  alignment={asset.alignment}
                  ctaStyle={asset.ctaStyle}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showBody={asset.showBody && !!asset.body}
                  showMetadata={asset.showMetadata}
                  showCta={asset.showCta}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'social-image' && (
                <SocialImage
                  headline={asset.headline || 'Headline'}
                  subhead={asset.subhead || ''}
                  metadata={asset.metadata || 'Day / Month | 00:00'}
                  ctaText={asset.ctaText || 'Learn More'}
                  imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
                  layout={asset.layout || 'even'}
                  solution={asset.solution}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showMetadata={asset.showMetadata !== false}
                  showCta={asset.showCta !== false}
                  showSolutionSet={asset.showSolutionSet !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'social-grid-detail' && (
                <SocialGridDetail
                  headline={asset.headline || 'Headline'}
                  subhead={asset.subhead || 'This is your subheader or description text.'}
                  eyebrow={asset.eyebrow || "Don't miss this."}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showSolutionSet={asset.showSolutionSet !== false}
                  solution={asset.solution}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  showRow3={asset.showRow3 !== false}
                  showRow4={asset.showRow4 !== false}
                  gridDetail1={{ type: 'data', text: asset.gridDetail1Text || 'Date: January 1st, 2026' }}
                  gridDetail2={{ type: 'data', text: asset.gridDetail2Text || 'Time: Midnight, EST' }}
                  gridDetail3={{ type: asset.gridDetail3Type || 'data', text: asset.gridDetail3Text || 'Place: Wherever' }}
                  gridDetail4={{ type: asset.gridDetail4Type || 'cta', text: asset.gridDetail4Text || 'Join the event' }}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'email-dark-gradient' && (
                <EmailDarkGradient
                  headline={asset.headline || 'Headline'}
                  eyebrow={asset.eyebrow}
                  subheading={asset.subhead}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  colorStyle={asset.colorStyle || '1'}
                  alignment={asset.alignment || 'left'}
                  ctaStyle={asset.ctaStyle || 'link'}
                  showEyebrow={asset.showEyebrow && !!asset.eyebrow}
                  showSubheading={asset.showSubhead && !!asset.subhead}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'email-speakers' && (
                <EmailSpeakers
                  headline={asset.headline || 'Headline'}
                  eyebrow={asset.eyebrow}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  solution={asset.solution}
                  logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
                  showEyebrow={asset.showEyebrow && !!asset.eyebrow}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  showSolutionSet={asset.showSolutionSet !== false}
                  speakerCount={asset.speakerCount || 3}
                  speaker1={{
                    name: asset.speaker1Name || 'Firstname Lastname',
                    role: asset.speaker1Role || 'Role, Company',
                    imageUrl: asset.speaker1ImageUrl || '',
                    imagePosition: asset.speaker1ImagePosition || { x: 0, y: 0 },
                    imageZoom: asset.speaker1ImageZoom || 1,
                  }}
                  speaker2={{
                    name: asset.speaker2Name || 'Firstname Lastname',
                    role: asset.speaker2Role || 'Role, Company',
                    imageUrl: asset.speaker2ImageUrl || '',
                    imagePosition: asset.speaker2ImagePosition || { x: 0, y: 0 },
                    imageZoom: asset.speaker2ImageZoom || 1,
                  }}
                  speaker3={{
                    name: asset.speaker3Name || 'Firstname Lastname',
                    role: asset.speaker3Role || 'Role, Company',
                    imageUrl: asset.speaker3ImageUrl || '',
                    imagePosition: asset.speaker3ImagePosition || { x: 0, y: 0 },
                    imageZoom: asset.speaker3ImageZoom || 1,
                  }}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'newsletter-dark-gradient' && (
                <NewsletterDarkGradient
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Headline'}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  colorStyle={asset.colorStyle || '1'}
                  imageSize={asset.newsletterImageSize || 'none'}
                  imageUrl={asset.newsletterImageUrl || null}
                  imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
                  imageZoom={asset.newsletterImageZoom || 1}
                  showEyebrow={asset.showEyebrow && !!asset.eyebrow}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'newsletter-blue-gradient' && (
                <NewsletterBlueGradient
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Headline'}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  colorStyle={asset.colorStyle || '1'}
                  imageSize={asset.newsletterImageSize || 'none'}
                  imageUrl={asset.newsletterImageUrl || null}
                  imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
                  imageZoom={asset.newsletterImageZoom || 1}
                  showEyebrow={asset.showEyebrow && !!asset.eyebrow}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'newsletter-light' && (
                <NewsletterLight
                  eyebrow={asset.eyebrow}
                  headline={asset.headline || 'Headline'}
                  body={asset.body || 'This is your body copy.'}
                  ctaText={asset.ctaText || 'Responsive'}
                  imageSize={asset.newsletterImageSize || 'none'}
                  imageUrl={asset.newsletterImageUrl || null}
                  imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
                  imageZoom={asset.newsletterImageZoom || 1}
                  showEyebrow={asset.showEyebrow && !!asset.eyebrow}
                  showBody={asset.showBody && !!asset.body}
                  showCta={asset.showCta !== false}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-report' && (
                <WebsiteReport
                  eyebrow={asset.eyebrow || 'REPORT'}
                  headline={asset.headline || 'Lightweight header.'}
                  subhead={asset.subhead}
                  cta={asset.ctaText || 'Responsive'}
                  solution={asset.solution}
                  variant={asset.reportVariant}
                  imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_report.png'}
                  imagePosition={asset.thumbnailImagePosition || { x: 0, y: 0 }}
                  imageZoom={asset.thumbnailImageZoom || 1}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  showCta={asset.showCta}
                  grayscale={asset.grayscale}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-event-listing' && (
                <WebsiteEventListing
                  eyebrow={asset.eyebrow || 'LIVE EVENT'}
                  headline={asset.headline || 'Headline'}
                  subhead={asset.subhead}
                  cta={asset.ctaText || 'Responsive'}
                  variant={asset.eventListingVariant}
                  gridDetail1Text={asset.gridDetail1Text || 'Add Details or Hide Me'}
                  gridDetail2Text={asset.gridDetail2Text || 'Add Details or Hide Me'}
                  gridDetail3Text={asset.gridDetail3Text || 'Add Details or Hide Me'}
                  gridDetail4Text={asset.gridDetail4Text || 'Add Details or Hide Me'}
                  showRow3={asset.showRow3}
                  showRow4={asset.showRow4}
                  showEyebrow={asset.showEyebrow}
                  showSubhead={asset.showSubhead && !!asset.subhead}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-floating-banner' && (
                <WebsiteFloatingBanner
                  eyebrow={asset.eyebrow || 'EYEBROW'}
                  headline={asset.headline || 'Headline'}
                  cta={asset.ctaText || 'Learn More'}
                  showEyebrow={asset.showEyebrow}
                  variant={asset.floatingBannerVariant || 'dark'}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
              {asset.templateType === 'website-floating-banner-mobile' && (
                <WebsiteFloatingBannerMobile
                  eyebrow={asset.eyebrow || 'EYEBROW'}
                  headline={asset.headline || 'Headline'}
                  cta={asset.ctaText || 'Learn More'}
                  showEyebrow={asset.showEyebrow}
                  variant={asset.floatingBannerMobileVariant || 'light'}
                  arrowType={asset.floatingBannerMobileArrowType || 'text'}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          )}

          {/* Expand icon overlay */}
          <div className="absolute bottom-1 right-1 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </button>

        {/* Asset info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {getTemplateName(asset.templateType)}
            </span>
          </div>

          {/* Text fields */}
          <div className="space-y-1">
            {textFields.slice(0, 4).map((field, index) => (
              <p key={index} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                <span className="font-medium text-gray-700 dark:text-gray-300">{field.label}:</span>{' '}
                {field.value}
              </p>
            ))}
            {textFields.length > 4 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                +{textFields.length - 4} more fields
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Scale dropdown */}
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as ExportScale)}
            disabled={isExporting}
            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="1x">1x</option>
            <option value="2x">2x</option>
          </select>

          {/* Export button - blue */}
          <button
            onClick={() => onExport(scale)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400
              text-white text-sm rounded-lg font-medium transition-colors"
          >
            {isExporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Export
          </button>

          {/* Edit button - matches Add to Queue styling */}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg
              hover:bg-blue-100 text-sm font-medium transition-colors border border-blue-200
              dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
          >
            Edit
          </button>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Remove from queue"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

interface PreviewModalProps {
  asset: QueuedAsset
  onClose: () => void
  colorsConfig: ColorsConfig
  typographyConfig: TypographyConfig
}

function PreviewModal({ asset, onClose, colorsConfig, typographyConfig }: PreviewModalProps) {
  const dimensions = TEMPLATE_DIMENSIONS[asset.templateType]

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Build grid details for EmailGrid
  const gridDetail1: GridDetail = { type: 'data', text: asset.gridDetail1Text }
  const gridDetail2: GridDetail = { type: 'data', text: asset.gridDetail2Text }
  const gridDetail3: GridDetail = { type: asset.gridDetail3Type, text: asset.gridDetail3Text }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal content */}
      <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Asset preview at full size */}
        <div
          className="rounded-lg overflow-hidden shadow-2xl"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {asset.templateType === 'website-thumbnail' && (
            <WebsiteThumbnail
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Lightweight header.'}
              subhead={asset.subhead}
              cta={asset.ctaText || 'Responsive'}
              solution={asset.solution}
              variant={asset.ebookVariant}
              imageUrl={asset.thumbnailImageUrl || undefined}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showCta={asset.showCta}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-press-release' && (
            <WebsitePressRelease
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Lightweight header.'}
              subhead={asset.subhead}
              body={asset.body}
              cta={asset.ctaText || 'Responsive'}
              solution={asset.solution}
              imageUrl={asset.thumbnailImageUrl || undefined}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-webinar' && (
            <WebsiteWebinar
              eyebrow={asset.eyebrow || 'Webinar'}
              headline={asset.headline || 'Lightweight header.'}
              subhead={asset.subhead}
              body={asset.body}
              cta={asset.ctaText || 'Responsive'}
              solution={asset.solution}
              variant={asset.webinarVariant}
              imageUrl={asset.thumbnailImageUrl || undefined}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta}
              speakerCount={asset.speakerCount}
              speaker1={{
                name: asset.speaker1Name,
                role: asset.speaker1Role,
                imageUrl: asset.speaker1ImageUrl,
                imagePosition: asset.speaker1ImagePosition,
                imageZoom: asset.speaker1ImageZoom,
              }}
              speaker2={{
                name: asset.speaker2Name,
                role: asset.speaker2Role,
                imageUrl: asset.speaker2ImageUrl,
                imagePosition: asset.speaker2ImagePosition,
                imageZoom: asset.speaker2ImageZoom,
              }}
              speaker3={{
                name: asset.speaker3Name,
                role: asset.speaker3Role,
                imageUrl: asset.speaker3ImageUrl,
                imagePosition: asset.speaker3ImagePosition,
                imageZoom: asset.speaker3ImageZoom,
              }}
              showSpeaker1={asset.showSpeaker1}
              showSpeaker2={asset.showSpeaker2}
              showSpeaker3={asset.showSpeaker3}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'email-grid' && (
            <EmailGrid
              headline={asset.headline || 'Headline'}
              body={asset.body}
              eyebrow={asset.eyebrow}
              subheading={asset.subheading}
              showEyebrow={asset.showEyebrow}
              showLightHeader={asset.showLightHeader}
              showHeavyHeader={false}
              showSubheading={asset.showSubheading}
              showBody={asset.showBody}
              showSolutionSet={asset.showSolutionSet}
              solution={asset.solution}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              showGridDetail2={asset.showGridDetail2}
              gridDetail1={gridDetail1}
              gridDetail2={gridDetail2}
              gridDetail3={gridDetail3}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'email-image' && (
            <EmailImage
              headline={asset.headline || 'Headline'}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
              layout={asset.layout || 'even'}
              solution={asset.solution}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              showSolutionSet={asset.showSolutionSet !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'social-dark-gradient' && (
            <SocialDarkGradient
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Headline'}
              subhead={asset.subhead}
              body={asset.body}
              metadata={asset.metadata}
              ctaText={asset.ctaText}
              colorStyle={asset.colorStyle}
              headingSize={asset.headingSize}
              alignment={asset.alignment}
              ctaStyle={asset.ctaStyle}
              logoColor={asset.logoColor === 'black' ? 'white' : asset.logoColor}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showBody={asset.showBody && !!asset.body}
              showMetadata={asset.showMetadata}
              showCta={asset.showCta}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'social-blue-gradient' && (
            <SocialBlueGradient
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Headline'}
              subhead={asset.subhead}
              body={asset.body}
              metadata={asset.metadata}
              ctaText={asset.ctaText}
              colorStyle={asset.colorStyle}
              headingSize={asset.headingSize}
              alignment={asset.alignment}
              ctaStyle={asset.ctaStyle}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showBody={asset.showBody && !!asset.body}
              showMetadata={asset.showMetadata}
              showCta={asset.showCta}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'social-image' && (
            <SocialImage
              headline={asset.headline || 'Headline'}
              subhead={asset.subhead || ''}
              metadata={asset.metadata || 'Day / Month | 00:00'}
              ctaText={asset.ctaText || 'Learn More'}
              imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
              layout={asset.layout || 'even'}
              solution={asset.solution}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showMetadata={asset.showMetadata !== false}
              showCta={asset.showCta !== false}
              showSolutionSet={asset.showSolutionSet !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'social-grid-detail' && (
            <SocialGridDetail
              headline={asset.headline || 'Headline'}
              subhead={asset.subhead || 'This is your subheader or description text.'}
              eyebrow={asset.eyebrow || "Don't miss this."}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showSolutionSet={asset.showSolutionSet !== false}
              solution={asset.solution}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              showRow3={asset.showRow3 !== false}
              showRow4={asset.showRow4 !== false}
              gridDetail1={{ type: 'data', text: asset.gridDetail1Text || 'Date: January 1st, 2026' }}
              gridDetail2={{ type: 'data', text: asset.gridDetail2Text || 'Time: Midnight, EST' }}
              gridDetail3={{ type: asset.gridDetail3Type || 'data', text: asset.gridDetail3Text || 'Place: Wherever' }}
              gridDetail4={{ type: asset.gridDetail4Type || 'cta', text: asset.gridDetail4Text || 'Join the event' }}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'email-dark-gradient' && (
            <EmailDarkGradient
              headline={asset.headline || 'Headline'}
              eyebrow={asset.eyebrow}
              subheading={asset.subhead}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              colorStyle={asset.colorStyle || '1'}
              alignment={asset.alignment || 'left'}
              ctaStyle={asset.ctaStyle || 'link'}
              showEyebrow={asset.showEyebrow && !!asset.eyebrow}
              showSubheading={asset.showSubhead && !!asset.subhead}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'email-speakers' && (
            <EmailSpeakers
              headline={asset.headline || 'Headline'}
              eyebrow={asset.eyebrow}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              solution={asset.solution}
              logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
              showEyebrow={asset.showEyebrow && !!asset.eyebrow}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              showSolutionSet={asset.showSolutionSet !== false}
              speakerCount={asset.speakerCount || 3}
              speaker1={{
                name: asset.speaker1Name || 'Firstname Lastname',
                role: asset.speaker1Role || 'Role, Company',
                imageUrl: asset.speaker1ImageUrl || '',
                imagePosition: asset.speaker1ImagePosition || { x: 0, y: 0 },
                imageZoom: asset.speaker1ImageZoom || 1,
              }}
              speaker2={{
                name: asset.speaker2Name || 'Firstname Lastname',
                role: asset.speaker2Role || 'Role, Company',
                imageUrl: asset.speaker2ImageUrl || '',
                imagePosition: asset.speaker2ImagePosition || { x: 0, y: 0 },
                imageZoom: asset.speaker2ImageZoom || 1,
              }}
              speaker3={{
                name: asset.speaker3Name || 'Firstname Lastname',
                role: asset.speaker3Role || 'Role, Company',
                imageUrl: asset.speaker3ImageUrl || '',
                imagePosition: asset.speaker3ImagePosition || { x: 0, y: 0 },
                imageZoom: asset.speaker3ImageZoom || 1,
              }}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'newsletter-dark-gradient' && (
            <NewsletterDarkGradient
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Headline'}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              colorStyle={asset.colorStyle || '1'}
              imageSize={asset.newsletterImageSize || 'none'}
              imageUrl={asset.newsletterImageUrl || null}
              imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
              imageZoom={asset.newsletterImageZoom || 1}
              showEyebrow={asset.showEyebrow && !!asset.eyebrow}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'newsletter-blue-gradient' && (
            <NewsletterBlueGradient
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Headline'}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              colorStyle={asset.colorStyle || '1'}
              imageSize={asset.newsletterImageSize || 'none'}
              imageUrl={asset.newsletterImageUrl || null}
              imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
              imageZoom={asset.newsletterImageZoom || 1}
              showEyebrow={asset.showEyebrow && !!asset.eyebrow}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'newsletter-light' && (
            <NewsletterLight
              eyebrow={asset.eyebrow}
              headline={asset.headline || 'Headline'}
              body={asset.body || 'This is your body copy.'}
              ctaText={asset.ctaText || 'Responsive'}
              imageSize={asset.newsletterImageSize || 'none'}
              imageUrl={asset.newsletterImageUrl || null}
              imagePosition={asset.newsletterImagePosition || { x: 0, y: 0 }}
              imageZoom={asset.newsletterImageZoom || 1}
              showEyebrow={asset.showEyebrow && !!asset.eyebrow}
              showBody={asset.showBody && !!asset.body}
              showCta={asset.showCta !== false}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-report' && (
            <WebsiteReport
              eyebrow={asset.eyebrow || 'REPORT'}
              headline={asset.headline || 'Lightweight header.'}
              subhead={asset.subhead}
              cta={asset.ctaText || 'Responsive'}
              solution={asset.solution}
              variant={asset.reportVariant}
              imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_report.png'}
              imagePosition={asset.thumbnailImagePosition || { x: 0, y: 0 }}
              imageZoom={asset.thumbnailImageZoom || 1}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              showCta={asset.showCta}
              grayscale={asset.grayscale}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-event-listing' && (
            <WebsiteEventListing
              eyebrow={asset.eyebrow || 'LIVE EVENT'}
              headline={asset.headline || 'Headline'}
              subhead={asset.subhead}
              cta={asset.ctaText || 'Responsive'}
              variant={asset.eventListingVariant}
              gridDetail1Text={asset.gridDetail1Text || 'Add Details or Hide Me'}
              gridDetail2Text={asset.gridDetail2Text || 'Add Details or Hide Me'}
              gridDetail3Text={asset.gridDetail3Text || 'Add Details or Hide Me'}
              gridDetail4Text={asset.gridDetail4Text || 'Add Details or Hide Me'}
              showRow3={asset.showRow3}
              showRow4={asset.showRow4}
              showEyebrow={asset.showEyebrow}
              showSubhead={asset.showSubhead && !!asset.subhead}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-floating-banner' && (
            <WebsiteFloatingBanner
              eyebrow={asset.eyebrow || 'EYEBROW'}
              headline={asset.headline || 'Headline'}
              cta={asset.ctaText || 'Learn More'}
              showEyebrow={asset.showEyebrow}
              variant={asset.floatingBannerVariant || 'dark'}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
          {asset.templateType === 'website-floating-banner-mobile' && (
            <WebsiteFloatingBannerMobile
              eyebrow={asset.eyebrow || 'EYEBROW'}
              headline={asset.headline || 'Headline'}
              cta={asset.ctaText || 'Learn More'}
              showEyebrow={asset.showEyebrow}
              variant={asset.floatingBannerMobileVariant || 'light'}
              arrowType={asset.floatingBannerMobileArrowType || 'text'}
              colors={colorsConfig}
              typography={typographyConfig}
              scale={1}
            />
          )}
        </div>
      </div>
    </div>
  )
}
