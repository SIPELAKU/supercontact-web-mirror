import { describe, expect, it } from 'vitest';
import { importProgressPercent } from './importProgress';

describe('importProgressPercent', () => {
  it('processed over total, as a whole percent', () => {
    expect(importProgressPercent(400, 1000)).toBe(40);
    expect(importProgressPercent(0, 2000)).toBe(0);
    expect(importProgressPercent(2000, 2000)).toBe(100);
  });

  it('rounds down, so 100% only when every row is done', () => {
    expect(importProgressPercent(1999, 2000)).toBe(99);
    expect(importProgressPercent(1, 3)).toBe(33);
  });

  it('stays within 0-100 when the counters disagree', () => {
    expect(importProgressPercent(1200, 1000)).toBe(100);
    expect(importProgressPercent(-5, 1000)).toBe(0);
  });

  it('no rows or missing numbers: null (shown as "—"), never a division error', () => {
    expect(importProgressPercent(0, 0)).toBeNull();
    expect(importProgressPercent(10, null)).toBeNull();
    expect(importProgressPercent(undefined, 100)).toBeNull();
  });
});
