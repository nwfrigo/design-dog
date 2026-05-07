'use client'

import { useStore } from '@/store'
import type { ColorStyle } from '@/types'

/**
 * Color Style control — 4 preset gradient swatches for templates whose color
 * variant lives in the `colorStyle` store field (email-dark-gradient,
 * social-dark-gradient, social-blue-gradient, newsletters with this field).
 *
 * Renders a compact 4-swatch row matching the sidebar's existing visual.
 */
export function StageBarColorStyle() {
  const colorStyle = useStore((s) => s.colorStyle)
  const setColorStyle = useStore((s) => s.setColorStyle)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wide text-gray-500 dark:text-content-secondary mr-1">
        Color
      </span>
      <div className="flex gap-1">
        {(['1', '2', '3', '4'] as const satisfies readonly ColorStyle[]).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setColorStyle(style)}
            aria-label={`Color style ${style}`}
            className={`w-7 h-7 rounded border-2 overflow-hidden transition-colors ${
              colorStyle === style
                ? 'border-blue-500'
                : 'border-gray-200 dark:border-[#494a4c] hover:border-gray-400 dark:hover:border-[#7c7d80]'
            }`}
          >
            <img
              src={`/assets/backgrounds/social-dark-gradient-${style}.png`}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
