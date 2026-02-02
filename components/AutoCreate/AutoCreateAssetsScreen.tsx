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
    startAutoCreateGeneration,
    setCurrentScreen,
  } = useStore()

  const [colors, setColors] = useState<ColorsConfig | null>(null)
  const [typography, setTypography] = useState<TypographyConfig | null>(null)

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

  const handleGenerate = async () => {
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with breadcrumb and counter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Auto-Create</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{kitConfig?.label || 'Kit'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-blue-600 dark:text-blue-400 font-medium">Assets</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Select your assets
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {kitConfig?.id === 'custom'
                ? 'Choose which assets to generate'
                : 'We recommend these assets based on your kit type. Toggle to customize.'}
            </p>
          </div>
          {/* Compact selection counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
              {selectedAssets.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">selected</span>
          </div>
        </div>
      </div>

      {/* Asset selection grid */}
      <div className="space-y-8 mb-8">
        {Object.entries(templatesByChannel).map(([channel, templates]) => (
          <div key={channel}>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              {channel}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((template) => {
                const isSelected = selectedAssets.includes(template.type)
                const isRecommended = kitConfig?.recommendedAssets.includes(template.type)
                const dims = TEMPLATE_DIMENSIONS[template.type]
                const targetWidth = 200
                const previewScale = dims ? targetWidth / dims.width : 0.2
                const previewHeight = dims ? Math.round(dims.height * previewScale) : 90

                return (
                  <div
                    key={template.type}
                    className={`
                      group relative flex flex-col rounded-lg overflow-hidden transition-all duration-200
                      border-[0.75px]
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                      }
                    `}
                  >
                    {/* Preview area */}
                    <button
                      onClick={() => toggleAutoCreateAsset(template.type)}
                      className="relative overflow-hidden bg-gray-100 dark:bg-gray-800/50"
                      style={{ height: previewHeight + 24, padding: 12 }}
                    >
                      {/* Recommended badge */}
                      {isRecommended && (
                        <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[10px] font-medium bg-purple-500 text-white rounded">
                          Rec
                        </span>
                      )}

                      {/* Checkbox */}
                      <div
                        className={`
                          absolute top-2 right-2 z-10 w-6 h-6 rounded cursor-pointer transition-all duration-150
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
                    </button>

                    {/* Info area */}
                    <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
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
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          ← Back to Content
        </button>
        <button
          onClick={handleGenerate}
          disabled={selectedAssets.length === 0}
          className={`
            px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${selectedAssets.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
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
  )
}
