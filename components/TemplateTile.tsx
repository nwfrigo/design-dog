'use client'

import { useMemo } from 'react'
import type { TemplateInfo } from '@/lib/template-config'

interface TemplateTileProps {
  template: TemplateInfo
  isSelected: boolean
  onToggle: () => void
}

// Template preview backgrounds based on template type
const getPreviewStyle = (templateType: string): { bg: string; text: string } => {
  if (templateType.includes('dark-gradient')) {
    return { bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900', text: 'text-white' }
  }
  if (templateType.includes('blue-gradient')) {
    return { bg: 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400', text: 'text-white' }
  }
  if (templateType.includes('light') || templateType.includes('grid') || templateType.includes('image')) {
    return { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', text: 'text-gray-800' }
  }
  if (templateType.includes('speakers')) {
    return { bg: 'bg-gradient-to-br from-gray-100 to-gray-200', text: 'text-gray-800' }
  }
  return { bg: 'bg-gradient-to-br from-gray-100 to-white', text: 'text-gray-800' }
}

// Get a display icon for the template type
const getTemplateIcon = (templateType: string) => {
  if (templateType.includes('email')) {
    return (
      <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
  if (templateType.includes('social')) {
    return (
      <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    )
  }
  if (templateType.includes('website')) {
    return (
      <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  }
  if (templateType.includes('newsletter')) {
    return (
      <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )
  }
  return null
}

export function TemplateTile({ template, isSelected, onToggle }: TemplateTileProps) {
  // Calculate preview dimensions (maintain aspect ratio, max width 240 for larger cards)
  const previewDimensions = useMemo(() => {
    const maxWidth = 240
    const scale = maxWidth / template.width
    return {
      width: maxWidth,
      height: Math.round(template.height * scale),
    }
  }, [template.width, template.height])

  const { bg, text } = getPreviewStyle(template.type)

  return (
    <button
      onClick={onToggle}
      className={`
        group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200
        border-2
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
        }
      `}
    >
      {/* Preview area */}
      <div
        className="relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-3"
        style={{ minHeight: previewDimensions.height + 24 }}
      >
        {/* Template preview mockup */}
        <div
          className={`rounded overflow-hidden shadow-sm flex flex-col ${bg}`}
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
          }}
        >
          {/* Mini mockup content */}
          <div className={`flex-1 p-3 flex flex-col justify-between ${text}`}>
            {/* Top: Logo placeholder */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-3 bg-current opacity-20 rounded" />
              <div className="w-8 h-2 bg-current opacity-10 rounded-full" />
            </div>

            {/* Middle: Content mockup */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="w-3/4 h-2.5 bg-current opacity-25 rounded" />
              <div className="w-1/2 h-2 bg-current opacity-15 rounded" />
              {previewDimensions.height > 80 && (
                <div className="w-2/3 h-1.5 bg-current opacity-10 rounded mt-1" />
              )}
            </div>

            {/* Bottom: Icon + CTA mockup */}
            <div className="flex items-end justify-between">
              {getTemplateIcon(template.type)}
              <div className="flex items-center gap-1">
                <div className="w-8 h-1.5 bg-current opacity-20 rounded" />
                <div className="w-2 h-2 border border-current opacity-20 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Selection checkmark */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium truncate ${
            isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {template.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">
            {template.dimensions}
          </span>
        </div>
      </div>
    </button>
  )
}

// Coming soon placeholder tile
export function ComingSoonTile({ label }: { label: string }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60">
      {/* Preview area placeholder */}
      <div className="h-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">Coming soon</span>
        </div>
      </div>

      {/* Info area */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{label}</span>
      </div>
    </div>
  )
}

// Request new template tile
export function RequestTemplateTile({ channelName }: { channelName: string }) {
  return (
    <button
      onClick={() => {
        // Future: Open a modal or form to request a new template
        alert(`Request a new ${channelName} template - Coming soon!`)
      }}
      className="flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
    >
      {/* Preview area */}
      <div className="flex-1 min-h-[136px] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Request new template
          </span>
        </div>
      </div>

      {/* Info area - matches other tiles */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Need something different?
        </span>
      </div>
    </button>
  )
}
