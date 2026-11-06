// components/admin/blueprints/blueprintVariables.ts
//
// The Setup Cepat company-data fields (a blueprint's `variables`). Only these
// are asked before the install; the KB articles' own data (ALAMAT_PUSAT, ...)
// is filled once, after it, in the Checklist Aktivasi panel - one place per
// piece of data, never asked twice.

import type { BlueprintVariable } from "@/lib/types/IndustryBlueprint";

const isBlank = (values: Record<string, string>, key: string) => !(values[key] || "").trim();

/** Required fields (NAMA_PERUSAHAAN) still blank: the install waits for them. */
export function missingRequired(
    fields: BlueprintVariable[],
    values: Record<string, string>
): BlueprintVariable[] {
    return fields.filter((v) => v.required && isBlank(values, v.key));
}

/** Optional fields left blank: allowed, they stay visible as {{TANDA}}. */
export function blankOptional(fields: BlueprintVariable[], values: Record<string, string>): string[] {
    return fields.filter((v) => !v.required && isBlank(values, v.key)).map((v) => v.key);
}
