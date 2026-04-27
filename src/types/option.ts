export interface NormalizedOption<T = unknown> {
  id: string
  value: unknown
  label: string
  group?: string
  disabled?: boolean
  raw: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionLike = string | number | Record<string, any>

export type OptionAccessor<T, R> = keyof T | ((option: T) => R)

export type SelectMode = 'single' | 'multiple' | 'tags'

export type SelectSize = 'sm' | 'md' | 'lg'

export type SelectTheme = 'light' | 'dark' | 'auto'
