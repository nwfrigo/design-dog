'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { DISTRIBUTION_CHANNELS, type SubChannelConfig, type TemplateInfo } from '@/lib/template-config'
import { TemplateTile, ComingSoonTile, RequestTemplateTile } from '@/components/TemplateTile'

// Icons for subchannel types
const SubChannelIcon = ({ icon }: { icon: SubChannelConfig['icon'] }) => {
  const iconClass = "w-5 h-5"

  switch (icon) {
    case 'mail':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'share':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    case 'globe':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    case 'newspaper':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    default:
      return null
  }
}

// QuickStart sidebar placeholder
function QuickStartSidebar() {
  const examplePrompts = [
    "Create a webinar promotion for our safety summit",
    "Design social posts for a product launch",
    "Make an email banner for the quarterly newsletter"
  ]

  return (
    <aside className="w-80 flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-800 hidden lg:block">
      <div className="sticky top-0 p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Start
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tell us what you need
          </p>
        </div>

        {/* Disabled input area */}
        <div className="relative mb-4">
          <textarea
            disabled
            placeholder="Describe what you want to create..."
            className="w-full h-24 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none cursor-not-allowed opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-[1px]">
            <span className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
              Coming soon
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Soon: Describe what you want to create and Design Dog will suggest the right asset types and help you build them faster.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Example prompts</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Example prompts */}
        <div className="space-y-2">
          {examplePrompts.map((prompt, index) => (
            <div
              key={index}
              className="p-3 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg opacity-60"
            >
              &ldquo;{prompt}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function AssetSelectionScreen() {
  const { selectedAssets, toggleAssetSelection, proceedToEditor, goToEditorWithTemplate } = useStore()

  // Track which subchannels are expanded (only Email open by default)
  const [expandedSubChannels, setExpandedSubChannels] = useState<Set<string>>(
    () => new Set(['email'])
  )

  const toggleSubChannel = (subChannelId: string) => {
    setExpandedSubChannels(prev => {
      const next = new Set(prev)
      if (next.has(subChannelId)) {
        next.delete(subChannelId)
      } else {
        next.add(subChannelId)
      }
      return next
    })
  }

  // Count selected templates in a subchannel
  const getSelectedCount = (templates: TemplateInfo[]) => {
    return templates.filter(t => selectedAssets.includes(t.type)).length
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Main content area */}
      <div className="flex-1 pr-0 lg:pr-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-500 dark:text-gray-400">
            Pick any template(s) to get started.
          </p>
        </div>

        {/* Distribution channels */}
        <div className="space-y-8">
          {DISTRIBUTION_CHANNELS.map((channel) => (
            <div key={channel.id}>
              {/* Channel header */}
              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-2xl font-light text-gray-400 dark:text-gray-500">
                  {channel.label}
                </h3>
                {channel.comingSoon && (
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                    Coming soon
                  </span>
                )}
              </div>

              {/* Subchannels grid */}
              {channel.comingSoon ? (
                // Coming soon placeholders
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channel.id === 'collateral' ? (
                    <>
                      <ComingSoonTile label="Solution Overview" />
                      <ComingSoonTile label="One-Sheeter" />
                    </>
                  ) : channel.id === 'events' ? (
                    <>
                      <ComingSoonTile label="Signage" />
                      <ComingSoonTile label="Presentation" />
                    </>
                  ) : (
                    <>
                      <ComingSoonTile label="Template 1" />
                      <ComingSoonTile label="Template 2" />
                    </>
                  )}
                </div>
              ) : (
                // Active subchannels
                <div className="space-y-3">
                  {channel.subChannels.map((subChannel) => {
                    const isExpanded = expandedSubChannels.has(subChannel.id)
                    const selectedCount = getSelectedCount(subChannel.templates)

                    return (
                      <div
                        key={subChannel.id}
                        className={`
                          border rounded-xl overflow-hidden transition-all duration-300
                          ${isExpanded
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                          }
                        `}
                      >
                        {/* Subchannel header (clickable) */}
                        <button
                          onClick={() => toggleSubChannel(subChannel.id)}
                          className={`
                            w-full px-5 py-4 flex items-center justify-between transition-colors
                            ${isExpanded
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {/* Expand/collapse chevron */}
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>

                            {/* Icon */}
                            <span className={`${isExpanded ? 'text-blue-500' : 'text-gray-400'}`}>
                              <SubChannelIcon icon={subChannel.icon} />
                            </span>

                            {/* Label */}
                            <span className={`font-medium ${
                              isExpanded
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {subChannel.label}
                            </span>

                            {/* Template count */}
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              {subChannel.templates.length} {subChannel.templates.length === 1 ? 'template' : 'templates'}
                            </span>
                          </div>

                          {/* Selected count badge */}
                          {selectedCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              {selectedCount} selected
                            </span>
                          )}
                        </button>

                        {/* Expanded template grid */}
                        <div
                          className={`
                            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-5 overflow-hidden transition-all duration-300 ease-out
                            ${isExpanded ? 'py-5 max-h-[1000px] opacity-100' : 'max-h-0 py-0 opacity-0'}
                          `}
                        >
                          {subChannel.templates.map((template) => (
                            <TemplateTile
                              key={template.type}
                              template={template}
                              isSelected={selectedAssets.includes(template.type)}
                              onToggle={() => toggleAssetSelection(template.type)}
                              onNavigateToEditor={() => goToEditorWithTemplate(template.type)}
                            />
                          ))}
                          <RequestTemplateTile channelName={subChannel.label} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer with selection summary and continue button - only shown when templates are selected */}
        {selectedAssets.length > 0 && (
          <div className="sticky bottom-0 mt-8 py-4 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent">
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 shadow-lg">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                  {selectedAssets.length}
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  asset{selectedAssets.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <button
                onClick={proceedToEditor}
                className="px-8 py-2.5 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <QuickStartSidebar />
    </div>
  )
}
