<script setup lang="ts" generic="T = unknown">
import { computed, ref, watch } from 'vue'
import type { NormalizedTreeNode, TreeNodeCheckState } from '@/types/tree'
import { ChevronDownIcon } from '@/components/icons'

defineOptions({ name: 'VTreeSelectNode', inheritAttrs: false })

const props = defineProps<{
  node: NormalizedTreeNode<T>
  expanded: Set<string>
  getCheckState: (node: NormalizedTreeNode<T>) => TreeNodeCheckState
  idPrefix: string
}>()

const emit = defineEmits<{
  (e: 'toggle', node: NormalizedTreeNode<T>): void
  (e: 'expand', node: NormalizedTreeNode<T>): void
  (e: 'collapse', node: NormalizedTreeNode<T>): void
}>()

const isExpanded = ref(props.expanded.has(props.node.id))
watch(
  () => props.expanded,
  (set) => {
    isExpanded.value = set.has(props.node.id)
  },
  { deep: true },
)

const checkState = computed(() => props.getCheckState(props.node))
const checked = computed(() => checkState.value === 'checked')
const indeterminate = computed(() => checkState.value === 'indeterminate')

const rowStyle = computed(() => ({
  paddingLeft: `${8 + props.node.depth * 22}px`,
}))

const checkboxRef = ref<HTMLInputElement | null>(null)

watch(
  indeterminate,
  (v) => {
    if (checkboxRef.value) checkboxRef.value.indeterminate = v
  },
  { immediate: true, flush: 'post' },
)

function onExpanderClick(event: MouseEvent) {
  event.stopPropagation()
  if (props.node.isLeaf) return
  if (isExpanded.value) emit('collapse', props.node)
  else emit('expand', props.node)
}

function onRowMousedown(event: MouseEvent) {
  if (event.target instanceof HTMLInputElement) return
  if (props.node.disabled) return
  event.preventDefault()
  emit('toggle', props.node)
}

function onCheckboxChange() {
  emit('toggle', props.node)
}
</script>

<template>
  <div class="vselect-tree-branch" role="none">
    <div
      :id="`${idPrefix}-node-${node.id}`"
      class="vselect-tree-row"
      role="treeitem"
      :aria-level="node.depth + 1"
      :aria-expanded="node.isLeaf ? undefined : isExpanded"
      :aria-checked="indeterminate ? 'mixed' : checked"
      :aria-disabled="node.disabled || undefined"
      :class="{ 'is-disabled': node.disabled }"
      :style="rowStyle"
      @mousedown="onRowMousedown"
    >
      <button
        type="button"
        class="vselect-tree-expander"
        :class="{ 'is-leaf': node.isLeaf, 'is-open': isExpanded }"
        :aria-label="node.isLeaf ? undefined : isExpanded ? 'Collapse' : 'Expand'"
        :tabindex="node.isLeaf ? -1 : 0"
        @mousedown.stop
        @click="onExpanderClick"
      >
        <ChevronDownIcon v-if="!node.isLeaf" />
      </button>

      <input
        ref="checkboxRef"
        type="checkbox"
        class="vselect-tree-checkbox"
        :checked="checked"
        :disabled="node.disabled"
        :aria-label="node.label"
        @change="onCheckboxChange"
        @click.stop
      />

      <span class="vselect-tree-label">{{ node.label }}</span>
    </div>

    <div
      v-if="!node.isLeaf && isExpanded && node.children.length > 0"
      class="vselect-tree-children"
      role="group"
    >
      <VTreeSelectNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :expanded="expanded"
        :get-check-state="getCheckState"
        :id-prefix="idPrefix"
        @toggle="(n) => emit('toggle', n)"
        @expand="(n) => emit('expand', n)"
        @collapse="(n) => emit('collapse', n)"
      />
    </div>
  </div>
</template>
