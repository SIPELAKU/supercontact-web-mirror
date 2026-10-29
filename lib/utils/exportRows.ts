// lib/utils/exportRows.ts
//
// A CSV or Excel download built from plain rows, for exports that are not a
// SuperTable table export. `xlsx` is imported on the click rather than at
// module scope, as in SuperTable's useTableExport: it is ~400 kB the page
// should not pay for until someone actually exports.

import { format } from 'date-fns';
import type * as XLSXModule from 'xlsx';

export type ExportFileFormat = 'csv' | 'excel';

export const EXPORT_FILE_EXTENSION: Record<ExportFileFormat, string> = {
  csv: 'csv',
  excel: 'xlsx',
};

/** "sent" -> "Sent": a status as file names, menus and messages show it. */
export const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

/**
 * `<Prefix>_<name>_<Label>_<yyyy-MM-dd>.<ext>`, e.g.
 * `Broadcast_Promo_Oktober_Sent_2026-10-24.xlsx`. The name keeps only letters
 * and digits, so the file saves anywhere; nothing left = `Untitled`.
 */
export function exportFileName(
  prefix: string,
  name: string,
  label: string,
  fileFormat: ExportFileFormat,
  date = new Date()
): string {
  const safeName = name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Untitled';
  return `${prefix}_${safeName}_${label}_${format(date, 'yyyy-MM-dd')}.${EXPORT_FILE_EXTENSION[fileFormat]}`;
}

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/**
 * The header row, then one row per item: the cells exactly as the file holds
 * them. Missing values become empty cells; text is trimmed, since stray spaces
 * from data entry are invisible in a spreadsheet but break sorting and lookups.
 */
export function toRows<T>(columns: ExportColumn<T>[], rows: T[]): (string | number)[][] {
  const cell = (value: string | number | null | undefined) =>
    typeof value === 'string' ? value.trim() : value ?? '';
  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => cell(column.value(row)))),
  ];
}

/** Excel column widths, in characters: the longest cell plus some air, within limits. */
export function columnWidths(table: (string | number)[][]): { wch: number }[] {
  const longest: number[] = [];
  for (const row of table) {
    row.forEach((cell, i) => {
      longest[i] = Math.max(longest[i] ?? 0, String(cell).length);
    });
  }
  return longest.map((length) => ({ wch: Math.min(Math.max(length + 2, 8), 50) }));
}

/**
 * The workbook both formats are written from. Excel also gets columns sized
 * to their content and a filter on the header row (CSV has room for neither,
 * so they are simply dropped there). Text cells stay text, so a phone number
 * keeps its leading + and every digit instead of turning into 6.29E+12.
 */
export function buildWorkbook<T>(
  XLSX: typeof XLSXModule,
  columns: ExportColumn<T>[],
  rows: T[],
  sheetName = 'Data'
) {
  const table = toRows(columns, rows);
  const sheet = XLSX.utils.aoa_to_sheet(table);
  sheet['!cols'] = columnWidths(table);
  if (sheet['!ref']) sheet['!autofilter'] = { ref: sheet['!ref'] };

  const book = XLSX.utils.book_new();
  // Excel rejects sheet names over 31 characters or containing []:*?/\
  const safeName = sheetName.replace(/[[\]:*?/\\]/g, '').slice(0, 31) || 'Data';
  XLSX.utils.book_append_sheet(book, sheet, safeName);
  return book;
}

/** Builds the file and hands it to the browser to save as `fileName`. */
export async function downloadRows<T>(
  fileName: string,
  columns: ExportColumn<T>[],
  rows: T[],
  format: ExportFileFormat,
  sheetName?: string
) {
  const XLSX = await import('xlsx');
  const book = buildWorkbook(XLSX, columns, rows, sheetName);
  XLSX.writeFile(book, fileName, { bookType: format === 'excel' ? 'xlsx' : 'csv' });
}
