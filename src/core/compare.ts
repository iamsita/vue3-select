export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a === 'object' && typeof b === 'object') return false
  return false
}

export function toggleValue(current: unknown[], value: unknown): unknown[] {
  const exists = current.some((v) => valuesEqual(v, value))
  return exists ? current.filter((v) => !valuesEqual(v, value)) : [...current, value]
}
