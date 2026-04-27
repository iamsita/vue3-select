# Types

All public types are exported from the package root.

```ts
import type {
  // Core option shape
  NormalizedOption,
  OptionLike,
  OptionAccessor,
  // Mode + visual
  SelectMode,
  SelectSize,
  SelectTheme,
  // Filter
  FilterFn,
  FilterContext,
  // Component prop / emits / instance contracts
  VSelectProps,
  VSelectEmits,
  VSelectInstance,
  // Slot prop shapes
  OptionSlotProps,
  TagSlotProps,
  ValueSlotProps,
  OptionGroupSlotProps,
  EmptySlotProps,
  CreateSlotProps,
  ClearIconSlotProps,
  DropdownIconSlotProps,
  LoaderSlotProps,
  // Tree variant
  NormalizedTreeNode,
  TreeOptionLike,
  TreeChildrenAccessor,
  TreeNodeCheckState,
  VTreeSelectProps,
  VTreeSelectInstance,
} from 'vue3-select'
```

## `NormalizedOption<T>`

```ts
interface NormalizedOption<T = unknown> {
  /** Stable, unique key — used by Vue's v-for and ARIA wiring. */
  id: string
  /** Value emitted via v-model. */
  value: unknown
  /** Display label. */
  label: string
  /** Optional group key. */
  group?: string
  /** Disabled options render but cannot be picked. */
  disabled?: boolean
  /** Original input as supplied by the caller. */
  raw: T
}
```

## `OptionLike`

```ts
type OptionLike = string | number | Record<string, any>
```

The widest type the component accepts as an option. Pinned to
`Record<string, any>` (rather than `unknown`) so plain interfaces without
an index signature still satisfy the constraint.

## `OptionAccessor<T, R>`

```ts
type OptionAccessor<T, R> = keyof T | ((option: T) => R)
```

Either a property name or an extractor function.

## `FilterFn<T>`

```ts
type FilterFn<T = unknown> = (ctx: FilterContext<T>) => boolean

interface FilterContext<T> {
  query: string
  option: NormalizedOption<T>
}
```

Custom filter — return `true` to keep the option in the menu.

## `NormalizedTreeNode<T>`

```ts
interface NormalizedTreeNode<T = unknown> {
  id: string
  value: unknown
  label: string
  depth: number
  parentId: string | null
  isLeaf: boolean
  disabled: boolean
  children: NormalizedTreeNode<T>[]
  raw: T
}
```

## `TreeNodeCheckState`

```ts
type TreeNodeCheckState = 'unchecked' | 'indeterminate' | 'checked'
```

What `getCheckState(node)` returns from `useTreeSelection`.
