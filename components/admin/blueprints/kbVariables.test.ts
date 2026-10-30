import { describe, expect, it } from 'vitest';

import { extraKbVariables, filledCount } from './kbVariables';

const v = (key: string, label = key) => ({ key, label });

describe('extraKbVariables', () => {
  it('no kb_variables (older BE): nothing extra', () => {
    expect(extraKbVariables({ variables: [v('company_name')] })).toEqual([]);
    expect(extraKbVariables({ variables: [v('company_name')], kb_variables: [] })).toEqual([]);
    expect(extraKbVariables(undefined)).toEqual([]);
  });

  it('drops the keys the blueprint already asks, keeps the rest in order', () => {
    const detail = {
      variables: [v('company_name'), v('no_wa_cs')],
      kb_variables: [v('company_name'), v('ALAMAT_PUSAT'), v('no_wa_cs'), v('URL_MAPS')],
    };
    expect(extraKbVariables(detail).map((x) => x.key)).toEqual(['ALAMAT_PUSAT', 'URL_MAPS']);
  });

  it('a key listed by two packs is asked once', () => {
    const detail = { variables: [], kb_variables: [v('ALAMAT_PUSAT', 'A'), v('ALAMAT_PUSAT', 'B')] };
    expect(extraKbVariables(detail)).toEqual([v('ALAMAT_PUSAT', 'A')]);
  });

  it('keys are compared exactly: {{company_name}} and {{COMPANY_NAME}} are different tokens', () => {
    const detail = { variables: [v('company_name')], kb_variables: [v('COMPANY_NAME')] };
    expect(extraKbVariables(detail).map((x) => x.key)).toEqual(['COMPANY_NAME']);
  });

  it('skips entries without a key', () => {
    const detail = { variables: [], kb_variables: [v(''), v('URL_MAPS')] };
    expect(extraKbVariables(detail).map((x) => x.key)).toEqual(['URL_MAPS']);
  });
});

describe('filledCount', () => {
  it('counts only non-blank values of these fields', () => {
    const fields = [v('A'), v('B'), v('C')];
    expect(filledCount(fields, { A: 'x', B: '   ', OTHER: 'y' })).toBe(1);
    expect(filledCount(fields, {})).toBe(0);
  });
});
