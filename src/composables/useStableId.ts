import { getCurrentInstance } from 'vue'

let counter = 0

export function useStableId(prefix = 'vs'): string {
  const instance = getCurrentInstance()
  if (instance) return `${prefix}-${instance.uid}`
  counter += 1
  return `${prefix}-anon-${counter}`
}
