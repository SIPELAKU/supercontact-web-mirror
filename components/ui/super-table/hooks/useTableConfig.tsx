import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Pencil } from 'lucide-react';
import {
  MRT_TableInstance,
  MRT_TableOptions,
  MRT_EditActionButtons,
} from 'material-react-table';

import { SuperTableProps } from '../types';
import { useTableState } from './useTableState';
import { useTableExport, UseTableExportReturn } from './useTableExport';
import { useSavedFilters } from './useSavedFilters';

import { BulkActionsBar } from '../components/BulkActionsBar';
import { ErrorState } from '../components/ErrorState';
import { TableToolbarActions } from '../components/TableToolbarActions';

export function useTableConfig<TData extends object>(
  props: SuperTableProps<TData>,
  tableState: ReturnType<typeof useTableState>,
  exportUtils: UseTableExportReturn<TData>,
  savedFilters: ReturnType<typeof useSavedFilters>,
  onExportClick: (table: MRT_TableInstance<TData>) => void
): Partial<MRT_TableOptions<TData>> {
  const exportEnabled = !!(
    props.features?.export?.excel || props.features?.export?.csv
  );
  // 1. EXTRACT DEFAULTS (Mengambil default per spesifikasi Odoo standards)
  const {
    columnVisibility = true,
    columnOrdering = true,
    columnResizing = true,
    columnPinning = false,
    sorting = true,
    // The server contract everywhere in this app is a single sort_by +
    // sort_order pair, and every caller forwards sorting[0] only. Leaving
    // multi-sort on rendered a second sort arrow the backend then ignored.
    multiSort = false,
    globalFilter = true,
    columnFilters = false,
    grouping = false,
    densityToggle = false,
    fullScreenToggle = false,
    pagination = true,
    pageSizeOptions = [10, 25, 50, 100],
    rowSelection = 'none',
    inlineEditing = false,
    maxHeight = '70vh',
    stickyHeader = true,

    // Filtering Defaults
    facetedValues = true,
    filterSwitching = true,
    popoverFilters = false,
    globalFilterAlwaysVisible = true,
  } = props.features || {};

  // Two filter affordances on one table is always a mistake: the page-owned
  // control plus MRT's built-in funnel toggle, each filtering by different
  // rules. Dev-only, so it costs nothing in production.
  if (process.env.NODE_ENV !== 'production' && props.renderFilters && columnFilters) {
    console.warn(
      `[SuperTable${props.tableId ? ` ${props.tableId}` : ''}] renderFilters is set together with ` +
        'features.columnFilters: true. Pick one - two filter UIs on the same table ' +
        'give the user two ways to filter that do not agree.'
    );
  }

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

    // ─── Row Identity ────────────────
    // ID baris stabil (bukan index) supaya selection tidak "nempel" ke
    // baris lain saat pindah halaman pada manualPagination.
    getRowId: (originalRow, index) =>
      props.getRowId
        ? props.getRowId(originalRow, index)
        : String((originalRow as { id?: string | number }).id ?? index),

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
    enableStickyHeader: stickyHeader,
    enableRowSelection: rowSelection !== 'none',
    enableSelectAll: rowSelection === 'multi',

    // ─── Pagination UI ───────────────
    // 'pages' replaces MUI's bare prev/next pair with numbered pages; without
    // first/last, reaching page 60 of a subscriber list meant 59 clicks.
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      rowsPerPageOptions: pageSizeOptions,
      showFirstButton: true,
      showLastButton: true,
      shape: 'rounded',
      variant: 'outlined',
      color: 'primary',
    },

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
                <Pencil size={18} />
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
  // MRT hands us ONE node for the entire left half of the toolbar
  // (renderTopToolbarCustomActions = the first child of MRT_TopToolbar).
  // Three things compete for it:
  //   1. renderFilters        - filter controls; always shown, always first
  //   2. renderTopLeftToolbar - Add / Import / Print buttons
  //   3. BulkActionsBar       - takes over (2) ONLY, while rows are selected
  //
  // Pinning filters at index 0 is the whole point of the separate slot: put
  // them in renderTopLeftToolbar instead and ticking a single checkbox
  // unmounts them, hiding both the control and which filter is active exactly
  // when someone is about to run a bulk delete. Keeping the element type at
  // index 0 stable across renders also means an OPEN filter popover survives
  // a checkbox click.
  //
  // DO NOT make the assignment below conditional. MRT computes
  // `stackAlertBanner = isMobile || !!renderTopToolbarCustomActions || ...`
  // and uses it to pick position: relative vs absolute for the toolbar row -
  // guarding this would flip every table to an absolutely positioned toolbar
  // sitting on top of the first data row.
  mrtConfig.renderTopToolbarCustomActions = ({ table }) => {
    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
    const hasSelection = selectedRows.length > 0;

    const filtersNode = props.renderFilters?.(table) ?? null;

    const actionsNode =
      hasSelection && props.renderBulkActions ? (
        <BulkActionsBar
          selectedRows={selectedRows}
          clearSelection={tableState.clearSelection}
          renderBulkActions={props.renderBulkActions}
        />
      ) : (
        props.renderTopLeftToolbar?.(table) ?? null
      );

    // No filter slot -> emit exactly what this returned before the slot
    // existed, raw `null` included, so MRT's `?? <span/>` spacer stays alive
    // and `justify-content: space-between` keeps the search/Export/View
    // cluster pinned right. This early return is the zero-regression story
    // for every SuperTable screen that does not opt in.
    if (!filtersNode) return actionsNode;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          // MRT's toolbar row does not wrap and its container is
          // overflow:hidden, so this wrapper is the only wrap point on the
          // left half - chips and the bulk bar drop to a second line here
          // instead of being clipped.
          flexWrap: 'wrap',
          columnGap: 1,
          rowGap: 0.75,
          minHeight: 40, // matches the 40px search field opposite it
          // Where the old <span/> spacer had zero width, this wrapper has
          // real content. Without these two it would refuse to shrink and
          // push the search/Export/View cluster past the clipped right edge
          // on a narrow viewport; with them it shrinks and wraps internally.
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        {filtersNode}
        {actionsNode}
      </Box>
    );
  };

  // Top Right Toolbar: search toggle (only when the field is hidden by
  // default), column-filter toggle, one Export button, one View menu.
  mrtConfig.renderToolbarInternalActions = ({ table }) => (
    <TableToolbarActions
      table={table}
      showSearchToggle={globalFilter && !globalFilterAlwaysVisible}
      showColumnFilterToggle={columnFilters}
      showColumnVisibility={columnVisibility}
      showDensity={densityToggle}
      showFullScreen={fullScreenToggle}
      exportEnabled={exportEnabled}
      isExporting={exportUtils.isExporting}
      onExportClick={() => onExportClick(table)}
      extra={props.renderTopRightToolbar?.(table)}
    />
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
