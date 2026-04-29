'use client'

import { ImageIcon, Sparkles } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarDragHandle,
  EditbarIconButton,
} from './shell'

/**
 * Image contextual editbar (Figma: toolbar_image, node 277:2920).
 *
 * Layout: grip + divider + [change-image] [generate-image]
 *
 * Buttons are unwired placeholders for v1 — both render in their resting
 * state (interactive, not disabled), per the user's design intent. Wiring
 * happens once the substrate's image-swap + AI-generate commands land.
 */

export interface EditbarImageProps {
  /** Hide grip + divider. Default true (hidden) — grips aren't wired to drag-reposition yet. */
  noDragHandle?: boolean
  onChangeImage?: () => void
  onGenerateImage?: () => void
}

export function EditbarImage({
  noDragHandle = true,
  onChangeImage,
  onGenerateImage,
}: EditbarImageProps) {
  return (
    <EditbarRoot ariaLabel="Image">
      {!noDragHandle && (
        <>
          <EditbarDragHandle />
          <EditbarDivider />
        </>
      )}
      <EditbarSection gap="default">
        <EditbarIconButton ariaLabel="Change image" size="sm" onClick={onChangeImage}>
          <ImageIcon size={18} />
        </EditbarIconButton>
        <EditbarIconButton ariaLabel="Generate image" size="sm" onClick={onGenerateImage}>
          <Sparkles size={18} />
        </EditbarIconButton>
      </EditbarSection>
    </EditbarRoot>
  )
}
