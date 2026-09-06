import { describe, expect, it } from 'vitest';
import {
  PUBLISH_FORM_KEYS,
  buildPublishFormData,
  currencyToSend,
  exchangeRateNote,
  quotationCurrencyOptions,
} from './quotationForm';
import { formatMoney } from '@/lib/helper/currency';

/**
 * COMMERCIAL Phase 5 (spec I8 / I11 / A22 / A23).
 *
 * THE PUBLISH KEY SET IS PINNED because sending one extra key here is a
 * customer-facing money bug, not a cosmetic one:
 *
 *   `PUT /quotations/{id}` now reads `currency` with three states, and `""`
 *   means "clear me back to the company default". A publish that started
 *   sending an empty `currency` would relabel a USD draft as IDR, null its
 *   rate, and leave its stored USD line amounts untouched - and the PDF is
 *   rasterised FROM that published row, and the public acceptance page reads
 *   it. `Rp 100` printed for USD 100, on the two documents a customer sees.
 */
describe('buildPublishFormData', () => {
  it('carries EXACTLY {action: publish} and nothing else', () => {
    const form = buildPublishFormData();
    expect([...form.keys()]).toEqual(['action']);
    expect(form.get('action')).toBe('publish');
  });

  it('never grows a currency key - an empty one would CLEAR the quotation currency', () => {
    const form = buildPublishFormData();
    expect(form.has('currency')).toBe(false);
    expect([...form.keys()]).toEqual([...PUBLISH_FORM_KEYS]);
  });
});

describe('quotationCurrencyOptions', () => {
  it('puts the company currency first and never offers a currency with no rate', () => {
    // A currency with no rate would earn the A25 refusal at SAVE time, with the
    // seller's work already typed. It is simply not offered.
    expect(quotationCurrencyOptions('IDR', ['USD', 'SGD'])).toEqual([
      { value: 'IDR', label: 'IDR (mata uang perusahaan)' },
      { value: 'USD', label: 'USD' },
      { value: 'SGD', label: 'SGD' },
    ]);
  });

  it('still offers the company currency when the rates list is empty or missing', () => {
    // The picker must never render as a broken empty select on a tenant that
    // has never left rupiah - which is every tenant on day one.
    expect(quotationCurrencyOptions('IDR', [])).toEqual([
      { value: 'IDR', label: 'IDR (mata uang perusahaan)' },
    ]);
    expect(quotationCurrencyOptions('IDR', null)).toHaveLength(1);
    expect(quotationCurrencyOptions(null, undefined)[0].value).toBe('IDR');
  });

  it('drops BLANK entries instead of turning them into a phantom option', () => {
    // The form passes `quotation?.currency ?? ""` so a saved row's currency is
    // always selectable. `normalizeCurrencyCode("")` answers the DEFAULT
    // currency, not "", so a blank that reached the normaliser would add a
    // phantom IDR row to a tenant whose base is not IDR.
    expect(quotationCurrencyOptions('SGD', ['', '   ', 'USD'])).toEqual([
      { value: 'SGD', label: 'SGD (mata uang perusahaan)' },
      { value: 'USD', label: 'USD' },
    ]);
  });

  it('keeps a STORED currency selectable even when it is not in the rates list', () => {
    // A rate is genuinely deletable (A27), and the rates query is disabled on a
    // read-only quotation - without this the select renders blank on the very
    // view an approver reads.
    expect(quotationCurrencyOptions('IDR', ['USD']).map((o) => o.value)).toEqual(['IDR', 'USD']);
  });

  it('never lists the company currency twice, whatever casing the API sent', () => {
    expect(quotationCurrencyOptions('IDR', ['idr', 'USD', 'usd'])).toEqual([
      { value: 'IDR', label: 'IDR (mata uang perusahaan)' },
      { value: 'USD', label: 'USD' },
    ]);
  });
});

describe('currencyToSend (the A23 three-state rule)', () => {
  it('sends NOTHING for the default currency on a quotation that was already default', () => {
    // Absent = "leave it alone", which is exactly the pre-Phase-5 behaviour of
    // every existing caller.
    expect(currencyToSend('IDR', 'IDR', 'IDR')).toBeNull();
    expect(currencyToSend('IDR', 'IDR', null)).toBeNull();
    expect(currencyToSend('', 'IDR', 'USD')).toBeNull();
  });

  it('sends a foreign currency the seller picked', () => {
    expect(currencyToSend('USD', 'IDR', 'IDR')).toBe('USD');
    expect(currencyToSend('usd', 'IDR', null)).toBe('USD');
  });

  it('SENDS the default back when the quotation was in another currency', () => {
    // Not sending it would leave the row on USD with a stale rate, silently.
    expect(currencyToSend('IDR', 'IDR', 'USD')).toBe('IDR');
  });
});

describe('exchangeRateNote', () => {
  const base = (value: string | number) => formatMoney(value, 'IDR');

  it('prints the stored rate and its date, in the DIRECTION the rate stores', () => {
    expect(exchangeRateNote('USD', '16250.000000', '2026-09-06', 'IDR', base)).toBe(
      'Kurs 1 USD = Rp 16.250 per 6 Sep 2026'
    );
  });

  it('says nothing at all for a quotation in the company currency', () => {
    // There is no rate to print, and printing "Kurs 1 IDR = Rp 1" would be noise
    // on every rupiah quotation in the tenant.
    expect(exchangeRateNote('IDR', '1.000000', '2026-09-06', 'IDR', base)).toBe('');
  });

  it('says nothing when there is no usable rate, rather than printing a zero', () => {
    expect(exchangeRateNote('USD', null, '2026-09-06', 'IDR', base)).toBe('');
    expect(exchangeRateNote('USD', '0', '2026-09-06', 'IDR', base)).toBe('');
    expect(exchangeRateNote('USD', 'abc', '2026-09-06', 'IDR', base)).toBe('');
  });

  it('prints the rate without a date when the date is missing or unreadable', () => {
    expect(exchangeRateNote('USD', '16250', null, 'IDR', base)).toBe('Kurs 1 USD = Rp 16.250');
    expect(exchangeRateNote('USD', '16250', 'bukan-tanggal', 'IDR', base)).toBe(
      'Kurs 1 USD = Rp 16.250 per bukan-tanggal'
    );
  });
});
