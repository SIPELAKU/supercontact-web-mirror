import { useState, useEffect, useCallback } from 'react';
import { MRT_ColumnFiltersState } from 'material-react-table';

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: MRT_ColumnFiltersState;
  globalFilter: string;
  createdAt: string;
}

interface UseSavedFiltersParams {
  enabled: boolean;
  tableId: string;
  currentFilters: MRT_ColumnFiltersState;
  currentGlobalFilter: string;
  onApplyPreset: (preset: SavedFilterPreset) => void;
}

export function useSavedFilters({
  enabled,
  tableId,
  currentFilters,
  currentGlobalFilter,
  onApplyPreset,
}: UseSavedFiltersParams) {
  const [presets, setPresets] = useState<SavedFilterPreset[]>([]);

  const storageKey = `st_sf_${tableId}`;

  // Read dari localStorage waktu awal
  useEffect(() => {
    if (!enabled || !tableId) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPresets(JSON.parse(stored).presets || []);
      }
    } catch {
      console.warn(`[SuperTable] Gagal memuat filter lokal dari ${storageKey}`);
    }
  }, [enabled, tableId, storageKey]);

  // Simpan Preset baru
  const savePreset = useCallback(
    (name: string) => {
      if (!enabled || !tableId) return;

      const newPreset: SavedFilterPreset = {
        id: crypto.randomUUID?.() || Date.now().toString(36),
        name,
        filters: currentFilters,
        globalFilter: currentGlobalFilter,
        createdAt: new Date().toISOString(),
      };

      setPresets((prev) => {
        // Ambil 4 yang terakhir + 1 yang baru agar max jadi 5
        const updated = [newPreset, ...prev].slice(0, 5); 
        localStorage.setItem(storageKey, JSON.stringify({ presets: updated }));
        return updated;
      });
    },
    [enabled, tableId, currentFilters, currentGlobalFilter, storageKey]
  );

  // Hapus Preset tertentu
  const deletePreset = useCallback(
    (id: string) => {
      if (!enabled || !tableId) return;

      setPresets((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem(storageKey, JSON.stringify({ presets: updated }));
        return updated;
      });
    },
    [enabled, tableId, storageKey]
  );

  // Pakai Preset 
  const applyPreset = useCallback(
    (preset: SavedFilterPreset) => {
      onApplyPreset(preset);
    },
    [onApplyPreset]
  );

  // Boolean penanda apakah kita tdk melebihi jatah maksimum preview list
  const canSaveMore = presets.length < 5;

  return {
    presets,
    savePreset,
    deletePreset,
    applyPreset,
    canSaveMore,
  };
}
