import { describe, expect, it } from 'vitest';

import {
  articleFillRequest,
  articlePlaceholderFields,
  articlesWithPlaceholders,
  otherArticlesSharing,
  placeholderSnippet,
  placeholderPayload,
  articlesFromGaps,
  placeholderRejection,
  publishReadiness,
  splitOwnPlaceholder,
  unfilledPlaceholders,
} from './kbPlaceholders';

describe('articlesFromGaps', () => {
  const gaps = {
    variables: [
      { key: 'ALAMAT_PUSAT', articles: [{ id: 'a1', title: 'Lokasi', status: 'draft' }] },
      {
        key: 'URL_MAPS',
        articles: [
          { id: 'a1', title: 'Lokasi', status: 'draft' },
          { id: 'a2', title: 'Cabang', status: 'published' },
        ],
      },
    ],
  };

  it('one entry per article, with every placeholder left in it', () => {
    expect(articlesFromGaps(gaps)).toEqual([
      { id: 'a1', title: 'Lokasi', status: 'draft', placeholders: ['ALAMAT_PUSAT', 'URL_MAPS'] },
      { id: 'a2', title: 'Cabang', status: 'published', placeholders: ['URL_MAPS'] },
    ]);
  });

  it('a key listed twice for the same article counts once', () => {
    const dup = { variables: [{ key: 'X', articles: [{ id: 'a1', title: 't' }, { id: 'a1', title: 't' }] }] };
    expect(articlesFromGaps(dup)[0].placeholders).toEqual(['X']);
  });

  it('no gaps, or not loaded: no articles', () => {
    expect(articlesFromGaps({ variables: [] })).toEqual([]);
    expect(articlesFromGaps(undefined)).toEqual([]);
  });
});

describe('publishReadiness', () => {
  const gapsById = new Map(articlesFromGaps({
    variables: [
      { key: 'ALAMAT_PUSAT', articles: [{ id: 'a1', title: 'Lokasi', status: 'draft' }, { id: 'a2', title: 'Peta', status: 'draft' }] },
      { key: 'URL_MAPS', articles: [{ id: 'a2', title: 'Peta', status: 'draft' }] },
    ],
  }).map((a) => [a.id, a]));

  it('a draft with nothing left to fill is ready', () => {
    expect(publishReadiness({ id: 'a9', status: 'draft' }, gapsById)).toBe('ready');
  });

  it('an article with placeholders left reports how many, whatever its status', () => {
    expect(publishReadiness({ id: 'a1', status: 'draft' }, gapsById)).toBe(1);
    expect(publishReadiness({ id: 'a1', status: 'published' }, gapsById)).toBe(1);
    expect(publishReadiness({ id: 'a2', status: 'draft' }, gapsById)).toBe(2);
  });

  it('nothing to say for a clean published article, an archived one, or unknown gaps', () => {
    expect(publishReadiness({ id: 'a9', status: 'published' }, gapsById)).toBeNull();
    expect(publishReadiness({ id: 'a1', status: 'archived' }, gapsById)).toBeNull();
    expect(publishReadiness({ id: 'a9', status: 'draft' }, undefined)).toBeNull();
  });
});

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

describe('articlePlaceholderFields', () => {
  const gaps = {
    variables: [
      { key: 'ALAMAT_PUSAT', label: 'Alamat pusat', example: 'Jl. Sudirman 1', articles: [{ id: 'a1' }, { id: 'a2' }] },
      { key: 'URL_MAPS', label: 'Link Maps', example: '', articles: [{ id: 'a2' }] },
      { key: 'company_name', articles: [{ id: 'a1' }] },
    ],
  };

  it("one field per placeholder left in that article, with its label and example", () => {
    expect(articlePlaceholderFields(gaps, 'a1')).toEqual([
      { key: 'ALAMAT_PUSAT', label: 'Alamat pusat', example: 'Jl. Sudirman 1' },
      { key: 'COMPANY_NAME', label: '', example: '' },
    ]);
    expect(articlePlaceholderFields(gaps, 'a2').map((f) => f.key)).toEqual(['ALAMAT_PUSAT', 'URL_MAPS']);
  });

  it('an article with nothing left, or gaps not loaded: no fields', () => {
    expect(articlePlaceholderFields(gaps, 'a9')).toEqual([]);
    expect(articlePlaceholderFields(undefined, 'a1')).toEqual([]);
  });

  it('a key listed twice counts once', () => {
    const dup = { variables: [{ key: 'X', articles: [{ id: 'a1' }] }, { key: 'X', articles: [{ id: 'a1' }] }] };
    expect(articlePlaceholderFields(dup, 'a1')).toHaveLength(1);
  });

  it('the same name in two cases (an older install) is one upper-case field, keeping the label', () => {
    const mixed = {
      variables: [
        { key: 'alamat_pusat', articles: [{ id: 'a1' }] },
        { key: 'ALAMAT_PUSAT', label: 'Alamat kantor/outlet utama', example: 'Jl. Melati 12', articles: [{ id: 'a1' }, { id: 'a2' }] },
      ],
    };
    expect(articlePlaceholderFields(mixed, 'a1')).toEqual([
      { key: 'ALAMAT_PUSAT', label: 'Alamat kantor/outlet utama', example: 'Jl. Melati 12' },
    ]);
  });

  it('the label of the first copy is kept when it has one', () => {
    const mixed = {
      variables: [
        { key: 'URL_MAPS', label: 'Link Google Maps', example: 'https://maps.app.goo.gl/x', articles: [{ id: 'a1' }] },
        { key: 'url_maps', label: 'Url Maps', example: 'other', articles: [{ id: 'a1' }] },
      ],
    };
    expect(articlePlaceholderFields(mixed, 'a1')).toEqual([
      { key: 'URL_MAPS', label: 'Link Google Maps', example: 'https://maps.app.goo.gl/x' },
    ]);
  });

  it('a copy in another article only does not add a field', () => {
    const mixed = {
      variables: [
        { key: 'ALAMAT_PUSAT', articles: [{ id: 'a1' }] },
        { key: 'alamat_pusat', label: 'Alamat', articles: [{ id: 'a2' }] },
      ],
    };
    expect(articlePlaceholderFields(mixed, 'a1')).toEqual([{ key: 'ALAMAT_PUSAT', label: '', example: '' }]);
  });
});

describe('otherArticlesSharing', () => {
  const gaps = {
    variables: [
      { key: 'ALAMAT_PUSAT', articles: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] },
      { key: 'URL_MAPS', articles: [{ id: 'a1' }, { id: 'a2' }, { id: 'a4' }] },
      { key: 'JAM_BUKA', articles: [{ id: 'a5' }] },
    ],
  };

  it("counts each other article once, across all of this article's placeholders", () => {
    expect(otherArticlesSharing(gaps, 'a1', ['ALAMAT_PUSAT', 'URL_MAPS'])).toBe(3);
  });

  it('only the given placeholders count', () => {
    expect(otherArticlesSharing(gaps, 'a1', ['ALAMAT_PUSAT'])).toBe(2);
    expect(otherArticlesSharing(gaps, 'a5', ['JAM_BUKA'])).toBe(0);
    expect(otherArticlesSharing(undefined, 'a1', ['ALAMAT_PUSAT'])).toBe(0);
  });

  it('either case counts: an older {{alamat_pusat}} article is filled by ALAMAT_PUSAT too', () => {
    const mixed = {
      variables: [
        { key: 'ALAMAT_PUSAT', articles: [{ id: 'a1' }, { id: 'a2' }] },
        { key: 'alamat_pusat', articles: [{ id: 'a3' }] },
      ],
    };
    expect(otherArticlesSharing(mixed, 'a1', ['ALAMAT_PUSAT'])).toBe(2);
    expect(otherArticlesSharing(mixed, 'a1', ['alamat_pusat'])).toBe(2);
  });
});

describe('placeholderSnippet', () => {
  it('a window of the body around the placeholder, whitespace tidied', () => {
    const body = 'Kunjungi toko kami.\n\nCabang utama kami di {{ALAMAT_PUSAT}}, buka setiap hari.';
    expect(placeholderSnippet({ body }, 'ALAMAT_PUSAT', 12)).toEqual({
      where: 'body',
      text: '…ama kami di {{ALAMAT_PUSAT}}, buka setia…',
    });
    // Line breaks and runs of spaces inside the window read as one space.
    expect(placeholderSnippet({ body: 'Alamat:\n\n  {{ALAMAT_PUSAT}}' }, 'ALAMAT_PUSAT')?.text).toBe(
      'Alamat: {{ALAMAT_PUSAT}}',
    );
  });

  it('title first, then excerpt, then body; any case, inner spaces', () => {
    const article = { title: 'Belanja di {{ company_name }}', excerpt: 'Tentang {{COMPANY_NAME}}', body: 'Isi {{company_name}}' };
    expect(placeholderSnippet(article, 'company_name')).toEqual({ where: 'title', text: 'Belanja di {{ company_name }}' });
    expect(placeholderSnippet({ excerpt: 'Tentang {{COMPANY_NAME}}', body: 'x' }, 'company_name')?.where).toBe('excerpt');
  });

  it('a key that is a prefix of another does not match it', () => {
    expect(placeholderSnippet({ body: 'Ongkir {{ETA_JAWA_TIMUR}}' }, 'ETA_JAWA')).toBeNull();
  });

  it('not in the article (or no text): null', () => {
    expect(placeholderSnippet({ title: 'Lokasi', excerpt: null, body: 'Jl. Sudirman' }, 'ALAMAT_PUSAT')).toBeNull();
    expect(placeholderSnippet({}, 'ALAMAT_PUSAT')).toBeNull();
  });
});

describe('articleFillRequest', () => {
  it('only this article by default, blanks left out', () => {
    expect(articleFillRequest({ ALAMAT_PUSAT: ' Jl. Sudirman 1 ', URL_MAPS: '' }, 'a1', false)).toEqual({
      values: { ALAMAT_PUSAT: 'Jl. Sudirman 1' },
      articleIds: ['a1'],
    });
  });

  it('every article carrying the placeholders when the user asks for it', () => {
    expect(articleFillRequest({ ALAMAT_PUSAT: 'Jl. Sudirman 1' }, 'a1', true)).toEqual({
      values: { ALAMAT_PUSAT: 'Jl. Sudirman 1' },
    });
  });
});
