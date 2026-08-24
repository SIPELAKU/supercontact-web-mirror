import {
    TicketVisibilityClause,
    TicketVisibilityCondition,
} from "@/lib/types/TicketSettings";

// Phase 5 / Inc 4 — conditional custom fields.
//
// Pure evaluator + values-map helper that mirror the backend visibility contract
// EXACTLY:
//   null / no clauses            => field always visible
//   { all: [ {field, op, value}, ... ] } => ALL clauses must pass (logical AND)
// `field` is a built-in ticket field name (type/priority/status) OR another custom
// field's field_key. Comparisons are string-based: String(actual) === String(value);
// `in` tests membership. A field is VISIBLE iff the condition is null or evaluates true.

// Normalize any actual value to the string form the contract compares on.
// null/undefined collapse to "" (a field that isn't set) rather than "null"/"undefined".
function toStr(v: unknown): string {
    if (v === null || v === undefined) return "";
    return String(v);
}

function evaluateClause(
    clause: TicketVisibilityClause,
    values: Record<string, any>
): boolean {
    const actual = toStr(values?.[clause.field]);

    if (clause.op === "in") {
        const options = Array.isArray(clause.value) ? clause.value : [clause.value];
        return options.map(toStr).includes(actual);
    }

    const expected = Array.isArray(clause.value)
        ? toStr(clause.value[0])
        : toStr(clause.value);

    if (clause.op === "neq") return actual !== expected;
    // default: "eq"
    return actual === expected;
}

/**
 * Returns true when a field with the given visibility_condition should be shown,
 * evaluated against a flat `values` map. Mirrors the backend AND-of-clauses semantics.
 */
export function isFieldVisible(
    condition: TicketVisibilityCondition | null | undefined,
    values: Record<string, any>
): boolean {
    if (!condition || !Array.isArray(condition.all) || condition.all.length === 0) {
        return true;
    }
    return condition.all.every((clause) => evaluateClause(clause, values));
}

/**
 * Builds the flat `values` map used by isFieldVisible from the CURRENT ticket form
 * state: built-in type/priority/status plus every custom-field value keyed by
 * field_key. Built-in names win over any colliding custom field_key, matching the
 * contract's "built-in ticket field name OR another custom field's field_key".
 */
export function buildVisibilityValues(
    builtIns: { type?: any; priority?: any; status?: any },
    customFieldValues: Record<string, any> | null | undefined
): Record<string, any> {
    return {
        ...(customFieldValues || {}),
        type: builtIns.type ?? "",
        priority: builtIns.priority ?? "",
        status: builtIns.status ?? "",
    };
}
