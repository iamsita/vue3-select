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
