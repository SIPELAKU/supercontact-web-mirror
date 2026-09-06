import { describe, expect, it } from 'vitest';
import {
  billingPeriodSuffix,
  describePriceSource,
  formatTier,
  parsePriceSource,
  priceSourcePromoCode,
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
    expect(parsePriceSource('base')).toEqual({
      kind: 'base',
      code: null,
      tier: null,
      promoCode: null,
      raw: 'base',
    });
    expect(parsePriceSource('manual')).toEqual({
      kind: 'manual',
      code: null,
      tier: null,
      promoCode: null,
      raw: 'manual',
    });
    expect(parsePriceSource('list:RESELLER tier:10')).toEqual({
      kind: 'list',
      code: 'RESELLER',
      tier: '10',
      promoCode: null,
      raw: 'list:RESELLER tier:10',
    });
    expect(parsePriceSource('cost_plus:RETAIL')).toEqual({
      kind: 'cost_plus',
      code: 'RETAIL',
      tier: null,
      promoCode: null,
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
      promoCode: null,
      raw: 'promo:BLACKFRIDAY',
    });
    // A malformed list source is unknown, not a half-parsed list.
    expect(parsePriceSource('list:RESELLER').kind).toBe('unknown');
    expect(parsePriceSource('list:RESELLER tier:').kind).toBe('unknown');
  });

  it('treats null, undefined and blank as unknown with an empty raw', () => {
    for (const value of [null, undefined, '', '   ']) {
      expect(parsePriceSource(value)).toEqual({
        kind: 'unknown',
        code: null,
        tier: null,
        promoCode: null,
        raw: '',
      });
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

/**
 * COMMERCIAL Phase 5 (spec I2 / I11). The promo suffix, one case per kind, WITH
 * and WITHOUT it, at the 32-character maximum the API's `PROMO_CODE_MAX_LENGTH`
 * allows.
 *
 * THE STRINGS BELOW ARE THE EXACT OUTPUT OF THE API'S `build_price_source`
 * (spec E1.1). The two parsers are one contract and this file is where they
 * meet: `build_price_source(kind, code=..., min_quantity=..., promo_code=...)`
 * appends ` promo:CODE` to the `base`, `list:` and `cost_plus:` forms, and
 * NEVER to `manual` (A11).
 *
 * Before this split the anchored `LIST_PATTERN` failed on every promoted line,
 * `kind` fell to `unknown`, and the seller's chip printed the raw machine
 * string `list:UMUM tier:1 promo:LEBARAN`. No API test could catch that,
 * because the API's own string was correct.
 */
describe('parsePriceSource with the promo suffix', () => {
  // 32 chars, the widest code `^[A-Z0-9_-]{2,32}$` permits.
  const WIDEST = 'A'.repeat(30) + '_9';

  it('reads a promoted BASE line', () => {
    expect(parsePriceSource('base promo:LEBARAN')).toEqual({
      kind: 'base',
      code: null,
      tier: null,
      promoCode: 'LEBARAN',
      raw: 'base promo:LEBARAN',
    });
    expect(parsePriceSource('base').promoCode).toBeNull();
  });

  it('reads a promoted LIST line without touching the tier', () => {
    expect(parsePriceSource('list:UMUM tier:1 promo:LEBARAN')).toEqual({
      kind: 'list',
      code: 'UMUM',
      tier: '1',
      promoCode: 'LEBARAN',
      raw: 'list:UMUM tier:1 promo:LEBARAN',
    });
    expect(parsePriceSource('list:UMUM tier:10.5 promo:LEBARAN').tier).toBe('10.5');
    expect(parsePriceSource('list:UMUM tier:1').promoCode).toBeNull();
  });

  it('reads a promoted COST_PLUS line and no longer glues the code', () => {
    // THE LATENT BUG (spec E1.1): the old branch sliced the prefix wholesale,
    // so `code` came back as the glued `'UMUM promo:X'` and the price-list
    // resolver looked up a code that does not exist.
    expect(parsePriceSource('cost_plus:UMUM promo:X1')).toEqual({
      kind: 'cost_plus',
      code: 'UMUM',
      tier: null,
      promoCode: 'X1',
      raw: 'cost_plus:UMUM promo:X1',
    });
    expect(parsePriceSource('cost_plus:UMUM').promoCode).toBeNull();
  });

  it('reads the widest code the API can write, on every kind', () => {
    expect(parsePriceSource(`base promo:${WIDEST}`).promoCode).toBe(WIDEST);
    const list = parsePriceSource(
      `list:${WIDEST} tier:9999999999.99 promo:${WIDEST}`
    );
    expect(list.kind).toBe('list');
    expect(list.code).toBe(WIDEST);
    expect(list.tier).toBe('9999999999.99');
    expect(list.promoCode).toBe(WIDEST);
    expect(parsePriceSource(`cost_plus:${WIDEST} promo:${WIDEST}`).code).toBe(WIDEST);
  });

  it('never reads a promo off a MANUAL line, because the API never writes one', () => {
    // A11: a manual override supersedes the list price AND the promotion, so
    // the stored value is the bare literal and the promo columns are NULL.
    expect(parsePriceSource('manual').kind).toBe('manual');
    expect(parsePriceSource('manual').promoCode).toBeNull();
  });

  it('leaves a bare `promo:X` unknown - the marker includes its leading space', () => {
    expect(parsePriceSource('promo:LEBARAN').kind).toBe('unknown');
    expect(parsePriceSource('promo:LEBARAN').promoCode).toBeNull();
    // ...and an unreadable head keeps NO promo code: `raw` already has the truth.
    expect(parsePriceSource('somethingelse promo:LEBARAN')).toEqual({
      kind: 'unknown',
      code: null,
      tier: null,
      promoCode: null,
      raw: 'somethingelse promo:LEBARAN',
    });
  });

  it('exposes the code through the one-line reader the chip uses', () => {
    expect(priceSourcePromoCode('list:UMUM tier:1 promo:LEBARAN')).toBe('LEBARAN');
    expect(priceSourcePromoCode('list:UMUM tier:1')).toBeNull();
    expect(priceSourcePromoCode(null)).toBeNull();
  });
});

describe('describePriceSource with the promo suffix', () => {
  it('names the promotion beside the list that priced the line', () => {
    expect(
      describePriceSource('list:RESELLER tier:10 promo:LEBARAN', {
        id: 'x',
        code: 'RESELLER',
        name: 'Reseller',
      })
    ).toBe('Harga dari Daftar Harga Reseller, tier ≥ 10, promo LEBARAN');
  });

  it('names it on the base and cost-plus branches too', () => {
    expect(describePriceSource('base promo:LEBARAN')).toBe('Harga dasar, promo LEBARAN');
    expect(describePriceSource('cost_plus:RETAIL promo:LEBARAN')).toBe(
      'Harga cost-plus (Daftar Harga RETAIL), promo LEBARAN'
    );
  });

  it('can be asked to LEAVE the promo out, for the one screen that names it twice', () => {
    // The quotation form renders a dedicated promo chip right beside this
    // string (spec I8). Two adjacent chips both spelling "LEBARAN" reads as a
    // rendering bug, so the form - and only the form - opts out.
    expect(
      describePriceSource('list:RESELLER tier:10 promo:LEBARAN', null, { includePromo: false })
    ).toBe('Harga dari Daftar Harga RESELLER, tier \u2265 10');
    expect(describePriceSource('base promo:LEBARAN', null, { includePromo: false })).toBe(
      'Harga dasar'
    );
    // The DEFAULT still names it, for the PDF and every read-only surface.
    expect(describePriceSource('base promo:LEBARAN', null, {})).toBe('Harga dasar, promo LEBARAN');
  });

  it('keeps every un-promoted sentence exactly as Phase 2 wrote it', () => {
    expect(describePriceSource('base')).toBe('Harga dasar');
    expect(describePriceSource('cost_plus:RETAIL')).toBe('Harga cost-plus (Daftar Harga RETAIL)');
    expect(describePriceSource('manual')).toBe('Harga manual');
  });
});

describe('priceSourceTone, widened union (spec I2 / M-f)', () => {
  it('gives a promoted line its OWN tone, not the price-list tone', () => {
    // A company promotion and a price list are different facts with different
    // owners; sharing a colour would make the seller read one as the other.
    expect(priceSourceTone('list:RESELLER tier:1 promo:LEBARAN')).toBe('promo');
    expect(priceSourceTone('cost_plus:RETAIL promo:LEBARAN')).toBe('promo');
    expect(priceSourceTone('base promo:LEBARAN')).toBe('promo');
  });

  it('keeps manual winning outright - a promoted manual line cannot exist', () => {
    expect(priceSourceTone('manual')).toBe('manual');
  });

  it('leaves every un-promoted tone where Phase 2 left it', () => {
    expect(priceSourceTone('list:RESELLER tier:1')).toBe('list');
    expect(priceSourceTone('cost_plus:RETAIL')).toBe('list');
    expect(priceSourceTone('base')).toBe('neutral');
    expect(priceSourceTone('promo:X')).toBe('neutral');
    expect(priceSourceTone(null)).toBe('neutral');
  });
});
