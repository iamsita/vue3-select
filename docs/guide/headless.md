# Headless Composables

`<VSelect>` is a thin assembly of small composables. Each one is exported
publicly so you can build a totally custom UI on the same primitives.

## Available primitives

| Composable | Job |
|---|---|
| `useSelection` | The single / multi / tags state machine over an option list |
| `useTreeSelection` | Same idea, but for hierarchical data with tri-state parents |
| `useOptionFilter` | Filter the option list against a query (custom filter optional) |
| `useDebounced` | Debounce a `Ref` source with `flush` / `cancel` / `force` escape hatches |
| `useKeyboardNav` | Arrow / Home / End / Enter / Esc / Backspace key handling |
| `useFloatingMenu` | The `@floating-ui/vue` setup — middleware, teleport gating |
| `useOutsideClick` | Pointerdown outside a set of refs while active |
| `useControlFocus` | Track "focus is inside this subtree" with rAF-deferred blur |
| `useStableId` | Per-instance id for aria wiring |

## Pure helpers

| Helper | Job |
|---|---|
| `normalize(options, config)` | Coerce primitives / objects into `NormalizedOption[]` |
| `normalizeTree(roots, config)` | Same for trees, with depth + parent ids |
| `defaultFilter(query, option, caseSensitive?)` | The substring matcher used by default |
| `valuesEqual(a, b)` | Reference-or-primitive equality |
| `toggleValue(current, value)` | Add-or-remove from a value array |
| `walkTree`, `flattenTree`, `filterTree`, `getLeafValues`, `getAncestorIds` | Tree traversal helpers |
| `readAccessor(option, accessor, fallback)` | Resolve a `keyof T \| (o) => …` accessor |

## Building a custom select

A minimal command-palette-style picker that reuses the state machine and
keyboard handling but renders its own UI:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useSelection,
  useOptionFilter,
  useKeyboardNav,
  useDebounced,
  normalize,
} from 'vue3-select'

const props = defineProps<{ options: string[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: unknown): void }>()
const modelValue = defineModel<unknown>()

const query = ref('')
const { debounced: debouncedQuery } = useDebounced(query, 100)

const normalised = computed(() => normalize(props.options, {}))
const { filtered } = useOptionFilter({
  options: normalised,
  query: debouncedQuery,
})

const {
  selectedOptions,
  isSelected,
  select,
  isOpen,
  open,
  close,
  activeIndex,
} = useSelection({
  modelValue,
  options: normalised,
  mode: ref('single'),
  emitUpdate: (v) => (modelValue.value = v),
  emitSelect: () => {},
  emitDeselect: () => {},
})

function selectActive() {
  const opt = filtered.value[activeIndex.value]
  if (opt) select(opt)
  close()
}

const { onKeydown } = useKeyboardNav({
  isOpen,
  activeIndex,
  options: filtered,
  open,
  close,
  selectActive,
  deselectLast: () => {},
  hasQuery: () => query.value.length > 0,
  taggable: ref(false),
  createFromQuery: () => {},
})
</script>
```

You now have a fully-functional state machine — render the input, list,
and selected display with whatever markup your design system uses.

## Why this matters

Most "headless UI" libraries are an entire second component to learn. Here
the headless surface is the same code that powers the bundled SFC, so
upgrading from "I'll just use `<VSelect>`" to "I need full control over
markup" is a continuous slope, not a rewrite.
