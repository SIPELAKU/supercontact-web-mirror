import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SuperTableState } from '../types';
import { MRT_SortingState, MRT_ColumnFiltersState } from 'material-react-table';

interface UseUrlSyncParams {
  enabled: boolean;
  tableId: string;
  state: SuperTableState;
  onRestoreState: (state: Partial<SuperTableState>) => void;
}

export function useUrlSync({
  enabled,
  tableId,
  state,
  onRestoreState,
}: UseUrlSyncParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isRestored = useRef(false);
  const [lastSavedUrl, setLastSavedUrl] = useState('');

  // 1. MEMBACA STATE DARI URL (saat mount)
  useEffect(() => {
    if (!enabled || !tableId) return;
    if (isRestored.current) return;

    const restoredState: Partial<SuperTableState> = {};

    // p: pageIndex, ps: pageSize
    const p = searchParams.get(`${tableId}_p`);
    const ps = searchParams.get(`${tableId}_ps`);
    if (p || ps) {
      restoredState.pagination = {
        pageIndex: p ? parseInt(p, 10) - 1 : 0, // di URL page 1 berarti index 0
        pageSize: ps ? parseInt(ps, 10) : 10,
      };
    }

    // s: sorting (contoh format "name:asc,date:desc")
    const s = searchParams.get(`${tableId}_s`);
    if (s) {
      const parsedSorting: MRT_SortingState = s.split(',').map((sortPart) => {
        const [id, descStr] = sortPart.split(':');
        return { id, desc: descStr === 'desc' };
      });
      restoredState.sorting = parsedSorting;
    }

    // gf: global filter
    const gf = searchParams.get(`${tableId}_gf`);
    if (gf) {
      restoredState.globalFilter = decodeURIComponent(gf);
    }

    // cf: column filters (contoh fomat "status:active,type:premium", array format "industry:Tech|Finance")
    const cf = searchParams.get(`${tableId}_cf`);
    if (cf) {
      const parsedFilters: MRT_ColumnFiltersState = cf.split(',').map((f) => {
        const colonIdx = f.indexOf(':');
        const id = f.substring(0, colonIdx);
        const rawVal = f.substring(colonIdx + 1);

        // Array jika mengandung "|"
        if (rawVal.includes('|')) {
          const value = rawVal.split('|').map(decodeURIComponent);
          return { id, value };
        }

        return { id, value: decodeURIComponent(rawVal) };
      });
      restoredState.columnFilters = parsedFilters;
    }

    // g: grouping (misal "status,type")
    const g = searchParams.get(`${tableId}_g`);
    if (g) {
      restoredState.grouping = g.split(',');
    }

    // Trigger update bila ada query tersimpan
    if (Object.keys(restoredState).length > 0) {
      onRestoreState(restoredState);
    }

    isRestored.current = true;
  }, [enabled, tableId, searchParams, onRestoreState]);

  // 2. MENULIS STATE KEDALAM URL BROWSER HISTORY
  useEffect(() => {
    if (!enabled || !tableId) return;
    if (!isRestored.current) return;

    const serializeToUrl = setTimeout(() => {
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

      // Pagination
      if (state.pagination.pageIndex > 0) {
        currentParams.set(`${tableId}_p`, (state.pagination.pageIndex + 1).toString());
      } else {
        currentParams.delete(`${tableId}_p`);
      }
      if (state.pagination.pageSize !== 10) {
         currentParams.set(`${tableId}_ps`, state.pagination.pageSize.toString());
      } else {
         currentParams.delete(`${tableId}_ps`);
      }

      // Sort
      if (state.sorting.length > 0) {
        const sortString = state.sorting
          .map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
          .join(',');
        currentParams.set(`${tableId}_s`, sortString);
      } else {
        currentParams.delete(`${tableId}_s`);
      }

      // Filter global
      if (state.globalFilter) {
        currentParams.set(`${tableId}_gf`, encodeURIComponent(state.globalFilter));
      } else {
        currentParams.delete(`${tableId}_gf`);
      }

      // Column filters
      if (state.columnFilters.length > 0) {
        const filterStr = state.columnFilters
          .map(({ id, value }) => {
            if (Array.isArray(value)) {
              return `${id}:${value.map((v) => encodeURIComponent(String(v))).join('|')}`;
            }
            return `${id}:${encodeURIComponent(String(value))}`;
          })
          .join(',');
        currentParams.set(`${tableId}_cf`, filterStr);
      } else {
        currentParams.delete(`${tableId}_cf`);
      }

      // Grouping
      if (state.grouping.length > 0) {
        currentParams.set(`${tableId}_g`, state.grouping.join(','));
      } else {
         currentParams.delete(`${tableId}_g`);
      }

      const queryString = currentParams.toString();
      const generatedUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Cuma lakukan replace url di history kalau query string memang beda dari yang terakhir, cegah call berulang
      if (lastSavedUrl !== generatedUrl) {
         router.replace(generatedUrl, { scroll: false });
         setLastSavedUrl(generatedUrl);
      }
    }, 300); // 300ms debounce push url state filter/search

    return () => clearTimeout(serializeToUrl);
  }, [enabled, tableId, state, searchParams, pathname, router, lastSavedUrl]);
}
