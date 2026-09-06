// lib/utils/categoryTree.ts
//
// Pure helpers over a server-ordered tree - GET /product-categories/tree
// (Phase 1) and GET /regions/tree (Phase 3). The server orders every level and
// only returns active nodes; these keep that order and add the two things
// pickers need - a flat, indented option list and "which ids are under this
// node".
//
// GENERIC over `TreeNodeLike` since Phase 3 (spec I4). They were typed to
// `ProductCategoryTreeNode`, which requires `sort_order: number` and
// `is_active: boolean` that a region node does not have, so a region tree
// could not be passed without an `npx tsc --noEmit` error. `FlatCategoryOption`
// is kept as an alias of `FlatTreeOption`, so every existing caller stays green
// with no edit.

/** The only shape these helpers read: an id, a code, a name and children. */
export interface TreeNodeLike {
  id: string;
  code: string;
  name: string;
  children?: TreeNodeLike[];
}

export interface FlatTreeOption {
  id: string;
  code: string;
  name: string;
  depth: number;
  /** `'— '.repeat(depth) + name` - the indentation a flat <select> can show. */
  label: string;
  parentId: string | null;
}

/** Phase 1's name for the same thing; kept so no existing caller changes. */
export type FlatCategoryOption = FlatTreeOption;

/** DFS in the server's order; every node becomes one option with its depth prefix. */
export function flattenTree<T extends TreeNodeLike>(
  nodes: T[] | null | undefined
): FlatTreeOption[] {
  const out: FlatTreeOption[] = [];
  const walk = (list: TreeNodeLike[], depth: number, parentId: string | null) => {
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

/** The node itself, so a caller keeps ITS OWN node type back, not `TreeNodeLike`. */
export function findNode<T extends TreeNodeLike>(
  nodes: T[] | null | undefined,
  id: string | null | undefined
): T | null {
  if (!id) return null;
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const inChildren = findNode((node.children ?? []) as T[], id);
    if (inChildren) return inChildren;
  }
  return null;
}

/** Ids of every node UNDER `id` (children, grandchildren, ...), excluding `id` itself. */
export function descendantIds<T extends TreeNodeLike>(
  nodes: T[] | null | undefined,
  id: string | null | undefined
): string[] {
  const root = findNode(nodes, id);
  if (!root) return [];
  const out: string[] = [];
  const walk = (list: TreeNodeLike[]) => {
    for (const node of list ?? []) {
      out.push(node.id);
      walk(node.children ?? []);
    }
  };
  walk(root.children ?? []);
  return out;
}

/** Depth of the deepest node under `id` relative to it (0 when it has no children). */
export function subtreeHeight<T extends TreeNodeLike>(
  nodes: T[] | null | undefined,
  id: string | null | undefined
): number {
  const root = findNode(nodes, id);
  if (!root) return 0;
  const height = (node: TreeNodeLike): number =>
    !node.children || node.children.length === 0
      ? 0
      : 1 + Math.max(...node.children.map((child) => height(child)));
  return height(root);
}
