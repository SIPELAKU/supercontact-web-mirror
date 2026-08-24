import { useState, useCallback } from 'react';
import { MRT_TableInstance } from 'material-react-table';
import { format } from 'date-fns';
import { SuperTableCallbacks, SuperTableState } from '../types';

interface UseTableExportParams<TData extends object> {
  enabled: boolean;
  isManual: boolean; // manualPagination = true
  tableId?: string;
  onExportRequest?: SuperTableCallbacks<TData>['onExportRequest'];
  currentState: SuperTableState;
}

export interface UseTableExportReturn<TData extends object> {
  exportToExcel: (table: MRT_TableInstance<TData>) => Promise<void>;
  exportToCsv: (table: MRT_TableInstance<TData>) => Promise<void>;
  isExporting: boolean;
}

export function useTableExport<TData extends object>({
  enabled,
  isManual,
  tableId,
  onExportRequest,
  currentState,
}: UseTableExportParams<TData>): UseTableExportReturn<TData> {
  const [isExporting, setIsExporting] = useState(false);

  // Fungsi helper sentral export ke SheetJS (AOA).
  //
  // `xlsx` is imported DYNAMICALLY, not at module scope. SuperTable is used by
  // ~66 screens, so a static import put the whole ~400 kB SheetJS bundle in
  // the first load of every table route (they measured ~570 kB vs ~230 kB for
  // non-table routes) purely for an Export button most sessions never press.
  // Loading it here means the cost is paid on the click that needs it.
  const executeExport = async (
    table: MRT_TableInstance<TData>,
    rowsData: TData[],
    type: 'csv' | 'excel'
  ) => {
    const XLSX = await import('xlsx');
    // 1. Ambil kolom yang SEMUA terekspos ke layar viewer
    // Termasuk menghiraukan "select baris" dan "aksi kebab menu"
    const visibleColumns = table
      .getVisibleFlatColumns()
      .filter(
        (col) =>
          col.id !== 'mrt-row-select' &&
          col.id !== 'mrt-row-actions' &&
          col.id !== 'mrt-row-expand' &&
          col.id !== 'actions'
      );

    // 2. Headings Text Baris Pertama
    const headers = visibleColumns.map((col) =>
      typeof col.columnDef.header === 'string'
        ? col.columnDef.header
        : col.id
    );

    // 3. Mapping data ke 2D array baris kolom
    const dataRows = rowsData.map((row) =>
      visibleColumns.map((col) => {
        // Ambil val via accessorKey/accessorFn lewat method instan MRT (jika tersedia di baris cache)
        // Kalau data dilempar langsung via Server-Side, fallback baca object row raw
        const val = typeof row === 'object' && (col.columnDef as any).accessorKey 
            ? (row as any)[(col.columnDef as any).accessorKey as string]
            : typeof row === 'object' && typeof (col.columnDef as any).accessorFn === 'function'
            ? (col.columnDef as any).accessorFn(row)
            : (row as any)?.[col.id]; // fallback ultimate
            
        // Type casting for Excel cell comfort readability
        if (val instanceof Date) return format(val, 'dd/MM/yyyy HH:mm');
        if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
          try {
            return format(new Date(val), 'dd/MM/yyyy HH:mm');
          } catch { return val; }
        }
        if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
        if (Array.isArray(val)) return val.join(', ');
        
        if (val === null || val === undefined) return '';

        return val;
      })
    );

    // 4. Transform ke format array of arrays SheetJS
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Ekspor');

    // 5. Generate fileName + Date format
    const timeStamp = format(new Date(), 'yyyyMMdd_HHmm');
    const fileName = `${tableId || 'Export_Tabel'}_${timeStamp}`;

    // 6. Write to File
    if (type === 'excel') {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
    }
  };

  const startExportProcess = useCallback(
    async (table: MRT_TableInstance<TData>, type: 'csv' | 'excel') => {
      if (!enabled) return;
      setIsExporting(true);

      try {
        let finalDataToExport: TData[] = [];

        if (isManual && onExportRequest) {
          // Server-Side: Tembak ke API buat dapetin seluruh baris data full (all pages)
          const serverData = await onExportRequest({
            format: type,
            currentState,
          });
          if (serverData && Array.isArray(serverData)) {
            finalDataToExport = serverData;
          }
        } else if (!isManual) {
          // Client-Side: Cukup ambil data yang sudah difilter oleh react-table internal
          finalDataToExport = table.getFilteredRowModel().rows.map((r) => r.original);
        }

        if (finalDataToExport.length === 0) {
           console.warn("[SuperTable] Data ekspor kosong atau fetch server gagal.");
        }

        // MUST be awaited: executeExport now loads xlsx on demand, so without
        // this the `finally` below clears the spinner before the file is
        // written, and any failure inside becomes an unhandled rejection
        // instead of hitting the catch.
        await executeExport(table, finalDataToExport, type);
      } catch (error) {
        console.error(`[SuperTable Export] Gagal melakukan export ${type}`, error);
      } finally {
        setIsExporting(false);
      }
    },
    [enabled, isManual, onExportRequest, currentState]
  );

  const exportToExcel = useCallback((table: MRT_TableInstance<TData>) => startExportProcess(table, 'excel'), [startExportProcess]);
  const exportToCsv = useCallback((table: MRT_TableInstance<TData>) => startExportProcess(table, 'csv'), [startExportProcess]);

  return { exportToExcel, exportToCsv, isExporting };
}
