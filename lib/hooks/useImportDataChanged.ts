// lib/hooks/useImportDataChanged.ts
"use client";

import { useEffect, useRef } from "react";
import type { ImportModule } from "@/lib/api/import-jobs";
import { useImportWatch } from "@/lib/store/importWatch";

/**
 * The import dock (FE-1) saw a followed import of this module finish while the
 * page is open: `onChanged` shows its rows. Not on mount; the page loads its
 * list itself.
 */
export function useImportDataChanged(module: ImportModule, onChanged: () => void) {
  const version = useImportWatch((state) => state.dataVersion[module] ?? 0);
  const seen = useRef(version);
  const latest = useRef(onChanged);
  latest.current = onChanged;

  useEffect(() => {
    if (version === seen.current) return;
    seen.current = version;
    latest.current();
  }, [version]);
}
