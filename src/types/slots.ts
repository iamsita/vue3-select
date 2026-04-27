import type { NormalizedOption } from './option'

export interface OptionSlotProps<T = unknown> {
  option: NormalizedOption<T>
  selected: boolean
  active: boolean
  disabled: boolean
}

/** Per-tag rendering in multi/tags mode. Default: `<VSelectTag />`. */
export interface TagSlotProps<T = unknown> {
  option: NormalizedOption<T>
  remove: () => void
  disabled: boolean
}

/** Whole-value rendering. Default: tags in multi mode, single label otherwise. */
export interface ValueSlotProps<T = unknown> {
  selected: NormalizedOption<T>[]
  isMulti: boolean
}

export interface OptionGroupSlotProps {
  group: string
}

/** Empty state slot — `mode` distinguishes "no options at all" from "no match". */
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
  /** Whether the loader appears inside the menu (true) or in the control (false). */
  inMenu: boolean
}
