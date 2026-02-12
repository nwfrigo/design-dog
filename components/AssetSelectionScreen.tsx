'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { DISTRIBUTION_CHANNELS, type TemplateInfo } from '@/lib/template-config'
import { TemplateTileV2, RequestTemplateTile } from '@/components/TemplateTile'
import { QuickStartWizard } from '@/components/QuickStartWizard'
import { KIT_LIST } from '@/config/kit-configs'

// Filter chip options
type FilterType = 'all' | 'email' | 'social' | 'website' | 'newsletter' | 'sales-pm'

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'email', label: 'Email' },
  { id: 'website', label: 'Website' },
  { id: 'sales-pm', label: 'Collateral' },
  { id: 'social', label: 'Social' },
  { id: 'newsletter', label: 'Newsletter' },
]

// Extended template info with channel
interface TemplateWithChannel extends TemplateInfo {
  channel: string
  channelLabel: string
}

// Channel order for grid display (matches filter chip order)
const CHANNEL_ORDER = ['email', 'website', 'collateral-pdf', 'social', 'newsletter']

// Flatten all templates with channel info, ordered by channel
function getAllTemplatesWithChannels(): TemplateWithChannel[] {
  const templatesByChannel: Record<string, TemplateWithChannel[]> = {}

  // Collect templates by channel
  for (const channel of DISTRIBUTION_CHANNELS) {
    if (channel.comingSoon) continue

    for (const subChannel of channel.subChannels) {
      if (!templatesByChannel[subChannel.id]) {
        templatesByChannel[subChannel.id] = []
      }
      for (const template of subChannel.templates) {
        templatesByChannel[subChannel.id].push({
          ...template,
          channel: subChannel.id,
          channelLabel: subChannel.label,
        })
      }
    }
  }

  // Return templates in desired order
  const orderedTemplates: TemplateWithChannel[] = []
  for (const channelId of CHANNEL_ORDER) {
    if (templatesByChannel[channelId]) {
      orderedTemplates.push(...templatesByChannel[channelId])
    }
  }

  return orderedTemplates
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
    startAutoCreateWithKit(kitId as import('@/config/kit-configs').KitType)
  }

  return (
    <aside className="w-full border-l border-gray-200 dark:border-gray-800 pl-8">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-light text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Create
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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

        {/* About blurb */}
        <p className="mt-8 text-xs font-mono text-gray-400 dark:text-gray-500 leading-relaxed">
          designdog is a homemade app that makes marketing assets for Cority. The possibilities are endless, and there&apos;s always room for improvement. If you see any, let Nick know!{' '}
          <a href="mailto:nicholas.frigo@cority.com" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            nicholas.frigo@cority.com
          </a>
        </p>
      </div>
    </aside>
  )
}

export function AssetSelectionScreen() {
  const router = useRouter()
  const { selectedAssets, toggleAssetSelection, proceedToEditor, goToEditorWithTemplate, saveDraft, setCurrentScreen } = useStore()

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Get all templates with channel info
  const allTemplates = useMemo(() => getAllTemplatesWithChannels(), [])

  // Filter templates based on active filter
  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'all') return allTemplates

    return allTemplates.filter(template => {
      switch (activeFilter) {
        case 'email':
          return template.channel === 'email'
        case 'social':
          return template.channel === 'social'
        case 'website':
          return template.channel === 'website'
        case 'newsletter':
          return template.channel === 'newsletter'
        case 'sales-pm':
          return template.channel === 'collateral-pdf'
        default:
          return true
      }
    })
  }, [allTemplates, activeFilter])

  const handleNavigateToEditor = (templateType: import('@/types').TemplateType) => {
    // Solution Overview PDF has a special setup screen
    if (templateType === 'solution-overview-pdf') {
      goToEditorWithTemplate(templateType)
      setCurrentScreen('solution-overview-setup')
      saveDraft()
      router.push('/editor')
      return
    }

    // FAQ PDF goes to setup screen first
    if (templateType === 'faq-pdf') {
      goToEditorWithTemplate(templateType)
      setCurrentScreen('faq-setup')
      saveDraft()
      router.push('/editor')
      return
    }

    goToEditorWithTemplate(templateType)
    saveDraft()
    router.push('/editor')
  }

  const handleProceedToEditor = () => {
    proceedToEditor()
    saveDraft()
    router.push('/editor')
  }

  // Get filter label for results count
  const getFilterLabel = () => {
    if (activeFilter === 'all') return ''
    const filter = FILTER_OPTIONS.find(f => f.id === activeFilter)
    return filter ? ` in ${filter.label}` : ''
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] gap-8">
      {/* Main content area - 2/3 */}
      <div className="flex-[2]">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            Pick any template to get started, or use Auto-Create to make entire collections at once.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                  ${activeFilter === filter.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}{getFilterLabel()}
          </p>
        </div>

        {/* Template Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-5">
          {filteredTemplates.map((template) => (
            <TemplateTileV2
              key={template.type}
              template={template}
              channelLabel={template.channelLabel}
              isSelected={selectedAssets.includes(template.type)}
              onToggle={() => toggleAssetSelection(template.type)}
              onNavigateToEditor={() => handleNavigateToEditor(template.type)}
            />
          ))}
          <RequestTemplateTile channelName={activeFilter === 'all' ? 'new' : FILTER_OPTIONS.find(f => f.id === activeFilter)?.label || 'new'} />
        </div>

        {/* Footer with selection summary and continue button */}
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

      {/* Right sidebar - 1/3 */}
      <div className="flex-1 hidden lg:block">
        <div className="sticky top-[120px]">
          <AutoCreateSidebar />
        </div>
      </div>

      {/* Auto-Create Wizard Modal */}
      <QuickStartWizard />
    </div>
  )
}
