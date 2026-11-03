import { describe, expect, it } from 'vitest';

import { blankOptional, missingRequired } from './blueprintVariables';

describe('missingRequired / blankOptional', () => {
  const fields = [
    { key: 'NAMA_PERUSAHAAN', required: true },
    { key: 'EMAIL_CS' },
    { key: 'NOMOR_WA', required: false },
  ];

  it('a required field blank or only spaces blocks; optional ones do not', () => {
    expect(missingRequired(fields, {}).map((x) => x.key)).toEqual(['NAMA_PERUSAHAAN']);
    expect(missingRequired(fields, { NAMA_PERUSAHAAN: '   ' }).map((x) => x.key)).toEqual(['NAMA_PERUSAHAAN']);
    expect(missingRequired(fields, { NAMA_PERUSAHAAN: 'Toko Maju' })).toEqual([]);
  });

  it('blank optional fields are listed, the required one is not', () => {
    expect(blankOptional(fields, { NOMOR_WA: '0812' })).toEqual(['EMAIL_CS']);
    expect(blankOptional(fields, { NAMA_PERUSAHAAN: 'x', EMAIL_CS: 'a@b.id', NOMOR_WA: '0812' })).toEqual([]);
  });

  it('an older BE without `required`: nothing blocks', () => {
    expect(missingRequired([{ key: 'company_name' }], {})).toEqual([]);
  });
});
