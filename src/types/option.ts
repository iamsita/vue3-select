/**
 * Internal shape every option is normalised into. Consumers may pass
 * primitives (string/number) or arbitrary objects — the component reads
 * identity via `optionValue` and label via `optionLabel`, then keeps a
 * reference to the original raw option on `raw`.
 */
export interface NormalizedOption<T = unknown> {
  /** Stable, unique key used by Vue's v-for and aria. */
  id: string
  /** The value emitted via v-model. */
  value: unknown
  /** Display label. */
  label: string
  /** Optional group key — options sharing a key render under the same heading. */
  group?: string
  /** Disabled options are visible but not selectable. */
  disabled?: boolean
  /** The original option as supplied by the caller. */
  raw: T
}

/**
 * The widest type we accept as an option. We pin it to `Record<string, any>`
 * (rather than `Record<string, unknown>`) so plain interfaces — which lack an
 * index signature — still satisfy the constraint.
 */
export type OptionLike = string | number | Record<string, any>

/** Resolves either a property name on the option or an extractor function. */
export type OptionAccessor<T, R> = keyof T | ((option: T) => R)

export type SelectMode = 'single' | 'multiple' | 'tags'

export type SelectSize = 'sm' | 'md' | 'lg'

export type SelectTheme = 'light' | 'dark' | 'auto'
