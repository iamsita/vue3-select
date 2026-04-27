// Public package entry. Consumers import named exports for tree-shaking; the
// optional `VueSelectPlugin` is available for global registration.

// Components
export { default as VSelect } from '@/components/VSelect.vue'
export { default as VSelectOption } from '@/components/VSelectOption.vue'
export { default as VSelectTag } from '@/components/VSelectTag.vue'
export { default as VTreeSelect } from '@/components/VTreeSelect.vue'
export { default as VTreeSelectNode } from '@/components/VTreeSelectNode.vue'
export * from '@/components/icons'

// Plugin
export { VueSelectPlugin, type VueSelectPluginOptions } from '@/plugin'

// Composables — re-exported so users can build headless variants on top.
export {
  useControlFocus,
  useDebounced,
  useFloatingMenu,
  useKeyboardNav,
  useOptionFilter,
  useOutsideClick,
  useSelection,
  useStableId,
  useTreeSelection,
  type UseControlFocusOptions,
  type UseControlFocusReturn,
  type UseDebouncedReturn,
  type UseFloatingMenuOptions,
  type UseFloatingMenuReturn,
  type UseKeyboardNavOptions,
  type UseOptionFilterOptions,
  type UseOutsideClickOptions,
  type UseSelectionOptions,
  type UseTreeSelectionOptions,
  type UseTreeSelectionReturn,
} from '@/composables'

// Core helpers — useful for custom filter functions and option pre-processing.
export {
  normalize,
  defaultFilter,
  escapeRegex,
  toggleValue,
  valuesEqual,
  readAccessor,
  isPrimitive,
  // Tree helpers
  normalizeTree,
  walkTree,
  flattenTree,
  filterTree,
  getLeafValues,
  getAncestorIds,
} from '@/core'

// Types
export type {
  NormalizedOption,
  OptionLike,
  OptionAccessor,
  SelectMode,
  SelectSize,
  SelectTheme,
  FilterFn,
  FilterContext,
  VSelectProps,
  VSelectEmits,
  VSelectInstance,
  OptionSlotProps,
  TagSlotProps,
  ValueSlotProps,
  OptionGroupSlotProps,
  EmptySlotProps,
  CreateSlotProps,
  ClearIconSlotProps,
  DropdownIconSlotProps,
  LoaderSlotProps,
  // Tree types
  NormalizedTreeNode,
  TreeOptionLike,
  TreeChildrenAccessor,
  TreeNodeCheckState,
  VTreeSelectProps,
  VTreeSelectInstance,
} from '@/types'
