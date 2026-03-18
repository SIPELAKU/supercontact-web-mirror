export { SuperTable } from './SuperTable';
export { useTableState } from './hooks/useTableState';

// -------------------------------------------------------------
// RE-EXPORT SUPER TABLE TYPE & INTERFACE UTILITIES
// -------------------------------------------------------------
export type {
  SuperTableProps,
  SuperTableFeatures,
  SuperTableState,
  SuperTableCallbacks,
  SuperTableSlots,
  SuperTableServerProps,
} from './types';

// -------------------------------------------------------------
// RE-EXPORT MRT TYPE NATIVES (FOR PARENT EASY USAGE)
// -------------------------------------------------------------
export type {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
} from './types';

// -------------------------------------------------------------
// FILTER VARIANT HELPER
// -------------------------------------------------------------
/**
 * Helper untuk set filterVariant yang tepat sesuai tipe data.
 * Developer cukup set `meta.type` di column def, SuperTable
 * otomatis assign filterVariant yang benar.
 */
export function inferFilterVariant(
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'boolean' | 'range'
): string { // string compatible untuk MRT_ColumnDef['filterVariant']
  const map: Record<string, string> = {
    text: 'text',
    number: 'range-slider',
    date: 'date-range',
    datetime: 'datetime-range',
    select: 'select',
    multiselect: 'multi-select',
    boolean: 'checkbox',
    range: 'range',
  };
  return map[type] || 'text';
}
