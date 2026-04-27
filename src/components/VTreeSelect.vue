<script setup lang="ts" generic="T extends TreeOptionLike = TreeOptionLike">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as floatingSize,
  useFloating,
} from '@floating-ui/vue'
import type { OptionAccessor } from '../types/option'
import type {
  NormalizedTreeNode,
  TreeNodeCheckState,
  TreeOptionLike,
  VTreeSelectInstance,
  VTreeSelectProps,
} from '../types/tree'
import { normalizeTree, filterTree, walkTree, flattenTree } from '../core/tree'
import { useStableId } from '../composables/useStableId'
import { useTreeSelection } from '../composables/useTreeSelection'
import { useDebounced } from '../composables/useDebounced'
import { ChevronDownIcon, CloseIcon } from './icons'
import VTreeSelectNode from './VTreeSelectNode.vue'

defineOptions({ name: 'VTreeSelect', inheritAttrs: false })

const props = withDefaults(defineProps<VTreeSelectProps<T>>(), {
  modelValue: () => [],
  options: () => [] as T[],
  optionValue: undefined,
  optionLabel: undefined,
  optionChildren: undefined,
  optionDisabled: undefined,
  placeholder: 'Select…',
  searchable: true,
  clearable: true,
  disabled: false,
  maxSelections: undefined,
  maxVisibleTags: undefined,
  defaultExpandAll: false,
  showToolbar: true,
  closeOnSelect: false,
  debounce: undefined,
  emptyText: 'No options',
  noResultsText: undefined,
  size: 'md',
  theme: 'light',
  ariaLabel: undefined,
  teleportTo: false,
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown[]): void
  (e: 'update:search', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'select', node: NormalizedTreeNode<T>): void
  (e: 'deselect', node: NormalizedTreeNode<T>): void
  (e: 'expand', node: NormalizedTreeNode<T>): void
  (e: 'collapse', node: NormalizedTreeNode<T>): void
  (e: 'search', query: string): void
}>()

const fallbackId = useStableId('vtreeselect')
const baseId = computed(() => props.id ?? fallbackId)
const treeId = computed(() => `${baseId.value}-tree`)

const rootEl = ref<HTMLElement | null>(null)
const controlEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const searchEl = ref<HTMLInputElement | null>(null)

const isOpen = ref(false)
const focused = ref(false)

const query = ref('')
const debounceMs = computed(() => props.debounce)
const {
  debounced: effectiveQuery,
  flush: flushSearch,
  force: forceSearch,
} = useDebounced(query, debounceMs)

const expanded = reactive(new Set<string>())

const tree = computed<NormalizedTreeNode<T>[]>(() =>
  normalizeTree(props.options, {
    optionValue: props.optionValue as OptionAccessor<T, unknown> | undefined,
    optionLabel: props.optionLabel as OptionAccessor<T, string> | undefined,
    optionChildren: props.optionChildren as OptionAccessor<T, T[] | undefined> | undefined,
    optionDisabled: props.optionDisabled as OptionAccessor<T, boolean> | undefined,
  }),
)

watch(
  tree,
  (next) => {
    expanded.clear()
    if (props.defaultExpandAll) {
      walkTree(next, (n) => {
        if (!n.isLeaf) expanded.add(n.id)
      })
    }
  },
  { immediate: true },
)

const filteredTree = computed(() => {
  if (!effectiveQuery.value) return tree.value
  return filterTree(tree.value, effectiveQuery.value)
})

watch(filteredTree, (next, prev) => {
  if (!effectiveQuery.value) return
  if (next === prev) return
  walkTree(next, (n) => {
    if (!n.isLeaf) expanded.add(n.id)
  })
})

watch(effectiveQuery, (q) => {
  emit('search', q)
  emit('update:search', q)
})

const modelRef = computed(() => props.modelValue)
const maxSelectionsRef = computed(() => props.maxSelections)

const { selectedValues, isLeafSelected, getCheckState, toggle, selectAll, clear } =
  useTreeSelection<T>({
    modelValue: modelRef,
    tree,
    maxSelections: maxSelectionsRef,
    emitUpdate: (v) => emit('update:modelValue', v),
    emitSelect: (n) => emit('select', n),
    emitDeselect: (n) => emit('deselect', n),
  })

const leafByValue = computed(() => {
  const map = new Map<unknown, NormalizedTreeNode<T>>()
  walkTree(tree.value, (n) => {
    if (n.isLeaf) map.set(n.value, n)
  })
  return map
})

const selectedLeaves = computed(() =>
  selectedValues.value
    .map((v) => leafByValue.value.get(v))
    .filter((n): n is NormalizedTreeNode<T> => n !== undefined),
)

const visibleTags = computed(() => {
  if (props.maxVisibleTags === undefined) return selectedLeaves.value
  return selectedLeaves.value.slice(0, props.maxVisibleTags)
})

const overflowTagCount = computed(() => {
  if (props.maxVisibleTags === undefined) return 0
  return Math.max(selectedLeaves.value.length - props.maxVisibleTags, 0)
})

const hasSelection = computed(() => selectedValues.value.length > 0)

const flattened = computed(() => flattenTree(filteredTree.value))
const isEmpty = computed(() => flattened.value.length === 0)

const emptyMessage = computed(() => {
  if (query.value) return props.noResultsText ?? props.emptyText
  return props.emptyText
})

function open() {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  emit('open')
  nextTick(() => {
    if (props.searchable && searchEl.value) searchEl.value.focus()
    updateFloating()
  })
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
}

function toggleOpen() {
  if (isOpen.value) close()
  else open()
}

function onToggle(node: NormalizedTreeNode<T>) {
  toggle(node)
  if (props.closeOnSelect) close()
}

function onExpand(node: NormalizedTreeNode<T>) {
  expanded.add(node.id)
  emit('expand', node)
}

function onCollapse(node: NormalizedTreeNode<T>) {
  expanded.delete(node.id)
  emit('collapse', node)
}

function onSearchInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  if (!isOpen.value) open()
}

function onClearClick(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  clear()
  query.value = ''
  forceSearch('')
}

function onTagRemove(node: NormalizedTreeNode<T>) {
  toggle(node)
}

function onControlMousedown(event: MouseEvent) {
  if (props.disabled) return
  const target = event.target as HTMLElement
  if (target.closest('.vselect-tag-remove, .vselect-indicator')) return
  if (target.tagName === 'INPUT') {
    if (!isOpen.value) open()
    return
  }
  event.preventDefault()
  if (props.searchable && searchEl.value) searchEl.value.focus()
  toggleOpen()
}

const { floatingStyles, update: updateFloating } = useFloating(controlEl, menuEl, {
  placement: 'bottom-start',
  middleware: [
    offset(6),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
    floatingSize({
      apply({ rects, elements }) {
        Object.assign(elements.floating.style, {
          minWidth: `${rects.reference.width}px`,
        })
      },
    }),
  ],
  whileElementsMounted: (...args) => autoUpdate(...args, { animationFrame: false }),
})

const useFloatingMenu = computed(() => props.teleportTo !== false)

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) return
  const target = event.target as Node
  if (rootEl.value?.contains(target)) return
  if (menuEl.value?.contains(target)) return
  close()
}

watch(isOpen, (open) => {
  if (open) document.addEventListener('pointerdown', onDocumentPointerDown, true)
  else document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})

function onFocus() {
  focused.value = true
}

function onBlur() {
  requestAnimationFrame(() => {
    if (!rootEl.value?.contains(document.activeElement)) focused.value = false
  })
}

const teleportTarget = computed(() => {
  if (props.teleportTo === false || props.teleportTo === undefined) return null
  return props.teleportTo
})

const rootClass = computed(() => [
  'vselect',
  `vselect--${props.size}`,
  props.theme === 'dark' && 'vselect--dark',
  props.theme === 'auto' && 'vselect--auto',
  {
    'is-open': isOpen.value,
    'is-focused': focused.value,
    'is-disabled': props.disabled,
    'is-multi': true,
    'is-searchable': props.searchable,
    'has-value': hasSelection.value,
  },
])

defineExpose<VTreeSelectInstance>({
  open,
  close,
  toggle: toggleOpen,
  focus: () => (searchEl.value ?? controlEl.value)?.focus(),
  blur: () => (searchEl.value ?? controlEl.value)?.blur(),
  clear,
  selectAll,
  expand: (id: string) => {
    expanded.add(id)
  },
  collapse: (id: string) => {
    expanded.delete(id)
  },
  flushSearch,
  get isOpen() {
    return isOpen.value
  },
})

void isLeafSelected
void getCheckState as unknown as (n: NormalizedTreeNode<T>) => TreeNodeCheckState
</script>

<template>
  <div
    ref="rootEl"
    :class="rootClass"
    :data-disabled="disabled || undefined"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <div
      ref="controlEl"
      class="vselect-control"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="treeId"
      :aria-haspopup="'tree'"
      :aria-disabled="disabled || undefined"
      :aria-label="ariaLabel ?? placeholder"
      :tabindex="searchable ? -1 : disabled ? -1 : 0"
      v-bind="$attrs"
      @mousedown="onControlMousedown"
    >
      <div class="vselect-values">
        <template v-if="hasSelection && !query">
          <span v-for="node in visibleTags" :key="node.id" class="vselect-tag">
            <span class="vselect-tag-label">{{ node.label }}</span>
            <button
              v-if="!disabled"
              type="button"
              class="vselect-tag-remove"
              :aria-label="`Remove ${node.label}`"
              tabindex="-1"
              @mousedown.prevent.stop="onTagRemove(node)"
            >
              <CloseIcon />
            </button>
          </span>
          <span v-if="overflowTagCount > 0" class="vselect-tag vselect-tag--overflow">
            +{{ overflowTagCount }}
          </span>
        </template>

        <span v-if="!hasSelection && !query" class="vselect-placeholder">{{ placeholder }}</span>

        <input
          v-if="searchable"
          ref="searchEl"
          class="vselect-search"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          :value="query"
          :disabled="disabled"
          :aria-controls="treeId"
          :aria-autocomplete="'list'"
          @input="onSearchInput"
        />
      </div>

      <div class="vselect-indicators">
        <button
          v-if="clearable && hasSelection && !disabled"
          type="button"
          class="vselect-indicator"
          aria-label="Clear selection"
          tabindex="-1"
          @mousedown="onClearClick"
        >
          <CloseIcon />
        </button>
        <span class="vselect-indicator" aria-hidden="true">
          <ChevronDownIcon class="vselect-chevron" />
        </span>
      </div>
    </div>

    <component
      :is="teleportTarget ? 'Teleport' : 'div'"
      v-if="isOpen"
      :to="teleportTarget || undefined"
    >
      <div
        v-show="isOpen"
        :id="treeId"
        ref="menuEl"
        class="vselect-menu vselect-tree"
        role="tree"
        :aria-multiselectable="true"
        :class="[
          `vselect--${size}`,
          theme === 'dark' && 'vselect--dark',
          theme === 'auto' && 'vselect--auto',
        ]"
        :style="useFloatingMenu ? floatingStyles : undefined"
      >
        <div v-if="showToolbar && !isEmpty" class="vselect-tree-toolbar">
          <span>{{ selectedValues.length }} selected</span>
          <span>
            <button
              type="button"
              class="vselect-tree-toolbar-action"
              tabindex="-1"
              @mousedown.prevent="selectAll"
            >
              Select all
            </button>
            <button
              v-if="hasSelection"
              type="button"
              class="vselect-tree-toolbar-action"
              tabindex="-1"
              @mousedown.prevent="clear"
            >
              Clear
            </button>
          </span>
        </div>

        <template v-if="isEmpty">
          <div class="vselect-tree-empty">{{ emptyMessage }}</div>
        </template>

        <template v-else>
          <VTreeSelectNode
            v-for="node in filteredTree"
            :key="node.id"
            :node="node"
            :expanded="expanded"
            :get-check-state="getCheckState"
            :id-prefix="baseId"
            @toggle="onToggle"
            @expand="onExpand"
            @collapse="onCollapse"
          />
        </template>
      </div>
    </component>
  </div>
</template>

<style lang="scss">
@use '../styles/index.scss';
</style>
