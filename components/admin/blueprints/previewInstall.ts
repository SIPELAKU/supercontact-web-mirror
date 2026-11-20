// components/admin/blueprints/previewInstall.ts
//
// A preview cannot count the knowledge base: the BE does not run the KB
// installer on a dry run (it only names the categories it would create), so
// that module always reports 0 created. Going by the totals alone disabled
// "Pasang" whenever everything else was already installed - a deleted
// knowledge base could never be put back from Setup Cepat. The KB install
// skips whatever already exists, so letting it run is safe.

import type { BlueprintInstallReport } from "@/lib/types/IndustryBlueprint";

//
// `renames` are the stage renames of the "Tahapan penjualan" plan: they change
// the company's data without creating anything, so a plan made only of
// renames must still be installable.
export function previewCanInstall(preview: Pick<BlueprintInstallReport, "modules" | "totals">, renames = 0): boolean {
  return preview.totals.created > 0 || renames > 0 || Boolean(preview.modules?.knowledge_base);
}

/** The install button's label: the KB has no count until it actually runs. */
export function installButtonLabel(preview: Pick<BlueprintInstallReport, "modules" | "totals">, renames = 0): string {
  if (preview.totals.created > 0) return `Pasang ${preview.totals.created} item`;
  if (renames > 0) return "Pasang perubahan tahapan";
  return preview.modules?.knowledge_base ? "Pasang Knowledge Base" : "Pasang 0 item";
}
