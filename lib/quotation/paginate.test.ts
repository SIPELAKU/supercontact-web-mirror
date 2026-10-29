import { describe, expect, it } from 'vitest';

import { PAGE_MARGIN_PX, pageBreakShift, pageCount } from './paginate';

const PAGE = 1131;
const M = PAGE_MARGIN_PX;

describe('pageCount', () => {
  it('counts one page for a document up to one page tall', () => {
    expect(pageCount(1131)).toBe(1);
    // A pixel of rounding in scrollHeight is not a second page.
    expect(pageCount(1132)).toBe(1);
    expect(pageCount(0)).toBe(1);
  });

  it('counts every started page', () => {
    expect(pageCount(1200)).toBe(2);
    expect(pageCount(2262)).toBe(2);
    expect(pageCount(2300)).toBe(3);
  });
});

describe('pageBreakShift', () => {
  it('leaves a block that fits above the bottom margin', () => {
    expect(pageBreakShift(900, 100)).toBe(0);
    expect(pageBreakShift(PAGE - M - 100, 100)).toBe(0);
  });

  it('moves a block the page cut would split to below the next top margin', () => {
    // 1050..1150 crosses 1131: it starts again at 1131 + 48.
    expect(pageBreakShift(1050, 100)).toBe(PAGE + M - 1050);
  });

  it('moves a block that would end inside the bottom margin', () => {
    expect(pageBreakShift(1000, 100)).toBe(PAGE + M - 1000);
  });

  it('moves a block that starts inside the top margin of a later page', () => {
    expect(pageBreakShift(PAGE + 10, 50)).toBe(M - 10);
    expect(pageBreakShift(PAGE + M, 50)).toBe(0);
  });

  it('works on any page, not only the first', () => {
    expect(pageBreakShift(2 * PAGE - 60, 100)).toBe(2 * PAGE + M - (2 * PAGE - 60));
  });

  it('leaves blocks taller than a page and empty blocks alone', () => {
    expect(pageBreakShift(1050, PAGE)).toBe(0);
    expect(pageBreakShift(1050, 0)).toBe(0);
  });

  it('never moves anything on the first page top', () => {
    expect(pageBreakShift(0, 100)).toBe(0);
    expect(pageBreakShift(10, 100)).toBe(0);
  });
});
