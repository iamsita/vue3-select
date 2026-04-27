import type { OptionAccessor } from '../types/option'
import type { NormalizedTreeNode, TreeOptionLike } from '../types/tree'
import { readAccessor } from './accessor'

interface NormalizeTreeConfig<T> {
  optionValue?: OptionAccessor<T, unknown>
  optionLabel?: OptionAccessor<T, string>
  optionChildren?: OptionAccessor<T, T[] | undefined>
  optionDisabled?: OptionAccessor<T, boolean>
}

export function normalizeTree<T extends TreeOptionLike>(
  options: readonly T[],
  config: NormalizeTreeConfig<T>,
): NormalizedTreeNode<T>[] {
  function visit(
    node: T,
    depth: number,
    parentId: string | null,
    indexPath: string,
  ): NormalizedTreeNode<T> {
    const value = readAccessor(
      node,
      config.optionValue,
      (node as Record<string, unknown>).value ?? (node as Record<string, unknown>).id,
    )
    const label = readAccessor(
      node,
      config.optionLabel,
      String(
        (node as Record<string, unknown>).label ??
          (node as Record<string, unknown>).name ??
          value ??
          '',
      ),
    )
    const childrenRaw =
      readAccessor(node, config.optionChildren, undefined as T[] | undefined) ??
      ((node as Record<string, unknown>).children as T[] | undefined) ??
      []
    const disabled = readAccessor(
      node,
      config.optionDisabled,
      Boolean((node as Record<string, unknown>).disabled),
    )

    const id = `tnode-${indexPath}-${String(value)}`
    const children: NormalizedTreeNode<T>[] = []
    childrenRaw.forEach((child, i) => {
      children.push(visit(child, depth + 1, id, `${indexPath}.${i}`))
    })

    return {
      id,
      value,
      label: String(label),
      depth,
      parentId,
      isLeaf: children.length === 0,
      disabled: Boolean(disabled),
      children,
      raw: node,
    }
  }

  return options.map((option, index) => visit(option, 0, null, String(index)))
}

export function walkTree<T>(
  nodes: readonly NormalizedTreeNode<T>[],
  visit: (node: NormalizedTreeNode<T>) => boolean | void,
): void {
  for (const node of nodes) {
    if (visit(node) === false) continue
    if (node.children.length > 0) walkTree(node.children, visit)
  }
}

export function flattenTree<T>(nodes: readonly NormalizedTreeNode<T>[]): NormalizedTreeNode<T>[] {
  const out: NormalizedTreeNode<T>[] = []
  walkTree(nodes, (n) => {
    out.push(n)
  })
  return out
}

export function getLeafValues<T>(node: NormalizedTreeNode<T> | NormalizedTreeNode<T>[]): unknown[] {
  const out: unknown[] = []
  const roots = Array.isArray(node) ? node : [node]
  walkTree(roots, (n) => {
    if (n.isLeaf && !n.disabled) out.push(n.value)
  })
  return out
}

export function filterTree<T>(
  nodes: readonly NormalizedTreeNode<T>[],
  query: string,
  caseSensitive = false,
): NormalizedTreeNode<T>[] {
  const q = query.trim()
  if (!q) return [...nodes]
  const needle = caseSensitive ? q : q.toLowerCase()

  function visit(node: NormalizedTreeNode<T>): NormalizedTreeNode<T> | null {
    const haystack = caseSensitive ? node.label : node.label.toLowerCase()
    const selfMatch = haystack.includes(needle)

    const filteredChildren: NormalizedTreeNode<T>[] = []
    for (const child of node.children) {
      const kept = visit(child)
      if (kept) filteredChildren.push(kept)
    }

    if (!selfMatch && filteredChildren.length === 0) return null
    if (filteredChildren.length === node.children.length && selfMatch) return node
    return { ...node, children: filteredChildren }
  }

  const out: NormalizedTreeNode<T>[] = []
  for (const root of nodes) {
    const kept = visit(root)
    if (kept) out.push(kept)
  }
  return out
}

export function getAncestorIds<T>(
  node: NormalizedTreeNode<T>,
  byId: Map<string, NormalizedTreeNode<T>>,
): string[] {
  const out: string[] = []
  let cursor: NormalizedTreeNode<T> | undefined = node
  while (cursor) {
    out.push(cursor.id)
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined
  }
  return out
}
