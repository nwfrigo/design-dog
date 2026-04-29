'use client'

import { useState } from 'react'
import { Bold, Italic, AArrowUp, AArrowDown, MoveVertical } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarDragHandle,
  EditbarIconButton,
} from './shell'
import { EditbarSlider } from './EditbarSlider'
import { useCanvasEditorStore } from '@/store/canvas-editor'

/**
 * Text contextual editbar (Figma: toolbar_text, node 277:2731).
 *
 * Three visual states from the Figma spec:
 *   1. Default          — grip + divider + [B I A↑ A↓ ↕]
 *   2. bold-activated   — same layout, B icon highlighted (active=true)
 *   3. no-drag-handle   — [B I A↑ A↓ ↕] only, no grip, no divider
 *
 * State styling (color tokens, all from EDITBAR_TOKENS):
 *   resting   → iconDefault   (#7c7d80)
 *   hover     → iconActive    (#ffffff)
 *   selected  → iconActive    (#ffffff) — persistent, same hue as hover
 *   disabled  → iconDisabled  (#343538)
 *
 * Bold/Italic execute via document.execCommand on the active contentEditable.
 * Disabled when not in edit mode (no contentEditable target → command would no-op).
 *
 * Line-spacing button (MoveVertical) opens the EditbarSlider popover for
 * adjusting the line height of the selected text block. Slider is placeholder
 * UI only — not wired to a store field yet.
 */

export interface EditbarTextProps {
  /** Hide grip + divider. Default true (hidden) — grips aren't wired to drag-reposition yet. */
  noDragHandle?: boolean
}

export function EditbarText({ noDragHandle = true }: EditbarTextProps) {
  const editingPath = useCanvasEditorStore((s) => s.editingPath)
  const selection = useCanvasEditorStore((s) => s.selection)
  const isEditing = !!editingPath && editingPath === selection?.path

  const [boldActive, setBoldActive] = useState(false)
  const [italicActive, setItalicActive] = useState(false)
  const [lineHeightOpen, setLineHeightOpen] = useState(false)

  // Re-poll execCommand state after a formatting click so the active styling
  // tracks the underlying selection.
  const refreshActiveStates = () => {
    if (typeof document === 'undefined') return
    try {
      setBoldActive(document.queryCommandState('bold'))
      setItalicActive(document.queryCommandState('italic'))
    } catch {
      // queryCommandState can throw in some contexts — ignore
    }
  }

  const onBold = () => {
    document.execCommand('bold')
    refreshActiveStates()
  }
  const onItalic = () => {
    document.execCommand('italic')
    refreshActiveStates()
  }
  // Font-size +/- are not wired yet — placeholder buttons render in disabled
  // state. Wire to per-template setters (e.g. setHeadlineFontSize) when the
  // substrate's command registry lands.
  const onSizeUp = () => {}
  const onSizeDown = () => {}

  const actions = (
    <EditbarSection gap="default">
      <EditbarIconButton
        ariaLabel="Bold"
        size="sm"
        active={boldActive}
        disabled={!isEditing}
        onClick={onBold}
      >
        <Bold size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Italic"
        size="sm"
        active={italicActive}
        disabled={!isEditing}
        onClick={onItalic}
      >
        <Italic size={18} />
      </EditbarIconButton>
      <EditbarIconButton ariaLabel="Increase font size" size="sm" disabled onClick={onSizeUp}>
        <AArrowUp size={18} />
      </EditbarIconButton>
      <EditbarIconButton ariaLabel="Decrease font size" size="sm" disabled onClick={onSizeDown}>
        <AArrowDown size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Line spacing"
        size="sm"
        active={lineHeightOpen}
        onClick={() => setLineHeightOpen((v) => !v)}
      >
        <MoveVertical size={18} />
      </EditbarIconButton>
    </EditbarSection>
  )

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <EditbarRoot ariaLabel="Text formatting">
        {!noDragHandle && (
          <>
            <EditbarDragHandle />
            <EditbarDivider />
          </>
        )}
        {actions}
      </EditbarRoot>

      {lineHeightOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 1,
          }}
        >
          <EditbarSlider />
        </div>
      )}
    </div>
  )
}
