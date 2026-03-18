import React from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import {
  MRT_TableOptions,
  MRT_ToggleGlobalFilterButton,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_EditActionButtons,
} from 'material-react-table';

import { SuperTableProps } from '../types';
import { useTableState } from './useTableState';
import { useTableExport, UseTableExportReturn } from './useTableExport';
import { useSavedFilters } from './useSavedFilters';

import { BulkActionsBar } from '../components/BulkActionsBar';
import { ErrorState } from '../components/ErrorState';

export function useTableConfig<TData extends object>(
  props: SuperTableProps<TData>,
  tableState: ReturnType<typeof useTableState>,
  exportUtils: UseTableExportReturn<TData>,
  savedFilters: ReturnType<typeof useSavedFilters>
): Partial<MRT_TableOptions<TData>> {
  // 1. EXTRACT DEFAULTS (Mengambil default per spesifikasi Odoo standards)
  const {
    columnVisibility = true,
    columnOrdering = true,
    columnResizing = true,
    columnPinning = false,
    sorting = true,
    multiSort = true,
    globalFilter = true,
    columnFilters = false,
    grouping = false,
    densityToggle = false,
    fullScreenToggle = false,
    pagination = true,
    rowSelection = 'none',
    inlineEditing = false,
    maxHeight = '70vh',
    stickyHeader = true,

    // Filtering Defaults
    smartFilterVariants = true,
    facetedValues = true,
    filterSwitching = true,
    popoverFilters = false,
    globalFilterAlwaysVisible = true,
  } = props.features || {};

  // 2. BUILD CORE OPTIONS
  const mrtConfig: Partial<MRT_TableOptions<TData>> = {
    // ─── Data & State Pointers ────────
    data: props.data || [],
    columns: props.columns || [],
    layoutMode: 'semantic',
    state: {
      isLoading: props.isLoading,
      showProgressBars: props.isFetching,

      pagination: tableState.pagination,
      sorting: tableState.sorting,
      globalFilter: tableState.globalFilter, // Biarkan ui input tetap snappy
      columnFilters: tableState.columnFilters.map((f) => {
        const colDef = props.columns?.find((c: any) => c.accessorKey === f.id || c.id === f.id) as any;
        if (colDef && colDef.filterVariant === 'multi-select') {
          return {
            ...f,
            value: Array.isArray(f.value) ? f.value : f.value ? [f.value] : [],
          };
        }
        return f;
      }),
      columnVisibility: tableState.columnVisibility,
      columnOrder: tableState.columnOrder,
      grouping: tableState.grouping,
      rowSelection: tableState.rowSelection,
    },

    initialState: {
      showGlobalFilter: globalFilterAlwaysVisible,
      showColumnFilters: columnFilters,
      ...props.initialState,
    },

    // ─── Force Native Internal Columns Size (FIX Spacer Bug) ─
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 80,
        grow: false,
      },
      'mrt-row-select': {
        size: 48,
        grow: false,
      },
    },

    // ─── Server-Side Handling ────────
    manualPagination: props.manualPagination,
    rowCount: props.rowCount,
    manualSorting: props.manualSorting,
    manualFiltering: props.manualFiltering,
    autoResetPageIndex: props.autoResetPageIndex,

    // ─── Feature Flags Mapping ───────
    enableHiding: columnVisibility,
    enableColumnOrdering: columnOrdering,
    enableColumnResizing: columnResizing,
    enablePinning: columnPinning,
    enableSorting: sorting,
    enableMultiSort: multiSort,
    enableGlobalFilter: globalFilter,
    enableColumnFilters: columnFilters,
    enableGrouping: grouping,
    enableDensityToggle: densityToggle,
    enableFullScreenToggle: fullScreenToggle,
    enablePagination: pagination,
    enableRowSelection: rowSelection !== 'none',
    enableSelectAll: rowSelection === 'multi',

    // ─── Filter Specific Handling ─────
    enableFacetedValues: facetedValues,
    enableFilterMatchHighlighting: filterSwitching,
    columnFilterDisplayMode: popoverFilters ? 'popover' : 'subheader',

    // ─── Toolbar Behaviors ───────────
    positionToolbarAlertBanner: 'none', // Di handle UI custom (BulkActionsBar)

    // ─── Event Listeners (Setters) ───
    onPaginationChange: tableState.setPagination,
    onSortingChange: tableState.setSorting,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onColumnOrderChange: tableState.setColumnOrder,
    onGroupingChange: tableState.setGrouping,
    onRowSelectionChange: tableState.setRowSelection,

    // ─── Interaction Callbacks ───────
    // Click events dipindah ke muiTableBodyRowProps di config styling bawah
  };

  // ─── 3. INLINE EDITING CONFIGURATIONS ─────────────────────────────
  if (inlineEditing) {
    mrtConfig.enableEditing = true;
    mrtConfig.editDisplayMode = inlineEditing as 'row' | 'cell' | 'table';

    // ── MODE: 'row' ──────────────────────────────────────────────────
    if (inlineEditing === 'row') {
      mrtConfig.onEditingRowSave = async ({ row, values, table }) => {
        const exitEditingMode = () => table.setEditingRow(null);
        try {
          await props.onSaveRow?.({
            row: row.original,
            values,
            exitEditingMode,
          });
        } catch (error) {
          console.error('[SuperTable] onSaveRow gagal:', error);
        }
      };

      mrtConfig.onEditingRowCancel = ({ row }) => {
        props.onCancelRowEdit?.(row.original);
      };
    }

    // ── MODE: 'cell' ─────────────────────────────────────────────────
    if (inlineEditing === 'cell') {
      mrtConfig.muiEditTextFieldProps = ({ cell, row, table }) => ({
        onBlur: async (e) => {
          const newValue = e.target.value;
          const oldValue = String(cell.getValue() ?? '');
          if (newValue === oldValue) return;

          table.setEditingCell(null);
          try {
            await props.onCellEdit?.({
              row: row.original,
              columnId: cell.column.id,
              oldValue: cell.getValue(),
              newValue,
            });
          } catch (error) {
            console.error('[SuperTable] onCellEdit gagal:', error);
          }
        },
        variant: 'outlined',
        size: 'small',
        sx: {
          '& .MuiOutlinedInput-root': {
            fontSize: 'inherit',
          }
        }
      });
    }
  }

  // Row Actions (Tombol Save/Cancel saat Update atau Render prop parent)
  if (props.renderRowActions || inlineEditing === 'row') {
    mrtConfig.enableRowActions = true;
    mrtConfig.positionActionsColumn = 'last';

    mrtConfig.renderRowActions = ({ row, table }) => {
      const isEditing = inlineEditing === 'row' && table.getState().editingRow?.id === row.id;

      if (isEditing) {
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <MRT_EditActionButtons row={row} table={table} variant="icon" />
          </Box>
        );
      }

      if (inlineEditing === 'row') {
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            {props.renderRowActions?.({ row, table })}
          </Box>
        );
      }

      return props.renderRowActions?.({ row, table }) ?? null;
    };
  }

  // ─── 4. CUSTOM SLOTS, BULK ACTIONS, & EMPTY STATES ────────────────
  // Top Left (Default: Search Bar / Tombol Plus). 
  // Jika tersorot baris maka terganti Bulk Action (seperti Gmail/Odoo).
  mrtConfig.renderTopToolbarCustomActions = ({ table }) => {
    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
    const hasSelection = selectedRows.length > 0;

    if (hasSelection && props.renderBulkActions) {
      return (
        <BulkActionsBar
          selectedRows={selectedRows}
          clearSelection={tableState.clearSelection}
          renderBulkActions={props.renderBulkActions}
        />
      );
    }

    return props.renderTopLeftToolbar?.(table) ?? null;
  };

  // Top Right Toolbar. Isinya Toggle Panel MRT + Export + Tombol custom
  mrtConfig.renderToolbarInternalActions = ({ table }) => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {/* 4.A Render Built-in Custom Export XLS/CSV if Enabled */}
      {props.features?.export?.excel && (
        <Tooltip arrow title="Export Excel (.xlsx)">
          <IconButton
            onClick={() => exportUtils.exportToExcel(table)}
            disabled={exportUtils.isExporting}
          >
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
      )}
      {props.features?.export?.csv && (
        <Tooltip arrow title="Export CSV (.csv)">
          <IconButton
            onClick={() => exportUtils.exportToCsv(table)}
            disabled={exportUtils.isExporting}
          >
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* 4.B Render OOTB Material-React-Table Action Toggles (respects flags) */}
      {globalFilter && <MRT_ToggleGlobalFilterButton table={table} />}
      {columnFilters && <MRT_ToggleFiltersButton table={table} />}
      {columnVisibility && <MRT_ShowHideColumnsButton table={table} />}
      {densityToggle && <MRT_ToggleDensePaddingButton table={table} />}
      {fullScreenToggle && <MRT_ToggleFullScreenButton table={table} />}

      {/* 4.C Render Tambahan Parent Custom Slot Kanan (Contoh: Menu Saved Filter) */}
      {props.renderTopRightToolbar?.(table)}
    </Box>
  );

  // Error States / Custom No-Record component
  mrtConfig.renderEmptyRowsFallback = () => {
    if (props.isError) {
      return (
        <ErrorState
          message={props.errorMessage}
          onRetry={props.onRetry}
        />
      );
    }
    if (props.renderEmptyState) {
      return <>{props.renderEmptyState()}</>;
    }
    // Jika tidak didefine renderEmptyState, MRT akan secara otomatis meren-der fallback loc default (noRecordsToDisplay)
    return undefined;
  };

  // Detail Panel
  if (props.renderDetailPanel) {
    mrtConfig.renderDetailPanel = props.renderDetailPanel;
  }

  // ─── 5. UI STYLING & MATERIAL THEMING (Native MUI compliance) ─────
  mrtConfig.muiTablePaperProps = {
    elevation: 0,
    sx: {
      borderRadius: 3,     // Rounding standar Supercontact
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'none',   // Hindari bump out shadow
      width: '100%',
      overflow: 'hidden',  // Ensure round corners apply to entire child panel
    },
  };

  mrtConfig.muiTableContainerProps = {
    sx: {
      maxHeight: maxHeight,  // Sticky header need bounded box size
      width: '100%',
      overflowX: 'auto',
    },
  };

  mrtConfig.muiTableHeadCellProps = {
    sx: (theme) => ({
      fontWeight: 600,
      fontSize: '0.875rem',
      backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : '#EEF2FD', // Standard background odoo-like blueish white
      color: theme.palette.text.secondary,
      py: 2, // Spacing yang nyaman (Comfortable density padding override base)
      borderBottom: `1px solid ${theme.palette.divider}`,
      '& .Mui-active': {
        color: 'primary.main',
      },
    }),
  };

  mrtConfig.muiTableBodyRowProps = ({ row }) => ({
    onClick: (e) => props.onRowClick?.(row.original, e),
    onDoubleClick: (e) => props.onRowDoubleClick?.(row.original, e),
    sx: {
      cursor: props.onRowClick || props.onRowDoubleClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
      // Injeksi object overrides specific dari property parents
      ...props.getRowStyles?.(row.original),
    },
    className: props.getRowClassName?.(row.original),
  });

  return mrtConfig;
}
