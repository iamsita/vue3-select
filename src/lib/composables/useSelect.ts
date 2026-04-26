import { computed, ref, watch, type Ref } from 'vue'
import type { NormalizedOption, SelectMode } from '../types'
import { toggleValue, valuesEqual } from '../utils'

interface UseSelectOptions<T> {
  modelValue: Ref<unknown>
  options: Ref<NormalizedOption<T>[]>
  mode: Ref<SelectMode>
  maxSelections?: Ref<number | undefined>
  emitUpdate: (value: unknown) => void
  emitSelect: (option: NormalizedOption<T>) => void
  emitDeselect: (option: NormalizedOption<T>) => void
}

/**
 * Core selection state machine. Translates between the v-model shape (one
 * value vs an array) and the internal "list of selected normalised options"
 * the UI renders. We resolve selections from the option list so that, for
 * object options, the selection rendering survives a refresh of the same
 * value supplied by reference.
 */
export function useSelect<T>(opts: UseSelectOptions<T>) {
  const isMulti = computed(() => opts.mode.value !== 'single')

  /** modelValue normalised to an array regardless of mode. */
  const selectedValues = computed<unknown[]>(() => {
    const value = opts.modelValue.value
    if (value == null || value === '') return []
    return Array.isArray(value) ? value : [value]
  })

  /**
   * Selected options resolved against the option list. We fall back to a
   * synthetic option when a value has no matching entry — common while async
   * options are still loading — so the UI stays consistent.
   */
  const selectedOptions = computed<NormalizedOption<T>[]>(() => {
    return selectedValues.value.map((v) => {
      const found = opts.options.value.find((o) => valuesEqual(o.value, v))
      if (found) return found
      const label = typeof v === 'object' && v !== null
        ? String((v as Record<string, unknown>).label ?? (v as Record<string, unknown>).name ?? '')
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
    const next = toggleValue(selectedValues.value, option.value)
    opts.emitUpdate(next)
    if (isSelected(option)) opts.emitDeselect(option)
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

  /** Open/close + active descendant tracking. */
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
    isOpen.value ? close() : open()
  }

  /** Reset cursor when the visible list changes underneath us. */
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
