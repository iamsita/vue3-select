import { getCurrentInstance } from 'vue'

let counter = 0

/**
 * Stable per-instance id used to wire ARIA attributes. Falls back to a
 * monotonic counter when called outside a component (tests).
 */
export function useId(prefix = 'vs'): string {
  const instance = getCurrentInstance()
  if (instance) return `${prefix}-${instance.uid}`
  counter += 1
  return `${prefix}-anon-${counter}`
}
