// lib/types/ExchangeRate.ts
//
// Exchange rates (COMMERCIAL Phase 5, spec D5 / A16).
//
// THE DIRECTION, ONCE, SO NOBODY GETS IT BACKWARDS:
//
//   `rate` is HOW MANY UNITS OF THE COMPANY'S DEFAULT CURRENCY one unit of
//   `currency` buys.  1 USD = 16.250 IDR  ->  currency='USD', rate=16250.000000
//
// So converting a company-currency price INTO the quotation currency DIVIDES by
// the rate. Six decimals exist for the inverse-heavy currencies (JPY, VND).
//
// The single most likely tenant mistake is entering the inverse, which is why
// the settings screen renders the sentence "1 USD = Rp 16.250 berlaku sejak
// 6 Sep 2026" instead of a bare number in a column (spec I7).
//
// A rate is DELETED, not archived (A27): a rate typed on the wrong date is a
// typo, not history, and no quotation references the row - a quotation
// snapshots the NUMBER.

export interface ExchangeRate {
  id: string;
  /** ISO-4217, uppercase, exactly three letters. */
  currency: string;
  /** Decimal-as-string, Numeric(18,6). Company currency per ONE foreign unit. */
  rate: string;
  valid_from: string;
  source?: string | null;
  /** The company's default currency, echoed so the sentence needs no 2nd call. */
  base_currency: string;
  /** The row in force TODAY for its currency (newest valid_from <= today). */
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRateListResponse {
  total?: number | null;
  items: ExchangeRate[];
  base_currency: string;
}

export interface ExchangeRateListParams {
  currency?: string;
  on_date?: string;
  include_total?: boolean;
  page?: number;
  limit?: number;
}

/** `currency` and `valid_from` are the IDENTITY and are not updatable (A27). */
export interface ExchangeRateCreate {
  currency: string;
  rate: number;
  valid_from: string;
  source?: string | null;
}

export interface ExchangeRateUpdate {
  rate?: number;
  source?: string | null;
}

/**
 * `GET /exchange-rates/currencies` - what the quotation form's currency picker
 * offers. A currency with NO rate is never listed, which is how the A25 "no
 * rate in force on this date" refusal is prevented from ever reaching a seller
 * as a save error.
 */
export interface ExchangeRateCurrenciesResponse {
  base_currency: string;
  currencies: string[];
}

export interface ExchangeRateDeleteResponse {
  id: string;
  deleted: boolean;
}
