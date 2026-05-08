'use client'

import { ImageIcon, Sparkles, Pencil } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarDragHandle,
  EditbarIconButton,
} from './shell'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotImage } from '../ImageRegistry'

/**
 * Image contextual editbar (Figma node 323:2172).
 *
 * Layout: [image] [sparkles] [pencil] — change-image, generate, edit/crop.
 * 18px icons, 16px gap, surface-primary bg with hairline line-subtle border.
 *
 * All three buttons render in every state so the toolbar shape stays
 * consistent. A button without a handler renders ghosted (disabled).
 * Generate is permanently ghosted until an AI image flow gets wired —
 * passing `onGenerateImage` (or wiring `onGenerate` in the registry)
 * will light it up.
 *
 * Explicit prop overrides take precedence over registry-bound handlers —
 * useful for the visual lab where there's no provider.
 */

export interface EditbarImageProps {
  /** Hide grip + divider. Default true (hidden) — grips aren't wired to drag-reposition yet. */
  noDragHandle?: boolean
  onChangeImage?: () => void
  onGenerateImage?: () => void
  onEditImage?: () => void
}

export function EditbarImage({
  noDragHandle = true,
  onChangeImage,
  onGenerateImage,
  onEditImage,
}: EditbarImageProps) {
  const selection = useCanvasEditorStore((s) => s.selection)
  const slot = useSlotImage(selection?.path)

  // Prop overrides win; otherwise fall back to slot bindings.
  const handleChange = onChangeImage ?? slot?.onChange
  const handleGenerate = onGenerateImage ?? slot?.onGenerate
  const handleEdit = onEditImage ?? slot?.onEdit

  return (
    <EditbarRoot ariaLabel="Image">
      {!noDragHandle && (
        <>
          <EditbarDragHandle />
          <EditbarDivider />
        </>
      )}
      <EditbarSection gap="default">
        <EditbarIconButton
          ariaLabel="Change image"
          size="sm"
          onClick={handleChange}
          disabled={!handleChange}
        >
          <ImageIcon size={18} />
        </EditbarIconButton>
        <EditbarIconButton
          ariaLabel="Generate image"
          size="sm"
          onClick={handleGenerate}
          disabled={!handleGenerate}
        >
          <Sparkles size={18} />
        </EditbarIconButton>
        <EditbarIconButton
          ariaLabel="Edit image"
          size="sm"
          onClick={handleEdit}
          disabled={!handleEdit}
        >
          <Pencil size={18} />
        </EditbarIconButton>
      </EditbarSection>
    </EditbarRoot>
  )
}
