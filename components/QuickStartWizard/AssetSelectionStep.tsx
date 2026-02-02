'use client'

import { useStore } from '@/store'
import { ALL_TEMPLATES, TEMPLATE_LABELS } from '@/lib/template-config'
import { KIT_CONFIGS } from '@/config/kit-configs'
import type { TemplateType } from '@/types'

export function AssetSelectionStep() {
  const {
    autoCreate,
    setAutoCreateStep,
    toggleAutoCreateAsset,
    startAutoCreateGeneration,
  } = useStore()

  const { selectedAssets, selectedKit } = autoCreate
  const kitConfig = selectedKit ? KIT_CONFIGS[selectedKit] : null

  const handleBack = () => {
    setAutoCreateStep('content-source')
  }

  const handleGenerate = async () => {
    await startAutoCreateGeneration()
  }

  // Get template label
  const getTemplateLabel = (templateType: TemplateType) => {
    return TEMPLATE_LABELS[templateType] || templateType
  }

  // Get channel from template type
  const getChannel = (templateType: TemplateType) => {
    if (templateType.startsWith('email-')) return 'Email'
    if (templateType.startsWith('social-')) return 'Social'
    if (templateType.startsWith('newsletter-')) return 'Newsletter'
    if (templateType.startsWith('website-')) return 'Website'
    return 'Other'
  }

  // Group templates by channel
  const templatesByChannel = ALL_TEMPLATES.reduce((acc, template) => {
    const channel = getChannel(template.type)
    if (!acc[channel]) acc[channel] = []
    acc[channel].push(template)
    return acc
  }, {} as Record<string, typeof ALL_TEMPLATES>)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Select your assets
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {kitConfig?.id === 'custom'
            ? 'Choose which assets to generate'
            : 'We recommend these assets based on your kit type. Toggle to customize.'}
        </p>
      </div>

      {/* Asset selection grid */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(templatesByChannel).map(([channel, templates]) => (
          <div key={channel}>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              {channel}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => {
                const isSelected = selectedAssets.includes(template.type)
                const isRecommended = kitConfig?.recommendedAssets.includes(template.type)

                return (
                  <button
                    key={template.type}
                    onClick={() => toggleAutoCreateAsset(template.type)}
                    className={`
                      relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected
                          ? 'bg-blue-500 text-white'
                          : 'border-2 border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium block truncate ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {getTemplateLabel(template.type)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {template.dimensions}
                      </span>
                    </div>

                    {/* Recommended badge */}
                    {isRecommended && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full">
                        Rec
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selection summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {selectedAssets.length}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedAssets.length === 1 ? 'asset' : 'assets'} selected
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI will generate copy for each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={selectedAssets.length === 0}
          className={`
            px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
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
