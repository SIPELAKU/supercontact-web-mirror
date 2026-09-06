import { describe, expect, it } from 'vitest';
import {
  CONTACT_TAG_COLORS,
  CONTACT_TAG_NAME_MAX_LENGTH,
  addTag,
  cleanTagName,
  describeArchiveImpact,
  describeRenameImpact,
  findTagByName,
  isTagNameAvailable,
  isValidTagColor,
  normalizeTagColor,
  normalizeTagName,
  removeTag,
  suggestTags,
  tagChipStyle,
  tagIdsFor,
  tagTextColor,
  validateTagDraft,
} from './contactTags';
import type { ContactTag, ContactTagBrief } from '@/lib/types/ContactTag';

function tag(partial: Partial<ContactTag> & { id: string; name: string }): ContactTag {
  return {
    color: null,
    company_id: 'c1',
    is_active: true,
    contact_count: 0,
    created_at: '2026-09-05T00:00:00Z',
    updated_at: '2026-09-05T00:00:00Z',
    ...partial,
  };
}

describe('normalizeTagName', () => {
  it('is the case-insensitive key the unique index computes', () => {
    // UNIQUE (company_id, lower(name)) - "VIP" and "vip" are ONE tag.
    expect(normalizeTagName('VIP')).toBe('vip');
    expect(normalizeTagName('  vip  ')).toBe('vip');
    expect(normalizeTagName('Pelanggan   Lama')).toBe('pelanggan lama');
    expect(normalizeTagName('')).toBe('');
    expect(normalizeTagName('   ')).toBe('');
  });

  it('trims and collapses whitespace on the value actually sent', () => {
    expect(cleanTagName('  Pelanggan   Lama ')).toBe('Pelanggan Lama');
    expect(cleanTagName('VIP')).toBe('VIP');
  });
});

describe('normalizeTagColor', () => {
  it('lower-cases a #rrggbb value and rejects everything else', () => {
    expect(normalizeTagColor('#AABBCC')).toBe('#aabbcc');
    expect(normalizeTagColor(' #22c55e ')).toBe('#22c55e');
    expect(normalizeTagColor('#abc')).toBeNull();
    expect(normalizeTagColor('red')).toBeNull();
    expect(normalizeTagColor('')).toBeNull();
    expect(normalizeTagColor(null)).toBeNull();
    expect(normalizeTagColor(undefined)).toBeNull();
  });

  it('treats "no colour" as valid but a malformed colour as not', () => {
    expect(isValidTagColor(null)).toBe(true);
    expect(isValidTagColor('')).toBe(true);
    expect(isValidTagColor('#22c55e')).toBe(true);
    expect(isValidTagColor('#22c5')).toBe(false);
    expect(isValidTagColor('rgb(1,2,3)')).toBe(false);
  });
});

describe('tagTextColor', () => {
  it('picks a readable foreground for every colour the picker offers', () => {
    for (const color of CONTACT_TAG_COLORS) {
      expect(['#0d121b', '#ffffff']).toContain(tagTextColor(color));
    }
  });

  it('is dark text on light backgrounds and light text on dark ones', () => {
    expect(tagTextColor('#ffffff')).toBe('#0d121b');
    expect(tagTextColor('#eab308')).toBe('#0d121b');
    expect(tagTextColor('#000000')).toBe('#ffffff');
    expect(tagTextColor('#6366f1')).toBe('#ffffff');
  });

  it('falls back to the neutral chip when a tag has no colour', () => {
    expect(tagChipStyle(null)).toEqual({ backgroundColor: '#e7ebf3', color: '#0d121b' });
    expect(tagChipStyle('#3b82f6').backgroundColor).toBe('#3b82f6');
  });
});

describe('findTagByName / isTagNameAvailable', () => {
  const tags = [
    tag({ id: 't1', name: 'VIP' }),
    tag({ id: 't2', name: 'Reseller' }),
    tag({ id: 't3', name: 'Lama', is_active: false }),
  ];

  it('matches case-insensitively, which is what create-on-type must do', () => {
    expect(findTagByName(tags, 'vip')?.id).toBe('t1');
    expect(findTagByName(tags, '  ViP ')?.id).toBe('t1');
    expect(findTagByName(tags, 'baru')).toBeNull();
    expect(findTagByName(tags, '')).toBeNull();
    expect(findTagByName(null, 'vip')).toBeNull();
  });

  it('matches an ARCHIVED tag too - the unique index does not skip them', () => {
    // Posting "lama" again would 409 even though the row is archived, so the
    // editor has to find it rather than offer to create a second one.
    expect(findTagByName(tags, 'lama')?.id).toBe('t3');
    expect(isTagNameAvailable(tags, 'Lama')).toBe(false);
  });

  it('lets a tag keep its own name while renaming', () => {
    expect(isTagNameAvailable(tags, 'VIP', 't1')).toBe(true);
    expect(isTagNameAvailable(tags, 'vip', 't2')).toBe(false);
    expect(isTagNameAvailable(tags, 'Baru', 't1')).toBe(true);
  });
});

describe('suggestTags', () => {
  const all = [
    tag({ id: 't1', name: 'VIP' }),
    tag({ id: 't2', name: 'Reseller' }),
    tag({ id: 't3', name: 'Arsip', is_active: false }),
  ];

  it('hides what the contact already carries and what is archived', () => {
    const selected: ContactTagBrief[] = [{ id: 't2', name: 'Reseller', color: null }];
    expect(suggestTags(all, selected, '').map((t) => t.id)).toEqual(['t1']);
  });

  it('filters case-insensitively on what was typed', () => {
    expect(suggestTags(all, [], 'res').map((t) => t.id)).toEqual(['t2']);
    expect(suggestTags(all, [], 'VI').map((t) => t.id)).toEqual(['t1']);
    expect(suggestTags(all, [], 'zzz')).toEqual([]);
  });

  it('never suggests an archived tag, even by exact name', () => {
    expect(suggestTags(all, [], 'Arsip')).toEqual([]);
  });
});

describe('the replace payload', () => {
  const vip: ContactTagBrief = { id: 't1', name: 'VIP', color: '#3b82f6' };
  const reseller: ContactTagBrief = { id: 't2', name: 'Reseller', color: null };

  it('adds without duplicating and keeps the order stable', () => {
    expect(addTag([vip], reseller)).toEqual([vip, reseller]);
    expect(addTag([vip, reseller], vip)).toEqual([vip, reseller]);
  });

  it('normalises a missing colour to null when adding', () => {
    expect(addTag([], { id: 't9', name: 'Baru' } as ContactTagBrief)).toEqual([
      { id: 't9', name: 'Baru', color: null },
    ]);
  });

  it('removes by id and copies, so the loaded contact is never mutated', () => {
    const loaded = [vip, reseller];
    const next = removeTag(loaded, 't1');
    expect(next).toEqual([reseller]);
    expect(loaded).toHaveLength(2);
    next[0].name = 'changed';
    expect(reseller.name).toBe('Reseller');
  });

  it('serialises to the id list PUT /contacts/{id}/tags takes, de-duplicated', () => {
    expect(tagIdsFor([vip, reseller, vip])).toEqual(['t1', 't2']);
    expect(tagIdsFor([])).toEqual([]);
    expect(tagIdsFor(null)).toEqual([]);
  });

  it('clearing every tag is an EMPTY list, not a skipped request', () => {
    // The endpoint replaces the whole set, so "no tags" has to be sent as [].
    expect(tagIdsFor(removeTag([vip], 't1'))).toEqual([]);
  });
});

describe('validateTagDraft', () => {
  const existing = [tag({ id: 't1', name: 'VIP' })];

  it('accepts a clean new tag', () => {
    expect(validateTagDraft({ name: 'Korporat', color: '#22c55e' }, existing)).toEqual({});
    expect(validateTagDraft({ name: 'Korporat', color: null }, existing)).toEqual({});
  });

  it('refuses a blank name, an over-long name and a duplicate', () => {
    expect(validateTagDraft({ name: '  ', color: null }, existing).name).toBeTruthy();
    expect(
      validateTagDraft({ name: 'x'.repeat(CONTACT_TAG_NAME_MAX_LENGTH + 1), color: null }, existing).name
    ).toContain(String(CONTACT_TAG_NAME_MAX_LENGTH));
    expect(validateTagDraft({ name: 'vip', color: null }, existing).name).toBeTruthy();
  });

  it('lets the tag being renamed keep its own name', () => {
    expect(validateTagDraft({ name: 'VIP', color: null }, existing, 't1')).toEqual({});
  });

  it('refuses a malformed colour under the `color` key the API uses', () => {
    expect(validateTagDraft({ name: 'Baru', color: '#zzz' }, existing).color).toBeTruthy();
  });
});

describe('rename and archive impact copy', () => {
  it('states the affected count BEFORE the rename commits', () => {
    expect(describeRenameImpact('VIP', 'Prioritas', 12)).toBe(
      '"VIP" akan berubah menjadi "Prioritas". 12 kontak memakai tag ini dan semuanya ikut berubah.'
    );
  });

  it('says "nobody yet" out loud rather than hiding a zero', () => {
    expect(describeRenameImpact('VIP', 'Prioritas', 0)).toContain('Belum ada kontak');
    expect(describeRenameImpact('VIP', 'Prioritas', null)).toContain('Belum ada kontak');
    expect(describeRenameImpact('VIP', 'Prioritas', undefined)).toContain('Belum ada kontak');
  });

  it('says archiving does not unlink the contacts that carry the tag', () => {
    expect(describeArchiveImpact('VIP', 3)).toContain('3 kontak');
    expect(describeArchiveImpact('VIP', 3)).toContain('tidak melepasnya');
    expect(describeArchiveImpact('VIP', 0)).toContain('belum dipakai');
  });
});
