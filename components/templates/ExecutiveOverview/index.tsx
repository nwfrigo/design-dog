'use client'

/**
 * Executive Overview — the first Stage & Bench multi-page collateral.
 *
 * A fixed 2-page, Letter-portrait (612×792) prospect-facing summary of the
 * recommended Cority partnership. Page 1 = intro + hero; Page 2 = value
 * cards + stats + contact. Light-mode only (matches the Figma design).
 *
 * Barrel: re-exports the two page components plus the shared block-id union,
 * content model, tokens, and provisional placeholders (which live in
 * `./constants` to avoid a page↔barrel import cycle).
 */

export { Page1 } from './Page1'
export { Page2 } from './Page2'
export type { Page1Props } from './Page1'
export type { Page2Props } from './Page2'

export * from './constants'
