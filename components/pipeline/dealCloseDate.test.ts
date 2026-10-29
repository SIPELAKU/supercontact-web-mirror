import { describe, expect, it } from 'vitest';
import { isCloseDateAllowed } from './dealCloseDate';

// 27 Oct 2026, mid-afternoon local time.
const now = new Date(2026, 9, 27, 15, 0, 0);
const day = (d: number, m = 9) => new Date(2026, m, d);

describe('isCloseDateAllowed (no past close date on an open deal)', () => {
  it('allows today, whatever the time, and any later day', () => {
    expect(isCloseDateAllowed(day(27), undefined, now)).toBe(true);
    expect(isCloseDateAllowed(day(28), undefined, now)).toBe(true);
    expect(isCloseDateAllowed(day(3, 11), undefined, now)).toBe(true);
  });

  it('rejects a day that has passed on a new deal', () => {
    expect(isCloseDateAllowed(day(26), undefined, now)).toBe(false);
  });

  it("keeps an expired deal's own past date, so it can be edited without moving it", () => {
    expect(isCloseDateAllowed(day(20), day(20), now)).toBe(true);
  });

  it('rejects moving an expired deal to another past day, and allows moving it forward', () => {
    expect(isCloseDateAllowed(day(15), day(20), now)).toBe(false);
    expect(isCloseDateAllowed(day(27), day(20), now)).toBe(true);
  });

  it('leaves an empty date to the "required" check', () => {
    expect(isCloseDateAllowed(undefined, undefined, now)).toBe(true);
  });
});
