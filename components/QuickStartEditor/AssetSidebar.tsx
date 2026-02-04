'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { TEMPLATE_LABELS, TEMPLATE_DIMENSIONS, CHANNELS } from '@/lib/template-config'
import { KIT_CONFIGS } from '@/config/kit-configs'
import type { GeneratedAsset, TemplateType } from '@/types'
import { TemplateRenderer } from '@/components/TemplateTile'
import {
  fetchColorsConfig,
  fetchTypographyConfig,
  type ColorsConfig,
  type TypographyConfig
} from '@/lib/brand-config'

// Import all template components
import { WebsiteThumbnail } from '@/components/templates/WebsiteThumbnail'
import { WebsitePressRelease } from '@/components/templates/WebsitePressRelease'
import { EmailGrid } from '@/components/templates/EmailGrid'
import { EmailImage } from '@/components/templates/EmailImage'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import { SocialBlueGradient } from '@/components/templates/SocialBlueGradient'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialGridDetail } from '@/components/templates/SocialGridDetail'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { NewsletterDarkGradient } from '@/components/templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from '@/components/templates/NewsletterBlueGradient'
import { NewsletterLight } from '@/components/templates/NewsletterLight'
import { WebsiteWebinar } from '@/components/templates/WebsiteWebinar'

interface AssetSidebarProps {
  currentAssetId: string | null
  onSelectAsset: (id: string) => void
}

export function AssetSidebar({ currentAssetId, onSelectAsset }: AssetSidebarProps) {
  const {
    generatedAssets,
    addAllGeneratedToQueue,
    goToQueue,
    exportQueue,
    retryFailedAsset,
    autoCreate,
    addAndGenerateAssets,
  } = useStore()

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [addAssetModalKey, setAddAssetModalKey] = useState(0)
  const [pendingAssets, setPendingAssets] = useState<TemplateType[]>([])
  const [isAddingAssets, setIsAddingAssets] = useState(false)
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

  const assetList = Object.values(generatedAssets)
  const successfulAssets = assetList.filter(a => a.status === 'complete')

  // Get kit label for header
  const selectedKit = autoCreate.selectedKit
  const kitConfig = selectedKit ? KIT_CONFIGS[selectedKit] : null
  const headerTitle = kitConfig ? `${kitConfig.label} Promotion Assets` : 'Generated Assets'

  const handleAddAllToQueue = () => {
    addAllGeneratedToQueue()
    goToQueue()
  }

  const handleDeleteAsset = (assetId: string) => {
    // Remove from generatedAssets
    const { [assetId]: removed, ...remaining } = generatedAssets
    useStore.setState({ generatedAssets: remaining })
    setDeleteConfirmId(null)
  }

  const handleAddNewAsset = () => {
    setPendingAssets([])
    setAddAssetModalKey(k => k + 1)
    setShowAddAssetModal(true)
  }

  const handleAddAssets = async () => {
    if (pendingAssets.length === 0) return

    setIsAddingAssets(true)
    setShowAddAssetModal(false)

    // Add assets and generate copy for them using the stored content context
    const newAssetIds = await addAndGenerateAssets(pendingAssets)

    setIsAddingAssets(false)
    setPendingAssets([])

    // Select the first newly added asset
    if (newAssetIds.length > 0) {
      onSelectAsset(newAssetIds[0])
    }
  }

  return (
    <div className="w-72 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {headerTitle}
        </h3>
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {assetList.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isSelected={asset.id === currentAssetId}
            onClick={() => onSelectAsset(asset.id)}
            onRetry={() => retryFailedAsset(asset.id)}
            onDelete={() => setDeleteConfirmId(asset.id)}
            colorsConfig={colorsConfig}
            typographyConfig={typographyConfig}
          />
        ))}

        {/* Add Asset Card */}
        <AddAssetCard onClick={handleAddNewAsset} />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {successfulAssets.length > 0 && (
          <button
            onClick={handleAddAllToQueue}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add All to Queue ({successfulAssets.length})
          </button>
        )}
        {exportQueue.length > 0 && (
          <button
            onClick={goToQueue}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
          >
            View Queue ({exportQueue.length})
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteAsset(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <AddAssetModal
          key={addAssetModalKey}
          pendingAssets={pendingAssets}
          setPendingAssets={setPendingAssets}
          onAdd={handleAddAssets}
          onClose={() => setShowAddAssetModal(false)}
          colorsConfig={colorsConfig}
          typographyConfig={typographyConfig}
          recommendedAssets={kitConfig?.recommendedAssets || []}
        />
      )}
    </div>
  )
}

function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete Asset?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete this asset? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function AddAssetModal({
  pendingAssets,
  setPendingAssets,
  onAdd,
  onClose,
  colorsConfig,
  typographyConfig,
  recommendedAssets,
}: {
  pendingAssets: TemplateType[]
  setPendingAssets: (assets: TemplateType[]) => void
  onAdd: () => void
  onClose: () => void
  colorsConfig: ColorsConfig | null
  typographyConfig: TypographyConfig | null
  recommendedAssets: TemplateType[]
}) {
  const targetWidth = 180

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Assets</h3>
          <button
            onClick={onClose}
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
                      const isRecommended = recommendedAssets.includes(template.type)
                      const previewScale = targetWidth / template.width
                      const previewHeight = Math.round(template.height * previewScale)

                      return (
                        <button
                          key={template.type}
                          onClick={() => {
                            if (isSelected) {
                              setPendingAssets(pendingAssets.filter(t => t !== template.type))
                            } else {
                              setPendingAssets([...pendingAssets, template.type])
                            }
                          }}
                          className={`
                            group relative flex flex-col rounded-lg overflow-hidden transition-all duration-200
                            border-[0.75px] text-left
                            ${isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500'
                            }
                          `}
                        >
                          {/* Recommended label - inside the card at top */}
                          {isRecommended && (
                            <div className={`px-3 py-1.5 text-xs font-medium ${
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Recommended
                            </div>
                          )}

                          {/* Preview */}
                          <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800/50 p-2 ${!isRecommended ? 'rounded-t-lg' : ''}`}
                            style={{ height: Math.min(previewHeight + 16, 120) }}
                          >
                            <div
                              className="rounded overflow-hidden shadow-sm bg-white [&_*]:!text-left"
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
                                    templateType={template.type as TemplateType}
                                    colors={colorsConfig}
                                    typography={typographyConfig}
                                    scale={1}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              )}
                            </div>

                            {/* Selection indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
                            <span className={`text-sm font-medium block truncate ${
                              isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {template.label}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                              {template.dimensions}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pendingAssets.length} {pendingAssets.length === 1 ? 'asset' : 'assets'} selected
            </span>
            {pendingAssets.length > 0 && (
              <button
                onClick={() => setPendingAssets([])}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Deselect all
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={pendingAssets.length === 0}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Assets
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddAssetCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col rounded-lg overflow-hidden bg-white dark:bg-gray-800/50 border-[0.75px] border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
    >
      {/* Preview area */}
      <div className="flex-1 min-h-[100px] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Add new asset
          </span>
        </div>
      </div>
    </button>
  )
}

function AssetCard({
  asset,
  isSelected,
  onClick,
  onRetry,
  onDelete,
  colorsConfig,
  typographyConfig,
}: {
  asset: GeneratedAsset
  isSelected: boolean
  onClick: () => void
  onRetry?: () => void
  onDelete?: () => void
  colorsConfig: ColorsConfig | null
  typographyConfig: TypographyConfig | null
}) {
  const dimensions = TEMPLATE_DIMENSIONS[asset.templateType]
  const targetWidth = 200
  const previewScale = dimensions ? targetWidth / dimensions.width : 0.15
  const previewHeight = dimensions ? Math.round(dimensions.height * previewScale) : 120

  return (
    <div
      className={`
        group relative flex flex-col rounded-lg overflow-hidden transition-all duration-200
        border-[0.75px]
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
          : asset.status === 'complete'
            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 opacity-60'
        }
      `}
    >
      {/* Preview area - click to select */}
      <button
        onClick={onClick}
        disabled={asset.status !== 'complete'}
        className="relative overflow-hidden bg-gray-100 dark:bg-gray-800/50"
        style={{ height: previewHeight + 16, padding: 8 }}
      >
        {/* Scaled template preview */}
        <div
          className="rounded overflow-hidden shadow-sm bg-white [&_*]:!text-left"
          style={{
            width: targetWidth,
            height: previewHeight,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {asset.status === 'complete' && colorsConfig && typographyConfig ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: dimensions?.width || 1200,
                height: dimensions?.height || 628,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              <AssetPreviewRenderer
                asset={asset}
                colors={colorsConfig}
                typography={typographyConfig}
              />
            </div>
          ) : asset.status === 'generating' ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : asset.status === 'error' ? (
            <div className="w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
        </div>

        {/* Delete button - subtle, top right */}
        {onDelete && asset.status === 'complete' && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        )}
      </button>

      {/* Info area */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium truncate block ${
            isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {TEMPLATE_LABELS[asset.templateType] || asset.templateType}
          </span>
          {dimensions && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              {dimensions.width} × {dimensions.height}
            </span>
          )}
        </div>

        {/* Retry button for failed assets */}
        {asset.status === 'error' && onRetry && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRetry()
            }}
            className="flex-shrink-0 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400
              hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30
              rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

// Asset Preview Renderer - renders asset with its actual copy content
function AssetPreviewRenderer({
  asset,
  colors,
  typography,
}: {
  asset: GeneratedAsset
  colors: ColorsConfig
  typography: TypographyConfig
}) {
  const commonProps = { colors, typography, scale: 1 }
  const copy = asset.copy

  switch (asset.templateType) {
    case 'website-thumbnail':
      return (
        <WebsiteThumbnail
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          subhead={copy.subhead}
          cta={asset.ctaText || 'Responsive'}
          solution={asset.solution}
          variant={asset.ebookVariant || 'image'}
          imageUrl={asset.thumbnailImageUrl || undefined}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showCta={asset.showCta !== false}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
        />
      )
    case 'website-press-release':
      return (
        <WebsitePressRelease
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Lightweight header.'}
          subhead={copy.subhead}
          body={copy.body}
          cta={asset.ctaText || 'Responsive'}
          solution={asset.solution}
          imageUrl={asset.thumbnailImageUrl || undefined}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
        />
      )
    case 'email-grid':
      return (
        <EmailGrid
          {...commonProps}
          headline={copy.headline || 'Headline'}
          body={copy.body}
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
          gridDetail1={{ type: 'data', text: asset.gridDetail1Text }}
          gridDetail2={{ type: 'data', text: asset.gridDetail2Text }}
          gridDetail3={{ type: asset.gridDetail3Type, text: asset.gridDetail3Text }}
        />
      )
    case 'email-image':
      return (
        <EmailImage
          {...commonProps}
          headline={copy.headline || 'Headline'}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
          layout={asset.layout || 'even'}
          solution={asset.solution}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
          showSolutionSet={asset.showSolutionSet !== false}
        />
      )
    case 'social-dark-gradient':
      return (
        <SocialDarkGradient
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          subhead={copy.subhead}
          body={copy.body}
          metadata={asset.metadata}
          ctaText={asset.ctaText}
          colorStyle={asset.colorStyle}
          headingSize={asset.headingSize}
          alignment={asset.alignment}
          ctaStyle={asset.ctaStyle}
          logoColor={asset.logoColor === 'black' ? 'white' : asset.logoColor}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showBody={asset.showBody && !!copy.body}
          showMetadata={asset.showMetadata}
          showCta={asset.showCta}
        />
      )
    case 'social-blue-gradient':
      return (
        <SocialBlueGradient
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          subhead={copy.subhead}
          body={copy.body}
          metadata={asset.metadata}
          ctaText={asset.ctaText}
          colorStyle={asset.colorStyle}
          headingSize={asset.headingSize}
          alignment={asset.alignment}
          ctaStyle={asset.ctaStyle}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showBody={asset.showBody && !!copy.body}
          showMetadata={asset.showMetadata}
          showCta={asset.showCta}
        />
      )
    case 'social-image':
      return (
        <SocialImage
          {...commonProps}
          headline={copy.headline || 'Headline'}
          subhead={copy.subhead || ''}
          metadata={asset.metadata || 'Day / Month | 00:00'}
          ctaText={asset.ctaText || 'Learn More'}
          imageUrl={asset.thumbnailImageUrl || '/assets/images/default_placeholder_image_1.png'}
          layout={asset.layout || 'even'}
          solution={asset.solution}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showMetadata={asset.showMetadata !== false}
          showCta={asset.showCta !== false}
          showSolutionSet={asset.showSolutionSet !== false}
        />
      )
    case 'social-grid-detail':
      return (
        <SocialGridDetail
          {...commonProps}
          headline={copy.headline || 'Headline'}
          subhead={copy.subhead || 'This is your subheader or description text.'}
          eyebrow={asset.eyebrow || "Don't miss this."}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showSolutionSet={asset.showSolutionSet !== false}
          solution={asset.solution}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
          showRow3={asset.showRow3 !== false}
          showRow4={asset.showRow4 !== false}
          gridDetail1={{ type: 'data', text: asset.gridDetail1Text || 'Date: January 1st, 2026' }}
          gridDetail2={{ type: 'data', text: asset.gridDetail2Text || 'Time: Midnight, EST' }}
          gridDetail3={{ type: asset.gridDetail3Type || 'data', text: asset.gridDetail3Text || 'Place: Wherever' }}
          gridDetail4={{ type: asset.gridDetail4Type || 'cta', text: asset.gridDetail4Text || 'Join the event' }}
        />
      )
    case 'email-dark-gradient':
      return (
        <EmailDarkGradient
          {...commonProps}
          headline={copy.headline || 'Headline'}
          eyebrow={asset.eyebrow}
          subheading={copy.subhead}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          colorStyle={asset.colorStyle || '1'}
          alignment={asset.alignment || 'left'}
          ctaStyle={asset.ctaStyle || 'link'}
          showEyebrow={asset.showEyebrow && !!asset.eyebrow}
          showSubheading={asset.showSubhead && !!copy.subhead}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
        />
      )
    case 'email-speakers':
      return (
        <EmailSpeakers
          {...commonProps}
          headline={copy.headline || 'Headline'}
          eyebrow={asset.eyebrow}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          solution={asset.solution}
          logoColor={asset.logoColor === 'white' ? 'black' : asset.logoColor}
          showEyebrow={asset.showEyebrow && !!asset.eyebrow}
          showBody={asset.showBody && !!copy.body}
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
        />
      )
    case 'newsletter-dark-gradient':
      return (
        <NewsletterDarkGradient
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          colorStyle={asset.colorStyle || '1'}
          imageSize={asset.newsletterImageSize || 'none'}
          imageUrl={asset.newsletterImageUrl || null}
          showEyebrow={asset.showEyebrow && !!asset.eyebrow}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
        />
      )
    case 'newsletter-blue-gradient':
      return (
        <NewsletterBlueGradient
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          colorStyle={asset.colorStyle || '1'}
          imageSize={asset.newsletterImageSize || 'none'}
          imageUrl={asset.newsletterImageUrl || null}
          showEyebrow={asset.showEyebrow && !!asset.eyebrow}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
        />
      )
    case 'newsletter-light':
      return (
        <NewsletterLight
          {...commonProps}
          eyebrow={asset.eyebrow}
          headline={copy.headline || 'Headline'}
          body={copy.body || 'This is your body copy.'}
          ctaText={asset.ctaText || 'Responsive'}
          imageSize={asset.newsletterImageSize || 'none'}
          imageUrl={asset.newsletterImageUrl || null}
          showEyebrow={asset.showEyebrow && !!asset.eyebrow}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
        />
      )
    case 'website-webinar':
      return (
        <WebsiteWebinar
          {...commonProps}
          eyebrow={asset.eyebrow || 'Webinar'}
          headline={copy.headline || 'Lightweight header.'}
          subhead={copy.subhead || ''}
          body={copy.body || ''}
          cta={asset.ctaText || 'Responsive'}
          solution={asset.solution}
          variant={asset.webinarVariant || 'image'}
          imageUrl={asset.thumbnailImageUrl || undefined}
          showEyebrow={asset.showEyebrow}
          showSubhead={asset.showSubhead && !!copy.subhead}
          showBody={asset.showBody && !!copy.body}
          showCta={asset.showCta !== false}
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
        />
      )
    default:
      return null
  }
}
