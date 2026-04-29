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
            className={`w-7 h-7 rounded border-2 overflow-hidden transition-all ${
              colorStyle === style
                ? 'border-blue-500 ring-1 ring-blue-200'
                : 'border-gray-300 dark:border-line-subtle hover:border-gray-400'
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
