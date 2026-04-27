import type { OptionAccessor, SelectSize, SelectTheme } from './option'

/**
 * Shape every tree input is normalised into. Mirrors `NormalizedOption` for
 * flat lists, with depth + parent + children added so the renderer can draw
 * the hierarchy without recomputing on every paint.
 */
export interface NormalizedTreeNode<T = unknown> {
  /** Stable key — used by Vue's v-for and aria. */
  id: string
  /** The value emitted via v-model when this node is a leaf. */
  value: unknown
  /** Display label. */
  label: string
  /** 0 for top-level, increments per level of nesting. */
  depth: number
  /** Reference to the parent's `id`, or null at the top level. */
  parentId: string | null
  /** A leaf has no children; only leaves are toggled into v-model. */
  isLeaf: boolean
  /** Disabled nodes render but cannot be toggled. */
  disabled: boolean
  /** Recursively normalised children. */
  children: NormalizedTreeNode<T>[]
  /** Original input as supplied by the caller. */
  raw: T
}

/**
 * The widest type a tree input can be. We accept any object — the accessors
 * pull `value` / `label` / `children` out — and pin the constraint loosely
 * so plain interfaces (without an index signature) still satisfy it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TreeOptionLike = Record<string, any>

/**
 * Accessor for the children array on a tree input. Default: `'children'`.
 */
export type TreeChildrenAccessor<T> = OptionAccessor<T, T[] | undefined>

/** Tri-state used to drive the parent checkbox visual. */
export type TreeNodeCheckState = 'unchecked' | 'indeterminate' | 'checked'

/**
 * Public props surface for `<VTreeSelect>`. Extracted here (rather than
 * inline in the SFC) so `vue-tsc` can roll it into the generated `.d.ts`
 * without tripping on synthesized private names.
 */
export interface VTreeSelectProps<T extends TreeOptionLike = TreeOptionLike> {
  /** v-model — array of leaf values currently selected. */
  modelValue?: unknown[]
  options?: T[]

  /** Property name or accessor for the value emitted via v-model. */
  optionValue?: keyof T | ((option: T) => unknown)
  /** Property name or accessor for the visible label. */
  optionLabel?: keyof T | ((option: T) => string)
  /** Property name or accessor for the children array. Default `'children'`. */
  optionChildren?: keyof T | ((option: T) => T[] | undefined)
  /** Property name or accessor for the disabled flag. */
  optionDisabled?: keyof T | ((option: T) => boolean)

  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  /** Hard cap on selected leaves. */
  maxSelections?: number
  /** Collapse the trigger to "+N" once this many tags are visible. */
  maxVisibleTags?: number

  /** Expand every parent on first render. */
  defaultExpandAll?: boolean
  /** Show "select all" / "clear" actions above the tree. */
  showToolbar?: boolean
  /** Auto-close after every toggle (rarely useful for trees — default false). */
  closeOnSelect?: boolean

  /**
   * Delay (ms) between the last keystroke and the search emits / filter
   * recomputation. The input value still updates immediately so typing feels
   * instant. Mostly useful for very large trees or remote-source variants.
   */
  debounce?: number

  emptyText?: string
  noResultsText?: string

  size?: SelectSize
  theme?: SelectTheme

  ariaLabel?: string
  teleportTo?: string | HTMLElement | false
  id?: string
}

/** Methods exposed via `defineExpose` on `<VTreeSelect>`. */
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
  /** When `debounce` is set, fires the pending search emit immediately. No-op otherwise. */
  flushSearch: () => void
  isOpen: boolean
}
