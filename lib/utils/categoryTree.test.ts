import { describe, expect, it } from 'vitest';
import type { ProductCategoryTreeNode } from '@/lib/types/ProductCategory';
import { descendantIds, findNode, flattenTree, subtreeHeight } from './categoryTree';

const node = (
  id: string,
  name: string,
  depth: number,
  children: ProductCategoryTreeNode[] = [],
  sort_order = 0
): ProductCategoryTreeNode => ({ id, code: id.toUpperCase(), name, sort_order, is_active: true, depth, children });

// Server order: (sort_order, name) at every level. The helpers must keep it.
const TREE: ProductCategoryTreeNode[] = [
  node('makanan', 'Makanan', 0, [
    node('minuman-panas', 'Minuman panas', 1, [node('espresso', 'Espresso', 2)]),
    node('kue', 'Kue', 1),
  ]),
  node('aksesori', 'Aksesori', 0),
];

describe('flattenTree', () => {
  it('walks depth-first in the given order and prefixes each depth with "— "', () => {
    const flat = flattenTree(TREE);
    expect(flat.map((o) => o.id)).toEqual(['makanan', 'minuman-panas', 'espresso', 'kue', 'aksesori']);
    expect(flat.map((o) => o.depth)).toEqual([0, 1, 2, 1, 0]);
    expect(flat.map((o) => o.label)).toEqual([
      'Makanan',
      '— Minuman panas',
      '— — Espresso',
      '— Kue',
      'Aksesori',
    ]);
  });

  it('records each node\'s parent so a picker can exclude a subtree', () => {
    const flat = flattenTree(TREE);
    expect(flat.find((o) => o.id === 'espresso')?.parentId).toBe('minuman-panas');
    expect(flat.find((o) => o.id === 'makanan')?.parentId).toBeNull();
  });

  it('is empty for an empty or missing tree', () => {
    expect(flattenTree([])).toEqual([]);
    expect(flattenTree(null)).toEqual([]);
    expect(flattenTree(undefined)).toEqual([]);
  });
});

describe('findNode', () => {
  it('finds nodes at any depth and returns null for unknown ids', () => {
    expect(findNode(TREE, 'espresso')?.name).toBe('Espresso');
    expect(findNode(TREE, 'aksesori')?.depth).toBe(0);
    expect(findNode(TREE, 'nope')).toBeNull();
    expect(findNode(TREE, null)).toBeNull();
    expect(findNode(undefined, 'makanan')).toBeNull();
  });
});

describe('descendantIds', () => {
  it('returns every id under the node, excluding the node itself', () => {
    expect(descendantIds(TREE, 'makanan')).toEqual(['minuman-panas', 'espresso', 'kue']);
    expect(descendantIds(TREE, 'minuman-panas')).toEqual(['espresso']);
  });

  it('is empty for a leaf and for an unknown id', () => {
    expect(descendantIds(TREE, 'espresso')).toEqual([]);
    expect(descendantIds(TREE, 'aksesori')).toEqual([]);
    expect(descendantIds(TREE, 'missing')).toEqual([]);
  });
});

describe('subtreeHeight', () => {
  it('measures how many levels hang under a node', () => {
    expect(subtreeHeight(TREE, 'makanan')).toBe(2);
    expect(subtreeHeight(TREE, 'minuman-panas')).toBe(1);
    expect(subtreeHeight(TREE, 'espresso')).toBe(0);
    expect(subtreeHeight(TREE, 'missing')).toBe(0);
  });
});
