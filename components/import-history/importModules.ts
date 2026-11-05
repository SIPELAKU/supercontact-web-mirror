// components/import-history/importModules.ts
//
// How each module opens its Import History, so a page and the import dock
// (FE-1) open the same view. Only Contacts is followed by the dock for now
// (scope 2026-11-05: Contact only); add a module here when it is.

import type { ImportModule } from "@/lib/api/import-jobs";

export interface ImportHistoryConfig {
  targetFilter: string[];
  // localStorage key of the module's Auto-refresh choice.
  storageKey: string;
}

export const IMPORT_HISTORY_CONFIG: Partial<Record<ImportModule, ImportHistoryConfig>> = {
  contacts: { targetFilter: ["contact"], storageKey: "import_interval_contact" },
};
