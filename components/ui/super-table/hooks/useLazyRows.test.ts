import { describe, expect, it, vi } from 'vitest';

// useLazyRows only uses useRef / useMemo / useCallback. This is the smallest
// hook runner that honours React's contract for those three - one component,
// slots matched by call order, memos kept while their deps are Object.is-equal
// - so the real hook runs here without a DOM or a renderer.
const runner = vi.hoisted(() => {
  type Slot = { current?: unknown; value?: unknown; deps?: unknown[] };
  let slots: Slot[] = [];
  let cursor = 0;
  const useMemo = <T>(factory: () => T, deps: unknown[]): T => {
    const i = cursor++;
    const prev = slots[i];
    if (
      prev?.deps &&
      prev.deps.length === deps.length &&
      prev.deps.every((d, k) => Object.is(d, deps[k]))
    ) {
      return prev.value as T;
    }
    const value = factory();
    slots[i] = { value, deps };
    return value;
  };
  return {
    mount() {
      slots = [];
      cursor = 0;
    },
    render<T>(fn: () => T): T {
      cursor = 0;
      return fn();
    },
    useRef<T>(initial: T) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { current: initial };
      return slots[i] as { current: T };
    },
    useMemo,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- this IS the hook runner
    useCallback: <T>(fn: T, deps: unknown[]) => useMemo(() => fn, deps),
  };
});

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useRef: runner.useRef,
  useMemo: runner.useMemo,
  useCallback: runner.useCallback,
}));

import { useLazyRows } from './useLazyRows';

type Row = { id: string; name?: string };
const PAGE_SIZE = 3;

/** The server's list, newest first, sliced the way an offset endpoint would. */
function fakeServer(ids: string[]) {
  let db = [...ids];
  return {
    page: (pageIndex: number): Row[] =>
      db.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((id) => ({ id })),
    get total() {
      return db.length;
    },
    duplicateToTop: (id: string) => {
      db = [id, ...db];
    },
    remove: (id: string) => {
      db = db.filter((x) => x !== id);
    },
  };
}

const getRowId = (row: Row) => row.id;

/** One mounted lazy table. Props persist between renders, like a parent's. */
function lazyTable() {
  runner.mount();
  const props = {
    enabled: true,
    pageSize: PAGE_SIZE,
    getRowId,
    resetToken: 'query-1',
    pageIndex: 0,
    data: [] as Row[],
    rowCount: undefined as number | undefined,
    isFetching: undefined as boolean | undefined,
    isLoading: false,
  };
  const render = (patch: Partial<typeof props>) => {
    Object.assign(props, patch);
    const result = runner.render(() => useLazyRows<Row>(props));
    return { ...result, ids: result.rows.map((r) => r.id) };
  };
  return { render };
}

/** Load batches 0..n-1 the way the page does: request in flight, then landed. */
function scrollThrough(
  table: ReturnType<typeof lazyTable>,
  server: ReturnType<typeof fakeServer>,
  batches: number
) {
  let last = table.render({});
  for (let pageIndex = 0; pageIndex < batches; pageIndex++) {
    table.render({ pageIndex, data: [], isLoading: true, isFetching: true });
    last = table.render({
      pageIndex,
      data: server.page(pageIndex),
      rowCount: server.total,
      isLoading: false,
      isFetching: false,
    });
  }
  return last;
}

describe('useLazyRows: what the Template Broadcasting table shows around a write', () => {
  it('one batch on screen: rows stay up during the refetch, and the copy shows once it lands', () => {
    const server = fakeServer(['t3', 't2', 't1']);
    const table = lazyTable();
    expect(scrollThrough(table, server, 1).ids).toEqual(['t3', 't2', 't1']);

    server.duplicateToTop('t4');
    // Duplicate in flight, then the refetch: same old page, isFetching on.
    expect(table.render({ isFetching: true }).ids).toEqual(['t3', 't2', 't1']);

    const landed = table.render({ data: server.page(0), rowCount: server.total, isFetching: false });
    expect(landed.ids).toEqual(['t4', 't3', 't2']);
  });

  it('three batches on screen, duplicate: the copy never shows (only the current batch is refetched)', () => {
    const server = fakeServer(['t9', 't8', 't7', 't6', 't5', 't4', 't3', 't2', 't1']);
    const table = lazyTable();
    expect(scrollThrough(table, server, 3).ids).toHaveLength(9);

    server.duplicateToTop('t10');
    // invalidateQueries refetches the ACTIVE query only: page 3.
    const after = table.render({ data: server.page(2), rowCount: server.total });

    expect(after.ids).not.toContain('t10');
    console.info('[3 batches + duplicate] rows on screen:', after.ids.join(','), '| total', server.total);
  });

  it('three batches on screen, delete from batch 1: the deleted row stays and a live row vanishes', () => {
    const server = fakeServer(['t9', 't8', 't7', 't6', 't5', 't4', 't3', 't2', 't1']);
    const table = lazyTable();
    scrollThrough(table, server, 3);

    server.remove('t8');
    const after = table.render({ data: server.page(2), rowCount: server.total });

    expect(after.ids).toContain('t8'); // deleted on the server, still listed
    expect(after.ids).not.toContain('t3'); // still on the server, gone from view
    expect(after.hasMore).toBe(false); // ...and no "load more" to bring it back
    console.info('[3 batches + delete t8] rows on screen:', after.ids.join(','), '| hasMore', after.hasMore);
  });

  it('switching WhatsApp account after scrolling: batches from two accounts end up in one list', () => {
    const accountA = fakeServer(['a9', 'a8', 'a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1']);
    const accountB = fakeServer(['b3', 'b2', 'b1']);
    const table = lazyTable();
    scrollThrough(table, accountA, 3);

    // The page resets ITS page to 1 for the new account, but the table is
    // still at batch 3 and the account is not part of its resetToken.
    table.render({ data: [], isLoading: true, isFetching: true });
    const after = table.render({
      data: accountB.page(0),
      rowCount: accountB.total,
      isLoading: false,
      isFetching: false,
    });

    expect(after.ids.some((id) => id.startsWith('a'))).toBe(true);
    expect(after.ids.some((id) => id.startsWith('b'))).toBe(true);
    console.info('[account switch] rows on screen:', after.ids.join(','));
  });

  it('the fix: after a write with 3 batches loaded, the list restarts from batch 1 on fresh rows', () => {
    // Render by render, as the template page drives it now: the write keeps
    // `isLoading` on until fresh batch 1 is in, and bumps restartKey.
    const server = fakeServer(['t9', 't8', 't7', 't6', 't5', 't4', 't3', 't2', 't1']);
    const table = lazyTable();
    scrollThrough(table, server, 3);
    const stalePage0 = server.page(0);

    server.remove('t8');
    // Delete in flight: rows stay, progress bar on.
    expect(table.render({ isLoading: true }).ids).toHaveLength(9);

    // restartKey bumped. SuperTable resets pageIndex in an effect, so this
    // render still has batch 3's index and data under a brand new token.
    const between = table.render({ resetToken: 'query-1|write-1' });
    expect(between.ids).toEqual([]);
    // ...shown as a skeleton, because isLoading is still on (SuperTable:
    // `isLoading && loadedCount === 0`), never as "No templates found".
    expect(between.loadedCount).toBe(0);

    // The page has switched to batch 1; the cached copy is the PRE-delete one.
    expect(table.render({ pageIndex: 0, data: stalePage0, isLoading: true }).ids).toEqual([]);

    // Write done, fresh batch 1 in.
    const after = table.render({ data: server.page(0), rowCount: server.total, isLoading: false });
    expect(after.ids).toEqual(['t9', 't7', 't6']);
    expect(after.ids).not.toContain('t8');
    expect(after.hasMore).toBe(true);
  });

  describe('Broadcasting WA Create/Edit modals (they invalidate the list; the page does nothing else)', () => {
    it('create, one batch on screen: the new broadcast shows', () => {
      const server = fakeServer(['b3', 'b2', 'b1']);
      const table = lazyTable();
      scrollThrough(table, server, 1);

      server.duplicateToTop('b4'); // a create lands on top the same way
      const after = table.render({ data: server.page(0), rowCount: server.total });
      expect(after.ids).toEqual(['b4', 'b3', 'b2']);
    });

    it('create, two batches on screen: the new broadcast never shows', () => {
      const server = fakeServer(['b6', 'b5', 'b4', 'b3', 'b2', 'b1']);
      const table = lazyTable();
      scrollThrough(table, server, 2);

      server.duplicateToTop('b7');
      const after = table.render({ data: server.page(1), rowCount: server.total });
      expect(after.ids).not.toContain('b7');
    });

    it('edit, ONE batch on screen: the new name never shows (fingerprint = length + first/last id)', () => {
      const table = lazyTable();
      table.render({
        data: [{ id: 'b3', name: 'Promo' }, { id: 'b2', name: 'Old name' }, { id: 'b1', name: 'Hello' }],
        rowCount: 3,
      });

      // The refetch after the edit: same ids, same order, one name changed.
      const after = table.render({
        data: [{ id: 'b3', name: 'Promo' }, { id: 'b2', name: 'New name' }, { id: 'b1', name: 'Hello' }],
        rowCount: 3,
      });
      const edited = after.rows.find((r) => r.id === 'b2');
      expect(edited?.name).toBe('Old name');
      console.info('[edit, 1 batch] b2 shows as:', edited?.name);
    });

    // The fix, render by render: BroadcastingWAClient's onSaved keeps
    // `isLoading` on until batch 1 is refetched, then bumps restartKey in the
    // same update that switches loading off.
    const oldBatch = [{ id: 'b2', name: 'Old name' }, { id: 'b1', name: 'Hello' }];
    const newBatch = [{ id: 'b2', name: 'New name' }, { id: 'b1', name: 'Hello' }];
    const nameOfB2 = (r: { rows: Row[] }) => r.rows.find((x) => x.id === 'b2')?.name;

    it('fix, edit with one batch: old rows stay up during the refetch, then the new name shows', () => {
      const table = lazyTable();
      table.render({ data: oldBatch, rowCount: 2 });

      expect(nameOfB2(table.render({ isLoading: true }))).toBe('Old name'); // saving
      expect(nameOfB2(table.render({ isLoading: true, data: newBatch }))).toBe('Old name'); // refetched, bar still on

      const done = table.render({ resetToken: 'query-1|write-1', isLoading: false });
      expect(nameOfB2(done)).toBe('New name');
      expect(done.ids).toEqual(['b2', 'b1']);
    });

    it('fix, edit, if React renders the two updates apart: one skeleton frame at worst, never an empty list', () => {
      const table = lazyTable();
      table.render({ data: oldBatch, rowCount: 2 });
      table.render({ isLoading: true, data: newBatch });

      // Restart applied, loading not yet off.
      const between = table.render({ resetToken: 'query-1|write-1' });
      expect(between.loadedCount).toBe(0); // with isLoading on, SuperTable draws a skeleton

      expect(nameOfB2(table.render({ isLoading: false }))).toBe('New name');
    });
  });

  describe('coming back to the list with a cached-but-stale page (TanStack refetches it on mount)', () => {
    const cached = [{ id: 't3' }, { id: 't2' }, { id: 't1' }];

    it('isFetching NOT passed (before): cached rows paint immediately', () => {
      const table = lazyTable();
      const first = table.render({ data: cached, rowCount: 3, isFetching: undefined });
      expect(first.ids).toEqual(['t3', 't2', 't1']);
    });

    it("isFetching passed (TanStack's flag): no rows until the refetch lands", () => {
      const table = lazyTable();
      // TanStack: data = cached page, isLoading = false, isFetching = true.
      const first = table.render({ data: cached, rowCount: 3, isFetching: true });
      expect(first.ids).toEqual([]);
      // SuperTable maps MRT's skeleton to `isLoading && loadedCount === 0`,
      // and isLoading is false here - so MRT shows the empty-state panel.
    });
  });
});
