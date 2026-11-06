import { describe, expect, it } from 'vitest';

import type { ContentGapVariable } from '@/lib/types/botPlayground';
import { canSkipKbFill, kbGapSignature, offersKbFill } from './kbFillOffer';

const gap = (key: string, statuses: (string | undefined)[]): ContentGapVariable => ({
  key,
  label: '',
  example: '',
  context: '',
  articles: statuses.map((status, i) => ({ id: `${key}-${i}`, title: `Artikel ${i}`, status })),
});

const allowed = { canListGaps: true, canEditArticles: true };

describe('offersKbFill', () => {
  it('placeholders left and the user may fill them: offer it', () => {
    expect(offersKbFill({ ...allowed, gapCount: 12 })).toBe(true);
  });

  it('every placeholder filled: no offer', () => {
    expect(offersKbFill({ ...allowed, gapCount: 0 })).toBe(false);
  });

  it('without either permission: no offer - the calls behind it would be refused', () => {
    expect(offersKbFill({ canListGaps: false, canEditArticles: true, gapCount: 12 })).toBe(false);
    expect(offersKbFill({ canListGaps: true, canEditArticles: false, gapCount: 12 })).toBe(false);
  });
});

describe('canSkipKbFill', () => {
  it('every article with a gap is still a draft (straight after Setup Cepat): may skip', () => {
    expect(canSkipKbFill({ variables: [gap('ALAMAT_PUSAT', ['draft', 'draft']), gap('URL_MAPS', ['draft'])] })).toBe(true);
  });

  it('one of them already published: must fill now - the bot can read it out', () => {
    expect(canSkipKbFill({ variables: [gap('ALAMAT_PUSAT', ['draft', 'published']), gap('URL_MAPS', ['draft'])] })).toBe(false);
  });

  it('no status reported (today the BE lists published articles only): treated as published', () => {
    expect(canSkipKbFill({ variables: [gap('ALAMAT_PUSAT', [undefined])] })).toBe(false);
  });

  it('nothing listed: nothing to skip', () => {
    expect(canSkipKbFill({ variables: [] })).toBe(false);
  });
});

describe('kbGapSignature', () => {
  it('the same set of placeholders gives the same signature, whatever the order', () => {
    expect(kbGapSignature({ variables: [gap('URL_MAPS', ['draft']), gap('ALAMAT_PUSAT', ['draft'])] })).toBe(
      kbGapSignature({ variables: [gap('ALAMAT_PUSAT', ['published']), gap('URL_MAPS', ['draft'])] })
    );
  });

  it('a new placeholder (another install) changes it - the panel comes back', () => {
    expect(kbGapSignature({ variables: [gap('ALAMAT_PUSAT', ['draft'])] })).not.toBe(
      kbGapSignature({ variables: [gap('ALAMAT_PUSAT', ['draft']), gap('DAFTAR_CABANG', ['draft'])] })
    );
  });
});
