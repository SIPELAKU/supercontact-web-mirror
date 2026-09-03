import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
} from 'material-react-table';
import { SuperTableFilterValues, SuperTableProps, SuperTableState } from '../types';

export function useTableState<TData extends object>(
  props: Pick<
    SuperTableProps<TData>,
    | 'initialState'
    | 'manualPagination'
    | 'manualSorting'
    | 'manualFiltering'
    | 'onStateChange'
    | 'features'
    | 'tableId'
    | 'resetPageKey'
    | 'clearSelectionKey'
  > & {
    /**
     * Lazy mode needs the parent's batch size to match the table's, or rows
     * are skipped outright - see `announceInitialState` below.
     */
    announceInitialState?: boolean;
  }
) {
  // ─── INIT STATES DENGAN FALLBACK INTERFACES ───────────────────────
  const [pagination, setPagination] = useState({
    pageIndex: props.initialState?.pagination?.pageIndex ?? 0,
    pageSize: props.initialState?.pagination?.pageSize ?? (props.features?.pageSizeOptions?.[0] || 10),
  });
  const [sorting, setSorting] = useState<MRT_SortingState>(
    props.initialState?.sorting ?? []
  );
  
  // globalFilter menampung text raw yg ngetik real time di input (controlled)
  const [globalFilter, setGlobalFilter] = useState<string>(
    props.initialState?.globalFilter ?? ''
  );
  // debouncedGlobalFilter nilai asli yg dilempar/dipakai query
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState<string>(
    props.initialState?.globalFilter ?? ''
  );
  
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    props.initialState?.columnFilters ?? []
  );
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    props.initialState?.columnVisibility ?? {}
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    props.initialState?.columnOrder ?? []
  );
  const [grouping, setGrouping] = useState<string[]>(
    props.initialState?.grouping ?? []
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>(
    props.initialState?.rowSelection ?? {}
  );

  // ─── DEBOUNCE GLOBAL SEARCH LOGIC ─────────────────────────────────
  // 300ms, down from 500. Previously the table also blanked to a skeleton on
  // every keystroke-triggered refetch, so a longer pause hid the flashing;
  // with keepPreviousData in place the old rows stay put and a shorter debounce
  // just reads as faster.
  const debounceTime = props.features?.globalFilterDebounce ?? 300;
  
  // The first debounce tick is the mount itself, not a search. It must NOT
  // reset the page, or a deep link like `?p=3&q=budi` would land on page 1
  // 300ms after useUrlSync restored page 3.
  const debounceSettled = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
      if (!debounceSettled.current) {
        debounceSettled.current = true;
        return;
      }
      // Reset to page 1 in the SAME batch as the search change. With
      // manualPagination, TanStack sets autoResetPageIndex to false, so nothing
      // does this for us: searching from page 5 used to keep pageIndex at 4,
      // which asked the server for page 5 of a smaller result set (an empty
      // table) and left the paginator highlighting a page that no longer
      // existed. Batching both keeps it to a single fetch.
      setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [globalFilter, debounceTime]);

  // Same rule for the table's own column filters.
  //
  // These two effects compare against the PREVIOUS value rather than using a
  // one-shot "skip the first run" flag. A one-shot flag is wrong twice over:
  // React 18 StrictMode runs effects twice on mount and refs survive that
  // simulated remount, so the second pass would fire the body for real; and
  // any later no-op re-run would too.
  //
  // `suppressNextColumnFilterReset` covers the one case where columnFilters
  // genuinely changes but the page must NOT move: useUrlSync restoring `?f=`
  // on mount. Eight tables in this app enable columnFilters AND urlSync
  // together, and without this a deep link carrying both `?f=` and `?p=3`
  // would snap straight back to page 1.
  const prevColumnFilters = useRef(columnFilters);
  const suppressNextColumnFilterReset = useRef(false);
  useEffect(() => {
    if (prevColumnFilters.current === columnFilters) return;
    prevColumnFilters.current = columnFilters;
    if (suppressNextColumnFilterReset.current) {
      suppressNextColumnFilterReset.current = false;
      return;
    }
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  // Re-sorting invalidates position just as thoroughly as filtering does, and
  // under lazy loading it is worse than a cosmetic wrong-page: the accumulated
  // rows are dropped because the query changed, but a pageIndex left at 3 then
  // asks for the FOURTH batch of the new order - so the list would render rows
  // 76-100 with rows 1-75 simply missing. Page-numbered tables get the
  // conventional "sorting takes you back to page 1" out of the same fix.
  const prevSorting = useRef(sorting);
  const suppressNextSortingReset = useRef(false);
  useEffect(() => {
    if (prevSorting.current === sorting) return;
    prevSorting.current = sorting;
    if (suppressNextSortingReset.current) {
      suppressNextSortingReset.current = false;
      return;
    }
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [sorting]);

  /**
   * Called by SuperTable once, before useUrlSync applies ANY restored state.
   *
   * Restoring `?sort=` or `?f=` is not a user changing the sort or the filter -
   * it is the page being rebuilt as it was left. Without this, the two effects
   * above would each read the restore as a fresh change and send the table back
   * to page 1, throwing away the `?p=3` restored microseconds earlier on the
   * same navigation.
   *
   * Both flags are set together because a restore can carry a sort without a
   * filter, or the reverse, and a single shared flag would be consumed by
   * whichever effect happened to run first.
   */
  const suppressNextFilterReset = useCallback(() => {
    suppressNextColumnFilterReset.current = true;
    suppressNextSortingReset.current = true;
  }, []);

  // Filters the PAGE owns, outside the table (`resetPageKey`). Besides going
  // back to page 1, this clears the row selection: rowSelection is keyed by
  // getRowId and survives a refetch, so without it the bulk bar could keep
  // reading "3 selected" for rows the server no longer returns - easy to hit
  // now that renderFilters puts the filter control beside that bar.
  const prevResetPageKey = useRef(props.resetPageKey);
  useEffect(() => {
    if (prevResetPageKey.current === props.resetPageKey) return;
    prevResetPageKey.current = props.resetPageKey;
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    // Keep the same object when nothing was selected, so this cannot cause an
    // extra render and a phantom onStateChange on every filter change.
    setRowSelection((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, [props.resetPageKey]);

  // Selection only - no page reset, no accumulated rows discarded. This is
  // what a page-owned "Batal pilih" button needs; `resetPageKey` would also
  // throw away everything scrolled into view.
  const prevClearSelectionKey = useRef(props.clearSelectionKey);
  useEffect(() => {
    if (prevClearSelectionKey.current === props.clearSelectionKey) return;
    prevClearSelectionKey.current = props.clearSelectionKey;
    setRowSelection((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, [props.clearSelectionKey]);

  // ─── DECLARATIVE FILTERS (`filters` prop) ─────────────────────────
  // The new filter UI and MRT's old column-filter subheader write to the SAME
  // place: `columnFilters`. That is deliberate, and it is what makes the
  // migration free - the eight pages that already read
  // `state.columnFilters.find(f => f.id === 'status')` keep working untouched
  // while their UI changes underneath them, and client-side tables get their
  // filtering driven by MRT's own engine with no extra wiring.
  const filterValues: SuperTableFilterValues = useMemo(
    () => Object.fromEntries(columnFilters.map((f) => [f.id, f.value])),
    [columnFilters]
  );

  const setFilterValues = useCallback((values: SuperTableFilterValues) => {
    setColumnFilters(
      Object.entries(values)
        .filter(([, value]) => {
          if (value === undefined || value === null || value === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
        .map(([id, value]) => ({ id, value }))
    );
  }, []);

  // ─── LAZY LOADING ────────────────────────────────────────────────────
  // "Load more" is just the next page index. Everything downstream - the
  // request the parent fires, the slot the rows land in - already keys off
  // pagination, so lazy loading needs no second notion of position.
  const loadNextPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
  }, []);

  // Changing the batch size mid-list would leave already-loaded rows sized by
  // the old batch and make offsets disagree with what has been accumulated,
  // so it restarts from the top - the same thing a page-size change has
  // always done.
  const setPageSize = useCallback((pageSize: number) => {
    setPagination({ pageIndex: 0, pageSize });
  }, []);

  // ─── ON STATE CHANGE (SERVER-SIDE BRIDGE) ─────────────────────────
  const isMounted = useRef(false);

  // Package sisa state menjadi sebuah object
  const currentState: SuperTableState = {
    pagination,
    sorting,
    globalFilter: debouncedGlobalFilter,
    columnFilters,
    columnVisibility,
    columnOrder,
    grouping,
    rowSelection,
    filters: filterValues,
  };

  const handleStateChange = useCallback(() => {
    // Hanya trigger event server-side jika salah satu mode manual dinyalakan
    if (!props.manualPagination && !props.manualSorting && !props.manualFiltering) return;
    
    // Normally the first render is skipped: the parent fetched with its own
    // defaults and nothing has changed yet.
    //
    // Lazy loading breaks that assumption, because now the two sides have to
    // agree on the BATCH SIZE. A page whose own default is `limit: 10` while
    // the table batches by 25 would fetch rows 1-10, then ask for "page 2 of
    // 25" on the first load-more and render rows 26-50 - rows 11 to 25 gone,
    // with nothing on screen to suggest anything is missing. Announcing the
    // state once on mount makes the table the single source of truth for it.
    //
    // Pages that already agree see an identical state and their own guard
    // returns early, so this costs a request only where it prevents a hole.
    if (!isMounted.current) {
        isMounted.current = true;
        if (!props.announceInitialState) return;
    }

    props.onStateChange?.(currentState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination,
    sorting,
    debouncedGlobalFilter,
    columnFilters,
    columnVisibility,
    columnOrder,
    grouping,
    rowSelection,
    props.manualPagination,
    props.manualSorting,
    props.manualFiltering,
  ]);

  // Trigger effect hanya jika state yang berdampak server ganti
  useEffect(() => {
    handleStateChange();
  }, [pagination, sorting, debouncedGlobalFilter, columnFilters, handleStateChange]);

  // ─── HELPERS ──────────────────────────────────────────────────────
  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  return {
    // Pagination
    pagination,
    setPagination,
    // Sort
    sorting,
    setSorting,
    // Search / Global Filter
    globalFilter,
    setGlobalFilter,
    debouncedGlobalFilter,
    // Filters Header
    columnFilters,
    setColumnFilters,
    // Column Display
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    // Features
    grouping,
    setGrouping,
    rowSelection,
    setRowSelection,
    // Declarative filters (same storage as columnFilters)
    filterValues,
    setFilterValues,
    // Lazy loading
    loadNextPage,
    setPageSize,
    // Utilities
    clearSelection,
    suppressNextFilterReset,
    currentState,
  };
}
