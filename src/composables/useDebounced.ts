import { onScopeDispose, ref, watch, type Ref } from 'vue'

export interface UseDebouncedReturn<T> {
  debounced: Ref<T>
  flush: () => void
  cancel: () => void

  force: (value: T) => void
}

export function useDebounced<T>(
  source: Ref<T>,
  delay: Ref<number | undefined> | number | undefined,
): UseDebouncedReturn<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: T = source.value
  let hasPending = false

  const getDelay = () => {
    const raw = typeof delay === 'object' && delay !== null ? delay.value : delay
    return typeof raw === 'number' && raw > 0 ? raw : 0
  }

  function cancel() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    hasPending = false
  }

  function flush() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (hasPending) {
      debounced.value = pending
      hasPending = false
    }
  }

  watch(source, (next) => {
    const ms = getDelay()
    if (ms === 0) {
      cancel()
      debounced.value = next
      return
    }
    pending = next
    hasPending = true
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = pending
      timer = undefined
      hasPending = false
    }, ms)
  })

  if (typeof delay === 'object' && delay !== null) {
    watch(delay, (ms) => {
      if (!ms || ms <= 0) flush()
    })
  }

  function force(value: T) {
    cancel()
    debounced.value = value
  }

  onScopeDispose(cancel)

  return { debounced, flush, cancel, force }
}
