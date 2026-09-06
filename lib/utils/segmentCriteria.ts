// lib/utils/segmentCriteria.ts
//
// Segment criteria serialisation, the `lib/utils/customFieldVisibility.ts`
// pair for Phase 3's clause builder.
//
// NOTHING HERE EVALUATES A SEGMENT. Membership is decided server-side on the
// quote path and is never persisted (spec A12); the browser only builds and
// reads back `{"all": [{field, operator, value}, ...]}`.
//
// The whitelist is `lib/constants/commercial-context.ts`, mirrored from the
// API constant. An operator a field does not allow is a 400 at write time
// (spec A8), so the builder is confined to `operatorsForField` and this
// serialiser drops nothing silently that the builder could have offered.

import {
  SEGMENT_CUSTOM_FIELD_OPS,
  SEGMENT_CUSTOM_FIELD_PREFIX,
  SEGMENT_FIELD_OPS,
  SEGMENT_FIELD_OPTIONS,
} from "@/lib/constants/commercial-context";
import type {
  SegmentBaseField,
  SegmentClause,
  SegmentClauseField,
  SegmentClauseOperator,
  SegmentCriteria,
} from "@/lib/types/CommercialContext";

/** One editable row in the builder; `value` is whatever the control holds. */
export interface SegmentClauseDraft {
  field: SegmentClauseField | "";
  operator: SegmentClauseOperator;
  value: string | string[];
}

/** `custom_fields.warna` -> true; one of the seven base fields -> false. */
export function isCustomFieldClause(field: string): boolean {
  return field.startsWith(SEGMENT_CUSTOM_FIELD_PREFIX);
}

/** `custom_fields.warna` -> `warna`; anything else -> null. */
export function customFieldKeyOf(field: string): string | null {
  if (!isCustomFieldClause(field)) return null;
  const key = field.slice(SEGMENT_CUSTOM_FIELD_PREFIX.length);
  return key.length > 0 ? key : null;
}

function isBaseField(field: string): field is SegmentBaseField {
  return Object.prototype.hasOwnProperty.call(SEGMENT_FIELD_OPS, field);
}

/**
 * The operators the API allows for this field. An unknown field gets an EMPTY
 * list, never the full set: offering an operator the server refuses is the
 * failure this table exists to prevent.
 */
export function operatorsForField(field: string): readonly SegmentClauseOperator[] {
  if (isCustomFieldClause(field)) return customFieldKeyOf(field) ? SEGMENT_CUSTOM_FIELD_OPS : [];
  if (isBaseField(field)) return SEGMENT_FIELD_OPS[field];
  return [];
}

export function isOperatorAllowed(field: string, operator: SegmentClauseOperator): boolean {
  return operatorsForField(field).includes(operator);
}

/**
 * True when the field's values are numbers compared as Decimal server-side:
 * the two accepted-quotation aggregates always, and any field under a
 * `gte`/`lte` operator (which the API refuses unless the value is numeric).
 */
export function isNumericClause(field: string, operator: SegmentClauseOperator): boolean {
  if (operator === "gte" || operator === "lte") return true;
  const option = SEGMENT_FIELD_OPTIONS.find((entry) => entry.value === field);
  return Boolean(option?.numeric);
}

/** `""` / `"abc"` -> null; `" 12.5 "` -> 12.5. Never NaN, never Infinity. */
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value ?? "").trim();
  if (text === "") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringList(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

/**
 * The builder's rows -> the exact API `criteria` shape, or null when no clause
 * is complete (so the caller can refuse to save rather than write
 * `{"all": []}`, which matches NOBODY - spec A14).
 *
 * A clause is dropped when it has no field, when its operator is not allowed
 * for that field, when a `custom_fields.` key is empty, when an `in` list is
 * empty after de-blanking, or when a numeric comparison has no number. Every
 * one of those is a refusal the server would make anyway; dropping them here
 * keeps the 400 for the cases a user cannot see.
 */
export function serializeSegmentClauses(clauses: SegmentClauseDraft[]): SegmentCriteria | null {
  const out: SegmentClause[] = [];
  for (const draft of clauses) {
    const field = String(draft.field ?? "");
    if (!field) continue;
    if (!isOperatorAllowed(field, draft.operator)) continue;

    if (draft.operator === "in") {
      const list = toStringList(draft.value);
      if (list.length === 0) continue;
      out.push({ field: field as SegmentClauseField, operator: "in", value: list });
      continue;
    }

    const single = Array.isArray(draft.value) ? draft.value[0] ?? "" : draft.value;
    if (isNumericClause(field, draft.operator)) {
      const numeric = toNumber(single);
      if (numeric === null) continue;
      out.push({ field: field as SegmentClauseField, operator: draft.operator, value: numeric });
      continue;
    }

    const text = String(single ?? "").trim();
    if (text === "") continue;
    out.push({ field: field as SegmentClauseField, operator: draft.operator, value: text });
  }
  return out.length > 0 ? { all: out } : null;
}

/**
 * Stored criteria -> editable rows, deep-copied so editing never mutates the
 * loaded segment. A stored clause whose operator this build does not know is
 * kept as-is under `eq` only if that is legal for the field; otherwise the row
 * carries the first operator the field allows, so the user can see and fix it
 * instead of the screen throwing.
 */
export function clausesFromCriteria(
  criteria: SegmentCriteria | null | undefined
): SegmentClauseDraft[] {
  const all = Array.isArray(criteria?.all) ? criteria!.all : [];
  return all.map((clause) => {
    const field = String(clause?.field ?? "") as SegmentClauseField | "";
    const allowed = operatorsForField(field);
    const operator: SegmentClauseOperator =
      allowed.includes(clause?.operator) ? clause.operator : allowed[0] ?? "eq";
    const value = clause?.value;
    if (operator === "in") {
      return {
        field,
        operator,
        value: Array.isArray(value) ? value.map((entry) => String(entry)) : value == null ? [] : [String(value)],
      };
    }
    return {
      field,
      operator,
      value: Array.isArray(value) ? String(value[0] ?? "") : value == null ? "" : String(value),
    };
  });
}

/**
 * A comparison key for a criteria that does NOT depend on JSONB key order.
 *
 * `customer_segments.criteria` is a JSONB column returned verbatim, and
 * Postgres normalises object keys by (length, bytes) - it hands back
 * `{"field", "value", "operator"}` for a clause that was written
 * `{"field", "operator", "value"}`. Comparing `JSON.stringify` of the two
 * therefore never matches, so a freshly loaded segment reported unsaved
 * changes before the user touched anything, and the house rule that JSONB key
 * order is never load-bearing was broken.
 *
 * Clause ORDER stays significant: the criteria is an AND of clauses the user
 * arranged, and re-ordering them is a real edit worth saving.
 */
export function criteriaSignature(
  criteria: SegmentCriteria | null | undefined
): string {
  const all = Array.isArray(criteria?.all) ? criteria!.all : [];
  return JSON.stringify(
    all.map((clause) => [
      String(clause?.field ?? ""),
      String(clause?.operator ?? ""),
      Array.isArray(clause?.value)
        ? (clause!.value as unknown[]).map((entry) => String(entry))
        : clause?.value ?? null,
    ])
  );
}

/**
 * A one-line summary of a stored criteria for a list row - "3 kondisi" is less
 * useful than naming the first field, and the whole criteria does not fit in a
 * table cell.
 */
export function describeCriteria(
  criteria: SegmentCriteria | null | undefined,
  labelFor: (field: string) => string
): string {
  const all = Array.isArray(criteria?.all) ? criteria!.all : [];
  if (all.length === 0) return "Tidak cocok dengan siapa pun";
  return all.map((clause) => labelFor(String(clause?.field ?? ""))).join(" dan ");
}
