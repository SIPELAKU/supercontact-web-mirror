// components/admin/blueprints/kbVariables.ts
//
// The KB packs a blueprint installs carry their own {{VARIABLES}} (the
// marketing packs, ±80 each). The blueprint detail lists them apart, as
// `kb_variables`, so the company-data step can ask them too instead of leaving
// them in the articles. A pack variable the blueprint already asks (the support
// packs reuse company_name, no_wa_cs, ...) is asked once, in the blueprint's
// own section.

import type { BlueprintDetail, BlueprintVariable } from "@/lib/types/IndustryBlueprint";

/** The pack variables the blueprint's own fields do not already ask, in the
 *  order the API lists them, each key once. */
export function extraKbVariables(
    detail: Pick<BlueprintDetail, "variables" | "kb_variables"> | undefined
): BlueprintVariable[] {
    if (!detail?.kb_variables?.length) return [];
    const seen = new Set((detail.variables || []).map((v) => v.key));
    const out: BlueprintVariable[] = [];
    for (const v of detail.kb_variables) {
        if (!v?.key || seen.has(v.key)) continue;
        seen.add(v.key);
        out.push(v);
    }
    return out;
}

/** How many of these fields hold something besides whitespace. */
export function filledCount(fields: BlueprintVariable[], values: Record<string, string>): number {
    return fields.filter((v) => (values[v.key] || "").trim()).length;
}
