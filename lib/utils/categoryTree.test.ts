import { describe, expect, it } from 'vitest';
import type { ProductCategoryTreeNode } from '@/lib/types/ProductCategory';
import type { RegionLevel, RegionTreeNode } from '@/lib/types/CommercialContext';
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

// ── Phase 3: the same helpers over a REGION tree ──────────────────────────
//
// A `RegionTreeNode` carries `level` and no `sort_order` / `is_active`, so
// before the helpers were made generic (spec I4) passing one was an
// `npx tsc --noEmit` error. These cases pin the behaviour for both shapes.

const region = (
  id: string,
  name: string,
  level: RegionLevel,
  depth: number,
  children: RegionTreeNode[] = []
): RegionTreeNode => ({ id, code: id.toUpperCase(), name, level, depth, children });

const REGION_TREE: RegionTreeNode[] = [
  region('id', 'Indonesia', 'country', 0, [
    region('id-jb', 'Jawa Barat', 'province', 1, [region('bandung', 'Bandung', 'kabupaten', 2)]),
    region('id-jk', 'DKI Jakarta', 'province', 1),
  ]),
];

describe('the helpers over a region tree', () => {
  it('flattens and indents a region tree the same way', () => {
    const flat = flattenTree(REGION_TREE);
    expect(flat.map((o) => o.id)).toEqual(['id', 'id-jb', 'bandung', 'id-jk']);
    expect(flat.map((o) => o.label)).toEqual([
      'Indonesia',
      '— Jawa Barat',
      '— — Bandung',
      '— DKI Jakarta',
    ]);
    expect(flat.map((o) => o.parentId)).toEqual([null, 'id', 'id-jb', 'id']);
  });

  it('finds a region node and gives its OWN type back, level included', () => {
    const found = findNode(REGION_TREE, 'id-jb');
    expect(found?.level).toBe('province');
    expect(findNode(REGION_TREE, 'nope')).toBeNull();
  });

  it('answers descendants and subtree height for the depth cap', () => {
    expect(descendantIds(REGION_TREE, 'id')).toEqual(['id-jb', 'bandung', 'id-jk']);
    expect(descendantIds(REGION_TREE, 'bandung')).toEqual([]);
    expect(subtreeHeight(REGION_TREE, 'id')).toBe(2);
    expect(subtreeHeight(REGION_TREE, 'id-jk')).toBe(0);
  });
});
