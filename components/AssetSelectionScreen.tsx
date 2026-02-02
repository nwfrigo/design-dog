'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { DISTRIBUTION_CHANNELS, type SubChannelConfig, type TemplateInfo } from '@/lib/template-config'
import { TemplateTile, ComingSoonTile, RequestTemplateTile } from '@/components/TemplateTile'
import { QuickStartWizard } from '@/components/QuickStartWizard'
import { KIT_LIST } from '@/config/kit-configs'

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

// Kit type icons
function KitIcon({ icon, className }: { icon: string; className?: string }) {
  const iconClass = className || 'w-5 h-5'

  switch (icon) {
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    case 'book':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'megaphone':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    default:
      return null
  }
}

// Auto-Create sidebar with kit launcher
function AutoCreateSidebar() {
  const { startAutoCreateWithKit } = useStore()

  const handleKitClick = (kitId: string) => {
    // Go directly to full-page content screen with kit pre-selected
    startAutoCreateWithKit(kitId as import('@/config/kit-configs').KitType)
  }

  return (
    <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 hidden lg:block">
      <div className="sticky top-0 p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-light text-gray-900 dark:text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Create
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Write and design assets for a Promo Kit in just a few clicks
          </p>
        </div>

        {/* Kit type quick links */}
        <div className="space-y-2">
          {KIT_LIST.filter(kit => kit.id !== 'custom').map((kit) => (
            <button
              key={kit.id}
              onClick={() => handleKitClick(kit.id)}
              className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <KitIcon icon={kit.icon} className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                  {kit.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {kit.recommendedAssets.length} assets
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function AssetSelectionScreen() {
  const router = useRouter()
  const { selectedAssets, toggleAssetSelection, proceedToEditor, goToEditorWithTemplate, saveDraft } = useStore()

  // Track which subchannels are expanded (only Email open by default)
  const [expandedSubChannels, setExpandedSubChannels] = useState<Set<string>>(
    () => new Set(['email'])
  )

  const handleNavigateToEditor = (templateType: import('@/types').TemplateType) => {
    goToEditorWithTemplate(templateType)
    saveDraft()
    router.push('/editor')
  }

  const handleProceedToEditor = () => {
    proceedToEditor()
    saveDraft()
    router.push('/editor')
  }

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
            Pick any template(s) to get started, or use Auto-Create to make entire collections at once.
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
                  ) : channel.id === 'community' ? (
                    <>
                      <ComingSoonTile label="User Community Thumbnail" />
                      <ComingSoonTile label="Academy Video Thumbnail" />
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
                              onNavigateToEditor={() => handleNavigateToEditor(template.type)}
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
                onClick={handleProceedToEditor}
                className="px-8 py-2.5 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <AutoCreateSidebar />

      {/* Auto-Create Wizard Modal */}
      <QuickStartWizard />
    </div>
  )
}
