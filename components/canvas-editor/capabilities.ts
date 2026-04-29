import type { CapabilitySet, EditableKind } from './types'

const NONE: CapabilitySet = {
  canEditText: false,
  canSwapImage: false,
  canCropImage: false,
  canRecolor: false,
  canDragSpacing: false,
  canTogglePill: false,
}

export const DEFAULTS_BY_KIND: Record<EditableKind, CapabilitySet> = {
  text: { ...NONE, canEditText: true, canRecolor: true },
  // CTA is a constrained text variant: editable copy, but no Bold/Italic; gains
  // Style (Link/Button) and arrow-color in EditbarCta — not exposed via the
  // generic CapabilitySet. Bench hide is provided by VisibilityRegistry.
  cta: { ...NONE, canEditText: true, canRecolor: true },
  image: { ...NONE, canSwapImage: true, canCropImage: true },
  spacer: { ...NONE, canDragSpacing: true },
  color: { ...NONE, canRecolor: true },
  pill: { ...NONE, canTogglePill: true, canRecolor: true },
  group: { ...NONE },
}

export function resolveCapabilities(
  kind: EditableKind,
  overrides?: Partial<CapabilitySet>,
): CapabilitySet {
  return { ...DEFAULTS_BY_KIND[kind], ...overrides }
}
