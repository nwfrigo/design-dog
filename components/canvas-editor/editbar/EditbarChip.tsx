'use client'

import { useState } from 'react'
import { EyeOff, Replace } from 'lucide-react'
import {
  EditbarSection,
  EditbarDivider,
  EditbarIconButton,
  EDITBAR_TOKENS,
} from './shell'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'
import { useSlotIcon } from '../IconRegistry'
import { IconPickerModal } from '@/components/IconPickerModal'

/**
 * Chip contextual editbar — matches Figma node 618:3034 (`toolbar_chip`).
 *
 * Layout:
 *  - eye-off (visibility hide, for stage↔bench moves) + divider
 *  - replace (opens the Lucide icon library to swap the chip's icon)
 *
 * The chip's LABEL stays inline-editable via double-click (Editable allows
 * `kind: 'chip'`); this toolbar only owns visibility + icon. Icon state comes
 * from the IconRegistry, wired per-slot by the adapter.
 */
export function EditbarChip() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)
  const visibility = useSlotVisibility(selection?.path)
  const iconSlot = useSlotIcon(selection?.path)
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!iconSlot && !visibility) return null

  return (
    <>
      <div
        role="toolbar"
        aria-label="Chip"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: EDITBAR_TOKENS.space4,
          height: EDITBAR_TOKENS.height,
          background: EDITBAR_TOKENS.bg,
          border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
          borderRadius: EDITBAR_TOKENS.radius,
          // Figma `toolbar_chip`: px-12 py-4, symmetric (two icon buttons).
          padding: '4px 12px',
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
            {iconSlot && <EditbarDivider />}
          </>
        )}
        {iconSlot && (
          <EditbarSection gap="default">
            <EditbarIconButton
              ariaLabel="Replace icon"
              size="sm"
              onClick={() => setPickerOpen(true)}
            >
              <Replace size={18} />
            </EditbarIconButton>
          </EditbarSection>
        )}
      </div>

      {pickerOpen && iconSlot && (
        <IconPickerModal
          value={iconSlot.icon}
          onChange={(name) => {
            iconSlot.set(name)
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
