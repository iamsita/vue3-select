import { computed, type ComputedRef, type Ref } from 'vue'
import type { NormalizedTreeNode, TreeNodeCheckState } from '../types/tree'
import { valuesEqual } from '../core/compare'
import { flattenTree, getLeafValues } from '../core/tree'

export interface UseTreeSelectionOptions<T> {
  /** v-model — array of leaf values. */
  modelValue: Ref<unknown>
  /** Normalised tree to evaluate state against. */
  tree: Ref<NormalizedTreeNode<T>[]>
  /** Cap the total number of selected leaves. Optional. */
  maxSelections?: Ref<number | undefined>
  emitUpdate: (value: unknown[]) => void
  emitSelect: (node: NormalizedTreeNode<T>) => void
  emitDeselect: (node: NormalizedTreeNode<T>) => void
}

export interface UseTreeSelectionReturn<T> {
  selectedValues: ComputedRef<unknown[]>
  isLeafSelected: (node: NormalizedTreeNode<T>) => boolean
  /** Tri-state for parents — for leaves, `'checked'` or `'unchecked'`. */
  getCheckState: (node: NormalizedTreeNode<T>) => TreeNodeCheckState
  /** Toggle a leaf or — if the node is a parent — every selectable leaf below it. */
  toggle: (node: NormalizedTreeNode<T>) => void
  selectAll: () => void
  clear: () => void
}

/**
 * Tree-aware selection state. Only **leaves** are stored in v-model — parent
 * checkbox state is always derived from the leaves below it. This keeps the
 * caller's value contract simple ("here's an array of ids") and matches the
 * common UX of tree-pickers like Element Plus / Ant Design.
 *
 * Indeterminate parents are computed fresh on read; for trees of practical
 * size (hundreds of nodes) this is cheap, and avoids the bug class of
 * cached-state-getting-out-of-sync after async option reloads.
 */
export function useTreeSelection<T>(
  opts: UseTreeSelectionOptions<T>,
): UseTreeSelectionReturn<T> {
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
    // Walk descendants, counting only enabled leaves — disabled leaves can't
    // be toggled, so they shouldn't influence the parent's tri-state.
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
      // Remove every leaf under this branch.
      const next = current.filter(
        (v) => !leafValues.some((lv) => valuesEqual(v, lv)),
      )
      opts.emitUpdate(next)
      // Emit deselect for each leaf that was actually selected.
      for (const child of flattenTree(node.children)) {
        if (child.isLeaf && !child.disabled) opts.emitDeselect(child)
      }
      return
    }

    // unchecked or indeterminate → select every selectable leaf under this branch.
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
    // Best-effort deselect — only emit for leaves that exist in the current tree.
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
