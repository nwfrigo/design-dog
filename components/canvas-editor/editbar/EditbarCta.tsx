'use client'

import { EyeOff } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarIconButton,
  EDITBAR_TOKENS,
} from './shell'
import { Toggle } from '@/components/ui'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'
import { useStore } from '@/store'

/**
 * EditbarCta — contextual toolbar for `kind: 'cta'` slots.
 *
 * Figma node 367:360. Layout: eye-off → divider → "BUTTON" label →
 * Toggle (left = button, right = link) → "LINK" label. The toggle's
 * thumb position reads as which CTA variant is active.
 *
 * Distinct from EditbarText: CTAs are buttons/links, not body copy. Bold
 * and italic are intentionally absent — CTA styling is template-controlled.
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
      {visibility && (
        <>
          <EditbarSection gap="default">
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
          </EditbarSection>
          <EditbarDivider />
        </>
      )}
      <EditbarSection gap="default">
        <span
          style={{
            fontFamily: EDITBAR_TOKENS.fontFamily,
            fontSize: 12,
            color: EDITBAR_TOKENS.textSecondary,
            textTransform: 'uppercase',
          }}
        >
          Button
        </span>
        <Toggle
          checked={ctaStyle === 'link'}
          onChange={(next) => setCtaStyle(next ? 'link' : 'button')}
          ariaLabel="CTA Style — off is Button, on is Link"
        />
        <span
          style={{
            fontFamily: EDITBAR_TOKENS.fontFamily,
            fontSize: 12,
            color: EDITBAR_TOKENS.textSecondary,
            textTransform: 'uppercase',
          }}
        >
          Link
        </span>
      </EditbarSection>
    </EditbarRoot>
  )
}
