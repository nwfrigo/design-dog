'use client'

import { Sparkles } from 'lucide-react'

/**
 * Generate control — sparkles button that triggers AI copy regeneration.
 * The actual handler lives in EditorScreen (uses local component state and
 * generation orchestration); this surface is just the affordance.
 */
export function StageBarGenerate({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
        text-gray-900 dark:text-content-primary
        border border-blue-600 rounded
        hover:bg-blue-600/10 transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      Generate
    </button>
  )
}
