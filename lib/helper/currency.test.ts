import { describe, it, expect } from 'vitest';
import {
  CURRENCY_DISPLAY,
  currencyDecimals,
  currencySymbol,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatRupiah,
  normalizeCurrencyCode,
  parseMoney,
} from './currency';

describe('formatPercent / formatQuantity', () => {
  it('drops the padding zeros the API sends and keeps real fractions', () => {
    expect(formatPercent('11.00')).toBe('11');
    expect(formatPercent('12.50')).toBe('12,5');
    expect(formatPercent(25)).toBe('25');
    expect(formatQuantity('2.00')).toBe('2');
    expect(formatQuantity('1.50')).toBe('1,5');
    expect(formatQuantity(0.3)).toBe('0,3');
  });

  it('shows 0 for junk', () => {
    expect(formatPercent(null)).toBe('0');
    expect(formatQuantity('x')).toBe('0');
  });
});

/**
 * Money arrives from the API as Decimal strings ("1234.50"). The summary, the
 * list and the PDF all print whole rupiah, rounded half-up, and never a
 * dollar sign or a comma-decimal fragment like "Rp 1.234,5".
 */
describe('formatRupiah', () => {
  it('rounds half-up to whole rupiah by default', () => {
    expect(formatRupiah('1234.50')).toBe('Rp 1.235');
    expect(formatRupiah('1234.49')).toBe('Rp 1.234');
    expect(formatRupiah(0.5)).toBe('Rp 1');
  });

  it('groups thousands the Indonesian way', () => {
    expect(formatRupiah('1500000.00')).toBe('Rp 1.500.000');
    expect(formatRupiah(136350000)).toBe('Rp 136.350.000');
  });

  it('keeps the sign in front of the currency and still rounds half-up', () => {
    expect(formatRupiah('-1234.50')).toBe('-Rp 1.235');
    expect(formatRupiah(-1234.49)).toBe('-Rp 1.234');
  });

  it('prints Rp 0 for anything that is not a number', () => {
    expect(formatRupiah(NaN)).toBe('Rp 0');
    expect(formatRupiah('abc')).toBe('Rp 0');
    expect(formatRupiah(null)).toBe('Rp 0');
    expect(formatRupiah(undefined)).toBe('Rp 0');
    expect(formatRupiah('')).toBe('Rp 0');
  });

  it('keeps the cents when asked to', () => {
    expect(formatRupiah('1234.50', { decimals: 2 })).toBe('Rp 1.234,50');
    expect(formatRupiah(1234, { decimals: 2 })).toBe('Rp 1.234,00');
    expect(formatRupiah('0.05', { decimals: 2 })).toBe('Rp 0,05');
  });

  it('accepts numbers as well as API strings', () => {
    expect(formatRupiah(1234.5)).toBe('Rp 1.235');
    expect(formatRupiah(0)).toBe('Rp 0');
  });
});

describe('parseMoney', () => {
  it('reads API decimal strings exactly', () => {
    expect(parseMoney('1234.50')).toBe(1234.5);
    expect(parseMoney('1.234')).toBe(1.234);
    expect(parseMoney('-10.00')).toBe(-10);
  });

  it('inverts formatRupiah output', () => {
    expect(parseMoney('Rp 1.234.568')).toBe(1234568);
    expect(parseMoney('Rp 1.234,50')).toBe(1234.5);
    expect(parseMoney('-Rp 1.235')).toBe(-1235);
    expect(parseMoney(formatRupiah('136350000.00'))).toBe(136350000);
  });

  it('passes numbers through and rejects junk', () => {
    expect(parseMoney(42)).toBe(42);
    expect(Number.isNaN(parseMoney('abc'))).toBe(true);
    expect(Number.isNaN(parseMoney(''))).toBe(true);
    expect(Number.isNaN(parseMoney(null))).toBe(true);
  });
});

/**
 * COMMERCIAL Phase 5 (spec I1). `formatRupiah` is now a wrapper over
 * `formatMoney(v, "IDR", opts)`, so every assertion above this block is also a
 * test of `formatMoney` - and the cases below pin the part the wrapper cannot
 * reach: a quotation issued in a currency that is not the company's.
 *
 * The failure this exists to prevent is not cosmetic. Before Phase 5 a USD 3.20
 * line printed `Rp 3` on the customer's PDF and on the public acceptance page:
 * the wrong symbol AND the wrong number, on the two documents a customer reads.
 */
describe('formatMoney', () => {
  it('is what formatRupiah delegates to, byte for byte', () => {
    expect(formatMoney('1234.50', 'IDR')).toBe(formatRupiah('1234.50'));
    expect(formatMoney('1500000.00', 'IDR')).toBe('Rp 1.500.000');
    // The currency argument defaults to the company currency, so a call that
    // forgets it degrades to today's behaviour rather than to a bare number.
    expect(formatMoney('1500000.00')).toBe('Rp 1.500.000');
  });

  it('applies DECIMALS BY CURRENCY: 0 for IDR, 2 for everything else', () => {
    expect(formatMoney('3.20', 'IDR')).toBe('Rp 3');
    expect(formatMoney('3.20', 'USD')).toBe('$ 3,20');
    expect(formatMoney('1234.50', 'USD')).toBe('$ 1.234,50');
    expect(formatMoney('1234', 'EUR')).toBe('€ 1.234,00');
    expect(currencyDecimals('IDR')).toBe(0);
    expect(currencyDecimals('USD')).toBe(2);
  });

  it('keeps id-ID grouping whatever the money - the reader is Indonesian', () => {
    // Dot for thousands, comma for the decimal, in USD as in IDR. The currency
    // decides the SYMBOL; it does not re-locale the reader.
    expect(formatMoney('1500000.25', 'USD')).toBe('$ 1.500.000,25');
    expect(formatMoney('1500000.25', 'SGD')).toBe('S$ 1.500.000,25');
  });

  it('prints an UNKNOWN currency as its own CODE, never as a guessed symbol', () => {
    expect(formatMoney('1234.50', 'XAU')).toBe('XAU 1.234,50');
    expect(formatMoney('1234.50', 'ZZZ')).toBe('ZZZ 1.234,50');
    expect(currencySymbol('XAU')).toBe('XAU');
    // ...and an unknown code takes the 2-decimal default, so no minor unit is
    // silently dropped from a currency nobody anticipated.
    expect(currencyDecimals('XAU')).toBe(2);
  });

  it('carries JPY in the display map with the spec I1 decimals rule', () => {
    // The spec fixes the rule as "0 for IDR, 2 otherwise". JPY is in the map
    // for its SYMBOL; its decimals follow that rule and are a data change here
    // if the owner decides otherwise.
    expect(CURRENCY_DISPLAY.JPY.symbol).toBe('¥');
    expect(formatMoney('1234', 'JPY')).toBe('¥ 1.234,00');
    expect(formatMoney('1234.56', 'JPY')).toBe('¥ 1.234,56');
  });

  it('falls back to the CURRENCY zero for anything unparsable, never a blank', () => {
    // A blank where a total belongs reads as "free" on a customer document.
    expect(formatMoney('abc', 'IDR')).toBe('Rp 0');
    expect(formatMoney(null, 'USD')).toBe('$ 0,00');
    expect(formatMoney(undefined, 'XAU')).toBe('XAU 0,00');
    expect(formatMoney(NaN, 'IDR')).toBe('Rp 0');
    expect(formatMoney('', 'USD')).toBe('$ 0,00');
  });

  it('keeps the sign in front of the symbol and rounds half-up', () => {
    expect(formatMoney('-1234.505', 'USD')).toBe('-$ 1.234,51');
    expect(formatMoney('-1234.50', 'IDR')).toBe('-Rp 1.235');
  });

  it('lets an explicit decimals option override the currency default', () => {
    expect(formatMoney('1234.50', 'IDR', { decimals: 2 })).toBe('Rp 1.234,50');
    expect(formatMoney('1234.50', 'USD', { decimals: 0 })).toBe('$ 1.235');
  });

  it('normalises a code the API or a form may hand it in any casing', () => {
    expect(normalizeCurrencyCode('usd')).toBe('USD');
    expect(normalizeCurrencyCode(' idr ')).toBe('IDR');
    // Empty / null means "the company default", which is what a quotation with
    // no currency set has always been priced in.
    expect(normalizeCurrencyCode('')).toBe('IDR');
    expect(normalizeCurrencyCode(null)).toBe('IDR');
    expect(formatMoney('10.00', 'usd')).toBe('$ 10,00');
  });
});

describe('parseMoney with a currency', () => {
  it('inverts formatMoney for a foreign currency', () => {
    expect(parseMoney(formatMoney('1234.50', 'USD'), 'USD')).toBe(1234.5);
    expect(parseMoney(formatMoney('1234.50', 'XAU'), 'XAU')).toBe(1234.5);
    expect(parseMoney('-$ 1.235', 'USD')).toBe(-1235);
  });

  it('still reads an API decimal string exactly, currency or not', () => {
    expect(parseMoney('1234.50', 'USD')).toBe(1234.5);
    expect(parseMoney('1.234', 'USD')).toBe(1.234);
  });
});
