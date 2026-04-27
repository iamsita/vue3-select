import type { NormalizedOption } from '@/types/option'

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

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
