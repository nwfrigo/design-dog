'use client'

import { EyeOff } from 'lucide-react'
import {
  EditbarSection,
  EditbarDivider,
  EditbarIconButton,
  EDITBAR_TOKENS,
} from './shell'
import { Dropdown } from './Dropdown'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'
import { useSlotCategory } from '../CategoryRegistry'

/**
 * Category contextual editbar — matches Figma node 370:628 (`toolbar_category`).
 *
 * Layout:
 *  - eye-off (visibility hide) + divider
 *  - dropdown for category selection (e.g. solution)
 *
 * Asymmetric padding (12px left, 4px right, 4px y) lets the embedded
 * dropdown sit flush to the right edge while the eye-off icon keeps a
 * comfortable left inset — matches the Figma spec exactly. We don't
 * reuse `EditbarRoot` because that uses symmetric padding.
 */

export function EditbarCategory() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)
  const visibility = useSlotVisibility(selection?.path)
  const category = useSlotCategory(selection?.path)

  // No category binding → fall back to nothing (defensive; ContextualToolbar
  // only renders this when kind === 'pill').
  if (!category && !visibility) return null

  return (
    <div
      role="toolbar"
      aria-label="Category"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: EDITBAR_TOKENS.space4,
        height: EDITBAR_TOKENS.height,
        background: EDITBAR_TOKENS.bg,
        border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
        borderRadius: EDITBAR_TOKENS.radius,
        // Figma `toolbar_category` padding: pl-lg(12) pr-sm(4) py-sm(4)
        padding: '4px 4px 4px 12px',
        fontFamily: EDITBAR_TOKENS.fontFamily,
        fontSize: EDITBAR_TOKENS.fontSize,
        boxShadow:
          '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        color: EDITBAR_TOKENS.textPrimary,
      }}
    >
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
      {category && (
        <Dropdown
          ariaLabel="Category"
          value={category.value}
          options={category.options}
          onChange={category.set}
        />
      )}
    </div>
  )
}
