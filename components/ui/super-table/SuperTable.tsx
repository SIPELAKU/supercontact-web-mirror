'use client';

import React from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { SuperTableProps } from './types';

// Hooks
import { useTableState } from './hooks/useTableState';
import { useTableExport } from './hooks/useTableExport';
import { useSavedFilters } from './hooks/useSavedFilters';
import { useUrlSync } from './hooks/useUrlSync';
import { useTableConfig } from './hooks/useTableConfig';

// Localization
import { MRT_Localization_ID } from './localization';

export function SuperTable<TData extends object>(
  props: SuperTableProps<TData>
) {
  // 1. Inisialisasi State internal Table
  const tableState = useTableState(props);

  // 2. Inisialisasi Exporting features
  const exportUtils = useTableExport<TData>({
    enabled: !!(props.features?.export?.excel || props.features?.export?.csv),
    isManual: !!props.manualPagination,
    tableId: props.tableId,
    onExportRequest: props.onExportRequest,
    currentState: tableState.currentState,
  });

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
    state: tableState.currentState,
    onRestoreState: (state) => {
      if (state.pagination) tableState.setPagination(state.pagination);
      if (state.sorting) tableState.setSorting(state.sorting);
      if (state.globalFilter !== undefined) tableState.setGlobalFilter(state.globalFilter);
      if (state.columnFilters) tableState.setColumnFilters(state.columnFilters);
      if (state.grouping) tableState.setGrouping(state.grouping);
    },
  });

  // 5. Susun dan Build Konfigurasi MRT raksasa
  const mrtConfig = useTableConfig(props, tableState, exportUtils, savedFilters);

  // 6. Instansiasi MRT Table
  const table = useMaterialReactTable({
    columns: props.columns || [],
    data: props.data || [],
    ...mrtConfig,
    localization: MRT_Localization_ID,
  } as any);

  // 7. Render UI
  return <MaterialReactTable table={table} />;
}
