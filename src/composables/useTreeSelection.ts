import { computed, type ComputedRef, type Ref } from 'vue'
import type { NormalizedTreeNode, TreeNodeCheckState } from '../types/tree'
import { valuesEqual } from '../core/compare'
import { flattenTree, getLeafValues } from '../core/tree'

export interface UseTreeSelectionOptions<T> {
  modelValue: Ref<unknown>
  tree: Ref<NormalizedTreeNode<T>[]>
  maxSelections?: Ref<number | undefined>
  emitUpdate: (value: unknown[]) => void
  emitSelect: (node: NormalizedTreeNode<T>) => void
  emitDeselect: (node: NormalizedTreeNode<T>) => void
}

export interface UseTreeSelectionReturn<T> {
  selectedValues: ComputedRef<unknown[]>
  isLeafSelected: (node: NormalizedTreeNode<T>) => boolean
  getCheckState: (node: NormalizedTreeNode<T>) => TreeNodeCheckState
  toggle: (node: NormalizedTreeNode<T>) => void
  selectAll: () => void
  clear: () => void
}

export function useTreeSelection<T>(opts: UseTreeSelectionOptions<T>): UseTreeSelectionReturn<T> {
  const selectedValues = computed<unknown[]>(() => {
    const value = opts.modelValue.value
    if (value == null || value === '') return []
    return Array.isArray(value) ? value : [value]
  })

  function isLeafSelected(node: NormalizedTreeNode<T>): boolean {
    return selectedValues.value.some((v) => valuesEqual(v, node.value))
  }

  function getCheckState(node: NormalizedTreeNode<T>): TreeNodeCheckState {
    if (node.isLeaf) return isLeafSelected(node) ? 'checked' : 'unchecked'

    let total = 0
    let selected = 0
    const stack: NormalizedTreeNode<T>[] = [...node.children]
    while (stack.length) {
      const cur = stack.pop()!
      if (cur.isLeaf) {
        if (cur.disabled) continue
        total += 1
        if (isLeafSelected(cur)) selected += 1
      } else {
        for (const c of cur.children) stack.push(c)
      }
    }

    if (total === 0) return 'unchecked'
    if (selected === 0) return 'unchecked'
    if (selected === total) return 'checked'
    return 'indeterminate'
  }

  function withCap(next: unknown[]): unknown[] {
    const cap = opts.maxSelections?.value
    if (cap === undefined) return next
    return next.length > cap ? next.slice(0, cap) : next
  }

  function toggleLeaf(node: NormalizedTreeNode<T>) {
    if (node.disabled) return
    const current = selectedValues.value
    const has = current.some((v) => valuesEqual(v, node.value))
    if (has) {
      opts.emitUpdate(current.filter((v) => !valuesEqual(v, node.value)))
      opts.emitDeselect(node)
      return
    }
    const cap = opts.maxSelections?.value
    if (cap !== undefined && current.length >= cap) return
    opts.emitUpdate([...current, node.value])
    opts.emitSelect(node)
  }

  function toggleParent(node: NormalizedTreeNode<T>) {
    const state = getCheckState(node)
    const leafValues = getLeafValues(node)
    if (leafValues.length === 0) return

    const current = selectedValues.value
    if (state === 'checked') {
      const next = current.filter((v) => !leafValues.some((lv) => valuesEqual(v, lv)))
      opts.emitUpdate(next)
      for (const child of flattenTree(node.children)) {
        if (child.isLeaf && !child.disabled) opts.emitDeselect(child)
      }
      return
    }

    const merged = [...current]
    for (const v of leafValues) {
      if (!merged.some((existing) => valuesEqual(existing, v))) merged.push(v)
    }
    const next = withCap(merged)
    opts.emitUpdate(next)
    for (const child of flattenTree(node.children)) {
      if (child.isLeaf && !child.disabled && !current.some((v) => valuesEqual(v, child.value))) {
        opts.emitSelect(child)
      }
    }
  }

  function toggle(node: NormalizedTreeNode<T>) {
    if (node.disabled) return
    if (node.isLeaf) toggleLeaf(node)
    else toggleParent(node)
  }

  function selectAll() {
    const all: unknown[] = []
    walkAllLeaves(opts.tree.value, (n) => {
      if (!n.disabled) all.push(n.value)
    })
    opts.emitUpdate(withCap(all))
  }

  function clear() {
    if (selectedValues.value.length === 0) return
    const cleared = selectedValues.value
    opts.emitUpdate([])
    for (const node of flattenTree(opts.tree.value)) {
      if (node.isLeaf && cleared.some((v) => valuesEqual(v, node.value))) {
        opts.emitDeselect(node)
      }
    }
  }

  return { selectedValues, isLeafSelected, getCheckState, toggle, selectAll, clear }
}

function walkAllLeaves<T>(
  nodes: readonly NormalizedTreeNode<T>[],
  visit: (n: NormalizedTreeNode<T>) => void,
) {
  for (const node of nodes) {
    if (node.isLeaf) visit(node)
    else walkAllLeaves(node.children, visit)
  }
}
