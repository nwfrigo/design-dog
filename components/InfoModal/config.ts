/**
 * Config for the 1.5 launch info modal — a 4-page "what's new" walkthrough
 * that opens once per browser, collapses to a bottom-left toast on close,
 * and persists indefinitely (manual delete when the window has run its
 * course).
 *
 * **Ephemeral feature.** All state and assets are scoped to this directory
 * for easy deletion. The whole `components/InfoModal/` folder + the mount
 * in `app/layout.tsx` + the four PNGs in `public/assets/info-modal/` are
 * the surface to remove.
 */

/** localStorage key — set to '1' after the user closes the modal once.
 *  Presence flips the default state from modal → toast. */
export const INFO_MODAL_STORAGE_KEY = 'dd-1-5-info-seen'

export type InfoModalFeature = {
  id: 'direct-edit' | 'drag-drop' | 'diy-spacing' | 'image-editing'
  label: string
  description: string
  imageSrc: string
}

export const INFO_MODAL_FEATURES: InfoModalFeature[] = [
  {
    id: 'direct-edit',
    label: 'Direct editing',
    description:
      'No more scanning from sidebar to design. Edit text and images, right on the asset.',
    imageSrc: '/assets/info-modal/edit.png',
  },
  {
    id: 'drag-drop',
    label: 'Drag and drop',
    description: 'Add or remove content by dragging it right off the design.',
    imageSrc: '/assets/info-modal/drag.png',
  },
  {
    id: 'diy-spacing',
    label: 'DIY spacing',
    description: "Wouldn't it be nice to just change the spacing yourself? Done.",
    imageSrc: '/assets/info-modal/space.png',
  },
  {
    id: 'image-editing',
    label: 'Image editing',
    description: "Edit images or use presets to get that 'Cority look' in the app.",
    imageSrc: '/assets/info-modal/image.png',
  },
]
