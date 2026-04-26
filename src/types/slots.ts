import type { NormalizedOption } from './option'

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

export interface SelectionTextSlotProps<T = unknown> {
  selected: NormalizedOption<T>[]
}

export interface GroupSlotProps {
  group: string
}

export interface EmptySlotProps {
  query: string
}

export interface CreateSlotProps {
  query: string
  create: () => void
}

export interface ClearSlotProps {
  clear: () => void
}

export interface IndicatorSlotProps {
  open: boolean
}
