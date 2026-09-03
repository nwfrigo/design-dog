/**
 * Config for the "Introducing 'My Work'" info modal — a one-page
 * announcement that opens once per browser, collapses to a bottom-left
 * "See what's new" toast on close, and persists indefinitely (manual
 * delete when the window has run its course).
 *
 * Same machinery as the 1.5 launch modal it replaced (Figma `660:3063`,
 * previously `399:3711`) — new content, new storage key so it re-fires
 * for everyone on startup.
 *
 * **Ephemeral feature.** All state and assets are scoped to this directory
 * for easy deletion. The whole `components/InfoModal/` folder + the mount
 * in `app/layout.tsx` + `public/assets/info-modal/` are the surface to
 * remove.
 */

/** localStorage key — set to '1' after the user closes the modal once.
 *  Presence flips the default state from modal → toast. Keyed per
 *  announcement so a new campaign re-opens for users who saw the last. */
export const INFO_MODAL_STORAGE_KEY = 'dd-my-work-info-seen'

export const INFO_MODAL_COPY = {
  headingLine1: 'Introducing',
  headingLine2: '‘My Work’',
  body:
    'View and edit drafts, clone previous designs, and manage your Design Dog work in one place. You know, like a normal app.',
  imageSrc: '/assets/info-modal/my-work.png',
}
