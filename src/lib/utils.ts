import type { NormalizedOption, OptionAccessor, OptionLike } from './types'

/**
 * Reads a property or computes a derived value. We accept a string key OR a
 * function so callers can stay terse for object options without losing access
 * to deep paths or computed labels.
 */
export function readAccessor<T, R>(
  option: T,
  accessor: OptionAccessor<T, R> | undefined,
  fallback: R,
): R {
  if (accessor === undefined) return fallback
  if (typeof accessor === 'function') return (accessor as (o: T) => R)(option)
  const value = (option as Record<string, unknown>)[accessor as string]
  return (value === undefined ? fallback : value) as R
}

/** Cheap, collision-free-enough id for one render pass. Not for persistence. */
let idCounter = 0
export function makeId(prefix = 'vs'): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function isPrimitive(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  )
}

/**
 * Normalises a heterogeneous option list. Primitives become `{ value, label }`
 * pairs; objects are passed through with the configured accessors. Group
 * keys are preserved so the menu renderer can collapse them into headings.
 */
export function normalize<T extends OptionLike>(
  options: readonly T[],
  config: {
    optionValue?: OptionAccessor<T, unknown>
    optionLabel?: OptionAccessor<T, string>
    optionGroup?: OptionAccessor<T, string | undefined>
    optionDisabled?: OptionAccessor<T, boolean>
  },
): NormalizedOption<T>[] {
  return options.map((option, index) => {
    if (isPrimitive(option)) {
      const str = String(option)
      return {
        id: `opt-${index}-${str}`,
        value: option,
        label: str,
        raw: option as T,
      }
    }
    const value = readAccessor(option, config.optionValue, (option as Record<string, unknown>).value)
    const label = readAccessor(
      option,
      config.optionLabel,
      String((option as Record<string, unknown>).label ?? value ?? ''),
    )
    const group = readAccessor(option, config.optionGroup, undefined)
    const disabled = readAccessor(option, config.optionDisabled, Boolean((option as Record<string, unknown>).disabled))
    return {
      id: `opt-${index}-${String(value)}`,
      value,
      label: String(label),
      group: group as string | undefined,
      disabled: Boolean(disabled),
      raw: option,
    }
  })
}

/** Compares two values for selection purposes. Object identity by reference. */
export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a === 'object' && typeof b === 'object') return false
  return false
}

/**
 * Toggles `value` inside `current` (multi-mode). Returns a new array — never
 * mutates input — so v-model emits trigger reactivity cleanly.
 */
export function toggleValue(current: unknown[], value: unknown): unknown[] {
  const exists = current.some((v) => valuesEqual(v, value))
  return exists ? current.filter((v) => !valuesEqual(v, value)) : [...current, value]
}

/** Escape a string so it can be embedded as a literal inside a regex. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Default fuzzy-ish substring match. We intentionally avoid a fuzzy ranking
 * library — the most common need is "does the label contain my query" and
 * shipping a 4kb fuzzy matcher by default would surprise consumers.
 */
export function defaultFilter<T>(
  query: string,
  option: NormalizedOption<T>,
  caseSensitive = false,
): boolean {
  if (!query) return true
  const haystack = caseSensitive ? option.label : option.label.toLowerCase()
  const needle = caseSensitive ? query : query.toLowerCase()
  return haystack.includes(needle)
}
