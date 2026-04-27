import { computed, ref, watch, type Ref } from 'vue'
import type { NormalizedOption, SelectMode } from '@/types/option'
import { toggleValue, valuesEqual } from '@/core/compare'

export interface UseSelectionOptions<T> {
  modelValue: Ref<unknown>
  options: Ref<NormalizedOption<T>[]>
  mode: Ref<SelectMode>
  maxSelections?: Ref<number | undefined>
  emitUpdate: (value: unknown) => void
  emitSelect: (option: NormalizedOption<T>) => void
  emitDeselect: (option: NormalizedOption<T>) => void
}

export function useSelection<T>(opts: UseSelectionOptions<T>) {
  const isMulti = computed(() => opts.mode.value !== 'single')

  const selectedValues = computed<unknown[]>(() => {
    const value = opts.modelValue.value
    if (value == null || value === '') return []
    return Array.isArray(value) ? value : [value]
  })

  const selectedOptions = computed<NormalizedOption<T>[]>(() => {
    return selectedValues.value.map((v) => {
      const found = opts.options.value.find((o) => valuesEqual(o.value, v))
      if (found) return found
      const label =
        typeof v === 'object' && v !== null
          ? String(
              (v as Record<string, unknown>).label ?? (v as Record<string, unknown>).name ?? '',
            )
          : String(v)
      return {
        id: `synthetic-${label}`,
        value: v,
        label,
        raw: v as T,
      } satisfies NormalizedOption<T>
    })
  })

  function isSelected(option: NormalizedOption<T>): boolean {
    return selectedValues.value.some((v) => valuesEqual(v, option.value))
  }

  function select(option: NormalizedOption<T>) {
    if (option.disabled) return
    if (!isMulti.value) {
      if (isSelected(option)) return
      opts.emitUpdate(option.value)
      opts.emitSelect(option)
      return
    }
    const cap = opts.maxSelections?.value
    if (!isSelected(option) && cap !== undefined && selectedValues.value.length >= cap) return
    const wasSelected = isSelected(option)
    const next = toggleValue(selectedValues.value, option.value)
    opts.emitUpdate(next)
    if (wasSelected) opts.emitDeselect(option)
    else opts.emitSelect(option)
  }

  function deselect(option: NormalizedOption<T>) {
    if (!isMulti.value) {
      opts.emitUpdate(null)
    } else {
      opts.emitUpdate(selectedValues.value.filter((v) => !valuesEqual(v, option.value)))
    }
    opts.emitDeselect(option)
  }

  function clear() {
    if (selectedValues.value.length === 0) return
    const cleared = [...selectedOptions.value]
    opts.emitUpdate(isMulti.value ? [] : null)
    cleared.forEach((o) => opts.emitDeselect(o))
  }

  const isOpen = ref(false)
  const activeIndex = ref(-1)

  function open() {
    if (isOpen.value) return
    isOpen.value = true
  }
  function close() {
    if (!isOpen.value) return
    isOpen.value = false
    activeIndex.value = -1
  }
  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  watch(
    () => opts.options.value.length,
    () => {
      activeIndex.value = -1
    },
  )

  return {
    isMulti,
    selectedValues,
    selectedOptions,
    isSelected,
    select,
    deselect,
    clear,
    isOpen,
    activeIndex,
    open,
    close,
    toggle,
  }
}
