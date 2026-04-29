'use client'

import { useEffect, useState } from 'react'

/**
 * Action buttons for the Stage Bar's right side: Preview · Queue · Scale · Export.
 * Mirrors the existing toolbar-below-preview block for non-migrated templates.
 *
 * State for the scale dropdown is local; everything else is provided by the
 * mounting component (EditorScreen) which owns the underlying handlers.
 */
export interface StageBarActionsProps {
  isExporting: boolean
  isEditingFromQueue: boolean
  exportScale: number
  onPreview: () => void
  onAddToQueue: () => void
  onSetExportScale: (scale: number) => void
  onExport: () => void
}

export function StageBarActions({
  isExporting,
  isEditingFromQueue,
  exportScale,
  onPreview,
  onAddToQueue,
  onSetExportScale,
  onExport,
}: StageBarActionsProps) {
  const [showScaleDropdown, setShowScaleDropdown] = useState(false)

  useEffect(() => {
    if (!showScaleDropdown) return
    const close = () => setShowScaleDropdown(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showScaleDropdown])

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={onPreview}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-content-secondary
          bg-white dark:bg-surface-primary rounded hover:bg-gray-50 dark:hover:bg-interactive-hover
          border border-gray-200 dark:border-[#494a4c] transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
        </svg>
        Preview
      </button>

      {!isEditingFromQueue && (
        <button
          type="button"
          onClick={onAddToQueue}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-content-secondary whitespace-nowrap
            bg-white dark:bg-surface-primary rounded hover:bg-gray-50 dark:hover:bg-interactive-hover
            border border-gray-200 dark:border-[#494a4c] transition-colors"
        >
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 12H3" /><path d="M16 6H3" /><path d="M16 18H3" /><path d="M18 9v6" /><path d="M21 12h-6" />
          </svg>
          Add to Queue
        </button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowScaleDropdown((v) => !v) }}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-content-secondary
            bg-white dark:bg-surface-primary rounded hover:bg-gray-50 dark:hover:bg-interactive-hover
            border border-gray-200 dark:border-[#494a4c] transition-colors"
        >
          {exportScale}x
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showScaleDropdown && (
          <div className="absolute top-full right-0 mt-1 w-16 bg-white dark:bg-surface-secondary border border-gray-200
            dark:border-[#494a4c] rounded shadow-lg overflow-hidden z-10">
            {[1, 2, 3].map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetExportScale(scale); setShowScaleDropdown(false) }}
                className={`w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-interactive-hover
                  ${exportScale === scale ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-content-secondary'}`}
              >
                {scale}x
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-900 dark:text-white
          border border-blue-600 rounded hover:bg-blue-600/10 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        )}
        Export
      </button>
    </div>
  )
}
