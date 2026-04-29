export type EditableKind = 'text' | 'cta' | 'image' | 'spacer' | 'color' | 'pill' | 'group'

export type EditorMode = 'edit' | 'export'

export type CapabilitySet = {
  canEditText: boolean
  canSwapImage: boolean
  canCropImage: boolean
  canRecolor: boolean
  canDragSpacing: boolean
  canTogglePill: boolean
}

export type Selection = {
  path: string
  kind: EditableKind
  templateId: string
  storeKey: string
  capabilities: CapabilitySet
  bounds: DOMRect | null
}

export type Hover = {
  path: string
  kind: EditableKind
  bounds: DOMRect | null
} | null
