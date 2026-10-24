import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

import { buildWorkbook, columnWidths, toRows, type ExportColumn } from './exportRows';

type Person = { name: string | null; phone?: string; visits: number };

const columns: ExportColumn<Person>[] = [
  { header: 'Name', value: (p) => p.name },
  { header: 'Phone', value: (p) => p.phone },
  { header: 'Visits', value: (p) => p.visits },
];

describe('toRows', () => {
  it('puts the headers first, then one row per item in column order', () => {
    expect(toRows(columns, [{ name: 'Budi', phone: '628123', visits: 3 }])).toEqual([
      ['Name', 'Phone', 'Visits'],
      ['Budi', '628123', 3],
    ]);
  });

  it('writes null and undefined as empty cells', () => {
    expect(toRows(columns, [{ name: null, visits: 0 }])[1]).toEqual(['', '', 0]);
  });

  it('trims stray spaces from text', () => {
    expect(toRows(columns, [{ name: '  Budi ', phone: ' 628123', visits: 2 }])[1]).toEqual(['Budi', '628123', 2]);
  });

  it('still produces the header row with no items', () => {
    expect(toRows(columns, [])).toEqual([['Name', 'Phone', 'Visits']]);
  });
});

describe('columnWidths', () => {
  it('fits the longest cell plus some air, never narrower than 8 or wider than 50', () => {
    expect(
      columnWidths([
        ['Name', 'Phone Number', 'X'],
        ['Fajar Sadboy', '+6285841999999', 'y'.repeat(80)],
      ])
    ).toEqual([{ wch: 14 }, { wch: 16 }, { wch: 50 }]);
  });
});

describe('buildWorkbook', () => {
  const rows: Person[] = [
    { name: 'Doe, "JD"\nJohn', phone: '+62 812', visits: 1 },
    { name: 'Rara', phone: '+6289630619575', visits: 2 },
  ];

  it('CSV: commas, quotes and line breaks survive', () => {
    const book = buildWorkbook(XLSX, columns, rows);
    const csv = XLSX.utils.sheet_to_csv(book.Sheets[book.SheetNames[0]]);
    expect(csv).toBe('Name,Phone,Visits\n"Doe, ""JD""\nJohn",+62 812,1\nRara,+6289630619575,2');
  });

  it('Excel: phone numbers stay text with every digit, columns are sized, the header has a filter', () => {
    const written = XLSX.write(buildWorkbook(XLSX, columns, rows, 'Sent'), { type: 'buffer', bookType: 'xlsx' });
    // cellStyles: SheetJS only reads column widths back when asked to.
    const book = XLSX.read(written, { type: 'buffer', cellStyles: true });
    const sheet = book.Sheets.Sent;

    expect(sheet.B3).toMatchObject({ t: 's', v: '+6289630619575' });
    expect(sheet.C3).toMatchObject({ t: 'n', v: 2 });
    // 14 characters (the two-line name, the full phone number) + 2; "Visits" hits the floor of 8.
    expect(sheet['!cols']?.map((c) => c.wch)).toEqual([16, 16, 8]);
    expect(sheet['!autofilter']).toEqual({ ref: 'A1:C3' });
  });

  it('keeps sheet names within what Excel accepts', () => {
    const book = buildWorkbook(XLSX, columns, rows, 'Sent / Read: [all] recipients of the October promo');
    expect(book.SheetNames[0]).toBe('Sent  Read all recipients of th');
  });
});
