'use client';

import React from 'react';
import {
  MaterialReactTable,
  MRT_TableInstance,
  useMaterialReactTable,
} from 'material-react-table';
import { SuperTableProps } from './types';

// Hooks
import { useTableState } from './hooks/useTableState';
import { useTableExport } from './hooks/useTableExport';
import { useSavedFilters } from './hooks/useSavedFilters';
import { useUrlSync } from './hooks/useUrlSync';
import { useListCursor } from './hooks/useListCursor';
import { useListPosition, type ListPosition } from './hooks/useListPosition';
import { useTableConfig, TableLazyConfig } from './hooks/useTableConfig';
import { useLazyRows, useNearEndOfScroll } from './hooks/useLazyRows';
import { usePathname } from 'next/navigation';

// Components
import { ExportDialog } from './components/ExportDialog';

/** Batch sizes offered per mode. Lazy batches are larger: with no page numbers
 *  to click, a batch is a scroll's worth of rows rather than a screenful. */
const LAZY_PAGE_SIZES = [25, 50, 100];
const PAGED_PAGE_SIZES = [10, 25, 50, 100];

export function SuperTable<TData extends object>(
  props: SuperTableProps<TData>
) {
  // ─── Pagination mode ─────────────────────────────────────────────────
  // `true` and `undefined` both mean lazy. That mapping is what lets ~44
  // existing tables switch over without being edited one at a time; `false`
  // still means "no pagination at all" and `'pages'` opts back into numbers.
  const paginationFeature = props.features?.pagination;
  const mode: 'lazy' | 'pages' | 'none' =
    paginationFeature === false
      ? 'none'
      : paginationFeature === 'pages'
        ? 'pages'
        : 'lazy';

  const pageSizeOptions =
    props.features?.pageSizeOptions ??
    (mode === 'pages' ? PAGED_PAGE_SIZES : LAZY_PAGE_SIZES);

  // 1. Inisialisasi State internal Table
  const tableState = useTableState({
    ...props,
    features: { ...props.features, pageSizeOptions },
    // Only lazy server tables need it, and only they pay for it.
    announceInitialState: mode === 'lazy' && !!props.manualPagination,
  });

  // 2. Inisialisasi Exporting features
  const exportEnabled = !!(
    props.features?.export?.excel || props.features?.export?.csv
  );
  const exportUtils = useTableExport<TData>({
    enabled: exportEnabled,
    isManual: !!props.manualPagination,
    tableId: props.tableId,
    exportFileName: props.exportFileName,
    onExportRequest: props.onExportRequest,
    currentState: tableState.currentState,
  });

  // The dialog needs the live table instance, which only exists after
  // useMaterialReactTable below - hold it in a ref the opener fills in.
  const [exportOpen, setExportOpen] = React.useState(false);
  const tableRef = React.useRef<MRT_TableInstance<TData> | null>(null);

  // 3. Inisialisasi Saved Filters Custom logic
  const savedFilters = useSavedFilters({
    enabled: !!(props.features?.savedFilters && props.tableId),
    tableId: props.tableId ?? '',
    currentFilters: tableState.columnFilters,
    currentGlobalFilter: tableState.globalFilter,
    onApplyPreset: (preset: any) => {
      tableState.setColumnFilters(preset.filters);
      tableState.setGlobalFilter(preset.globalFilter);
    },
  });

  // 4. Inisialisasi Sinkronisasi Routing App Next.js (SSG/SSR resilient)
  useUrlSync({
    enabled: !!(props.features?.urlSync && props.tableId),
    tableId: props.tableId ?? '',
    urlKey: props.urlKey,
    defaultPageSize: props.initialState?.pagination?.pageSize ?? pageSizeOptions[0],
    // A lazy list has no page number to restore, and writing `?p=7` for
    // "I have scrolled seven batches in" would be a lie: following that link
    // would land on batch 7 alone with the first six missing.
    trackPagination: mode === 'pages',
    state: tableState.currentState,
    onRestoreState: (state) => {
      // Restoring is not the user changing anything, so none of the applied
      // values below may reset the table to page 1 and discard the `?p=3`
      // restored on the same navigation. Called first, unconditionally: a
      // deep link can carry a sort with no filter, or the reverse.
      tableState.suppressNextFilterReset();
      if (state.pagination) tableState.setPagination(state.pagination);
      if (state.sorting) tableState.setSorting(state.sorting);
      if (state.globalFilter !== undefined) tableState.setGlobalFilter(state.globalFilter);
      if (state.columnFilters) tableState.setColumnFilters(state.columnFilters);
      if (state.grouping) tableState.setGrouping(state.grouping);
    },
  });

  // 4b. Remember where this list was, so a breadcrumb back from a record
  // returns to the same page/search/sort instead of page 1. Only meaningful
  // for tables that put their state in the URL in the first place.
  useListCursor({ enabled: !!(props.features?.urlSync && props.tableId) });

  // ─── 5. LAZY LOADING ─────────────────────────────────────────────────
  const pathname = usePathname();
  const isLazy = mode === 'lazy';
  // Only a table whose parent fetches page-by-page needs rows accumulated.
  // A client-side table already holds every row; for it, "load more" simply
  // shows more of what MRT has already filtered and sorted.
  const isServerLazy = isLazy && !!props.manualPagination;

  const getRowId = React.useCallback(
    (row: TData, index: number) =>
      props.getRowId
        ? props.getRowId(row, index)
        : String((row as { id?: string | number }).id ?? index),
    [props.getRowId]
  );

  // Everything that defines WHICH rows the server would return. When it
  // changes, rows loaded under the old query no longer belong together.
  const resetToken = React.useMemo(
    () =>
      JSON.stringify([
        tableState.debouncedGlobalFilter,
        tableState.sorting,
        tableState.columnFilters,
        tableState.pagination.pageSize,
        props.resetPageKey ?? null,
      ]),
    [
      tableState.debouncedGlobalFilter,
      tableState.sorting,
      tableState.columnFilters,
      tableState.pagination.pageSize,
      props.resetPageKey,
    ]
  );

  const lazyRows = useLazyRows<TData>({
    enabled: isServerLazy,
    data: props.data || [],
    pageIndex: tableState.pagination.pageIndex,
    pageSize: tableState.pagination.pageSize,
    rowCount: props.rowCount,
    isFetching: props.isFetching,
    isLoading: props.isLoading,
    getRowId,
    resetToken,
  });

  // How many rows a client-side lazy table is currently showing.
  //
  // Deliberately its OWN state rather than `pagination.pageIndex * pageSize`.
  // Deriving it from the pagination state made SuperTable both the writer and
  // the reader of a value MRT also writes: revealing more rows raised the
  // pageSize MRT was handed, MRT echoed that back through
  // `onPaginationChange`, and the two fed each other until the page locked up
  // mid-click. Nothing in a lazy table's UI moves MRT's pagination, so the
  // reveal simply does not belong there.
  const batchSize = tableState.pagination.pageSize;
  const [clientVisibleCount, setClientVisibleCount] = React.useState(batchSize);

  // A new query, or a new batch size, starts the reveal over.
  const clientKey = `${resetToken}|${batchSize}`;
  const prevClientKey = React.useRef(clientKey);
  if (prevClientKey.current !== clientKey) {
    prevClientKey.current = clientKey;
    if (clientVisibleCount !== batchSize) setClientVisibleCount(batchSize);
  }

  // Auto-load has a brake. Scrolling is cheap and rows are not: without a stop
  // a long enough scroll would put every one of 12,000 rows in the DOM. Past
  // the limit the sentinel goes quiet and only the button adds more.
  const autoLoadLimit = props.features?.autoLoadLimit ?? 10;
  const batchesLoaded = isServerLazy
    ? lazyRows.batchesLoaded
    : Math.ceil(clientVisibleCount / batchSize);
  const autoLoadPaused = batchesLoaded >= autoLoadLimit;

  // A client-side table's true remaining count is what MRT has FILTERED, not
  // what was handed in - and that number only exists on the table instance,
  // which is created below. `props.data.length` is the cheap upper bound used
  // to arm the sentinel; the precise check happens inside handleLoadMore,
  // by which time the instance is populated from the previous render.
  const instanceRef = React.useRef<MRT_TableInstance<TData> | null>(null);

  const hasMore = isServerLazy
    ? lazyRows.hasMore
    : clientVisibleCount < (props.data?.length ?? 0);
  const isLoadingMore = isServerLazy
    ? lazyRows.isLoadingMore
    : Boolean(props.isFetching);

  const handleLoadMore = React.useCallback(() => {
    // A second request for the same batch would leave a hole in the sequence,
    // not merely waste a call - so an in-flight fetch blocks the next one.
    if (isLoadingMore) return;
    if (!isServerLazy) {
      // The real remaining count is what MRT has FILTERED, not what was handed
      // in. Without this check a fully-revealed client-side list would keep
      // firing on every scroll - a twelve-row settings table would climb to
      // the auto-load brake just by being scrolled past.
      const filtered =
        instanceRef.current?.getFilteredRowModel().rows.length ??
        props.data?.length ??
        0;
      if (clientVisibleCount >= filtered) return;
      setClientVisibleCount((v) => v + batchSize);
      return;
    }
    if (!lazyRows.hasMore) return;
    // Every page asked for so far must have LANDED first. `isLoadingMore`
    // above only knows about a request when the parent reports `isFetching` or
    // `isLoading`, and plenty of them report neither - so on those tables a
    // fast scroll (or a restore walking batches) could bump pageIndex twice
    // before the first response arrived, and the batch in between was never
    // requested at all. The result is rows 1-50 followed by 76-100, with
    // nothing on screen to suggest 51-75 exist.
    if (batchesLoaded !== tableState.pagination.pageIndex + 1) return;
    tableState.loadNextPage();
  }, [
    isLoadingMore,
    isServerLazy,
    clientVisibleCount,
    batchSize,
    lazyRows.hasMore,
    batchesLoaded,
    tableState.pagination.pageIndex,
    props.data,
    tableState.loadNextPage,
  ]);

  // ─── Coming back to where you were ───────────────────────────────────
  // At most this many batches are re-fetched on a return. Restoring is
  // sequential - one request per batch, because a parent fetches one page at a
  // time - so an unbounded restore would fire twenty requests to put someone
  // back at row 500. Six covers the way these lists are actually worked
  // through; deeper than that, landing near the top is the kinder failure.
  const RESTORE_MAX_BATCHES = 6;

  const position = useListPosition({
    enabled: isLazy && !!props.tableId,
    pathname: pathname ?? '',
    tableId: props.tableId ?? '',
  });

  // `null` = not restoring. A number = keep loading until that many batches
  // are in, then put the scroll back.
  const [restoreTarget, setRestoreTarget] = React.useState<number | null>(null);
  const restoreScrollTop = React.useRef(0);
  // The query a restore was started for. `useUrlSync` applies `?q=`/`?f=` in
  // an effect, so the token can still move under a restore that began on the
  // pre-restore one - and finishing it would put six batches of the WRONG
  // list on screen.
  const restoreToken = React.useRef('');
  // A given stored position is consumed once. Without this, finishing a
  // restore and then scrolling would re-arm it on the next token match.
  const restoreConsumed = React.useRef(false);

  // The stored position belongs to a QUERY, and on mount the query is not
  // settled yet: useUrlSync applies `?q=`/`?sort=`/`?f=` in an effect, so
  // `resetToken` changes once shortly after mount. Watching the token rather
  // than firing on mount is what makes a restore wait for the URL to land -
  // and what makes a later filter change (a different token) correctly NOT
  // restore anything.
  // Read ONCE, on mount, into a snapshot. Calling `recall()` from the effect
  // body meant it could hand back a position THIS session had just written:
  // loading a third batch saved {batches:3}, the next render re-read it, and
  // the table armed a "restore" to a depth it was already at - on the first
  // visit, with nothing to restore.
  const storedOnMount = React.useRef<ListPosition | null>(null);
  const storedRead = React.useRef(false);
  React.useEffect(() => {
    if (storedRead.current) return;
    storedRead.current = true;
    storedOnMount.current = position.recall();
  }, [position]);

  React.useEffect(() => {
    if (!isLazy || restoreConsumed.current) return;
    if (!storedRead.current) return;
    const stored = storedOnMount.current;
    if (!stored || stored.token !== resetToken) return;
    restoreConsumed.current = true;
    if (stored.batches <= 1) return;
    restoreScrollTop.current = stored.scrollTop;
    restoreToken.current = resetToken;
    setRestoreTarget(Math.min(stored.batches, RESTORE_MAX_BATCHES));
  }, [isLazy, resetToken, position]);

  // Drive the restore one batch at a time, waiting for each to settle. This
  // deliberately bypasses the auto-load brake: the brake exists to stop idle
  // scrolling from hoarding rows, not to stop someone returning to rows they
  // had already loaded a moment ago.
  React.useEffect(() => {
    if (restoreTarget === null) return;
    // The query moved out from under us; whatever is loading now belongs to a
    // different list than the position described.
    if (restoreToken.current !== resetToken) {
      setRestoreTarget(null);
      return;
    }
    if (isLoadingMore || props.isLoading || props.isFetching) return;
    // Every page requested so far must have LANDED before asking for the next.
    // Plenty of parents report neither `isLoading` nor `isFetching`, so there
    // is no other signal that a request is in flight - and without this the
    // effect re-fires while waiting and walks pageIndex past a batch nobody
    // ever asked the server for. Measured: 75 rows on screen reading
    // 1-50 then 76-100, with 51-75 silently missing.
    if (isServerLazy && batchesLoaded !== tableState.pagination.pageIndex + 1) return;

    if (batchesLoaded >= restoreTarget || !hasMore) {
      setRestoreTarget(null);
      // After the last batch commits the rows exist but are not laid out yet,
      // so the container has no such offset to scroll to and the assignment is
      // clamped to whatever height it happens to have. How many frames that
      // takes depends on row height and how much the browser has to do, so
      // rather than guess at one, re-apply until it sticks (or give up, so a
      // genuinely unreachable offset cannot spin).
      const top = restoreScrollTop.current;
      let attempts = 0;
      const apply = () => {
        const el = instanceRef.current?.refs?.tableContainerRef?.current;
        if (el) {
          el.scrollTop = top;
          if (Math.abs(el.scrollTop - top) < 1) return;
        }
        if (++attempts < 8) requestAnimationFrame(apply);
      };
      requestAnimationFrame(apply);
      return;
    }
    handleLoadMore();
  }, [
    restoreTarget,
    resetToken,
    batchesLoaded,
    isServerLazy,
    tableState.pagination.pageIndex,
    hasMore,
    isLoadingMore,
    props.isLoading,
    props.isFetching,
    handleLoadMore,
  ]);

  // Loading via the button fires no scroll event, so depth would go unrecorded
  // for anyone who reaches row 200 by clicking rather than scrolling.
  React.useEffect(() => {
    if (!isLazy || restoreTarget !== null || batchesLoaded <= 1) return;
    const el = instanceRef.current?.refs?.tableContainerRef?.current;
    position.remember({
      batches: batchesLoaded,
      scrollTop: el?.scrollTop ?? 0,
      token: resetToken,
    });
  }, [isLazy, batchesLoaded, resetToken, restoreTarget, position]);

  const handleNearEnd = useNearEndOfScroll({
    enabled:
      isLazy &&
      hasMore &&
      !autoLoadPaused &&
      !isLoadingMore &&
      !props.isLoading,
    onNearEnd: handleLoadMore,
  });

  // One scroll listener does both jobs: decide whether to load more, and
  // record where the reader is. Recording is throttled inside useListPosition,
  // and is skipped while restoring so the restore cannot overwrite the very
  // position it is on its way to.
  const handleContainerScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = event.currentTarget.scrollTop;
      handleNearEnd(event);
      if (restoreTarget === null) {
        position.remember({ batches: batchesLoaded, scrollTop, token: resetToken });
      }
    },
    [handleNearEnd, position, batchesLoaded, resetToken, restoreTarget]
  );

  const lazyConfig: TableLazyConfig<TData> = {
    mode,
    rows: isServerLazy ? lazyRows.rows : props.data || [],
    isServer: isServerLazy,
    loadedCount: isServerLazy ? lazyRows.loadedCount : clientVisibleCount,
    knownTotal: isServerLazy ? lazyRows.knownTotal : undefined,
    hasMore,
    isLoadingMore,
    onLoadMore: handleLoadMore,
    autoLoadPaused,
    onContainerScroll: handleContainerScroll,
    pageSizeOptions,
    onPageSizeChange: tableState.setPageSize,
    entityLabel: props.entityLabel ?? 'baris',
    virtualize: !!props.features?.virtualize,
    clientVisibleCount,
  };

  // 6. Susun dan Build Konfigurasi MRT raksasa
  const mrtConfig = useTableConfig(
    props,
    tableState,
    exportUtils,
    savedFilters,
    (table: MRT_TableInstance<TData>) => {
      tableRef.current = table;
      setExportOpen(true);
    },
    lazyConfig
  );

  // 7. Instansiasi MRT Table
  const table = useMaterialReactTable({
    columns: props.columns || [],
    data: lazyConfig.rows,
    ...mrtConfig,
  } as any) as MRT_TableInstance<TData>;

  instanceRef.current = table;

  // ─── Selection, handed to the page as row objects ────────────────────
  // `onSelectionChange` has been in the props type since the beginning and was
  // never once called - a page that used it simply got silence. It is wired
  // here rather than inside the MRT setter because `rowSelection` is a map of
  // ids, and what a caller wants is the rows themselves.
  const onSelectionChange = props.onSelectionChange;
  React.useEffect(() => {
    if (!onSelectionChange) return;
    onSelectionChange(table.getSelectedRowModel().rows.map((r) => r.original));
    // `table` is a fresh object every render, so depending on it would fire
    // this on every render; the selection map is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState.rowSelection, onSelectionChange]);

  // ─── Back to the top when the QUERY changes ──────────────────────────
  // A new search or sort produces a different list, so staying 400px down it
  // is meaningless - and worse than meaningless with auto-load: the container
  // is still scrolled to the bottom, so the shrunken list immediately fires
  // "near the end" again and refills itself. Searching from three batches in
  // used to land you on three batches of the NEW result, never having seen
  // row one.
  const prevResetToken = React.useRef(resetToken);
  React.useEffect(() => {
    if (prevResetToken.current === resetToken) return;
    prevResetToken.current = resetToken;
    if (!isLazy) return;
    instanceRef.current?.refs?.tableContainerRef?.current?.scrollTo({ top: 0 });
  }, [resetToken, isLazy]);

  const exportColumns = React.useMemo(() => {
    if (!exportOpen) return [];
    return table
      .getAllLeafColumns()
      .filter(
        (col) =>
          col.id !== 'mrt-row-select' &&
          col.id !== 'mrt-row-actions' &&
          col.id !== 'mrt-row-expand' &&
          col.id !== 'actions'
      )
      .map((col) => ({
        id: col.id,
        label:
          typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id,
      }));
  }, [exportOpen, table]);

  // 8. Render UI
  return (
    <>
      <MaterialReactTable table={table as any} />

      {exportEnabled && (
        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          columns={exportColumns}
          // "Rows on this page" means something different once there are no
          // pages: it is everything scrolled into the table so far.
          pageCount={table.getRowModel().rows.length}
          pageScopeLabel={isLazy ? 'Baris yang sudah dimuat' : undefined}
          totalCount={
            props.manualPagination
              ? (lazyRows.knownTotal ?? props.rowCount ?? props.data?.length ?? 0)
              : table.getFilteredRowModel().rows.length
          }
          selectedCount={table.getSelectedRowModel().rows.length}
          allowedFormats={{
            excel: !!props.features?.export?.excel,
            csv: !!props.features?.export?.csv,
          }}
          isExporting={exportUtils.isExporting}
          progress={exportUtils.progress}
          onConfirm={async (options) => {
            await exportUtils.runExport(tableRef.current ?? table, options);
            setExportOpen(false);
          }}
        />
      )}
    </>
  );
}
