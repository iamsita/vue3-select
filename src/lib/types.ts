import type { Component, VNode } from 'vue'

/**
 * Internal shape every option is normalised into. Consumers may pass primitives
 * (string/number) or arbitrary objects — the component reads identity via
 * `optionValue` and label via `optionLabel`, then keeps a reference to the
 * original raw option on `raw`.
 */
export interface NormalizedOption<T = unknown> {
  /** Stable, unique key used by Vue's v-for and aria. */
  id: string
  /** The value emitted via v-model. */
  value: unknown
  /** Display label. */
  label: string
  /** Optional group key — options sharing a key render under the same heading. */
  group?: string
  /** Disabled options are visible but not selectable. */
  disabled?: boolean
  /** The original option as supplied by the caller. */
  raw: T
}

export type OptionLike = string | number | Record<string, any>

/** Resolves either a property name on the option or an extractor function. */
export type OptionAccessor<T, R> = keyof T | ((option: T) => R)

export type SelectMode = 'single' | 'multiple' | 'tags'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface FilterContext<T> {
  query: string
  option: NormalizedOption<T>
}

export type FilterFn<T = unknown> = (ctx: FilterContext<T>) => boolean

export interface CreateOptionContext {
  query: string
}

/**
 * Public props surface. Kept separate from the component's `defineProps` so
 * downstream packages (and the documented API) have a single source of truth.
 */
export interface VSelectProps<T extends OptionLike = OptionLike> {
  modelValue?: unknown
  options?: T[]
  mode?: SelectMode
  /** Property name or accessor for the value emitted via v-model. */
  optionValue?: OptionAccessor<T, unknown>
  /** Property name or accessor for the visible label. */
  optionLabel?: OptionAccessor<T, string>
  /** Property name or accessor for grouping. */
  optionGroup?: OptionAccessor<T, string | undefined>
  /** Property name or accessor for the disabled flag. */
  optionDisabled?: OptionAccessor<T, boolean>
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  /** Show a loading spinner while the parent fetches options. */
  closeOnSelect?: boolean
  /** Auto-focus the search input when the menu opens. */
  autofocus?: boolean
  /** Limit how many tags are visible in multi mode before collapsing into "+N". */
  maxVisibleTags?: number
  /** Hard cap on selections in multi/tags mode. */
  maxSelections?: number
  /** Permit creating new options from the search query (tags mode default). */
  taggable?: boolean
  /** Custom filter — returns true if the option matches the query. */
  filter?: FilterFn<T>
  /** Treat search as case sensitive. */
  caseSensitive?: boolean
  /** Custom no-results text. */
  noOptionsText?: string
  noResultsText?: string
  loadingText?: string
  size?: SelectSize
  /** Accessible label, falls back to placeholder. */
  ariaLabel?: string
  /** Append the menu to a different element (e.g. 'body'). */
  teleportTo?: string | HTMLElement | false
  /** Form integration. */
  name?: string
  /** Required marker for native form validation. */
  required?: boolean
  /** Override automatic id generation. */
  id?: string
}

export interface VSelectEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'update:search', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'select', option: NormalizedOption): void
  (e: 'deselect', option: NormalizedOption): void
  (e: 'create', value: string): void
  (e: 'search', query: string): void
}

/** Exposed via defineExpose — useful for parent components driving focus. */
export interface VSelectInstance {
  open: () => void
  close: () => void
  toggle: () => void
  focus: () => void
  blur: () => void
  clear: () => void
  isOpen: boolean
}

/** Slot prop bag passed to consumers when overriding rendering. */
export interface OptionSlotProps<T = unknown> {
  option: NormalizedOption<T>
  selected: boolean
  active: boolean
  disabled: boolean
}

export interface SelectionSlotProps<T = unknown> {
  option: NormalizedOption<T>
  remove: () => void
  disabled: boolean
}

export type IconRender = string | Component | ((props: Record<string, unknown>) => VNode)

/**
 * Props surface as consumed by `<VSelect>`. Kept here (rather than inside the
 * SFC) so vue-tsc can roll the type into the generated `.d.ts` without hitting
 * private-name errors on the SFC's synthesized default export.
 */
export interface VSelectComponentProps<T extends OptionLike = OptionLike> {
  modelValue?: unknown
  options?: T[]
  mode?: SelectMode
  optionValue?: keyof T | ((option: T) => unknown)
  optionLabel?: keyof T | ((option: T) => string)
  optionGroup?: keyof T | ((option: T) => string | undefined)
  optionDisabled?: keyof T | ((option: T) => boolean)
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  closeOnSelect?: boolean
  autofocus?: boolean
  maxVisibleTags?: number
  maxSelections?: number
  taggable?: boolean
  caseSensitive?: boolean
  noOptionsText?: string
  noResultsText?: string
  loadingText?: string
  size?: SelectSize
  ariaLabel?: string
  teleportTo?: string | HTMLElement | false
  name?: string
  required?: boolean
  id?: string
  theme?: 'light' | 'dark' | 'auto'
}
