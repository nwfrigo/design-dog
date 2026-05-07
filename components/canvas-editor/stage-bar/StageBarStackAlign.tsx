'use client'

import { useStore } from '@/store'

/**
 * Stack Alignment control — Top / Center / Bottom for templates whose content
 * stack vertical anchor lives in the `stackAlign` store field.
 */
export function StageBarStackAlign() {
  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wide text-gray-500 dark:text-content-secondary mr-1">
        Stack
      </span>
      <div className="inline-flex gap-0.5 p-0.5 bg-gray-100 dark:bg-surface-tertiary rounded border border-gray-200 dark:border-[#494a4c]">
        {(['top', 'center', 'bottom'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStackAlign(option)}
            className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition-colors ${
              stackAlign === option
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
