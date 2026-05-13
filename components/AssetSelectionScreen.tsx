'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Infinity as InfinityIcon,
  Mail,
  Signature,
  Newspaper,
  MessageSquareHeart,
  Globe,
  CalendarCheck,
  File as FileIcon,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '@/store'
import { SUBCHANNELS, type TemplateInfo } from '@/lib/template-config'
import { TemplateTileV2, RequestTemplateTile } from '@/components/TemplateTile'

// Filter chip options. Icon names match the Figma layer stack (Lucide).
type FilterType = 'all' | 'email-banners' | 'email-signatures' | 'social' | 'website' | 'newsletter' | 'sales-pm' | 'event:cority-connect' | 'event:ehs-accelerate' | 'event:cority-customer-exchange'

const FILTER_OPTIONS: { id: FilterType; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: InfinityIcon },
  { id: 'email-banners', label: 'Email Banners', icon: Mail },
  { id: 'email-signatures', label: 'Email Sig.', icon: Signature },
  { id: 'newsletter', label: 'Newsletters', icon: Newspaper },
  { id: 'social', label: 'Social', icon: MessageSquareHeart },
  { id: 'website', label: 'Website', icon: Globe },
]

const COLLATERAL_FILTER: { id: FilterType; label: string; icon: LucideIcon } = {
  id: 'sales-pm',
  label: 'Collateral',
  icon: FileIcon,
}

// Events dropdown config
const EVENTS: { id: FilterType; label: string; templates: string[] }[] = [
  {
    id: 'event:cority-connect',
    label: 'Cority Connect',
    templates: ['email-cority-connect-2026'],
  },
  {
    id: 'event:ehs-accelerate',
    label: 'EHS+ Accelerate',
    templates: ['email-ehs-accelerate-banner', 'email-ehs-accelerate-invitation', 'email-ehs-accelerate-signature', 'social-ehs-accelerate', 'website-ehs-accelerate-listing'],
  },
  {
    id: 'event:cority-customer-exchange',
    label: 'Cority Customer Exchange',
    templates: ['email-cority-customer-exchange-banner', 'email-cority-customer-exchange-signature'],
  },
]

// Extended template info with channel
interface TemplateWithChannel extends TemplateInfo {
  channel: string
  channelLabel: string
}

// Channel order for grid display. Mirrors the chip row: content channels
// alphabetized, then Collateral trailing at the bottom.
const CHANNEL_ORDER = ['email-banners', 'email-signatures', 'newsletter', 'social', 'website', 'collateral-pdf']

// Flatten all templates with channel info, ordered by channel.
function getAllTemplatesWithChannels(): TemplateWithChannel[] {
  const templatesByChannel: Record<string, TemplateWithChannel[]> = {}

  for (const subChannel of SUBCHANNELS) {
    if (subChannel.comingSoon) continue
    if (!templatesByChannel[subChannel.id]) {
      templatesByChannel[subChannel.id] = []
    }
    for (const template of subChannel.templates) {
      if (template.hidden) continue
      templatesByChannel[subChannel.id].push({
        ...template,
        channel: subChannel.id,
        channelLabel: template.channelLabel ?? subChannel.label,
      })
    }
  }

  const orderedTemplates: TemplateWithChannel[] = []
  for (const channelId of CHANNEL_ORDER) {
    if (templatesByChannel[channelId]) {
      orderedTemplates.push(...templatesByChannel[channelId])
    }
  }

  return orderedTemplates
}

export function AssetSelectionScreen() {
  const router = useRouter()
  const { selectedAssets, toggleAssetSelection, proceedToEditor, goToEditorWithTemplate, saveDraft, setCurrentScreen } = useStore()

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false)
  const eventsRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (eventsRef.current && !eventsRef.current.contains(e.target as Node)) {
        setEventsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get all templates with channel info
  const allTemplates = useMemo(() => getAllTemplatesWithChannels(), [])

  // Filter templates based on active filter
  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'all') return allTemplates

    if (activeFilter.startsWith('event:')) {
      const event = EVENTS.find(e => e.id === activeFilter)
      if (!event) return allTemplates
      return allTemplates.filter(t => event.templates.includes(t.type))
    }

    return allTemplates.filter(template => {
      switch (activeFilter) {
        case 'email-banners':
          return template.channel === 'email-banners'
        case 'email-signatures':
          return template.channel === 'email-signatures'
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

    // Stacker PDF goes to setup screen first
    if (templateType === 'stacker-pdf') {
      goToEditorWithTemplate(templateType)
      setCurrentScreen('stacker-setup')
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
    if (activeFilter.startsWith('event:')) {
      const event = EVENTS.find(e => e.id === activeFilter)
      return event ? ` in ${event.label}` : ''
    }
    const filter = FILTER_OPTIONS.find(f => f.id === activeFilter)
    return filter ? ` in ${filter.label}` : ''
  }

  // Derived helpers for Events chip
  const isEventsActive = activeFilter.startsWith('event:')
  const activeEventLabel = isEventsActive ? EVENTS.find(e => e.id === activeFilter)?.label : null

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div>
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-500 dark:text-content-secondary">
            Pick any template to get started.
          </p>
        </div>

        {/* Filter Chips — Figma node 401:4390. Each chip: icon + uppercase
            label, 0.5px border, 4px radius. Active = surface-primary,
            inactive = surface-secondary. */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((filter) => {
              const Icon = filter.icon
              const active = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => { setActiveFilter(filter.id); setEventsDropdownOpen(false) }}
                  className={`
                    inline-flex items-center gap-2 px-2 py-2 rounded border-[0.5px] border-line-subtle
                    font-mono text-xs uppercase whitespace-nowrap text-content-primary
                    transition-colors
                    ${active
                      ? 'bg-surface-primary'
                      : 'bg-surface-secondary hover:bg-surface-primary'
                    }
                  `}
                >
                  <Icon size={12} strokeWidth={1.5} />
                  {filter.label}
                </button>
              )
            })}

            {/* Events dropdown chip — same visual treatment as the others,
                wrapped in a positioning container for the dropdown menu. */}
            <div className="relative" ref={eventsRef}>
              <button
                onClick={() => setEventsDropdownOpen(prev => !prev)}
                className={`
                  inline-flex items-center gap-2 px-2 py-2 rounded border-[0.5px] border-line-subtle
                  font-mono text-xs uppercase whitespace-nowrap text-content-primary
                  transition-colors
                  ${isEventsActive
                    ? 'bg-surface-primary'
                    : 'bg-surface-secondary hover:bg-surface-primary'
                  }
                `}
              >
                <CalendarCheck size={12} strokeWidth={1.5} />
                {activeEventLabel ? `Events: ${activeEventLabel}` : 'Events'}
              </button>

              {eventsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] bg-surface-primary border border-line-subtle rounded-lg shadow-lg overflow-hidden">
                  {EVENTS.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => { setActiveFilter(event.id); setEventsDropdownOpen(false) }}
                      className={`
                        w-full text-left px-3 py-2 text-xs font-medium transition-colors
                        ${activeFilter === event.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-content-primary hover:bg-surface-secondary'
                        }
                      `}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vertical hairline divider — 24px gap on each side per Figma
                spacing/2xl. Outer flex gap-2 (8px) + mx-4 (16px) = 24px. */}
            <div className="self-center mx-4 h-7 w-px bg-line-subtle" />

            {/* Collateral chip — trails the divider with the same visual
                treatment as the main chips. */}
            <button
              onClick={() => { setActiveFilter(COLLATERAL_FILTER.id); setEventsDropdownOpen(false) }}
              className={`
                inline-flex items-center gap-2 px-2 py-2 rounded border-[0.5px] border-line-subtle
                font-mono text-xs uppercase whitespace-nowrap text-content-primary
                transition-colors
                ${activeFilter === COLLATERAL_FILTER.id
                  ? 'bg-surface-primary'
                  : 'bg-surface-secondary hover:bg-surface-primary'
                }
              `}
            >
              <FileIcon size={12} strokeWidth={1.5} />
              {COLLATERAL_FILTER.label}
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-content-secondary">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}{getFilterLabel()}
          </p>
        </div>

        {/* Template Grid — 3 cols on wider screens, 2 cols below. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
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
          <RequestTemplateTile channelName={
            activeFilter === 'all'
              ? 'new'
              : activeFilter.startsWith('event:')
                ? EVENTS.find(e => e.id === activeFilter)?.label || 'new'
                : FILTER_OPTIONS.find(f => f.id === activeFilter)?.label || 'new'
          } />
        </div>

        {/* Footer with selection summary and continue button */}
        {selectedAssets.length > 0 && (
          <div className="sticky bottom-0 mt-8 py-4 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent">
            <div className="flex items-center justify-between bg-white dark:bg-surface-primary border border-gray-200 dark:border-line-subtle rounded-xl px-5 py-4 shadow-lg">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                  {selectedAssets.length}
                </span>
                <span className="text-gray-700 dark:text-content-secondary font-medium">
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

    </div>
  )
}
