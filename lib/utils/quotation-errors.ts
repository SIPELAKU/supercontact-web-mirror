// lib/utils/quotation-errors.ts
//
// Turns the API's quotation error shapes into something a form can place:
// one message per row (by the row's `index`), an optional message for the
// header discount, and the sentence for the toast.
//
// The shapes handled (Phase 0 spec, section D2 "Error shapes"):
//
//   400 VALIDATION_ERROR "Some items are invalid"
//     details.items[] = { index, errors: [{ field, message }] }
//     - a per-field pydantic error ("price": "Extra inputs are not permitted")
//     - a malformed JSON entry ({ index, input, errors: [{ field: null, ... }] })
//     - an archived / non-sellable product ({ index, product_id, errors: [...] })
//
//   400 DISCOUNT_POLICY_VIOLATION "Diskon 30% melebihi batas ..."
//     details.policy = { id, applies_to, max_discount_percent }
//     details.header = { discount_type, discount_value, effective_percent }
//                      (present only when the header alone exceeds)
//     details.items[] = { index, product_id, effective_discount_percent,
//                         errors: [{ field: "discount", message }] }
//
// `index` is the running row index across all flattened `items` entries. An
// entry without one (older API builds) falls back to its array position.

export const DISCOUNT_POLICY_VIOLATION = 'DISCOUNT_POLICY_VIOLATION';

export interface QuotationItemErrorEntry {
  index?: number;
  product_id?: string;
  effective_discount_percent?: string;
  input?: string;
  errors?: Array<{ field?: string | null; message: string }>;
}

export interface QuotationErrorDetails {
  items?: QuotationItemErrorEntry[];
  header?: Record<string, unknown>;
  policy?: Record<string, unknown>;
  /**
   * Header-level field errors (Phase 1): custom-field values refused by the
   * `_as_validation_error` shape, `{ field, message }` each. `field` is a
   * custom field_key, `custom_fields` for the unknown-keys error, or absent.
   */
  errors?: Array<{ field?: string | null; message: string }>;
  entity_type?: string;
}

export interface MappedQuotationError {
  /** One readable line per offending row, keyed by row index. */
  byRow: Record<number, string>;
  /** The same errors keyed by row and then by field ("_" when field-less). */
  fieldsByRow: Record<number, Record<string, string>>;
  /**
   * Header-level messages keyed by field (`details.errors[]`): a custom
   * field_key, `custom_fields`, `discount_value`, ... Field-less under "_".
   */
  fieldsHeader: Record<string, string>;
  /** Set when the header discount itself is what the API refused. */
  header?: string;
  /** The sentence for the toast. */
  message: string;
  code?: string;
}

const FALLBACK_MESSAGE = 'Quotation tidak dapat diproses';

function asDetails(value: unknown): QuotationErrorDetails {
  return value && typeof value === 'object' ? (value as QuotationErrorDetails) : {};
}

export function mapQuotationError(
  details: unknown,
  message?: string | null,
  code?: string | null
): MappedQuotationError {
  const parsed = asDetails(details);
  const text = typeof message === 'string' && message.trim() ? message : FALLBACK_MESSAGE;

  const byRow: Record<number, string> = {};
  const fieldsByRow: Record<number, Record<string, string>> = {};

  const items = Array.isArray(parsed.items) ? parsed.items : [];
  items.forEach((entry, position) => {
    if (!entry || typeof entry !== 'object') return;
    const index = typeof entry.index === 'number' ? entry.index : position;
    const errors = Array.isArray(entry.errors) ? entry.errors : [];

    const lines: string[] = [];
    const fields: Record<string, string> = fieldsByRow[index] ?? {};
    for (const err of errors) {
      if (!err || typeof err.message !== 'string') continue;
      const field = typeof err.field === 'string' && err.field.trim() ? err.field : null;
      lines.push(field ? `${field}: ${err.message}` : err.message);
      const key = field ?? '_';
      fields[key] = fields[key] ? `${fields[key]}; ${err.message}` : err.message;
    }
    if (lines.length === 0) {
      // An entry with no readable errors still marks the row as the culprit.
      lines.push(text);
      fields._ = fields._ ? `${fields._}; ${text}` : text;
    }
    byRow[index] = byRow[index] ? `${byRow[index]}; ${lines.join('; ')}` : lines.join('; ');
    fieldsByRow[index] = fields;
  });

  // Header-level field errors travel under `details.errors[]`, not `items[]`
  // (S3-2): the same `{ field, message }` entries, keyed here by field.
  const fieldsHeader: Record<string, string> = {};
  const headerErrors = Array.isArray(parsed.errors) ? parsed.errors : [];
  for (const err of headerErrors) {
    if (!err || typeof err !== 'object' || typeof err.message !== 'string') continue;
    const key = typeof err.field === 'string' && err.field.trim() ? err.field : '_';
    fieldsHeader[key] = fieldsHeader[key] ? `${fieldsHeader[key]}; ${err.message}` : err.message;
  }

  const result: MappedQuotationError = { byRow, fieldsByRow, fieldsHeader, message: text };
  if (code) result.code = code;

  // The policy check reports a header that exceeds on its own under
  // `details.header`; the only sentence it comes with is the top-level one.
  if (parsed.header && typeof parsed.header === 'object') {
    result.header = text;
  }

  return result;
}

/**
 * Convenience for the `catch` block: the API client attaches `code` and
 * `details` to the thrown Error.
 */
export function mapQuotationException(error: unknown): MappedQuotationError {
  const err = (error ?? {}) as { details?: unknown; message?: unknown; code?: unknown };
  return mapQuotationError(
    err.details,
    typeof err.message === 'string' ? err.message : null,
    typeof err.code === 'string' ? err.code : null
  );
}
