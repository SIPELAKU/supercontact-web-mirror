// lib/utils/quotationForm.ts
//
// The pure half of the quotation form's multipart building (COMMERCIAL Phase 5,
// spec I8 / A22 / A23).
//
// THE PUBLISH REQUEST CARRIES EXACTLY ONE KEY, AND THAT IS LOAD-BEARING.
//
// `PUT /quotations/{id}` with `{action: "publish"}` is how the web publishes a
// draft. Phase 5 gives the same endpoint a `currency` Form field with THREE
// states (A23):
//
//   absent  -> leave the stored currency alone
//   ""      -> explicitly CLEAR, back to the company default
//   "USD"   -> set it
//
// So a publish that started sending an empty `currency` would relabel a USD
// draft as IDR - nulling its rate while leaving its stored USD line amounts
// untouched - and the PDF is rasterised from that published row, and the public
// acceptance page reads it. `Rp 100` for USD 100, on a customer-facing
// document. The key set is pinned by a test for exactly that reason.
//
// FastAPI also SILENTLY DROPS an undeclared multipart field, which is how the
// Phase 4 `pipeline_id` defect shipped inert - so the web's `currency` and the
// endpoint's `Form` declaration are one change, not two.

import { normalizeCurrencyCode } from "@/lib/helper/currency";

/**
 * The COMPLETE key set of the publish request. One key. Anything added here is
 * a deliberate decision about what publishing MEANS, not a convenience.
 */
export const PUBLISH_FORM_KEYS = ["action"] as const;

/**
 * The publish multipart, built in one place so no future edit can slip a field
 * into it by accident (A22 / A23).
 */
export function buildPublishFormData(): FormData {
  const form = new FormData();
  form.append("action", "publish");
  return form;
}

/**
 * The currency picker's options: the company's own currency FIRST, then every
 * currency the tenant actually holds a rate for (spec I8).
 *
 * A currency with no rate is never offered, which is how the A25 refusal - "no
 * rate in force on this date" - is prevented from ever reaching a seller as a
 * save error. The base currency is always present even when the rates list is
 * empty or the endpoint is unreachable, so the picker never renders as a broken
 * empty select on a tenant that never leaves rupiah.
 */
export function quotationCurrencyOptions(
  baseCurrency: string | null | undefined,
  currencies: string[] | null | undefined
): { value: string; label: string }[] {
  const base = normalizeCurrencyCode(baseCurrency);
  const seen = new Set<string>([base]);
  const options = [{ value: base, label: `${base} (mata uang perusahaan)` }];
  for (const raw of currencies ?? []) {
    // Blank entries are skipped BEFORE normalising. `normalizeCurrencyCode("")`
    // answers the DEFAULT currency, not "", so a blank that reached the
    // normaliser would add a phantom "IDR" option to a tenant whose base is not
    // IDR. Callers legitimately pass a blank - "the stored currency, if any".
    if (typeof raw !== "string" || raw.trim() === "") continue;
    const code = normalizeCurrencyCode(raw);
    if (seen.has(code)) continue;
    seen.add(code);
    options.push({ value: code, label: code });
  }
  return options;
}

/**
 * What the form should SEND as the quotation currency.
 *
 * `null` means "do not send the key at all", which is the absent state (A23)
 * and exactly today's behaviour for every existing caller. The key is sent only
 * when the seller picked something that differs from the company default, or
 * when they picked the default back on a quotation that had been in another
 * currency - the "explicitly cleared" case, which is sent as the base code
 * rather than as an empty string, because the seller made a positive choice.
 */
export function currencyToSend(
  selected: string | null | undefined,
  baseCurrency: string | null | undefined,
  storedCurrency: string | null | undefined
): string | null {
  const code = (selected ?? "").trim().toUpperCase();
  if (!code) return null;
  const base = normalizeCurrencyCode(baseCurrency);
  const stored = (storedCurrency ?? "").trim().toUpperCase();
  if (code !== base) return code;
  // Back to the company currency on a quotation that was in another one: that
  // is a real change and has to travel, or the row keeps its old rate.
  if (stored && stored !== base) return code;
  // Default on a quotation that was already in the default: nothing to say.
  return null;
}

/** "Kurs 1 USD = Rp 16.250 per 6 Sep 2026", or "" when there is no rate. */
export function exchangeRateNote(
  currency: string | null | undefined,
  rate: string | null | undefined,
  rateDate: string | null | undefined,
  baseCurrency: string | null | undefined,
  formatBase: (value: string | number) => string
): string {
  const code = normalizeCurrencyCode(currency);
  const base = normalizeCurrencyCode(baseCurrency);
  if (!rate || code === base) return "";
  const numeric = Number(rate);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  const head = `Kurs 1 ${code} = ${formatBase(rate)}`;
  if (!rateDate) return head;
  const date = new Date(rateDate);
  if (Number.isNaN(date.getTime())) return `${head} per ${rateDate}`;
  return `${head} per ${date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}
