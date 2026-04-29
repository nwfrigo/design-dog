'use client'

import { Link2, Square, AArrowUp, AArrowDown, Palette, EyeOff } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarIconButton,
} from './shell'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'
import { useStore } from '@/store'

/**
 * EditbarCta — contextual toolbar for `kind: 'cta'` slots.
 *
 * Distinct from EditbarText: CTAs are buttons/links, not body copy. Bold and
 * italic are intentionally absent — CTA styling is template-controlled, not
 * user-controlled.
 *
 * Phase 1 stub: structure + placeholder buttons. Wiring lands in Phase 2:
 *   - Style toggle (Link / Button) → setCtaStyle
 *   - Font size ↑ / ↓ → per-template CTA size setter
 *   - Arrow color → new ctaArrowColor field (relevant only for Link style)
 *   - Hide → bench (already wired below; identical to EditbarText)
 */
export function EditbarCta() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const visibility = useSlotVisibility(selection?.path)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)
  const ctaStyle = useStore((s) => s.ctaStyle)
  const setCtaStyle = useStore((s) => s.setCtaStyle)

  return (
    <EditbarRoot ariaLabel="CTA formatting">
      <EditbarSection gap="default">
        <EditbarIconButton
          ariaLabel="Style: Link"
          size="sm"
          active={ctaStyle === 'link'}
          onClick={() => setCtaStyle('link')}
        >
          <Link2 size={18} />
        </EditbarIconButton>
        <EditbarIconButton
          ariaLabel="Style: Button"
          size="sm"
          active={ctaStyle === 'button'}
          onClick={() => setCtaStyle('button')}
        >
          <Square size={18} />
        </EditbarIconButton>
      </EditbarSection>
      <EditbarDivider />
      <EditbarSection gap="default">
        {/* Phase 2 placeholders — wire when ctaFontSize / ctaArrowColor land. */}
        <EditbarIconButton ariaLabel="Increase font size" size="sm" disabled>
          <AArrowUp size={18} />
        </EditbarIconButton>
        <EditbarIconButton ariaLabel="Decrease font size" size="sm" disabled>
          <AArrowDown size={18} />
        </EditbarIconButton>
        <EditbarIconButton ariaLabel="Arrow color" size="sm" disabled>
          <Palette size={18} />
        </EditbarIconButton>
        {visibility && (
          <EditbarIconButton
            ariaLabel={`Hide ${visibility.label}`}
            size="sm"
            onClick={() => {
              visibility.hide()
              setEditingPath(null)
              clearSelection()
            }}
          >
            <EyeOff size={18} />
          </EditbarIconButton>
        )}
      </EditbarSection>
    </EditbarRoot>
  )
}
