// lib/store/importWatch.ts
"use client";

// The imports the floating progress (FE-1) follows, on every page and across
// reloads (localStorage `smartsales_import_watch`). One entry per imported
// file, holding the jobs of all its parts (FE-5). Also two signals that are
// not stored: which module's Import History is open (the dock hides then)
// and a counter per module that goes up when a followed job changes its data,
// so that module's page can refresh its list.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ImportModule } from "@/lib/api/import-jobs";
import type { ImportView } from "@/lib/utils/importModules";

export interface WatchedImport {
  // The first part's job id: unique, and stable across reloads.
  id: string;
  module: ImportModule;
  // Which page imported it, so Import History opens the view that lists it.
  view?: ImportView;
  // The mailing list or group it went into.
  groupIds?: string[];
  fileName: string;
  jobIds: string[];
}

/** Entries saved before `view` existed can only be Contacts. */
export function watchedView(item: Pick<WatchedImport, "view">): ImportView {
  return item.view ?? "contacts";
}

// Older entries are dropped beyond this, so a forgotten × never piles up.
export const MAX_WATCHED_IMPORTS = 5;

/** Adds a file at the top; the same file again replaces its entry. */
export function addWatchedImport(list: WatchedImport[], entry: Omit<WatchedImport, "id">): WatchedImport[] {
  if (entry.jobIds.length === 0) return list;
  const next: WatchedImport = { ...entry, id: entry.jobIds[0] };
  return [next, ...list.filter((item) => item.id !== next.id)].slice(0, MAX_WATCHED_IMPORTS);
}

/** Forgets one job (e.g. the API no longer has it); a file with no jobs left goes too. */
export function dropWatchedJob(list: WatchedImport[], jobId: string): WatchedImport[] {
  return list
    .map((item) => ({ ...item, jobIds: item.jobIds.filter((id) => id !== jobId) }))
    .filter((item) => item.jobIds.length > 0);
}

interface ImportWatchState {
  watched: WatchedImport[];
  historyOpen: Partial<Record<ImportModule, boolean>>;
  dataVersion: Partial<Record<ImportModule, number>>;
  watch: (entry: Omit<WatchedImport, "id">) => void;
  unwatch: (id: string) => void;
  dropJob: (jobId: string) => void;
  setHistoryOpen: (module: ImportModule, open: boolean) => void;
  markDataChanged: (module: ImportModule) => void;
}

export const useImportWatch = create<ImportWatchState>()(
  persist(
    (set) => ({
      watched: [],
      historyOpen: {},
      dataVersion: {},
      watch: (entry) => set((state) => ({ watched: addWatchedImport(state.watched, entry) })),
      unwatch: (id) => set((state) => ({ watched: state.watched.filter((item) => item.id !== id) })),
      dropJob: (jobId) => set((state) => ({ watched: dropWatchedJob(state.watched, jobId) })),
      setHistoryOpen: (module, open) =>
        set((state) =>
          Boolean(state.historyOpen[module]) === open ? state : { historyOpen: { ...state.historyOpen, [module]: open } },
        ),
      markDataChanged: (module) =>
        set((state) => ({ dataVersion: { ...state.dataVersion, [module]: (state.dataVersion[module] ?? 0) + 1 } })),
    }),
    {
      name: "smartsales_import_watch",
      storage: createJSONStorage(() => localStorage),
      // Only the list survives a reload; the signals belong to this page.
      partialize: (state) => ({ watched: state.watched }),
    },
  ),
);
