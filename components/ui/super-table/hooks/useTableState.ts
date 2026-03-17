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
  const debounceTime = props.features?.globalFilterDebounce ?? 500;
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [globalFilter, debounceTime]);

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
