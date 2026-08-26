import { useCallback, useState } from 'react';
import { MRT_TableInstance } from 'material-react-table';
import { format as formatDate } from 'date-fns';
import { notify } from '@/lib/notifications';
import { SuperTableCallbacks, SuperTableState } from '../types';
import type { ExportFormat, ExportScope } from '../components/ExportDialog';

interface UseTableExportParams<TData extends object> {
  enabled: boolean;
  isManual: boolean; // manualPagination = true
  tableId?: string;
  /** Human-readable base for the file name; falls back to the tableId. */
  exportFileName?: string;
  onExportRequest?: SuperTableCallbacks<TData>['onExportRequest'];
  currentState: SuperTableState;
}

export interface UseTableExportReturn<TData extends object> {
  runExport: (
    table: MRT_TableInstance<TData>,
    options: { scope: ExportScope; format: ExportFormat; columnIds: string[] }
  ) => Promise<void>;
  isExporting: boolean;
  progress: [number, number] | null;
}

/** `subscribers-table` → `Subscribers`. Falls back to a generic label. */
function humaniseFileBase(raw?: string): string {
  if (!raw) return 'Export';
  return (
    raw
      .replace(/[-_]?table$/i, '')
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Export'
  );
}

export function useTableExport<TData extends object>({
  enabled,
  isManual,
  tableId,
  exportFileName,
  onExportRequest,
  currentState,
}: UseTableExportParams<TData>): UseTableExportReturn<TData> {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);

  // `xlsx` is imported DYNAMICALLY, not at module scope. SuperTable is used by
  // ~66 screens, so a static import put the whole ~400 kB SheetJS bundle in
  // the first load of every table route (they measured ~570 kB vs ~230 kB for
  // non-table routes) purely for an Export button most sessions never press.
  // Loading it here means the cost is paid on the click that needs it.
  const writeFile = async (
    table: MRT_TableInstance<TData>,
    rowsData: TData[],
    columnIds: string[],
    type: ExportFormat
  ) => {
    const XLSX = await import('xlsx');

    // Honour the user's column picks, but keep the table's own column order
    // and skip MRT's structural columns plus any hand-rolled "actions"
    // column — buttons don't belong in a spreadsheet.
    const chosen = new Set(columnIds);
    const columns = table
      .getAllLeafColumns()
      .filter(
        (col) =>
          chosen.has(col.id) &&
          col.id !== 'mrt-row-select' &&
          col.id !== 'mrt-row-actions' &&
          col.id !== 'mrt-row-expand' &&
          col.id !== 'actions'
      );

    const headers = columns.map((col) =>
      typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
    );

    const dataRows = rowsData.map((row) =>
      columns.map((col) => {
        const def = col.columnDef as any;
        // Server-side rows arrive as plain objects, so read them directly
        // rather than through MRT's row cache (which only holds the page).
        const val =
          typeof row === 'object' && def.accessorKey
            ? (row as any)[def.accessorKey as string]
            : typeof row === 'object' && typeof def.accessorFn === 'function'
              ? def.accessorFn(row)
              : (row as any)?.[col.id];

        if (val instanceof Date) return formatDate(val, 'dd MMM yyyy HH:mm');
        if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
          try {
            return formatDate(new Date(val), 'dd MMM yyyy HH:mm');
          } catch {
            return val;
          }
        }
        // The authenticated app is English-only, and these files leave the
        // product — they used to say "Ya"/"Tidak".
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (Array.isArray(val)) return val.join(', ');
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);

        return val;
      })
    );

    const base = humaniseFileBase(exportFileName ?? tableId);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    // Excel rejects sheet names over 31 chars or containing []:*?/\
    XLSX.utils.book_append_sheet(wb, ws, base.replace(/[[\]:*?/\\]/g, '').slice(0, 31) || 'Data');

    const fileName = `${base.replace(/\s+/g, '_')}_${formatDate(new Date(), 'yyyy-MM-dd')}`;
    if (type === 'excel') {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
    }
    return dataRows.length;
  };

  const runExport = useCallback(
    async (
      table: MRT_TableInstance<TData>,
      options: { scope: ExportScope; format: ExportFormat; columnIds: string[] }
    ) => {
      if (!enabled) return;
      setIsExporting(true);
      setProgress(null);

      try {
        let rows: TData[] = [];

        if (options.scope === 'selected') {
          rows = table.getSelectedRowModel().rows.map((r) => r.original);
        } else if (options.scope === 'page') {
          rows = table.getRowModel().rows.map((r) => r.original);
        } else if (isManual && onExportRequest) {
          // Server-side: ask the page to walk every page of the current query.
          const serverData = await onExportRequest({
            format: options.format,
            currentState,
            onProgress: (fetched: number, total: number) =>
              setProgress([fetched, total]),
          } as any);
          if (serverData && Array.isArray(serverData)) rows = serverData;
        } else {
          rows = table.getFilteredRowModel().rows.map((r) => r.original);
        }

        if (rows.length === 0) {
          notify.warning('Nothing to export', {
            description: 'No rows matched the selection you chose.',
          });
          return;
        }

        const written = await writeFile(table, rows, options.columnIds, options.format);
        notify.success(
          `Exported ${written.toLocaleString()} row${written === 1 ? '' : 's'}`,
          {
            description: `Saved as ${options.format === 'excel' ? '.xlsx' : '.csv'}.`,
          }
        );
      } catch (error: any) {
        // This used to be console.error only, so a failed export looked
        // identical to a successful one that produced no download.
        console.error('[SuperTable Export] failed', error);
        notify.error('Export failed', {
          description:
            error?.message || 'Could not build the file. Please try again.',
        });
      } finally {
        setIsExporting(false);
        setProgress(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, isManual, onExportRequest, currentState, exportFileName, tableId]
  );

  return { runExport, isExporting, progress };
}
