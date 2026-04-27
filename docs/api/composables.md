# Composables

Every state machine and DOM-plumbing primitive that powers the SFCs is
exported. See the [Headless guide](../guide/headless) for a worked example.

## `useSelection`

The single / multi / tags state machine over a normalised option list.

```ts
import { useSelection } from 'vue3-select'

const {
  isMulti,
  selectedValues,
  selectedOptions,
  isSelected,
  select,
  deselect,
  clear,
  isOpen,
  activeIndex,
  open,
  close,
  toggle,
} = useSelection({
  modelValue: ref<unknown>(null),
  options: computed(() => normalize(...)),
  mode: ref<'single' | 'multiple' | 'tags'>('single'),
  maxSelections: ref<number | undefined>(undefined),
  emitUpdate: (v) => { /* … */ },
  emitSelect: (option) => { /* … */ },
  emitDeselect: (option) => { /* … */ },
})
```

## `useTreeSelection`

Same idea, but for hierarchies. Only **leaves** are stored in v-model.

```ts
import { useTreeSelection } from 'vue3-select'

const { selectedValues, isLeafSelected, getCheckState, toggle, selectAll, clear } =
  useTreeSelection({
    modelValue: ref<unknown[]>([]),
    tree: computed(() => normalizeTree(...)),
    maxSelections: ref<number | undefined>(undefined),
    emitUpdate: (v) => { /* … */ },
    emitSelect: (node) => { /* … */ },
    emitDeselect: (node) => { /* … */ },
  })
```

`getCheckState(node)` returns `'checked'` / `'unchecked'` / `'indeterminate'`.

## `useOptionFilter`

```ts
import { useOptionFilter } from 'vue3-select'

const { filtered, hasMatches } = useOptionFilter({
  options,         // Ref<NormalizedOption<T>[]>
  query,           // Ref<string>
  filter,          // optional FilterFn<T>
  caseSensitive,   // optional Ref<boolean>
})
```

## `useDebounced`

```ts
import { useDebounced } from 'vue3-select'

const { debounced, flush, cancel, force } = useDebounced(source, 200)
// or with a reactive delay:
const { debounced } = useDebounced(source, ref(200))
```

`flush()` commits the pending value now, `cancel()` drops it, `force(v)`
overrides synchronously and cancels anything in-flight. The pending timer
auto-clears on scope dispose, so this is safe in `setup()` without
explicit cleanup.

## `useKeyboardNav`

```ts
import { useKeyboardNav } from 'vue3-select'

const { onKeydown } = useKeyboardNav({
  isOpen,
  activeIndex,
  options: filtered,
  open,
  close,
  selectActive,
  deselectLast,
  hasQuery: () => query.value.length > 0,
  taggable: ref(false),
  createFromQuery,
})
```

Bind `onKeydown` to a `<input>` / `<button>` `@keydown` and you get
↑ / ↓ / Home / End / Enter / Esc / Tab / Backspace handling.

## `useFloatingMenu`

```ts
import { useFloatingMenu } from 'vue3-select'

const { styles, target, floating, update } = useFloatingMenu(controlEl, menuEl, {
  teleportTo: ref<string | HTMLElement | false>('body'),
})
```

Wraps `@floating-ui/vue` with the same middleware stack `<VSelect>` uses
(offset / flip / shift / width-match). When `teleportTo === false`, `styles`
is `undefined` and `target` is `null` so the menu sits in document flow.

## `useOutsideClick`

```ts
import { useOutsideClick } from 'vue3-select'

useOutsideClick({
  active: isOpen,                    // Ref<boolean>
  contains: [rootEl, menuEl],        // Ref<HTMLElement | null>[]
  onOutside: () => (isOpen.value = false),
})
```

The `pointerdown` listener attaches only while `active` is `true` and
auto-detaches on scope dispose.

## `useControlFocus`

```ts
import { useControlFocus } from 'vue3-select'

const { focused, onFocusIn, onFocusOut } = useControlFocus({
  root: rootEl,
  onFocus: (e) => emit('focus', e),
  onBlur: (e) => emit('blur', e),
})
```

`focused` is `true` while focus is anywhere inside `root`. The composable
defers blur decisions to the next animation frame so focus moving between
internal children (input → tag remove → input) doesn't flicker `focused`.

## `useStableId`

```ts
import { useStableId } from 'vue3-select'

const id = useStableId('my-prefix') // 'my-prefix-42' (per-instance uid)
```

Used for ARIA wiring. Falls back to a monotonic counter outside a component
context (handy in tests).
