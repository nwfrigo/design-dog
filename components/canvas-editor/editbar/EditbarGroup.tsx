'use client'

import { EyeOff } from 'lucide-react'
import { EditbarRoot, EditbarSection, EditbarIconButton } from './shell'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'

/**
 * Group contextual editbar — visibility only.
 *
 * A `kind: 'group'` slot is a container for nested children (the per-speaker
 * name/role/avatar lockups, executive-overview's footer contact byline). The
 * group itself owns no content, so the only thing it can offer is "hide the
 * whole lockup" — which is exactly what its `show*` flag drives.
 *
 * Groups previously mapped to `null` in EDITBAR_BY_KIND, so the only way to
 * hide one was dragging its stage block to the bench. That left group slots as
 * the sole exception to substrate decision #2 ("every kind's editbar has an
 * EyeOff button"); discovering drag-to-bench is much harder than clicking an
 * eye. Drag still works — this just adds the click affordance the other kinds
 * already had.
 *
 * Renders nothing when the selected group has no VisibilityRegistry entry
 * (a non-benchable, always-on group), so it can't show a control that
 * wouldn't do anything.
 */
export function EditbarGroup() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)
  const visibility = useSlotVisibility(selection?.path)

  if (!visibility) return null

  return (
    <EditbarRoot ariaLabel="Group">
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
    </EditbarRoot>
  )
}
