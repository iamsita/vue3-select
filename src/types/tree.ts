import type { OptionAccessor, SelectSize, SelectTheme } from './option'

export interface NormalizedTreeNode<T = unknown> {
  id: string
  value: unknown
  label: string
  depth: number
  parentId: string | null
  isLeaf: boolean
  disabled: boolean
  children: NormalizedTreeNode<T>[]
  raw: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TreeOptionLike = Record<string, any>

export type TreeChildrenAccessor<T> = OptionAccessor<T, T[] | undefined>

export type TreeNodeCheckState = 'unchecked' | 'indeterminate' | 'checked'

export interface VTreeSelectProps<T extends TreeOptionLike = TreeOptionLike> {
  modelValue?: unknown[]
  options?: T[]

  optionValue?: keyof T | ((option: T) => unknown)
  optionLabel?: keyof T | ((option: T) => string)
  optionChildren?: keyof T | ((option: T) => T[] | undefined)
  optionDisabled?: keyof T | ((option: T) => boolean)

  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  maxSelections?: number
  maxVisibleTags?: number

  defaultExpandAll?: boolean
  showToolbar?: boolean
  closeOnSelect?: boolean

  debounce?: number

  emptyText?: string
  noResultsText?: string

  size?: SelectSize
  theme?: SelectTheme

  ariaLabel?: string
  teleportTo?: string | HTMLElement | false
  id?: string
}

export interface VTreeSelectInstance {
  open: () => void
  close: () => void
  toggle: () => void
  focus: () => void
  blur: () => void
  clear: () => void
  selectAll: () => void
  expand: (id: string) => void
  collapse: (id: string) => void
  flushSearch: () => void
  isOpen: boolean
}
