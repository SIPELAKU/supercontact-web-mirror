import { describe, expect, it } from 'vitest';
import {
  billingPeriodSuffix,
  describePriceSource,
  formatTier,
  parsePriceSource,
  priceSourceTone,
} from './priceSource';

/**
 * `price_source` is the only record of WHY a line costs what it costs. The
 * seller reads it on the form, on the read-only view and on the PDF, so the
 * one thing this formatter may never do is throw or blank the cell - an old
 * leg, a hand-written row and a future grammar all have to render.
 */
describe('parsePriceSource', () => {
  it('parses the four grammars', () => {
    expect(parsePriceSource('base')).toEqual({ kind: 'base', code: null, tier: null, raw: 'base' });
    expect(parsePriceSource('manual')).toEqual({
      kind: 'manual',
      code: null,
      tier: null,
      raw: 'manual',
    });
    expect(parsePriceSource('list:RESELLER tier:10')).toEqual({
      kind: 'list',
      code: 'RESELLER',
      tier: '10',
      raw: 'list:RESELLER tier:10',
    });
    expect(parsePriceSource('cost_plus:RETAIL')).toEqual({
      kind: 'cost_plus',
      code: 'RETAIL',
      tier: null,
      raw: 'cost_plus:RETAIL',
    });
  });

  it('keeps a decimal tier exactly as the server wrote it', () => {
    expect(parsePriceSource('list:RESELLER tier:10.5').tier).toBe('10.5');
  });

  it('accepts the widest code the server can write (32 chars, dots, dashes)', () => {
    const code = 'A'.repeat(30) + '_9';
    const parsed = parsePriceSource(`list:${code} tier:9999999999.99`);
    expect(parsed.kind).toBe('list');
    expect(parsed.code).toBe(code);
    expect(parsed.tier).toBe('9999999999.99');
  });

  it('files anything unrecognised as unknown, verbatim, without throwing', () => {
    expect(parsePriceSource('promo:BLACKFRIDAY')).toEqual({
      kind: 'unknown',
      code: null,
      tier: null,
      raw: 'promo:BLACKFRIDAY',
    });
    // A malformed list source is unknown, not a half-parsed list.
    expect(parsePriceSource('list:RESELLER').kind).toBe('unknown');
    expect(parsePriceSource('list:RESELLER tier:').kind).toBe('unknown');
  });

  it('treats null, undefined and blank as unknown with an empty raw', () => {
    for (const value of [null, undefined, '', '   ']) {
      expect(parsePriceSource(value)).toEqual({ kind: 'unknown', code: null, tier: null, raw: '' });
    }
  });
});

describe('formatTier', () => {
  it('reads a tier the Indonesian way and never pads', () => {
    expect(formatTier('10')).toBe('10');
    expect(formatTier('10.00')).toBe('10');
    expect(formatTier('10.5')).toBe('10,5');
    expect(formatTier('0.25')).toBe('0,25');
  });

  it('falls back to the raw text for anything unparsable', () => {
    expect(formatTier('banyak')).toBe('banyak');
    expect(formatTier('')).toBe('');
    expect(formatTier(null)).toBe('');
  });
});

describe('describePriceSource', () => {
  it('names the base fallback', () => {
    expect(describePriceSource('base')).toBe('Harga dasar');
  });

  it('uses the price list NAME from the brief, with the tier minimum', () => {
    expect(
      describePriceSource('list:RESELLER tier:10', { id: 'x', code: 'RESELLER', name: 'Reseller' })
    ).toBe('Harga dari Daftar Harga Reseller, tier ≥ 10');
  });

  it('renders a decimal tier readably', () => {
    expect(
      describePriceSource('list:RESELLER tier:10.5', { id: 'x', code: 'RESELLER', name: 'Reseller' })
    ).toBe('Harga dari Daftar Harga Reseller, tier ≥ 10,5');
  });

  it('falls back to the CODE when no brief came back for it', () => {
    // The brief is resolved at response time from the stored code; an archived
    // or unknown list yields none, and the code still beats saying nothing.
    expect(describePriceSource('list:RESELLER tier:10')).toBe(
      'Harga dari Daftar Harga RESELLER, tier ≥ 10'
    );
    expect(describePriceSource('list:RESELLER tier:10', null)).toBe(
      'Harga dari Daftar Harga RESELLER, tier ≥ 10'
    );
  });

  it('describes the cost-plus branch with the list it came from', () => {
    expect(describePriceSource('cost_plus:RETAIL', { id: 'x', code: 'RETAIL', name: 'Retail' })).toBe(
      'Harga cost-plus (Daftar Harga Retail)'
    );
    expect(describePriceSource('cost_plus:RETAIL')).toBe('Harga cost-plus (Daftar Harga RETAIL)');
  });

  it('names a manual override plainly', () => {
    expect(describePriceSource('manual')).toBe('Harga manual');
  });

  it('renders an unrecognised source verbatim instead of crashing', () => {
    expect(describePriceSource('promo:BLACKFRIDAY')).toBe('promo:BLACKFRIDAY');
  });

  it('returns an empty string when there is nothing to say', () => {
    expect(describePriceSource(null)).toBe('');
    expect(describePriceSource('')).toBe('');
  });
});

describe('priceSourceTone', () => {
  it('singles out a manual price, which is the only one a reviewer must notice', () => {
    expect(priceSourceTone('manual')).toBe('manual');
    expect(priceSourceTone('list:RESELLER tier:1')).toBe('list');
    expect(priceSourceTone('cost_plus:RETAIL')).toBe('list');
    expect(priceSourceTone('base')).toBe('neutral');
    expect(priceSourceTone('promo:X')).toBe('neutral');
  });
});

describe('billingPeriodSuffix', () => {
  it('prints a recurring line period after the unit price', () => {
    expect(billingPeriodSuffix('monthly')).toBe('/bulan');
    expect(billingPeriodSuffix('yearly')).toBe('/tahun');
  });

  it('prints nothing for a one-off line or an unknown period', () => {
    expect(billingPeriodSuffix(null)).toBe('');
    expect(billingPeriodSuffix(undefined)).toBe('');
    expect(billingPeriodSuffix('weekly')).toBe('');
  });
});
