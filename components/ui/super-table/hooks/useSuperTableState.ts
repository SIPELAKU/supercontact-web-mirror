import { useState } from 'react';
import { MRT_PaginationState, MRT_SortingState, MRT_RowSelectionState } from 'material-react-table';

export function useSuperTableState(initialPageSize = 10) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const resetSelection = () => setRowSelection({});

  return {
    stateProps: {
      pagination,
      onPaginationChange: setPagination,
      sorting,
      onSortingChange: setSorting,
      globalFilter,
      onGlobalFilterChange: setGlobalFilter,
      rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    // Direct access if needed
    pagination,
    setPagination,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    resetSelection,
  };
}
