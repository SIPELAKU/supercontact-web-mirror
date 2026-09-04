// lib/utils/categoryTree.ts
//
// Pure helpers over GET /product-categories/tree. The server orders every
// level by (sort_order, name) and only returns active nodes; these keep that
// order and add the two things pickers need - a flat, indented option list
// and "which ids are under this node".

import type { ProductCategoryTreeNode } from "@/lib/types/ProductCategory";

export interface FlatCategoryOption {
  id: string;
  code: string;
  name: string;
  depth: number;
  /** `'— '.repeat(depth) + name` - the indentation a flat <select> can show. */
  label: string;
  parentId: string | null;
}

/** DFS in the server's order; every node becomes one option with its depth prefix. */
export function flattenTree(nodes: ProductCategoryTreeNode[] | null | undefined): FlatCategoryOption[] {
  const out: FlatCategoryOption[] = [];
  const walk = (list: ProductCategoryTreeNode[], depth: number, parentId: string | null) => {
    for (const node of list ?? []) {
      out.push({
        id: node.id,
        code: node.code,
        name: node.name,
        depth,
        label: `${"— ".repeat(depth)}${node.name}`,
        parentId,
      });
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children, depth + 1, node.id);
      }
    }
  };
  walk(nodes ?? [], 0, null);
  return out;
}

export function findNode(
  nodes: ProductCategoryTreeNode[] | null | undefined,
  id: string | null | undefined
): ProductCategoryTreeNode | null {
  if (!id) return null;
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const inChildren = findNode(node.children, id);
    if (inChildren) return inChildren;
  }
  return null;
}

/** Ids of every node UNDER `id` (children, grandchildren, ...), excluding `id` itself. */
export function descendantIds(
  nodes: ProductCategoryTreeNode[] | null | undefined,
  id: string | null | undefined
): string[] {
  const root = findNode(nodes, id);
  if (!root) return [];
  const out: string[] = [];
  const walk = (list: ProductCategoryTreeNode[]) => {
    for (const node of list ?? []) {
      out.push(node.id);
      walk(node.children);
    }
  };
  walk(root.children);
  return out;
}

/** Depth of the deepest node under `id` relative to it (0 when it has no children). */
export function subtreeHeight(
  nodes: ProductCategoryTreeNode[] | null | undefined,
  id: string | null | undefined
): number {
  const root = findNode(nodes, id);
  if (!root) return 0;
  const height = (node: ProductCategoryTreeNode): number =>
    !node.children || node.children.length === 0
      ? 0
      : 1 + Math.max(...node.children.map((child) => height(child)));
  return height(root);
}
