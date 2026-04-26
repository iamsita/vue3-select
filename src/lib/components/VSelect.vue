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
import type {
  NormalizedOption,
  OptionLike,
  OptionSlotProps,
  SelectionSlotProps,
  VSelectComponentProps,
  VSelectInstance,
} from '../types'
import { normalize } from '../utils'
import { useFilter } from '../composables/useFilter'
import { useId } from '../composables/useId'
import { useKeyboard } from '../composables/useKeyboard'
import { useSelect } from '../composables/useSelect'
import { ChevronDownIcon, CheckIcon, CloseIcon } from './VSelectIcons'

defineOptions({ name: 'VSelect', inheritAttrs: false })

const props = withDefaults(defineProps<VSelectComponentProps<T>>(), {
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
  caseSensitive: false,
  noOptionsText: 'No options',
  noResultsText: 'No results',
  loadingText: 'Loading…',
  size: 'md',
  ariaLabel: undefined,
  teleportTo: false,
  name: undefined,
  required: false,
  id: undefined,
  theme: 'light',
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

const baseId = computed(() => props.id ?? useId('vs'))
const listboxId = computed(() => `${baseId.value}-listbox`)
const searchId = computed(() => `${baseId.value}-search`)

const rootEl = ref<HTMLElement | null>(null)
const controlEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const searchEl = ref<HTMLInputElement | null>(null)

const query = ref('')
const focused = ref(false)

const modelRef = computed(() => props.modelValue)
const modeRef = computed(() => props.mode)
const maxSelectionsRef = computed(() => props.maxSelections)

// Normalised option list — recomputed only when inputs change.
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
} = useSelect<T>({
  modelValue: modelRef,
  options: normalizedOptions,
  mode: modeRef,
  maxSelections: maxSelectionsRef,
  emitUpdate: (v) => emit('update:modelValue', v),
  emitSelect: (o) => emit('select', o as NormalizedOption<T>),
  emitDeselect: (o) => emit('deselect', o as NormalizedOption<T>),
})

const { filtered } = useFilter<T>({
  options: normalizedOptions,
  query,
  caseSensitive: computed(() => props.caseSensitive),
})

const closeOnSelectResolved = computed(() =>
  props.closeOnSelect ?? props.mode === 'single',
)

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
  emit('update:search', '')
}

function createFromQuery() {
  const q = query.value.trim()
  if (!q) return
  emit('create', q)
  query.value = ''
  emit('update:search', '')
}

function deselectLast() {
  if (!isMulti.value) return
  const last = selectedOptions.value[selectedOptions.value.length - 1]
  if (last) deselect(last)
}

const { onKeydown } = useKeyboard<T>({
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

// Floating UI — only initialised when teleporting since otherwise the menu is
// a sibling of the control and CSS flow handles layout.
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
      // Pre-select first non-disabled option for keyboard users.
      if (activeIndex.value === -1 && filtered.value.length > 0) {
        const firstEnabled = filtered.value.findIndex((o) => !o.disabled)
        activeIndex.value = firstEnabled
      }
      if (useFloatingMenu.value) updateFloating()
    })
  } else {
    emit('close')
  }
})

watch(query, (q) => {
  emit('update:search', q)
  emit('search', q)
  // When the user types, reset highlight to the first match. This keeps
  // Enter responsive — otherwise the cursor lingers on a now-hidden index.
  nextTick(() => {
    if (filtered.value.length === 0) activeIndex.value = -1
    else activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  })
})

// Click outside — closes the menu unless the click is on the control itself.
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
  // Don't steal focus from clear / remove buttons.
  const target = event.target as HTMLElement
  if (target.closest('.vs-tag__remove, .vs-indicator')) return
  // The search input handles its own focus; if it exists we let the click
  // pass through so the caret lands at the click position.
  if (target.tagName === 'INPUT') return
  event.preventDefault()
  if (props.searchable && searchEl.value) {
    searchEl.value.focus()
  }
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
  // Defer the actual blur so clicking inside the menu (which steals focus)
  // doesn't immediately collapse the dropdown.
  requestAnimationFrame(() => {
    if (!rootEl.value?.contains(document.activeElement)) {
      focused.value = false
      emit('blur', event)
    }
  })
}

function onOptionMousedown(event: MouseEvent, option: NormalizedOption<T>) {
  // Mousedown rather than click — fires before blur, keeping focus inside.
  event.preventDefault()
  if (option.disabled) return
  select(option)
  if (closeOnSelectResolved.value) {
    close()
    if (props.searchable && searchEl.value) searchEl.value.blur()
  } else if (props.searchable && searchEl.value) {
    searchEl.value.focus()
  }
  query.value = ''
}

function onClearClick(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  clear()
  query.value = ''
  if (props.searchable && searchEl.value) searchEl.value.focus()
}

function onTagRemove(option: NormalizedOption<T>, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  deselect(option)
}

// Group options by their `group` key while preserving original order.
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

const showSearchInput = computed(() => props.searchable)

const rootClass = computed(() => [
  'vs',
  `vs--size-${props.size}`,
  `vs--theme-${props.theme}`,
  {
    'vs--open': isOpen.value,
    'vs--focused': focused.value,
    'vs--disabled': props.disabled,
    'vs--multi': isMulti.value,
    'vs--single': !isMulti.value,
    'vs--searchable': props.searchable,
    'vs--loading': props.loading,
    'vs--has-value': hasSelection.value,
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
  get isOpen() {
    return isOpen.value
  },
})

// Native form integration: hidden input(s) carry the value into FormData so
// the consumer can drop the component into a plain <form> without writing
// extra wiring.
const hiddenInputValues = computed<string[]>(() => {
  if (!props.name) return []
  return selectedOptions.value.map((o) => {
    const v = o.value
    if (v == null) return ''
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  })
})

// Autofocus is honoured at mount; we use a watcher to handle prop change too.
watch(
  () => props.autofocus,
  (auto) => {
    if (auto) nextTick(() => searchEl.value?.focus() ?? controlEl.value?.focus())
  },
  { immediate: true },
)

// Slot prop bag — exposed via type for IDE autocomplete on consumer side.
defineSlots<{
  prepend?: () => unknown
  append?: () => unknown
  selection?: (props: SelectionSlotProps<T>) => unknown
  'selection-text'?: (props: { selected: NormalizedOption<T>[] }) => unknown
  option?: (props: OptionSlotProps<T>) => unknown
  'group-label'?: (props: { group: string }) => unknown
  'no-options'?: (props: { query: string }) => unknown
  'no-results'?: (props: { query: string }) => unknown
  loading?: () => unknown
  indicator?: (props: { open: boolean }) => unknown
  clear?: (props: { clear: () => void }) => unknown
  create?: (props: { query: string; create: () => void }) => unknown
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
      class="vs-control"
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
      <slot name="prepend" />

      <div class="vs-control__values">
        <!-- Multi / tags rendering -->
        <template v-if="isMulti">
          <template v-for="option in visibleTags" :key="option.id">
            <slot
              name="selection"
              :option="option"
              :remove="() => deselect(option)"
              :disabled="disabled"
            >
              <span class="vs-tag" :data-value="String(option.value)">
                <span class="vs-tag__label">{{ option.label }}</span>
                <button
                  v-if="!disabled"
                  type="button"
                  class="vs-tag__remove"
                  :aria-label="`Remove ${option.label}`"
                  tabindex="-1"
                  @mousedown="onTagRemove(option, $event)"
                >
                  <CloseIcon />
                </button>
              </span>
            </slot>
          </template>
          <span v-if="overflowTagCount > 0" class="vs-tag vs-tag--overflow">
            +{{ overflowTagCount }}
          </span>
        </template>

        <!-- Single rendering: show the selected label only when the user isn't typing. -->
        <template v-else-if="hasSelection && !query">
          <slot
            name="selection-text"
            :selected="selectedOptions"
          >
            <span class="vs-control__single">{{ selectedOptions[0]?.label }}</span>
          </slot>
        </template>

        <!-- Placeholder shows when no selection and no active query. -->
        <span
          v-if="!hasSelection && !query"
          class="vs-control__placeholder"
        >{{ placeholder }}</span>

        <input
          v-if="showSearchInput"
          :id="searchId"
          ref="searchEl"
          class="vs-search"
          :class="{ 'vs-search--hidden': !isMulti && hasSelection && !isOpen }"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          :value="query"
          :placeholder="hasSelection ? '' : ''"
          :disabled="disabled"
          :aria-controls="listboxId"
          :aria-autocomplete="'list'"
          :aria-activedescendant="activeOptionId"
          @input="onSearchInput"
          @keydown="onKeydown"
        />
      </div>

      <div class="vs-control__indicators">
        <slot v-if="loading" name="loading">
          <span class="vs-spinner" aria-hidden="true" />
        </slot>
        <slot v-else-if="clearable && hasSelection && !disabled" name="clear" :clear="clear">
          <button
            type="button"
            class="vs-indicator"
            aria-label="Clear selection"
            tabindex="-1"
            @mousedown="onClearClick"
          >
            <CloseIcon />
          </button>
        </slot>
        <slot name="indicator" :open="isOpen">
          <span class="vs-indicator vs-indicator--chevron" aria-hidden="true">
            <ChevronDownIcon class="vs-indicator__chevron" />
          </span>
        </slot>
      </div>

      <slot name="append" />

      <!-- Hidden inputs for native form submission. -->
      <template v-if="name">
        <input
          v-for="(val, i) in hiddenInputValues"
          :key="i"
          class="vs-hidden-input"
          type="hidden"
          :name="isMulti ? `${name}[]` : name"
          :value="val"
        />
        <input
          v-if="hiddenInputValues.length === 0"
          class="vs-hidden-input"
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
      :style="!teleportTarget ? '' : ''"
    >
      <div
        v-show="isOpen"
        :id="listboxId"
        ref="menuEl"
        class="vs-menu"
        role="listbox"
        :aria-multiselectable="isMulti"
        :class="[`vs--size-${size}`, `vs--theme-${theme}`]"
        :style="useFloatingMenu ? floatingStyles : undefined"
      >
        <slot v-if="loading" name="loading">
          <div class="vs-menu__loading">
            <span class="vs-spinner" />
            <span>{{ loadingText }}</span>
          </div>
        </slot>
        <template v-else-if="renderRows.length === 0">
          <slot
            v-if="query"
            name="no-results"
            :query="query"
          >
            <div class="vs-menu__empty">{{ noResultsText }}</div>
          </slot>
          <slot
            v-else
            name="no-options"
            :query="query"
          >
            <div class="vs-menu__empty">{{ noOptionsText }}</div>
          </slot>
        </template>

        <template v-else>
          <template v-for="(row, i) in renderRows" :key="i">
            <div
              v-if="row.type === 'group'"
              class="vs-group"
              role="presentation"
            >
              <slot name="group-label" :group="row.group!">
                {{ row.group }}
              </slot>
            </div>
            <div
              v-else
              :id="`${baseId}-opt-${row.option!.id}`"
              class="vs-option"
              role="option"
              :class="{
                'is-active': activeIndex === row.index,
                'is-selected': isSelected(row.option!),
                'is-disabled': row.option!.disabled,
              }"
              :aria-selected="isSelected(row.option!)"
              :aria-disabled="row.option!.disabled || undefined"
              @mousemove="activeIndex = row.index!"
              @mousedown="onOptionMousedown($event, row.option!)"
            >
              <slot
                name="option"
                :option="row.option!"
                :selected="isSelected(row.option!)"
                :active="activeIndex === row.index"
                :disabled="row.option!.disabled || false"
              >
                <span class="vs-option__label">{{ row.option!.label }}</span>
                <span v-if="isSelected(row.option!)" class="vs-option__check">
                  <CheckIcon />
                </span>
              </slot>
            </div>
          </template>
        </template>

        <slot
          v-if="showCreate"
          name="create"
          :query="query"
          :create="createFromQuery"
        >
          <div
            class="vs-menu__create"
            role="option"
            @mousedown.prevent="createFromQuery"
          >
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
