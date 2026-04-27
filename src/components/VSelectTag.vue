<script setup lang="ts" generic="T = unknown">
import type { NormalizedOption } from '@/types/option'
import { CloseIcon } from '@/components/icons'

defineOptions({ name: 'VSelectTag', inheritAttrs: false })

const props = defineProps<{
  option: NormalizedOption<T>
  disabled?: boolean
  removeLabel?: string
}>()

const emit = defineEmits<{
  (e: 'remove', option: NormalizedOption<T>, event: MouseEvent): void
}>()

function onRemove(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('remove', props.option, event)
}
</script>

<template>
  <span class="vselect-tag" :data-value="String(option.value)">
    <span class="vselect-tag-label">{{ option.label }}</span>
    <button
      v-if="!disabled"
      type="button"
      class="vselect-tag-remove"
      :aria-label="removeLabel ?? `Remove ${option.label}`"
      tabindex="-1"
      @mousedown="onRemove"
    >
      <CloseIcon />
    </button>
  </span>
</template>
