'use client'

import { useStore } from '@/store'
import type { ColorStyle } from '@/types'
import { EditbarRoot, EditbarSection, EDITBAR_TOKENS } from './shell'

/**
 * Color contextual editbar — chip picker for templates that pick a preset
 * background style (currently EmailDarkGradient and the social gradients).
 *
 * v1 hardcoded to the 4-preset gradient set since that's what every dark/blue
 * gradient template uses today. Future: pull preset list from a per-template
 * registry so other color modes (theme tokens, freeform pickers) plug in.
 *
 * Visual is placeholder; will be restyled when Figma designs land.
 */
const PRESET_STYLES: ColorStyle[] = ['1', '2', '3', '4']

export function EditbarColor() {
  const colorStyle = useStore((s) => s.colorStyle)
  const setColorStyle = useStore((s) => s.setColorStyle)

  return (
    <EditbarRoot ariaLabel="Color">
      <EditbarSection gap="tight">
        {PRESET_STYLES.map((style) => {
          const active = style === colorStyle
          return (
            <button
              key={style}
              type="button"
              aria-label={`Color style ${style}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setColorStyle(style)}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                border: `1.5px solid ${active ? EDITBAR_TOKENS.iconActive : 'transparent'}`,
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'inline-block',
              }}
            >
              <img
                src={`/assets/backgrounds/social-dark-gradient-${style}.png`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 4 }}
              />
            </button>
          )
        })}
      </EditbarSection>
    </EditbarRoot>
  )
}
