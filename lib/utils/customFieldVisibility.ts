// lib/utils/customFieldVisibility.ts
//
// Visibility for the GENERIC custom fields. The evaluator is the ticket
// module's, re-exported (same contract: AND of eq/neq/in clauses, string
// comparison); only the values map differs - each entity layers ITS OWN
// built-in names, so a product field can never see a ticket `priority`.

import type {
  CustomFieldEntityType,
  VisibilityClause,
  VisibilityCondition,
} from "@/lib/types/CustomFieldDefinition";
import { BUILTIN_CONDITION_FIELDS_BY_ENTITY } from "@/lib/constants/custom-field-entities";

export { isFieldVisible } from "@/lib/utils/ticketFieldVisibility";

/**
 * Flat values map for `isFieldVisible`: the entity's custom values plus only
 * that entity's built-ins, built-ins layered last (reserved names win).
 * Missing built-ins collapse to "" - "not set", never "undefined".
 */
export function buildEntityVisibilityValues(
  entityType: CustomFieldEntityType,
  builtIns: Record<string, unknown> | null | undefined,
  customValues: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(customValues ?? {}) };
  for (const field of BUILTIN_CONDITION_FIELDS_BY_ENTITY[entityType] ?? []) {
    const value = builtIns?.[field.value];
    out[field.value] = value === null || value === undefined ? "" : value;
  }
  return out;
}

/**
 * The clause builder's rows -> the exact API `visibility_condition` shape, or
 * null when no clause is complete. `in` values become a de-blanked string[];
 * eq/neq become one trimmed string. Extracted from the ticket settings tab
 * (which keeps its own copy - that module is untouched).
 */
export function serializeVisibilityClauses(clauses: VisibilityClause[]): VisibilityCondition | null {
  const valid = clauses
    .map((c) => {
      if (c.op === "in") {
        const arr = (Array.isArray(c.value) ? c.value : [c.value])
          .map((v) => String(v).trim())
          .filter(Boolean);
        return { field: c.field, op: c.op, value: arr } as VisibilityClause;
      }
      const single = Array.isArray(c.value) ? c.value[0] ?? "" : c.value;
      return { field: c.field, op: c.op, value: String(single).trim() } as VisibilityClause;
    })
    .filter(
      (c) =>
        Boolean(c.field) && (c.op === "in" ? (c.value as string[]).length > 0 : c.value !== "")
    );
  return valid.length > 0 ? { all: valid } : null;
}

/** Deep-copied clauses out of a stored condition, for editing. */
export function clausesFromCondition(condition: VisibilityCondition | null | undefined): VisibilityClause[] {
  return (condition?.all ?? []).map((c) => ({
    field: c.field,
    op: c.op,
    value: Array.isArray(c.value) ? [...c.value] : c.value,
  }));
}
