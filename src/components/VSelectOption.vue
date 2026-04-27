<script setup lang="ts" generic="T = unknown">
import type { NormalizedOption } from '@/types/option'
import { CheckIcon } from '@/components/icons'

defineOptions({ name: 'VSelectOption', inheritAttrs: false })

defineProps<{
  option: NormalizedOption<T>
  selected: boolean
  active: boolean
  domId: string
}>()

const emit = defineEmits<{
  (e: 'pick', option: NormalizedOption<T>, event: MouseEvent): void
  (e: 'highlight', option: NormalizedOption<T>): void
}>()

function onMousedown(event: MouseEvent, option: NormalizedOption<T>) {
  event.preventDefault()
  if (option.disabled) return
  emit('pick', option, event)
}
</script>

<template>
  <div
    :id="domId"
    class="vselect-option"
    role="option"
    :class="{
      'is-active': active,
      'is-selected': selected,
      'is-disabled': option.disabled,
    }"
    :aria-selected="selected"
    :aria-disabled="option.disabled || undefined"
    @mousemove="emit('highlight', option)"
    @mousedown="onMousedown($event, option)"
  >
    <slot
      :option="option"
      :selected="selected"
      :active="active"
      :disabled="option.disabled || false"
    >
      <span class="vselect-option-label">{{ option.label }}</span>
      <span v-if="selected" class="vselect-option-check">
        <CheckIcon />
      </span>
    </slot>
  </div>
</template>
