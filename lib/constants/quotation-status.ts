// lib/constants/quotation-status.ts
//
// Single source of truth for quotation status handling.
//
// These six strings are the exact canonical values of the API's
// `QuotationStatus` StrEnum (app/models/quotation_model.py). Responses are
// always canonical - the API folds its two legacy spellings on the way out -
// but a legacy value can still reach the web as INPUT: a list URL bookmarked
// before the rename (`?f=quotation_status:Pending`). It is normalised here,
// in one place, so the chip, the list filter and the detail page can never
// disagree about what a status means.
//
// The capability helpers mirror the API's own guards (E3 / D2.7) so the UI
// is neither stricter nor looser than the server it talks to.

export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export type QuotationStatusValue =
  (typeof QUOTATION_STATUS)[keyof typeof QUOTATION_STATUS];

export type QuotationChipColor =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface QuotationStatusMeta {
  value: string;
  label: string;
  color: QuotationChipColor;
}

/** Label and chip colour per canonical value, in filter-dropdown order. */
export const QUOTATION_STATUSES: Record<QuotationStatusValue, QuotationStatusMeta> = {
  [QUOTATION_STATUS.DRAFT]: { value: 'draft', label: 'Draft', color: 'default' },
  [QUOTATION_STATUS.PENDING_APPROVAL]: {
    value: 'pending_approval',
    label: 'Menunggu Persetujuan',
    color: 'warning',
  },
  [QUOTATION_STATUS.SENT]: { value: 'sent', label: 'Terkirim', color: 'info' },
  [QUOTATION_STATUS.ACCEPTED]: { value: 'accepted', label: 'Diterima', color: 'success' },
  [QUOTATION_STATUS.REJECTED]: { value: 'rejected', label: 'Ditolak', color: 'error' },
  [QUOTATION_STATUS.EXPIRED]: { value: 'expired', label: 'Kedaluwarsa', color: 'default' },
};

/** Every canonical value, in the order they make sense in a filter dropdown. */
export const QUOTATION_STATUS_OPTIONS: QuotationStatusMeta[] = Object.values(QUOTATION_STATUSES);

/**
 * Mirrors the API's `LEGACY_STATUS_MAP`: the only two spellings that pre-date
 * the rename. `Pending` was "sent to the customer", never "draft".
 */
const LEGACY_STATUS_MAP: Record<string, QuotationStatusValue> = {
  Pending: QUOTATION_STATUS.SENT,
  Accepted: QUOTATION_STATUS.ACCEPTED,
};

export function isQuotationStatus(value: unknown): value is QuotationStatusValue {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(QUOTATION_STATUSES, value)
  );
}

/**
 * Canonical spelling for anything that might name a status: `Pending` ->
 * `sent`, `Accepted` -> `accepted`, canonical values unchanged. Anything else
 * comes back untouched, so an unexpected value shows as itself instead of
 * being silently mistaken for a status it is not.
 */
export function normalizeQuotationStatus(value: string | null | undefined): string {
  if (!value) return '';
  if (isQuotationStatus(value)) return value;
  return LEGACY_STATUS_MAP[value] ?? value;
}

/** Tolerant lookup: unknown values keep their raw label and a neutral chip. */
export function quotationStatusMeta(value: string | null | undefined): QuotationStatusMeta {
  const normalized = normalizeQuotationStatus(value);
  if (isQuotationStatus(normalized)) return QUOTATION_STATUSES[normalized];
  return { value: normalized, label: normalized || '-', color: 'default' };
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * What the chip shows. A `sent` quotation whose expiry date has already
 * passed is shown as "Kedaluwarsa". This is a DISPLAY-ONLY hint: the API
 * never writes `expired` in Phase 0, so the row still filters as `sent` and
 * can still be marked accepted or rejected.
 */
export function displayQuotationStatus(
  status: string | null | undefined,
  expireDate?: string | Date | null,
  now: Date = new Date()
): QuotationStatusMeta {
  const meta = quotationStatusMeta(status);
  if (meta.value === QUOTATION_STATUS.SENT && expireDate) {
    const expiry = expireDate instanceof Date ? expireDate : new Date(expireDate);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < startOfDay(now)) {
      return QUOTATION_STATUSES[QUOTATION_STATUS.EXPIRED];
    }
  }
  return meta;
}

// ── List filter → GET /quotations query ────────────────────────────────────

/** The part of GET /quotations' query that the status and date filters decide. */
export interface QuotationListFilterQuery {
  /** Canonical server value; undefined when no status filter is active. */
  quotation_status?: string;
  /** `YYYY-MM-DD` from the date-range filter, or an ISO instant (see below). */
  date_from?: string;
  date_to?: string;
}

/**
 * The last instant that still counts as "Kedaluwarsa" at `now`: the
 * millisecond before local midnight today, as an ISO string for the API's
 * `date_to` (a datetime; `expire_date` is timestamptz). It is derived from the
 * same `startOfDay` displayQuotationStatus uses, so the server's
 * `expire_date <= date_to` is exactly the chip's `expiry < startOfDay(now)` -
 * for any stored time of day and any browser timezone. A bare `YYYY-MM-DD`
 * would not be: the API reads it as UTC midnight and would miss a row that
 * expires later that same day while its chip already reads Kedaluwarsa.
 */
export function expiredQuotationUpperBound(now: Date = new Date()): string {
  return new Date(startOfDay(now) - 1).toISOString();
}

/**
 * Translate the list's status filter (with the `expire_date` range) into what
 * GET /quotations understands.
 *
 * `expired` exists only on the client. The API never writes it in Phase 0
 * (spec A14); it is what displayQuotationStatus shows for a `sent` row whose
 * expiry has passed. Sent verbatim it matched no row, so filtering by the
 * status the chip had just shown always came back empty. It goes out as
 * `sent` with `date_to` capped at expiredQuotationUpperBound(now): a
 * user-chosen `date_to` that is earlier is kept, a later one is tightened.
 * Every other value is normalised (legacy `Pending`/`Accepted` fold onto their
 * canonical spelling) and the range is passed through as given.
 */
export function quotationListFilterQuery(
  statusFilterValue: string | null | undefined,
  dateRange?: [string | undefined, string | undefined] | null,
  now: Date = new Date()
): QuotationListFilterQuery {
  const status = normalizeQuotationStatus(statusFilterValue) || undefined;
  const query: QuotationListFilterQuery = {
    quotation_status: status,
    date_from: dateRange?.[0] || undefined,
    date_to: dateRange?.[1] || undefined,
  };
  if (status !== QUOTATION_STATUS.EXPIRED) return query;

  const cap = expiredQuotationUpperBound(now);
  const userTo = query.date_to ? new Date(query.date_to).getTime() : NaN;
  const keepUserTo = !Number.isNaN(userTo) && userTo <= new Date(cap).getTime();
  return {
    ...query,
    quotation_status: QUOTATION_STATUS.SENT,
    date_to: keepUserTo ? query.date_to : cap,
  };
}

// ── Capabilities, mirroring the API ────────────────────────────────────────

/** API: `PUT /quotations/{id}` is allowed only while the row is `draft`. */
export function canEditQuotation(status: string | null | undefined): boolean {
  return normalizeQuotationStatus(status) === QUOTATION_STATUS.DRAFT;
}

/** API: `POST /quotations/{id}/status` transitions only from `sent`. */
export function canDecideQuotation(status: string | null | undefined): boolean {
  return normalizeQuotationStatus(status) === QUOTATION_STATUS.SENT;
}

export function quotationEditBlockedReason(
  status: string | null | undefined
): string | undefined {
  return canEditQuotation(status)
    ? undefined
    : 'Hanya quotation berstatus Draft yang bisa diedit';
}
