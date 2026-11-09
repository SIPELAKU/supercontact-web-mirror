// lib/hooks/useDuplicateChoices.ts
//
// Which source the user picked for every field that differs, shared by the
// duplicate dialogs: Add Contact (existing / incoming), the import pause
// (FE-3) and duplicate rows in an import file (FE-6, one source per row).
// Nothing is preselected: a dialog's confirm button waits for `missing` to be
// empty, so no value is overwritten unseen.

import { useCallback, useEffect, useMemo, useState } from "react";
import { missingChoices } from "@/lib/utils/contactDuplicate";

// `initial`: choices made earlier, e.g. when a file duplicate is reopened.
export function useDuplicateChoices<K extends string = string>(
  fields: string[],
  resetKey: unknown,
  initial?: Record<string, K>,
) {
  const [chosen, setChosen] = useState<Record<string, K>>(initial ?? {});

  // A new duplicate starts with no choices, or the ones it had.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `initial` is read only when the duplicate changes
  useEffect(() => setChosen(initial ?? {}), [resetKey]);

  const choose = useCallback((field: string, source: K) => {
    setChosen((prev) => ({ ...prev, [field]: source }));
  }, []);

  const missing = useMemo(() => missingChoices(fields, chosen), [fields, chosen]);

  return { chosen, choose, missing };
}
