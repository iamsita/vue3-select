import { computed, type ComputedRef, type Ref } from 'vue'
import type { FilterFn, NormalizedOption } from '../types'
import { defaultFilter } from '../utils'

interface UseFilterOptions<T> {
  options: Ref<NormalizedOption<T>[]>
  query: Ref<string>
  filter?: FilterFn<T>
  caseSensitive?: Ref<boolean>
}

/**
 * Filters the option list against the active search query. Returns the
 * filtered list and a "would create" flag so the menu can offer the user a
 * "Create '<query>'" row when nothing matches and `taggable` is on.
 */
export function useFilter<T>(opts: UseFilterOptions<T>): {
  filtered: ComputedRef<NormalizedOption<T>[]>
  hasMatches: ComputedRef<boolean>
} {
  const filtered = computed(() => {
    const query = opts.query.value.trim()
    if (!query) return opts.options.value
    const fn = opts.filter
    const cs = opts.caseSensitive?.value ?? false
    return opts.options.value.filter((option) =>
      fn ? fn({ query, option }) : defaultFilter(query, option, cs),
    )
  })

  const hasMatches = computed(() => filtered.value.length > 0)

  return { filtered, hasMatches }
}
