import type { FilterFn } from '@/types/filter'
import type { OptionLike, SelectMode, SelectSize, SelectTheme } from '@/types/option'

export interface VSelectProps<T extends OptionLike = OptionLike> {
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
  filter?: FilterFn<T>
  caseSensitive?: boolean

  debounce?: number

  emptyText?: string
  noResultsText?: string
  loadingText?: string

  size?: SelectSize
  theme?: SelectTheme

  ariaLabel?: string
  teleportTo?: string | HTMLElement | false

  name?: string
  required?: boolean
  id?: string
}
