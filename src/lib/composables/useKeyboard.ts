import type { Ref } from 'vue'
import type { NormalizedOption } from '../types'

interface UseKeyboardOptions<T> {
  isOpen: Ref<boolean>
  activeIndex: Ref<number>
  options: Ref<NormalizedOption<T>[]>
  open: () => void
  close: () => void
  selectActive: () => void
  deselectLast: () => void
  hasQuery: () => boolean
  taggable: Ref<boolean>
  createFromQuery: () => void
}

/**
 * Keyboard handler for the combobox. Centralised so the search input and the
 * trigger button share the same key map — typing "ArrowDown" feels the same
 * regardless of which element holds focus.
 */
export function useKeyboard<T>(opts: UseKeyboardOptions<T>) {
  function move(delta: number) {
    const visible = opts.options.value
    if (visible.length === 0) {
      opts.activeIndex.value = -1
      return
    }
    const enabledIndices = visible
      .map((o, i) => (o.disabled ? -1 : i))
      .filter((i) => i >= 0)
    if (enabledIndices.length === 0) return

    const current = opts.activeIndex.value
    const currentPos = enabledIndices.indexOf(current)
    let nextPos: number
    if (currentPos === -1) {
      nextPos = delta > 0 ? 0 : enabledIndices.length - 1
    } else {
      nextPos = (currentPos + delta + enabledIndices.length) % enabledIndices.length
    }
    const next = enabledIndices[nextPos]
    if (next !== undefined) opts.activeIndex.value = next
  }

  function onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!opts.isOpen.value) opts.open()
        else move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!opts.isOpen.value) opts.open()
        else move(-1)
        break
      case 'Home':
        if (opts.isOpen.value && opts.options.value.length) {
          event.preventDefault()
          opts.activeIndex.value = opts.options.value.findIndex((o) => !o.disabled)
        }
        break
      case 'End':
        if (opts.isOpen.value && opts.options.value.length) {
          event.preventDefault()
          for (let i = opts.options.value.length - 1; i >= 0; i -= 1) {
            if (!opts.options.value[i]!.disabled) {
              opts.activeIndex.value = i
              break
            }
          }
        }
        break
      case 'Enter':
        if (opts.isOpen.value && opts.activeIndex.value >= 0) {
          event.preventDefault()
          opts.selectActive()
        } else if (opts.isOpen.value && opts.taggable.value && opts.hasQuery()) {
          event.preventDefault()
          opts.createFromQuery()
        } else if (!opts.isOpen.value) {
          event.preventDefault()
          opts.open()
        }
        break
      case 'Escape':
        if (opts.isOpen.value) {
          event.preventDefault()
          opts.close()
        }
        break
      case 'Tab':
        // Allow tab to escape but commit any active highlight in tags mode.
        if (opts.isOpen.value) opts.close()
        break
      case 'Backspace':
        if (!opts.hasQuery()) opts.deselectLast()
        break
      default:
        break
    }
  }

  return { onKeydown }
}
