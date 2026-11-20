import { describe, expect, it } from 'vitest';
import { errorForIndex, planErrors } from './StageMappingPreview';

const report = {
  created: 0,
  skipped: 0,
  errors: [
    { index: 2, name: 'Simulasi', error: 'Stage not found' },
    { index: '4', error: '' },
    { name: 'x' },
    { index: null, error: 'A pipeline can have at most 8 stages, inactive ones included' },
  ],
};

describe('errorForIndex', () => {
  it('finds the API error of one blueprint stage by index', () => {
    expect(errorForIndex(report, 2)).toBe('Stage not found');
    expect(errorForIndex(report, 4)).toBe('Gagal');
    expect(errorForIndex(report, 1)).toBeNull();
    expect(errorForIndex(undefined, 0)).toBeNull();
  });
});

describe('planErrors', () => {
  it('errors about the whole plan (no index)', () => {
    expect(planErrors(report)).toEqual(['Gagal', 'A pipeline can have at most 8 stages, inactive ones included']);
    expect(planErrors(undefined)).toEqual([]);
  });
});
