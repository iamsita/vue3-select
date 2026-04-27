<script setup lang="ts" generic="T extends OptionLike = OptionLike">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as floatingSize,
  useFloating,
} from '@floating-ui/vue'
import type { NormalizedOption, OptionLike } from '@/types/option'
import type {
  ClearIconSlotProps,
  CreateSlotProps,
  DropdownIconSlotProps,
  EmptySlotProps,
  LoaderSlotProps,
  OptionGroupSlotProps,
  OptionSlotProps,
  TagSlotProps,
  ValueSlotProps,
  VSelectInstance,
  VSelectProps,
} from '@/types'
import { normalize } from '@/core/normalize'
import { useOptionFilter } from '@/composables/useOptionFilter'
import { useStableId } from '@/composables/useStableId'
import { useKeyboardNav } from '@/composables/useKeyboardNav'
import { useSelection } from '@/composables/useSelection'
import { useDebounced } from '@/composables/useDebounced'
import { ChevronDownIcon, CloseIcon } from '@/components/icons'
import VSelectOption from '@/components/VSelectOption.vue'
import VSelectTag from '@/components/VSelectTag.vue'

defineOptions({ name: 'VSelect', inheritAttrs: false })

const props = withDefaults(defineProps<VSelectProps<T>>(), {
  modelValue: undefined,
  options: () => [] as T[],
  mode: 'single',
  optionValue: undefined,
  optionLabel: undefined,
  optionGroup: undefined,
  optionDisabled: undefined,
  placeholder: 'Select…',
  searchable: true,
  clearable: true,
  disabled: false,
  loading: false,
  closeOnSelect: undefined,
  autofocus: false,
  maxVisibleTags: undefined,
  maxSelections: undefined,
  taggable: false,
  filter: undefined,
  caseSensitive: false,
  debounce: undefined,
  emptyText: 'No options',
  noResultsText: undefined,
  loadingText: 'Loading…',
  size: 'md',
  theme: 'light',
  ariaLabel: undefined,
  teleportTo: false,
  name: undefined,
  required: false,
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'update:search', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'select', option: NormalizedOption<T>): void
  (e: 'deselect', option: NormalizedOption<T>): void
  (e: 'create', value: string): void
  (e: 'search', query: string): void
}>()

const fallbackId = useStableId('vselect')
const baseId = computed(() => props.id ?? fallbackId)
const listboxId = computed(() => `${baseId.value}-listbox`)
const searchId = computed(() => `${baseId.value}-search`)

const rootEl = ref<HTMLElement | null>(null)
const controlEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const searchEl = ref<HTMLInputElement | null>(null)

const query = ref('')
const debounceMs = computed(() => props.debounce)
const {
  debounced: effectiveQuery,
  flush: flushSearch,
  cancel: cancelSearch,
  force: forceSearch,
} = useDebounced(query, debounceMs)
void cancelSearch

const focused = ref(false)

const modelRef = computed(() => props.modelValue)
const modeRef = computed(() => props.mode)
const maxSelectionsRef = computed(() => props.maxSelections)

const normalizedOptions = computed<NormalizedOption<T>[]>(() =>
  normalize(props.options, {
    optionValue: props.optionValue,
    optionLabel: props.optionLabel,
    optionGroup: props.optionGroup,
    optionDisabled: props.optionDisabled,
  }),
)

const {
  isMulti,
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
} = useSelection<T>({
  modelValue: modelRef,
  options: normalizedOptions,
  mode: modeRef,
  maxSelections: maxSelectionsRef,
  emitUpdate: (v) => emit('update:modelValue', v),
  emitSelect: (o) => emit('select', o as NormalizedOption<T>),
  emitDeselect: (o) => emit('deselect', o as NormalizedOption<T>),
})

const { filtered } = useOptionFilter<T>({
  options: normalizedOptions,
  query: effectiveQuery,
  filter: props.filter,
  caseSensitive: computed(() => props.caseSensitive),
})

const closeOnSelectResolved = computed(() => props.closeOnSelect ?? props.mode === 'single')

const taggableRef = computed(() => props.taggable || props.mode === 'tags')

const showCreate = computed(() => {
  if (!taggableRef.value) return false
  const q = query.value.trim()
  if (!q) return false
  return !filtered.value.some((o) => o.label.toLowerCase() === q.toLowerCase())
})

function selectActive() {
  const idx = activeIndex.value
  const option = filtered.value[idx]
  if (!option) return
  select(option)
  if (closeOnSelectResolved.value) close()
  query.value = ''
  forceSearch('')
}

function createFromQuery() {
  const q = query.value.trim()
  if (!q) return
  emit('create', q)
  query.value = ''
  forceSearch('')
}

function deselectLast() {
  if (!isMulti.value) return
  const last = selectedOptions.value[selectedOptions.value.length - 1]
  if (last) deselect(last)
}

const { onKeydown } = useKeyboardNav<T>({
  isOpen,
  activeIndex,
  options: filtered,
  open,
  close,
  selectActive,
  deselectLast,
  hasQuery: () => query.value.length > 0,
  taggable: taggableRef,
  createFromQuery,
})

const useFloatingMenu = computed(() => props.teleportTo !== false)

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

watch(isOpen, (open) => {
  if (open) {
    emit('open')
    nextTick(() => {
      if (props.searchable && searchEl.value) searchEl.value.focus()
      if (activeIndex.value === -1 && filtered.value.length > 0) {
        activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
      }
      if (useFloatingMenu.value) updateFloating()
    })
  } else {
    emit('close')
  }
})

watch(effectiveQuery, (q) => {
  emit('update:search', q)
  emit('search', q)
  nextTick(() => {
    if (filtered.value.length === 0) activeIndex.value = -1
    else activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  })
})

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
  toggle()
}

function onSearchInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  if (!isOpen.value) open()
}

function onFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  requestAnimationFrame(() => {
    if (!rootEl.value?.contains(document.activeElement)) {
      focused.value = false
      emit('blur', event)
    }
  })
}

function onOptionPick(option: NormalizedOption<T>) {
  if (option.disabled) return
  select(option)
  if (closeOnSelectResolved.value) {
    close()
    if (props.searchable && searchEl.value) searchEl.value.blur()
  } else if (props.searchable && searchEl.value) {
    searchEl.value.focus()
  }
  query.value = ''
  forceSearch('')
}

function onClearClick(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  clear()
  query.value = ''
  forceSearch('')
  if (props.searchable && searchEl.value) searchEl.value.focus()
}

function onTagRemove(option: NormalizedOption<T>) {
  deselect(option)
}

interface RenderRow {
  type: 'group' | 'option'
  group?: string
  option?: NormalizedOption<T>
  index?: number
}

const renderRows = computed<RenderRow[]>(() => {
  const rows: RenderRow[] = []
  let lastGroup: string | undefined
  filtered.value.forEach((option, index) => {
    if (option.group && option.group !== lastGroup) {
      rows.push({ type: 'group', group: option.group })
      lastGroup = option.group
    } else if (!option.group) {
      lastGroup = undefined
    }
    rows.push({ type: 'option', option, index })
  })
  return rows
})

const visibleTags = computed(() => {
  if (props.maxVisibleTags === undefined) return selectedOptions.value
  return selectedOptions.value.slice(0, props.maxVisibleTags)
})

const overflowTagCount = computed(() => {
  if (props.maxVisibleTags === undefined) return 0
  return Math.max(selectedOptions.value.length - props.maxVisibleTags, 0)
})

const hasSelection = computed(() => selectedOptions.value.length > 0)

const emptyMode = computed<'no-options' | 'no-results'>(() =>
  query.value ? 'no-results' : 'no-options',
)

const emptyMessage = computed(() => {
  if (query.value) return props.noResultsText ?? props.emptyText
  return props.emptyText
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
    'is-multi': isMulti.value,
    'is-single': !isMulti.value,
    'is-searchable': props.searchable,
    'is-loading': props.loading,
    'has-value': hasSelection.value,
  },
])

const activeOptionId = computed(() => {
  const opt = filtered.value[activeIndex.value]
  return opt ? `${baseId.value}-opt-${opt.id}` : undefined
})

const teleportTarget = computed(() => {
  if (props.teleportTo === false || props.teleportTo === undefined) return null
  return props.teleportTo
})

defineExpose<VSelectInstance>({
  open,
  close,
  toggle,
  focus: () => searchEl.value?.focus() ?? controlEl.value?.focus(),
  blur: () => searchEl.value?.blur() ?? controlEl.value?.blur(),
  clear,
  flushSearch,
  get isOpen() {
    return isOpen.value
  },
})

const hiddenInputValues = computed<string[]>(() => {
  if (!props.name) return []
  return selectedOptions.value.map((o) => {
    const v = o.value
    if (v == null) return ''
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  })
})

watch(
  () => props.autofocus,
  (auto) => {
    if (auto) nextTick(() => searchEl.value?.focus() ?? controlEl.value?.focus())
  },
  { immediate: true },
)

defineSlots<{
  prefix?: () => unknown
  suffix?: () => unknown
  tag?: (props: TagSlotProps<T>) => unknown
  value?: (props: ValueSlotProps<T>) => unknown
  option?: (props: OptionSlotProps<T>) => unknown
  optiongroup?: (props: OptionGroupSlotProps) => unknown
  empty?: (props: EmptySlotProps) => unknown
  loader?: (props: LoaderSlotProps) => unknown
  dropdownicon?: (props: DropdownIconSlotProps) => unknown
  clearicon?: (props: ClearIconSlotProps) => unknown
  create?: (props: CreateSlotProps) => unknown
}>()
</script>

<template>
  <div
    ref="rootEl"
    :class="rootClass"
    :data-disabled="disabled || undefined"
    @focusin="onFocus($event as FocusEvent)"
    @focusout="onBlur($event as FocusEvent)"
  >
    <div
      ref="controlEl"
      class="vselect-control"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-haspopup="'listbox'"
      :aria-disabled="disabled || undefined"
      :aria-required="required || undefined"
      :aria-label="ariaLabel ?? placeholder"
      :aria-activedescendant="activeOptionId"
      :tabindex="searchable ? -1 : disabled ? -1 : 0"
      v-bind="$attrs"
      @mousedown="onControlMousedown"
      @keydown="!searchable && onKeydown($event)"
    >
      <slot name="prefix" />

      <div class="vselect-values">
        <slot
          v-if="$slots.value && hasSelection && !query"
          name="value"
          :selected="selectedOptions"
          :is-multi="isMulti"
        />

        <template v-else-if="isMulti">
          <template v-for="option in visibleTags" :key="option.id">
            <slot name="tag" :option="option" :remove="() => deselect(option)" :disabled="disabled">
              <VSelectTag :option="option" :disabled="disabled" @remove="onTagRemove" />
            </slot>
          </template>
          <span v-if="overflowTagCount > 0" class="vselect-tag vselect-tag--overflow">
            +{{ overflowTagCount }}
          </span>
        </template>

        <template v-else-if="hasSelection && !query">
          <span class="vselect-single">{{ selectedOptions[0]?.label }}</span>
        </template>

        <span v-if="!hasSelection && !query" class="vselect-placeholder">{{ placeholder }}</span>

        <input
          v-if="searchable"
          :id="searchId"
          ref="searchEl"
          class="vselect-search"
          :class="{ 'is-hidden': !isMulti && hasSelection && !isOpen }"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          :value="query"
          :disabled="disabled"
          :aria-controls="listboxId"
          :aria-autocomplete="'list'"
          :aria-activedescendant="activeOptionId"
          @input="onSearchInput"
          @keydown="onKeydown"
        />
      </div>

      <div class="vselect-indicators">
        <slot v-if="loading" name="loader" :in-menu="false">
          <span class="vselect-spinner" aria-hidden="true" />
        </slot>
        <slot v-else-if="clearable && hasSelection && !disabled" name="clearicon" :clear="clear">
          <button
            type="button"
            class="vselect-indicator"
            aria-label="Clear selection"
            tabindex="-1"
            @mousedown="onClearClick"
          >
            <CloseIcon />
          </button>
        </slot>
        <slot name="dropdownicon" :open="isOpen">
          <span class="vselect-indicator" aria-hidden="true">
            <ChevronDownIcon class="vselect-chevron" />
          </span>
        </slot>
      </div>

      <slot name="suffix" />

      <template v-if="name">
        <input
          v-for="(val, i) in hiddenInputValues"
          :key="i"
          class="vselect-hidden-input"
          type="hidden"
          :name="isMulti ? `${name}[]` : name"
          :value="val"
        />
        <input
          v-if="hiddenInputValues.length === 0"
          class="vselect-hidden-input"
          type="hidden"
          :name="name"
          :required="required"
          value=""
        />
      </template>
    </div>

    <component
      :is="teleportTarget ? 'Teleport' : 'div'"
      v-if="isOpen"
      :to="teleportTarget || undefined"
    >
      <div
        v-show="isOpen"
        :id="listboxId"
        ref="menuEl"
        class="vselect-menu"
        role="listbox"
        :aria-multiselectable="isMulti"
        :class="[
          `vselect--${size}`,
          theme === 'dark' && 'vselect--dark',
          theme === 'auto' && 'vselect--auto',
        ]"
        :style="useFloatingMenu ? floatingStyles : undefined"
      >
        <slot v-if="loading" name="loader" :in-menu="true">
          <div class="vselect-loading">
            <span class="vselect-spinner" />
            <span>{{ loadingText }}</span>
          </div>
        </slot>

        <template v-else-if="renderRows.length === 0">
          <slot name="empty" :query="query" :mode="emptyMode">
            <div class="vselect-empty">{{ emptyMessage }}</div>
          </slot>
        </template>

        <template v-else>
          <template v-for="(row, i) in renderRows" :key="i">
            <div v-if="row.type === 'group'" class="vselect-group" role="presentation">
              <slot name="optiongroup" :group="row.group!">
                {{ row.group }}
              </slot>
            </div>
            <VSelectOption
              v-else
              :option="row.option!"
              :selected="isSelected(row.option!)"
              :active="activeIndex === row.index"
              :dom-id="`${baseId}-opt-${row.option!.id}`"
              @highlight="activeIndex = row.index!"
              @pick="onOptionPick"
            >
              <template v-if="$slots.option" #default="slotProps">
                <slot name="option" v-bind="slotProps" />
              </template>
            </VSelectOption>
          </template>
        </template>

        <slot v-if="showCreate" name="create" :query="query" :create="createFromQuery">
          <div class="vselect-create" role="option" @mousedown.prevent="createFromQuery">
            Create <strong>{{ query }}</strong>
          </div>
        </slot>
      </div>
    </component>
  </div>
</template>

<style lang="scss">
@use '../styles/index.scss';
</style>
