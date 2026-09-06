import { describe, expect, it } from 'vitest';
import {
  compareToBasePrice,
  formatDateShort,
  formatMinQuantity,
  formatValidityRange,
  priceWindowLabel,
  priceWindowState,
  tierLabel,
  todayInJakarta,
} from './priceGrid';

describe('todayInJakarta', () => {
  it('uses WIB, not the browser timezone, because the server does', () => {
    // 18:00 UTC is already the next day in Jakarta (+07).
    expect(todayInJakarta(new Date('2026-09-03T18:00:00Z'))).toBe('2026-09-04');
    expect(todayInJakarta(new Date('2026-09-03T16:59:59Z'))).toBe('2026-09-03');
    // Midnight WIB exactly.
    expect(todayInJakarta(new Date('2026-09-03T17:00:00Z'))).toBe('2026-09-04');
  });
});

describe('formatDateShort', () => {
  it('reads an API date the Indonesian way', () => {
    expect(formatDateShort('2026-09-04')).toBe('4 Sep 2026');
    expect(formatDateShort('2026-01-31')).toBe('31 Jan 2026');
    expect(formatDateShort('2026-12-01')).toBe('1 Des 2026');
  });

  it('tolerates a timestamp and anything unparsable', () => {
    expect(formatDateShort('2026-09-04T10:00:00Z')).toBe('4 Sep 2026');
    expect(formatDateShort('nanti')).toBe('nanti');
    expect(formatDateShort('2026-13-01')).toBe('2026-13-01');
    expect(formatDateShort(null)).toBe('');
    expect(formatDateShort('')).toBe('');
  });
});

/**
 * The window states exist because a price row is never updated in place: a
 * re-price CLOSES the old row and inserts a new one. Closing at
 * `max(effective_from, valid_from) - 1 day` means a row superseded on the day
 * it started ends BEFORE it began - an empty window that is valid on no date
 * at all. That row still shows in the grid as history, so the grid has to name
 * that state instead of printing a backwards range.
 */
describe('priceWindowState', () => {
  const today = '2026-09-04';

  it('calls an open-ended row valid from today onward "open"', () => {
    expect(priceWindowState({ valid_from: '2026-09-01', valid_until: null }, today)).toBe('open');
    expect(priceWindowState({ valid_from: '2026-09-04', valid_until: null }, today)).toBe('open');
  });

  it('keeps a row whose window still contains today "open"', () => {
    expect(priceWindowState({ valid_from: '2026-09-01', valid_until: '2026-09-30' }, today)).toBe(
      'open'
    );
    // Ends today - still valid today (the window is inclusive).
    expect(priceWindowState({ valid_from: '2026-09-01', valid_until: '2026-09-04' }, today)).toBe(
      'open'
    );
  });

  it('calls a future row "scheduled"', () => {
    expect(priceWindowState({ valid_from: '2026-10-01', valid_until: null }, today)).toBe(
      'scheduled'
    );
  });

  it('calls a row that ended before today "closed"', () => {
    expect(priceWindowState({ valid_from: '2026-08-01', valid_until: '2026-09-03' }, today)).toBe(
      'closed'
    );
  });

  it('calls a same-day supersede "empty", not "closed"', () => {
    // add_price on the same day closes yesterday's start at valid_from - 1.
    expect(priceWindowState({ valid_from: '2026-09-04', valid_until: '2026-09-03' }, today)).toBe(
      'empty'
    );
    // Closing a FUTURE-dated row collapses it the same way.
    expect(priceWindowState({ valid_from: '2026-10-01', valid_until: '2026-09-30' }, today)).toBe(
      'empty'
    );
  });

  it('defaults to today in WIB when no date is passed', () => {
    expect(priceWindowState({ valid_from: '1900-01-01', valid_until: null })).toBe('open');
  });

  it('labels every state in Indonesian', () => {
    expect(priceWindowLabel('open')).toBe('Aktif');
    expect(priceWindowLabel('scheduled')).toBe('Terjadwal');
    expect(priceWindowLabel('closed')).toBe('Ditutup');
    expect(priceWindowLabel('empty')).toBe('Digantikan');
  });
});

describe('formatValidityRange', () => {
  const today = '2026-09-04';

  it('reads an open-ended row as a start date', () => {
    expect(formatValidityRange({ valid_from: '2026-09-01', valid_until: null }, today)).toBe(
      'Sejak 1 Sep 2026'
    );
  });

  it('reads a bounded row as a range', () => {
    expect(formatValidityRange({ valid_from: '2026-09-01', valid_until: '2026-09-30' }, today)).toBe(
      '1 Sep 2026 - 30 Sep 2026'
    );
  });

  it('never prints a backwards range for a superseded row', () => {
    expect(formatValidityRange({ valid_from: '2026-09-04', valid_until: '2026-09-03' }, today)).toBe(
      'Digantikan 4 Sep 2026'
    );
  });
});

describe('formatMinQuantity / tierLabel', () => {
  it('strips the Decimal padding the API sends', () => {
    expect(formatMinQuantity('1.00')).toBe('1');
    expect(formatMinQuantity('10.50')).toBe('10,5');
    expect(formatMinQuantity(0.25)).toBe('0,25');
    expect(formatMinQuantity(null)).toBe('');
  });

  it('says a tier is a MINIMUM, with the unit when the row has one', () => {
    expect(tierLabel('10.00', 'kg')).toBe('≥ 10 kg');
    expect(tierLabel('1.00', null)).toBe('≥ 1');
    expect(tierLabel('1.00', '  ')).toBe('≥ 1');
    expect(tierLabel(null, 'kg')).toBe('');
  });
});

describe('compareToBasePrice', () => {
  it('compares, and never produces a price of its own', () => {
    expect(compareToBasePrice('90000.00', '100000.00')).toBe('below');
    expect(compareToBasePrice('110000.00', '100000.00')).toBe('above');
    expect(compareToBasePrice('100000.00', '100000.00')).toBe('same');
  });

  it('is honest about a value it cannot read', () => {
    expect(compareToBasePrice(null, '100000.00')).toBe('unknown');
    expect(compareToBasePrice('90000.00', undefined)).toBe('unknown');
    expect(compareToBasePrice('gratis', '1')).toBe('unknown');
  });
});
