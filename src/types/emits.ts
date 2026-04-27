import type { NormalizedOption } from '@/types/option'

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

/** Methods exposed via `defineExpose` — useful for parent-driven focus. */
export interface VSelectInstance {
  open: () => void
  close: () => void
  toggle: () => void
  focus: () => void
  blur: () => void
  clear: () => void
  isOpen: boolean
}
