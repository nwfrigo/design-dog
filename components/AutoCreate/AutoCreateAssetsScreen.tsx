'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { ALL_TEMPLATES, TEMPLATE_LABELS, TEMPLATE_DIMENSIONS } from '@/lib/template-config'
import { KIT_CONFIGS } from '@/config/kit-configs'
import { TemplateRenderer } from '@/components/TemplateTile'
import { fetchColorsConfig, fetchTypographyConfig, type ColorsConfig, type TypographyConfig } from '@/lib/brand-config'
import type { TemplateType } from '@/types'

export function AutoCreateAssetsScreen() {
  const {
    autoCreate,
    toggleAutoCreateAsset,
    setAutoCreateAssets,
    startAutoCreateGeneration,
    setCurrentScreen,
  } = useStore()

  const [colors, setColors] = useState<ColorsConfig | null>(null)
  const [typography, setTypography] = useState<TypographyConfig | null>(null)
  const [showContextWarning, setShowContextWarning] = useState(false)

  useEffect(() => {
    Promise.all([fetchColorsConfig(), fetchTypographyConfig()])
      .then(([c, t]) => {
        setColors(c)
        setTypography(t)
      })
  }, [])

  const { selectedAssets, selectedKit } = autoCreate
  const kitConfig = selectedKit ? KIT_CONFIGS[selectedKit] : null

  const handleBack = () => {
    setCurrentScreen('auto-create-content')
  }

  // Calculate context length from content sources
  const getContextLength = () => {
    const { contentSource } = autoCreate
    let length = 0
    if (contentSource.pdfContent) length += contentSource.pdfContent.length
    if (contentSource.manualDescription) length += contentSource.manualDescription.length
    if (contentSource.manualKeyPoints) length += contentSource.manualKeyPoints.length
    if (contentSource.additionalContext) length += contentSource.additionalContext.length
    return length
  }

  const handleGenerate = async () => {
    const contextLength = getContextLength()
    if (contextLength < 100) {
      setShowContextWarning(true)
      return
    }
    setCurrentScreen('auto-create-generating')
    await startAutoCreateGeneration()
  }

  const handleGenerateAnyway = async () => {
    setShowContextWarning(false)
    setCurrentScreen('auto-create-generating')
    await startAutoCreateGeneration()
  }

  const getChannel = (templateType: TemplateType) => {
    if (templateType.startsWith('email-')) return 'Email'
    if (templateType.startsWith('social-')) return 'Social'
    if (templateType.startsWith('newsletter-')) return 'Newsletter'
    if (templateType.startsWith('website-')) return 'Website'
    return 'Other'
  }

  const templatesByChannel = ALL_TEMPLATES.reduce((acc, template) => {
    const channel = getChannel(template.type)
    if (!acc[channel]) acc[channel] = []
    acc[channel].push(template)
    return acc
  }, {} as Record<string, typeof ALL_TEMPLATES>)

  const kitLabel = kitConfig?.label?.toLowerCase() || 'kit'

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Select your {kitLabel} assets
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {kitConfig?.id === 'custom'
            ? 'Choose which assets to generate.'
            : `We recommend these assets to promote your ${kitLabel}, but choose any you want.`}
        </p>
      </div>

      {/* Asset selection grid */}
      <div className="flex-1 overflow-y-auto pb-24">
        {Object.entries(templatesByChannel).map(([channel, templates], index) => (
          <div
            key={channel}
            className={index > 0 ? 'pt-8 mt-8 border-t border-gray-200 dark:border-gray-800' : ''}
          >
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              {channel}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              {templates.map((template) => {
                const isSelected = selectedAssets.includes(template.type)
                const isRecommended = kitConfig?.recommendedAssets.includes(template.type)
                const dims = TEMPLATE_DIMENSIONS[template.type]
                const targetWidth = 200
                const previewScale = dims ? targetWidth / dims.width : 0.2
                const previewHeight = dims ? Math.round(dims.height * previewScale) : 90

                return (
                  <button
                    key={template.type}
                    onClick={() => toggleAutoCreateAsset(template.type)}
                    className={`
                      group relative flex flex-col rounded-lg overflow-hidden transition-all duration-200
                      border-[0.75px] text-left cursor-pointer
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                      }
                    `}
                  >
                    {/* Recommended header - always renders space for recommended items */}
                    {isRecommended && (
                      <div className="flex items-center gap-1 px-3 py-1.5">
                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          Recommended
                        </span>
                      </div>
                    )}

                    {/* Preview area */}
                    <div
                      className="relative overflow-hidden bg-gray-100 dark:bg-gray-800/50"
                      style={{ height: previewHeight + 24, padding: 12 }}
                    >
                      {/* Scaled template preview */}
                      <div
                        className="rounded overflow-hidden shadow-sm bg-white mx-auto"
                        style={{
                          width: targetWidth,
                          height: previewHeight,
                          position: 'relative',
                        }}
                      >
                        {colors && typography && dims ? (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: dims.width,
                              height: dims.height,
                              transform: `scale(${previewScale})`,
                              transformOrigin: 'top left',
                            }}
                          >
                            <TemplateRenderer
                              templateType={template.type}
                              colors={colors}
                              typography={typography}
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
                    </div>

                    {/* Info area */}
                    <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium truncate block ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {TEMPLATE_LABELS[template.type] || template.type}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                          {template.dimensions}
                        </span>
                      </div>
                      {/* Checkbox */}
                      <div
                        className={`
                          w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-150
                          ${isSelected
                            ? 'bg-blue-500'
                            : 'border border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors"
          >
            ← Back to Content
          </button>
          <div className="flex items-center gap-4">
            {/* Selection counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                  {selectedAssets.length}
                </span>
                <span className="text-sm text-gray-300">selected</span>
              </div>
              {selectedAssets.length > 0 && (
                <button
                  onClick={() => setAutoCreateAssets([])}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Deselect all
                </button>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedAssets.length === 0}
              className={`
                px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${selectedAssets.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate {selectedAssets.length} {selectedAssets.length === 1 ? 'Asset' : 'Assets'}
            </button>
          </div>
        </div>
      </div>

      {/* Context Warning Modal */}
      {showContextWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContextWarning(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Limited content detected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  There isn't much content to work with. The AI may generate generic copy that doesn't reflect your specific material.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Go back to add more details, or continue anyway.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowContextWarning(false)
                  setCurrentScreen('auto-create-content')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Add more content
              </button>
              <button
                onClick={handleGenerateAnyway}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Generate anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
