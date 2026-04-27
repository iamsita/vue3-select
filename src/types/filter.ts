import type { NormalizedOption } from '@/types/option'

export interface FilterContext<T> {
  query: string
  option: NormalizedOption<T>
}

export type FilterFn<T = unknown> = (ctx: FilterContext<T>) => boolean
