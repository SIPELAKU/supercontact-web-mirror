import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
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
import { RowActionsCell } from '../components/RowActionsCell';
import { FilterPanel } from '../components/FilterPanel';
import { SearchField } from '../components/SearchField';
import { SortControl } from '../components/SortControl';
import { TableFooter } from '../components/TableFooter';

/**
 * Everything the lazy-loading footer needs, computed by SuperTable and handed
 * down. Kept as one object so the config signature does not grow a dozen
 * positional arguments.
 */
export interface TableLazyConfig<TData extends object> {
  mode: 'lazy' | 'pages' | 'none';
  /** Rows to hand MRT: accumulated pages on a server table, raw data otherwise. */
  rows: TData[];
  /** True when the parent is fetching pages from an API. */
  isServer: boolean;
  loadedCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  autoLoadPaused: boolean;
  /** Attached to the scrolling table container; drives auto-load. */
  onContainerScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  entityLabel: string;
  virtualize: boolean;
  /** Rows shown so far on a client-side table (`pageSize` for MRT's engine). */
  clientVisibleCount: number;
}

export function useTableConfig<TData extends object>(
  props: SuperTableProps<TData>,
  tableState: ReturnType<typeof useTableState>,
  exportUtils: UseTableExportReturn<TData>,
  savedFilters: ReturnType<typeof useSavedFilters>,
  onExportClick: (table: MRT_TableInstance<TData>) => void,
  lazy: TableLazyConfig<TData>
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
    rowSelection = 'none',
    inlineEditing = false,
    maxHeight = '70vh',
    stickyHeader = true,

    // Filtering Defaults
    facetedValues = true,
    filterSwitching = true,
    popoverFilters = false,
  } = props.features || {};

  const isLazy = lazy.mode === 'lazy';
  const isPaged = lazy.mode === 'pages';

  // The declarative `filters` prop and MRT's column-filter subheader write to
  // the same state, so showing both would give the user two controls for one
  // value - and they would disagree the moment either is used. The declarative
  // one wins because it is the only one that can say WHICH filters are on.
  const useDeclarativeFilters = (props.filters?.length ?? 0) > 0;
  const mrtColumnFilters = columnFilters && !useDeclarativeFilters;

  if (process.env.NODE_ENV !== 'production') {
    const id = props.tableId ? ` ${props.tableId}` : '';
    if (props.renderFilters && (columnFilters || useDeclarativeFilters)) {
      console.warn(
        `[SuperTable${id}] renderFilters is set together with declarative filters. ` +
          'Pick one - two filter UIs on the same table give the user two ways ' +
          'to filter that do not agree. Prefer the `filters` prop.'
      );
    }
    if (columnFilters && useDeclarativeFilters) {
      console.warn(
        `[SuperTable${id}] features.columnFilters is ignored because \`filters\` ` +
          'is set. Remove the flag - the declarative filters replace it.'
      );
    }
  }

  // The accessible entry point into a record: ONE real <a> per row, whose
  // accessible name is the record's own title. Deliberately not role="link"
  // on the <tr> - that breaks the rowgroup>row>cell tree and nests the
  // selection checkbox inside a link.
  const columns = props.primaryColumn
    ? (props.columns || []).map((col: any) => {
        if (col.accessorKey !== props.primaryColumn!.accessorKey) return col;
        const Original = col.Cell;
        return {
          ...col,
          Cell: (cellProps: any) => (
            <Link
              href={props.primaryColumn!.href(cellProps.row.original)}
              className="font-medium text-[color:var(--brand,#5479EE)] hover:underline"
            >
              {Original
                ? Original(cellProps)
                : String(cellProps.cell.getValue() ?? '')}
            </Link>
          ),
        };
      })
    : props.columns || [];

  // ─── PAGINATION MODE ──────────────────────────────────────────────────
  // Server lazy: MRT's paging engine is switched OFF entirely and it renders
  //   every accumulated row we hand it. Slicing is nobody's job any more.
  // Client lazy: the engine stays ON, because it is what filters and sorts the
  //   full set before anything is shown - but the "page" is the whole visible
  //   run (rows 1..N), so growing the list is just growing pageSize.
  const enginePagination = isPaged || (isLazy && !lazy.isServer);

  const paginationState =
    isLazy && !lazy.isServer
      ? { pageIndex: 0, pageSize: lazy.clientVisibleCount }
      : tableState.pagination;

  // 2. BUILD CORE OPTIONS
  const mrtConfig: Partial<MRT_TableOptions<TData>> = {
    // ─── Data & State Pointers ────────
    data: lazy.rows,
    columns,
    layoutMode: 'semantic',
    state: {
      // Skeletons are for an EMPTY table waiting on its first rows. Once rows
      // are on screen, `isLoading` would blank all of them - so loading batch
      // four would wipe batches one to three and jump the scroll position to
      // the top. From then on the linear progress bar is the whole story.
      isLoading: props.isLoading && lazy.loadedCount === 0,
      showProgressBars: props.isFetching || props.isLoading,

      pagination: paginationState,
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
      // Search is rendered by SuperTable's own SearchField now, so MRT's
      // built-in field must never mount. It is `mountOnEnter`/`unmountOnExit`
      // inside a Collapse, so `false` costs one zero-width div and nothing else.
      showGlobalFilter: false,
      showColumnFilters: mrtColumnFilters,
      ...props.initialState,
    },

    // ─── Force Native Internal Columns Size (FIX Spacer Bug) ─
    displayColumnDefOptions: {
      'mrt-row-actions': {
        // MRT turns `size` into a hard min-width. Six 26px IconButtons forced
        // ~176px; one kebab needs ~56.
        size: props.rowActions ? 56 : 80,
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
    // With lazy loading the table holds many pages at once, so the count MRT
    // needs is no longer "rows in this response" - it is the whole result set.
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
    enableColumnFilters: mrtColumnFilters,
    enableGrouping: grouping,
    enableDensityToggle: densityToggle,
    enableFullScreenToggle: fullScreenToggle,
    enablePagination: enginePagination,
    enableStickyHeader: stickyHeader,
    enableRowSelection: rowSelection !== 'none',
    enableSelectAll: rowSelection === 'multi',

    // Opt-in, and read once at mount - MRT memoises it with an empty dep
    // array, so it cannot be flipped later based on how many rows piled up.
    enableRowVirtualization: lazy.virtualize,
    rowVirtualizerOptions: lazy.virtualize ? { overscan: 8 } : undefined,

    // ─── Pagination UI ───────────────
    // In lazy mode the numbered paginator is replaced wholesale by the footer
    // in renderBottomToolbarCustomActions; the engine may still be running
    // (client-side tables need it to filter and sort), it just has no UI.
    positionPagination: isPaged ? 'bottom' : 'none',
    muiPaginationProps: {
      rowsPerPageOptions: lazy.pageSizeOptions,
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
    // On a client-side lazy table the pagination state is derived (page 0,
    // pageSize = rows revealed so far) and nothing in the UI changes it, so
    // letting MRT echo it back would only fight the reveal - see the note on
    // `clientVisibleCount` in SuperTable.
    onPaginationChange:
      isLazy && !lazy.isServer ? undefined : tableState.setPagination,
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
  if (props.renderRowActions || props.rowActions || inlineEditing === 'row') {
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

      // Declarative form wins: it is the one SuperTable can render as a
      // menu on desktop and a labelled bottom sheet on a phone.
      if (props.rowActions) {
        const list =
          typeof props.rowActions === 'function'
            ? props.rowActions(row.original)
            : props.rowActions;
        return <RowActionsCell row={row.original} table={table} actions={list} />;
      }

      const actions = props.renderRowActions?.({ row, table });
      if (!actions) return null;

      // Wrapped once here so all ~30 callers are safe at the same time; a
      // caller no longer has to remember stopPropagation on every button.
      return (
        <Box data-st-no-row-click sx={{ display: 'contents' }}>
          {actions}
        </Box>
      );
    };
  }

  // ─── 4. CUSTOM SLOTS, BULK ACTIONS, & EMPTY STATES ────────────────
  // MRT hands us ONE node for the entire left half of the toolbar
  // (renderTopToolbarCustomActions = the first child of MRT_TopToolbar).
  // Four things compete for it:
  //   1. filters (declarative)  - the Filters button and its active chips
  //   2. renderFilters          - the legacy page-owned filter slot
  //   3. renderTopLeftToolbar   - Add / Import / Print buttons
  //   4. BulkActionsBar         - takes over (3) ONLY, while rows are selected
  //
  // Pinning filters ahead of the action buttons is the whole point: put them
  // in renderTopLeftToolbar instead and ticking a single checkbox unmounts
  // them, hiding both the control and which filter is active exactly when
  // someone is about to run a bulk delete.
  //
  // DO NOT make the assignment below conditional. MRT computes
  // `stackAlertBanner = isMobile || !!renderTopToolbarCustomActions || ...`
  // and uses it to pick position: relative vs absolute for the toolbar row -
  // guarding this would flip every table to an absolutely positioned toolbar
  // sitting on top of the first data row.
  mrtConfig.renderTopToolbarCustomActions = ({ table }) => {
    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
    const hasSelection = selectedRows.length > 0;

    const declarativeFilters = useDeclarativeFilters ? (
      <FilterPanel
        filters={props.filters!}
        values={tableState.filterValues}
        onChange={tableState.setFilterValues}
      />
    ) : null;

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

    // No filter slot of any kind -> emit exactly what this returned before the
    // slots existed, raw `null` included, so MRT's `?? <span/>` spacer stays
    // alive and `justify-content: space-between` keeps the right-hand cluster
    // pinned right. This early return is the zero-regression story for every
    // SuperTable screen that does not opt in.
    if (!declarativeFilters && !filtersNode) return actionsNode;

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
        {declarativeFilters}
        {filtersNode}
        {actionsNode}
      </Box>
    );
  };

  // Top Right Toolbar: search, sort, column-filter toggle, Export, View.
  mrtConfig.renderToolbarInternalActions = ({ table }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      {globalFilter && (
        <SearchField
          value={tableState.globalFilter}
          onChange={tableState.setGlobalFilter}
          placeholder={props.searchPlaceholder}
          resultLabel={
            tableState.debouncedGlobalFilter
              ? `${lazy.loadedCount} ${lazy.entityLabel} cocok`
              : undefined
          }
        />
      )}
      {sorting && (
        <SortControl
          table={table}
          sorting={tableState.sorting}
          onChange={tableState.setSorting}
        />
      )}
      <TableToolbarActions
        table={table}
        showColumnFilterToggle={mrtColumnFilters}
        showColumnVisibility={columnVisibility}
        showDensity={densityToggle}
        showFullScreen={fullScreenToggle}
        exportEnabled={exportEnabled}
        isExporting={exportUtils.isExporting}
        onExportClick={() => onExportClick(table)}
        extra={props.renderTopRightToolbar?.(table)}
      />
    </Box>
  );

  // ─── LAZY FOOTER ──────────────────────────────────────────────────
  // Replaces the numbered paginator. Rendered through MRT's bottom-toolbar
  // slot, which renders regardless of `enablePagination`, so a server table
  // with the paging engine switched off still gets a footer.
  if (isLazy) {
    mrtConfig.renderBottomToolbarCustomActions = ({ table }) => {
      // A client-side table only knows its true total after MRT has filtered:
      // "240 of 12,431" must count what matches the search, not what was
      // fetched. That number exists on the instance, so it is read here rather
      // than threaded down as a prop.
      const clientTotal = lazy.isServer
        ? undefined
        : table.getFilteredRowModel().rows.length;

      const totalCount = lazy.isServer ? props.rowCount : clientTotal;
      const loadedCount = lazy.isServer
        ? lazy.loadedCount
        : Math.min(lazy.clientVisibleCount, clientTotal ?? 0);
      const hasMore = lazy.isServer
        ? lazy.hasMore
        : lazy.clientVisibleCount < (clientTotal ?? 0);

      return (
        <TableFooter
          loadedCount={loadedCount}
          totalCount={totalCount}
          hasMore={hasMore}
          isLoadingMore={lazy.isLoadingMore}
          onLoadMore={lazy.onLoadMore}
          pageSize={tableState.pagination.pageSize}
          pageSizeOptions={lazy.pageSizeOptions}
          onPageSizeChange={lazy.onPageSizeChange}
          entityLabel={lazy.entityLabel}
          autoLoadPaused={lazy.autoLoadPaused}
        />
      );
    };
  }

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
      return (
        <>
          {props.renderEmptyState({
            clearFilters: () => tableState.setFilterValues({}),
            hasActiveFilters: tableState.columnFilters.length > 0,
            hasSearch: Boolean(tableState.debouncedGlobalFilter),
          })}
        </>
      );
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
    // Auto-loading hangs off THIS element's scroll position rather than a
    // sentinel in the footer: the footer never scrolls, so a sentinel there is
    // permanently on screen and fires the moment the table mounts.
    onScroll: isLazy ? lazy.onContainerScroll : undefined,
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

  mrtConfig.muiTableBodyRowProps = ({ row, isDetailPanel }) => {
    // MRT reuses these props for the detail-panel row too. Without this, a
    // click anywhere inside an expanded panel counts as a click on the row
    // that owns it.
    if (isDetailPanel) return {};

    return {
      onClick: (e) => {
        // ONE guard, here, instead of every caller inventing its own. Before
        // this, three tables each solved it differently: a Box wrapper with
        // stopPropagation, stopPropagation sprinkled per button, and DOM
        // sniffing for `closest('button')`. Anything inside an element marked
        // `data-st-no-row-click` - the actions cell is marked for you - no
        // longer opens the row.
        if ((e.target as HTMLElement).closest?.('[data-st-no-row-click]')) return;
        props.onRowClick?.(row.original, e);
      },
      onDoubleClick: (e) => {
        if ((e.target as HTMLElement).closest?.('[data-st-no-row-click]')) return;
        props.onRowDoubleClick?.(row.original, e);
      },
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
    };
  };

  return mrtConfig;
}
