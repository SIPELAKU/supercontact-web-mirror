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
//
// PHASE 4 widens DISCOUNT_POLICY_VIOLATION rather than adding a code for it:
// the same shape now also reports the AMOUNT band (a total discount above
// `max_discount_amount`) and the MARGIN band (a line whose `margin_percent`
// falls below `min_margin_percent`), the latter carrying `margin_percent` on
// the offending entry. Both land per row exactly like the percent band, so no
// caller changes. The APPROVAL band is not an error at all - it is a 200 with
// `approval_required` on the totals (spec E4.2).

export const DISCOUNT_POLICY_VIOLATION = 'DISCOUNT_POLICY_VIOLATION';

// ── Phase 4 error codes (spec D1) ──────────────────────────────────────────
//
// Eight new codes, and the point of naming them here is PLACEMENT: a
// governance refusal that lands only in a toast is a refusal the seller cannot
// act on. `quotationErrorPlacement` below says, for each one, which control
// owns the message.

export const QUOTATION_APPROVAL_REQUIRED = 'QUOTATION_APPROVAL_REQUIRED';
export const NO_ELIGIBLE_APPROVER = 'NO_ELIGIBLE_APPROVER';
export const APPROVAL_ALREADY_DECIDED = 'APPROVAL_ALREADY_DECIDED';
export const QUOTATION_LOCKED = 'QUOTATION_LOCKED';
export const QUOTATION_ALREADY_REVISED = 'QUOTATION_ALREADY_REVISED';
export const WHATSAPP_TEMPLATE_NOT_APPROVED = 'WHATSAPP_TEMPLATE_NOT_APPROVED';
export const QUOTATION_DELIVERY_FAILED = 'QUOTATION_DELIVERY_FAILED';
export const POLICY_COMPANY_ROW_EXISTS = 'POLICY_COMPANY_ROW_EXISTS';

/**
 * Where a mapped error belongs on screen.
 *
 *   'rows'     - one message per offending line (the discount bands)
 *   'header'   - the banner at the top of the form: it is about the whole
 *                quotation or about the tenant's configuration, not a line
 *   'status'   - the status/action area: the row moved under the caller
 *   'delivery' - inside the send dialog, beside the channel picker
 *   'toast'    - nothing more specific is known
 */
export type QuotationErrorPlacement = 'rows' | 'header' | 'status' | 'delivery' | 'toast';

const PLACEMENT_BY_CODE: Record<string, QuotationErrorPlacement> = {
  // The publish was routed for approval, or the tenant has nobody who could
  // approve it. Both are statements about the WHOLE quotation and about the
  // tenant's setup - never about one line.
  [QUOTATION_APPROVAL_REQUIRED]: 'header',
  [NO_ELIGIBLE_APPROVER]: 'header',
  // The row moved out from under this screen: someone else decided, or the
  // status is no longer what the action needs.
  [APPROVAL_ALREADY_DECIDED]: 'status',
  [QUOTATION_LOCKED]: 'status',
  [QUOTATION_ALREADY_REVISED]: 'status',
  // Both are answers to a send attempt and belong beside the channel picker.
  [WHATSAPP_TEMPLATE_NOT_APPROVED]: 'delivery',
  [QUOTATION_DELIVERY_FAILED]: 'delivery',
  // Only reachable from the policy manager, where the form owns the message.
  [POLICY_COMPANY_ROW_EXISTS]: 'header',
  // Phase 0/2 behaviour, unchanged: the percent, amount and margin bands all
  // report per-line entries under `details.items[]`.
  [DISCOUNT_POLICY_VIOLATION]: 'rows',
};

export function quotationErrorPlacement(
  code: string | null | undefined
): QuotationErrorPlacement {
  if (!code) return 'toast';
  return PLACEMENT_BY_CODE[code] ?? 'toast';
}

export interface QuotationItemErrorEntry {
  index?: number;
  product_id?: string;
  effective_discount_percent?: string;
  /** Phase 4: the line's margin at refusal time, when the margin band fired
   *  (`PolicyLineViolation.margin_percent`). Decimal-as-string, or null when
   *  the line has no recorded cost and is therefore exempt (A7). */
  margin_percent?: string | null;
  input?: string;
  errors?: Array<{ field?: string | null; message: string }>;
}

export interface QuotationErrorDetails {
  items?: QuotationItemErrorEntry[];
  header?: Record<string, unknown>;
  policy?: Record<string, unknown>;
  /** Phase 4, QUOTATION_ALREADY_REVISED: the child that already exists, so
   *  the UI can link to it instead of retrying an action that always 409s. */
  revision_id?: string;
  revision_number?: string;
  /** Phase 4, QUOTATION_LOCKED: the status that blocked the write. */
  quotation_status?: string;
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
  /** Which control owns this message (Phase 4). `rows` when there are per-row
   *  entries even if the code says otherwise - a mapped row error always has a
   *  home, and the toast still carries the sentence. */
  placement: QuotationErrorPlacement;
  /**
   * The `details` payload as given, so a screen can read a code-specific key
   * without this module growing one field per code: the child revision's id
   * and number on QUOTATION_ALREADY_REVISED, the offending status on
   * QUOTATION_LOCKED, the account list on the multi-account send refusal.
   */
  details?: QuotationErrorDetails;
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

  // A code's declared placement is a default, not a verdict: when the API
  // actually returned per-row entries they are what the seller must fix, so
  // the rows win. Anything unrecognised with rows still lands on the rows.
  const declared = quotationErrorPlacement(code);
  const hasRows = Object.keys(byRow).length > 0;
  const placement: QuotationErrorPlacement =
    hasRows && declared === 'toast' ? 'rows' : declared;

  const result: MappedQuotationError = {
    byRow,
    fieldsByRow,
    fieldsHeader,
    message: text,
    placement,
    details: parsed,
  };
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
