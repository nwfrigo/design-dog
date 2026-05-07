'use client'

import { useStore } from '@/store'

/**
 * Alignment control — Left / Center segmented toggle for templates whose
 * horizontal text alignment lives in the `alignment` store field.
 */
export function StageBarAlignment() {
  const alignment = useStore((s) => s.alignment)
  const setAlignment = useStore((s) => s.setAlignment)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wide text-gray-500 dark:text-content-secondary mr-1">
        Align
      </span>
      <div className="inline-flex gap-0.5 p-0.5 bg-gray-100 dark:bg-surface-tertiary rounded border border-gray-200 dark:border-[#494a4c]">
        {(['left', 'center'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setAlignment(option)}
            className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition-colors ${
              alignment === option
                ? 'bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary shadow-sm'
                : 'text-gray-600 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
