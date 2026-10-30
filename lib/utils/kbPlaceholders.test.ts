import { describe, expect, it } from 'vitest';

import {
  articlesWithPlaceholders,
  placeholderPayload,
  placeholderRejection,
  splitOwnPlaceholder,
  unfilledPlaceholders,
} from './kbPlaceholders';

describe('splitOwnPlaceholder', () => {
  const context = 'Sabtu: {{JAM_SABTU}} - Minggu & hari libur nasional: {{JAM_MINGGU}} - Pesan';

  it("marks only the field's own placeholder; the neighbour stays plain text", () => {
    expect(splitOwnPlaceholder(context, 'JAM_MINGGU')).toEqual([
      { text: 'Sabtu: {{JAM_SABTU}} - Minggu & hari libur nasional: ', own: false },
      { text: '{{JAM_MINGGU}}', own: true },
      { text: ' - Pesan', own: false },
    ]);
  });

  it('marks every occurrence, any case, with inner spaces', () => {
    expect(splitOwnPlaceholder('{{ jam_sabtu }} lalu {{JAM_SABTU}}', 'JAM_SABTU')).toEqual([
      { text: '{{ jam_sabtu }}', own: true },
      { text: ' lalu ', own: false },
      { text: '{{JAM_SABTU}}', own: true },
    ]);
  });

  it('a key that is a prefix of another does not match it', () => {
    expect(splitOwnPlaceholder('{{ETA_JAWA}} dan {{ETA_JAWA_TIMUR}}', 'ETA_JAWA').filter((p) => p.own)).toEqual([
      { text: '{{ETA_JAWA}}', own: true },
    ]);
  });

  it('no own placeholder (cut off by the snippet): the whole text, unmarked', () => {
    expect(splitOwnPlaceholder('Tautan Google Maps: {{URL_M', 'URL_MAPS')).toEqual([
      { text: 'Tautan Google Maps: {{URL_M', own: false },
    ]);
  });
});

describe('placeholderPayload', () => {
  it('sends the typed values, trimmed', () => {
    expect(placeholderPayload({ ALAMAT_PUSAT: '  Jl. Sudirman No. 1 ', URL_MAPS: 'https://maps.app/x' })).toEqual({
      ALAMAT_PUSAT: 'Jl. Sudirman No. 1',
      URL_MAPS: 'https://maps.app/x',
    });
  });

  it('leaves blank and whitespace-only fields out, so they stay visible placeholders', () => {
    expect(placeholderPayload({ ALAMAT_PUSAT: 'Jl. Sudirman', DAFTAR_CABANG: '', URL_MAPS: '   ' })).toEqual({
      ALAMAT_PUSAT: 'Jl. Sudirman',
    });
  });

  it('nothing typed: an empty payload', () => {
    expect(placeholderPayload({})).toEqual({});
    expect(placeholderPayload({ A: ' ' })).toEqual({});
  });
});

describe('unfilledPlaceholders', () => {
  it('finds marketing-pack (upper case) and blueprint (lower case) placeholders, once each, in order', () => {
    const body = 'Cabang di {{ALAMAT_PUSAT}}, WA {{no_wa_cs}}. Peta: {{ URL_MAPS }}. Lagi: {{ALAMAT_PUSAT}}';
    expect(unfilledPlaceholders(body)).toEqual(['ALAMAT_PUSAT', 'no_wa_cs', 'URL_MAPS']);
  });

  it('a filled article, an empty body or no body: nothing left', () => {
    expect(unfilledPlaceholders('Cabang di Jl. Sudirman No. 1, Jakarta.')).toEqual([]);
    expect(unfilledPlaceholders('')).toEqual([]);
    expect(unfilledPlaceholders(null)).toEqual([]);
    expect(unfilledPlaceholders(undefined)).toEqual([]);
  });

  it('braces that are not a placeholder do not count', () => {
    expect(unfilledPlaceholders('kode {promo} atau {{ }} atau {{dua kata}}')).toEqual([]);
  });
});

describe('articlesWithPlaceholders', () => {
  it('keeps only the articles that still carry one, with what is left', () => {
    expect(
      articlesWithPlaceholders([
        { id: 'a1', title: 'Lokasi', body: 'Di {{ALAMAT_PUSAT}} ({{URL_MAPS}})' },
        { id: 'a2', title: 'Cara bayar', body: 'Transfer ke virtual account.' },
        { id: 'a3', title: 'Kontak', body: 'WA {{no_wa_cs}}' },
      ])
    ).toEqual([
      { id: 'a1', title: 'Lokasi', placeholders: ['ALAMAT_PUSAT', 'URL_MAPS'] },
      { id: 'a3', title: 'Kontak', placeholders: ['no_wa_cs'] },
    ]);
  });

  it('all clean: nothing blocked', () => {
    expect(articlesWithPlaceholders([{ id: 'a2', title: 'Cara bayar', body: 'Transfer.' }])).toEqual([]);
  });
});

describe('placeholderRejection', () => {
  const refusal = (details: unknown) => ({ success: false, data: null, error: { code: 'CONFLICT', message: 'x', details } });

  it('reads the blocked articles out of the API refusal', () => {
    const err = refusal({
      reason: 'unfilled_placeholders',
      articles: [
        { id: 'a1', title: 'Lokasi toko', placeholders: ['ALAMAT_PUSAT', 'URL_MAPS'] },
        { id: 'a2', title: '', placeholders: ['company_name'] },
      ],
    });
    expect(placeholderRejection(err)).toEqual([
      { id: 'a1', title: 'Lokasi toko', placeholders: ['ALAMAT_PUSAT', 'URL_MAPS'] },
      { id: 'a2', title: '(tanpa judul)', placeholders: ['company_name'] },
    ]);
  });

  it('reads the 422 the API actually sends: bulk `articles` with article_id', () => {
    const err = {
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Article still contains unfilled placeholders; fill them in before publishing',
        details: { articles: [{ article_id: 'b1', title: 'Lokasi toko', placeholders: ['ALAMAT_PUSAT'] }] },
      },
    };
    expect(placeholderRejection(err)).toEqual([{ id: 'b1', title: 'Lokasi toko', placeholders: ['ALAMAT_PUSAT'] }]);
  });

  it('reads the single-article 422: details is the article itself', () => {
    const err = refusal({ article_id: 'c1', title: 'Jam buka', placeholders: ['jam_buka', 'company_name'] });
    expect(placeholderRejection(err)).toEqual([{ id: 'c1', title: 'Jam buka', placeholders: ['jam_buka', 'company_name'] }]);
  });

  it('any other error: nothing (the caller shows its usual message)', () => {
    expect(placeholderRejection(refusal({ reason: 'something_else', articles: [] }))).toEqual([]);
    expect(placeholderRejection(refusal([{ loc: ['body', 'title'], msg: 'field required' }]))).toEqual([]);
    expect(placeholderRejection(refusal({ article_id: 'x', title: 'no blanks' }))).toEqual([]);
    expect(placeholderRejection(refusal(null))).toEqual([]);
    expect(placeholderRejection(new Error('UNAUTHORIZED'))).toEqual([]);
    expect(placeholderRejection(null)).toEqual([]);
    expect(placeholderRejection({ detail: 'Not Found' })).toEqual([]);
  });

  it('drops entries without an id or without placeholders', () => {
    const err = refusal({
      reason: 'unfilled_placeholders',
      articles: [{ title: 'no id', placeholders: ['X'] }, { id: 'a3', title: 'empty', placeholders: [] }, { id: 'a4', title: 'ok', placeholders: ['Y'] }],
    });
    expect(placeholderRejection(err).map((a) => a.id)).toEqual(['a4']);
  });
});
