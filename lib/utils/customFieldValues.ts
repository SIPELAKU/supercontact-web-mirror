// lib/utils/customFieldValues.ts
//
// Client-side twin of the API's `custom_field_validation.validate_values`
// (spec E4). The SERVER decides; this exists so a form can show the same
// refusal under the same control before the round trip, and so read-only
// surfaces format stored values consistently. Messages are the server's,
// verbatim, so a value refused here reads the same as one refused there.

import type {
  CustomFieldDefinitionLike,
  CustomFieldEntityType,
} from "@/lib/types/CustomFieldDefinition";
import { buildEntityVisibilityValues, isFieldVisible } from "./customFieldVisibility";

export type CustomFieldValidationMode = "strict" | "permissive";

export interface CustomFieldValueError {
  /** A field_key, or "custom_fields" for the unknown-keys error. */
  field: string;
  message: string;
}

export interface ValidateCustomFieldValuesOptions {
  entityType: CustomFieldEntityType;
  /** Built-in values (product_type/status, quotation_status) for visibility. */
  builtIns?: Record<string, unknown> | null;
  /**
   * STRICT (product, quotation, crm_company): unknown keys refused, required
   * enforced. PERMISSIVE (contact): unknown keys pass through, an unchanged
   * value is skipped entirely, required is not enforced.
   */
  mode?: CustomFieldValidationMode;
  enforceRequired?: boolean;
  /**
   * The values already stored on the row (the edit form's seed). PERMISSIVE:
   * a defined key whose value is unchanged is skipped. STRICT: a stored key
   * with no active definition (one that was deactivated - "Nonaktifkan"
   * keeps stored values) is NOT reported as unknown, mirroring the API's
   * merge-update rule; a defined key is still always re-judged.
   */
  storedValues?: Record<string, unknown> | null;
}

export interface ValidateCustomFieldValuesResult {
  /** Values with numbers normalised (numeric strings -> numbers). */
  values: Record<string, unknown>;
  errors: CustomFieldValueError[];
}

/** `null`, `undefined`, `""` and `[]` all mean "not filled in". */
export function isBlankCustomValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

/** Number as sent when numeric, else a parsed numeric string; `undefined` when invalid. */
function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    // Decimal('12.5') parses; "12,5" or "abc" does not.
    if (!/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(value.trim())) return undefined;
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function validateCustomFieldValues(
  definitions: CustomFieldDefinitionLike[],
  values: Record<string, unknown> | null | undefined,
  options: ValidateCustomFieldValuesOptions
): ValidateCustomFieldValuesResult {
  const mode = options.mode ?? "strict";
  const enforceRequired = options.enforceRequired ?? true;
  const input: Record<string, unknown> = { ...(values ?? {}) };
  const out: Record<string, unknown> = { ...input };
  const errors: CustomFieldValueError[] = [];

  const active = definitions.filter((d) => d.is_active !== false);
  const known = new Set(active.map((d) => d.field_key));

  if (mode === "strict") {
    // A key the row already holds (its definition was deactivated) is not
    // unknown - there is no control to clear it and the server keeps it.
    const stored = options.storedValues ?? null;
    const unknown = Object.keys(input).filter(
      (key) => !known.has(key) && !(stored && Object.prototype.hasOwnProperty.call(stored, key))
    );
    if (unknown.length > 0) {
      errors.push({
        field: "custom_fields",
        message: `Unknown custom field(s): ${unknown.join(", ")}`,
      });
    }
  }

  const visibilityValues = buildEntityVisibilityValues(options.entityType, options.builtIns, input);

  for (const def of active) {
    const key = def.field_key;
    const present = Object.prototype.hasOwnProperty.call(input, key);
    const value = input[key];

    if (mode === "permissive") {
      // A defined key whose submitted value is what is already stored is not
      // re-checked (legacy values must keep saving untouched - spec A22).
      if (!present) continue;
      if (options.storedValues && sameValue(value, options.storedValues[key])) continue;
    }

    if (!isFieldVisible(def.visibility_condition ?? null, visibilityValues)) continue;

    if (isBlankCustomValue(value)) {
      if (enforceRequired && def.is_required) {
        errors.push({ field: key, message: `Custom field '${def.label}' is required` });
      }
      continue;
    }

    switch (def.field_type) {
      case "text":
        if (typeof value !== "string") errors.push({ field: key, message: `'${def.label}' must be text` });
        break;
      case "number": {
        const num = typeof value === "boolean" ? undefined : coerceNumber(value);
        if (num === undefined) errors.push({ field: key, message: `'${def.label}' must be a number` });
        else out[key] = num;
        break;
      }
      case "boolean":
        if (typeof value !== "boolean") errors.push({ field: key, message: `'${def.label}' must be a boolean` });
        break;
      case "date":
        if (typeof value !== "string" || !isIsoDate(value)) {
          errors.push({ field: key, message: `'${def.label}' must be a date (YYYY-MM-DD)` });
        }
        break;
      case "select": {
        const options = def.select_options ?? [];
        if (Array.isArray(value) || typeof value === "object" || !options.includes(String(value))) {
          errors.push({
            field: key,
            message: `Invalid value for '${def.label}' - must be one of [${options.join(", ")}]`,
          });
        }
        break;
      }
      case "multi_select": {
        const options = def.select_options ?? [];
        if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
          errors.push({ field: key, message: `'${def.label}' must be a list of options` });
          break;
        }
        const list = value as string[];
        const unique = new Set(list).size === list.length;
        if (!unique || list.some((v) => !options.includes(v))) {
          errors.push({
            field: key,
            message: `Invalid value for '${def.label}' - must be one of [${options.join(", ")}]`,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  return { values: out, errors };
}

/** `{ field_key: message }` - the shape a form drops under its controls. */
export function customFieldErrorsByKey(errors: CustomFieldValueError[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const err of errors) {
    out[err.field] = out[err.field] ? `${out[err.field]}; ${err.message}` : err.message;
  }
  return out;
}

/**
 * A stored value as a read-only surface prints it: boolean Ya/Tidak,
 * multi_select joined by ", ", numbers in id-ID, objects as JSON so a legacy
 * nested contact value renders instead of crashing React. Blank -> "-".
 */
export function formatCustomFieldValue(
  value: unknown,
  fieldType?: CustomFieldDefinitionLike["field_type"] | null
): string {
  if (isBlankCustomValue(value)) return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  if (Array.isArray(value)) return value.map((v) => formatCustomFieldValue(v)).join(", ");
  if (typeof value === "string") {
    if (fieldType === "number") {
      const num = coerceNumber(value);
      if (num !== undefined) return num.toLocaleString("id-ID");
    }
    if (fieldType === "boolean") {
      if (value === "true") return "Ya";
      if (value === "false") return "Tidak";
    }
    return value;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
