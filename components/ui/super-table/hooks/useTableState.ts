import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
} from 'material-react-table';
import { SuperTableProps, SuperTableState } from '../types';

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
  >
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

  // Same rule for column filters and for filters the page owns outside the
  // table (`resetPageKey`), which cannot be batched into the debounce above.
  const skipFirstReset = useRef(true);
  useEffect(() => {
    if (skipFirstReset.current) {
      skipFirstReset.current = false;
      return;
    }
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [columnFilters, props.resetPageKey]);

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
  };

  const handleStateChange = useCallback(() => {
    // Hanya trigger event server-side jika salah satu mode manual dinyalakan
    if (!props.manualPagination && !props.manualSorting && !props.manualFiltering) return;
    
    // Jangan fire event stateChange pada initial mount jika tak ada perubahan (cukup dipass initial prop)
    if (!isMounted.current) {
        isMounted.current = true;
        return;
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
    // Utilities
    clearSelection,
    currentState,
  };
}
