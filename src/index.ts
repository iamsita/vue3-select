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
  useSelection,
  useOptionFilter,
  useKeyboardNav,
  useStableId,
  useTreeSelection,
  useDebounced,
  type UseSelectionOptions,
  type UseOptionFilterOptions,
  type UseKeyboardNavOptions,
  type UseTreeSelectionOptions,
  type UseTreeSelectionReturn,
  type UseDebouncedReturn,
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
