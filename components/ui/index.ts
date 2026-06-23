/**
 * Design-system root barrel.
 *
 * Canonical home for global, app-wide UI primitives. New primitives land here;
 * existing ones migrate in opportunistically as they're touched. Import via
 * `@/components/ui`.
 */

export { Toggle, type ToggleProps } from './Toggle'
export { Field, type FieldProps } from './Field'
export { InfoToast, type InfoToastProps } from './InfoToast'

// Migrated in (touch-to-move): atoms this work touched. Remaining DS primitives
// relocate here opportunistically as they're next edited.
export {
  SelectorPrimitive,
  type SelectorPrimitiveProps,
  type ColorOption,
  type EnumOption,
} from './SelectorPrimitive'
export { ActionButton, type ActionButtonProps, type ActionFn } from './ActionButton'
export {
  PresetButtonGroup,
  PresetChip,
  type PresetButtonGroupProps,
  type PresetChipProps,
  type PresetOption,
} from './PresetButtonGroup'
