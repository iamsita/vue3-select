import type { NormalizedOption } from '@/types/option'

export interface OptionSlotProps<T = unknown> {
  option: NormalizedOption<T>
  selected: boolean
  active: boolean
  disabled: boolean
}

export interface TagSlotProps<T = unknown> {
  option: NormalizedOption<T>
  remove: () => void
  disabled: boolean
}

export interface ValueSlotProps<T = unknown> {
  selected: NormalizedOption<T>[]
  isMulti: boolean
}

export interface OptionGroupSlotProps {
  group: string
}

export interface EmptySlotProps {
  query: string
  mode: 'no-options' | 'no-results'
}

export interface CreateSlotProps {
  query: string
  create: () => void
}

export interface ClearIconSlotProps {
  clear: () => void
}

export interface DropdownIconSlotProps {
  open: boolean
}

export interface LoaderSlotProps {
  inMenu: boolean
}
