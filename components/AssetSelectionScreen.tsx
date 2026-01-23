'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { CHANNELS, type TemplateInfo } from '@/lib/template-config'
import type { TemplateType } from '@/types'

export function AssetSelectionScreen() {
  const { selectedAssets, toggleAssetSelection, proceedToEditor } = useStore()

  // Track which channels are expanded (Email open by default)
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set(['email']))

  const toggleChannel = (channelId: string) => {
    setExpandedChannels(prev => {
      const next = new Set(prev)
      if (next.has(channelId)) {
        next.delete(channelId)
      } else {
        next.add(channelId)
      }
      return next
    })
  }

  const canProceed = selectedAssets.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Select Asset Types
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose which assets you want to create. You&apos;ll enter content once, then customize each asset.
        </p>
      </div>

      <div className="space-y-2">
        {CHANNELS.map((channel) => {
          const isExpanded = expandedChannels.has(channel.id)
          const hasTemplates = channel.templates.length > 0
          const selectedInChannel = channel.templates.filter(t =>
            selectedAssets.includes(t.type)
          ).length

          return (
            <div key={channel.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Channel Header */}
              <button
                onClick={() => toggleChannel(channel.id)}
                disabled={!hasTemplates}
                className={`w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50
                  ${hasTemplates ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-default opacity-60'}
                  transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {/* Expand/Collapse Icon */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''} ${!hasTemplates ? 'opacity-0' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  {/* Folder Icon */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>

                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {channel.label}
                  </span>

                  {!hasTemplates && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Selected count badge */}
                {selectedInChannel > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedInChannel}
                  </span>
                )}
              </button>

              {/* Templates List */}
              {isExpanded && hasTemplates && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {channel.templates.map((template) => (
                    <TemplateRow
                      key={template.type}
                      template={template}
                      isSelected={selectedAssets.includes(template.type)}
                      onToggle={() => toggleAssetSelection(template.type)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedAssets.length === 0
              ? 'No assets selected'
              : `${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} selected`}
          </p>
          <button
            onClick={proceedToEditor}
            disabled={!canProceed}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

interface TemplateRowProps {
  template: TemplateInfo
  isSelected: boolean
  onToggle: () => void
}

function TemplateRow({ template, isSelected, onToggle }: TemplateRowProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 pl-12 text-left transition-all border-b last:border-b-0 border-gray-100 dark:border-gray-800 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
          isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${
              isSelected
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {template.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {template.dimensions}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {template.description}
          </p>
        </div>
      </div>
    </button>
  )
}
