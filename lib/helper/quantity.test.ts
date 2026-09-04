import { describe, expect, it } from 'vitest';
import { formatQuantityWithUnit, stepForPrecision } from './quantity';

describe('stepForPrecision', () => {
  it('maps the unit precision to the input step', () => {
    expect(stepForPrecision(0)).toBe(1);
    expect(stepForPrecision(1)).toBe(0.1);
    expect(stepForPrecision(2)).toBe(0.01);
  });

  it('treats an unknown precision as whole numbers and never exceeds two decimals', () => {
    expect(stepForPrecision(undefined)).toBe(1);
    expect(stepForPrecision(null)).toBe(1);
    expect(stepForPrecision(5)).toBe(0.01);
  });
});

describe('formatQuantityWithUnit', () => {
  it('prints the quantity with the unit name and no padding zeros', () => {
    expect(formatQuantityWithUnit('2.00', 'porsi', 0)).toBe('2 porsi');
    expect(formatQuantityWithUnit('1.50', 'kg', 2)).toBe('1,5 kg');
    expect(formatQuantityWithUnit(3, 'box', 0)).toBe('3 box');
  });

  it('prints just the number when the line has no unit', () => {
    expect(formatQuantityWithUnit('1.50', null, 2)).toBe('1,5');
    expect(formatQuantityWithUnit('2.00', undefined, 2)).toBe('2');
    expect(formatQuantityWithUnit('2.00', '   ', 0)).toBe('2');
  });

  it('never prints fewer decimals than the stored quantity carries (A3/A5)', () => {
    // A unit lowered to 0/1 decimals, or assigned after the line was saved,
    // must not change what the customer-facing document says.
    expect(formatQuantityWithUnit('1.50', 'porsi', 0)).toBe('1,5 porsi');
    expect(formatQuantityWithUnit('2.50', 'pcs', 0)).toBe('2,5 pcs');
    expect(formatQuantityWithUnit('1.25', 'kg', 1)).toBe('1,25 kg');
    expect(formatQuantityWithUnit('1.25', 'kg')).toBe('1,25 kg');
    expect(formatQuantityWithUnit(1.5, 'kg', 0)).toBe('1,5 kg');
  });

  it('still drops padding zeros whatever the precision hint', () => {
    expect(formatQuantityWithUnit('2.00', 'porsi', 0)).toBe('2 porsi');
    expect(formatQuantityWithUnit('2.00', 'porsi', 2)).toBe('2 porsi');
    expect(formatQuantityWithUnit('1.50', 'kg', 0)).toBe('1,5 kg');
    expect(formatQuantityWithUnit('1.10', 'kg', 0)).toBe('1,1 kg');
  });

  it('caps the display at the two decimals the column stores', () => {
    expect(formatQuantityWithUnit(1.005, 'kg', 0)).toBe('1 kg');
    expect(formatQuantityWithUnit(0.1 + 0.2, 'kg', 0)).toBe('0,3 kg');
  });

  it('shows 0 for junk', () => {
    expect(formatQuantityWithUnit('x', 'pcs', 0)).toBe('0 pcs');
    expect(formatQuantityWithUnit(null, null, 2)).toBe('0');
  });
});
