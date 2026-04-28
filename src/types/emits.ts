import type { NormalizedOption } from '@/types/option'
import type { NormalizedTreeNode } from '@/types/tree'

/**
 * Public emits surface for `<VSelect>`. Mirrors the runtime `emits` block —
 * exported so consumers can type their own event handlers without re-deriving.
 */
export interface VSelectEmits<T = unknown> {
  (e: 'update:modelValue', value: unknown): void
  (e: 'update:search', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'select', option: NormalizedOption<T>): void
  (e: 'deselect', option: NormalizedOption<T>): void
  (e: 'create', value: string): void
  (e: 'search', query: string): void
}

/** Methods exposed via `defineExpose` on `<VSelect>`. */
export interface VSelectInstance {
  open: () => void
  close: () => void
  toggle: () => void
  focus: () => void
  blur: () => void
  clear: () => void
  /** When `debounce` is set, fires the pending search emit immediately. No-op otherwise. */
  flushSearch: () => void
  readonly isOpen: boolean
}

/**
 * Public emits surface for `<VTreeSelect>`. Tree mode only emits leaves into
 * v-model — `select` / `deselect` fire once per affected leaf even when the
 * user toggles a parent checkbox.
 */
export interface VTreeSelectEmits<T = unknown> {
  (e: 'update:modelValue', value: unknown[]): void
  (e: 'update:search', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'select', node: NormalizedTreeNode<T>): void
  (e: 'deselect', node: NormalizedTreeNode<T>): void
  (e: 'expand', node: NormalizedTreeNode<T>): void
  (e: 'collapse', node: NormalizedTreeNode<T>): void
  (e: 'search', query: string): void
}
