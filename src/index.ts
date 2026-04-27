
export { default as VSelect } from '@/components/VSelect.vue'
export { default as VSelectOption } from '@/components/VSelectOption.vue'
export { default as VSelectTag } from '@/components/VSelectTag.vue'
export { default as VTreeSelect } from '@/components/VTreeSelect.vue'
export { default as VTreeSelectNode } from '@/components/VTreeSelectNode.vue'
export * from '@/components/icons'

export { VueSelectPlugin, type VueSelectPluginOptions } from '@/plugin'

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

export {
  normalize,
  defaultFilter,
  escapeRegex,
  toggleValue,
  valuesEqual,
  readAccessor,
  isPrimitive,
  normalizeTree,
  walkTree,
  flattenTree,
  filterTree,
  getLeafValues,
  getAncestorIds,
} from '@/core'

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
  NormalizedTreeNode,
  TreeOptionLike,
  TreeChildrenAccessor,
  TreeNodeCheckState,
  VTreeSelectProps,
  VTreeSelectInstance,
} from '@/types'
