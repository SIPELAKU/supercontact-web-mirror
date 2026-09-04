import { describe, it, expect } from 'vitest';
import { formatPercent, formatQuantity, formatRupiah, parseMoney } from './currency';

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
