export function valuesEqual(a: unknown, b: unknown): boolean {
  return a === b
}

export function toggleValue(current: unknown[], value: unknown): unknown[] {
  const index = current.indexOf(value)
  if (index === -1) return [...current, value]
  const next = current.slice()
  next.splice(index, 1)
  return next
}
