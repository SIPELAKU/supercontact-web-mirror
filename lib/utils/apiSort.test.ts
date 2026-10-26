import { describe, expect, it } from 'vitest';

import { toApiSort } from './apiSort';
import {
  BROADCAST_RECIPIENT_SORT_KEYS,
  BROADCAST_SORT_KEYS,
  WA_RECIPIENT_SORT_KEYS,
} from '@/lib/types/whatsapp-marketing';

describe('toApiSort', () => {
  it('sends nothing when no column is sorted, so the API keeps its default order', () => {
    expect(toApiSort([], BROADCAST_SORT_KEYS)).toEqual({});
  });

  it('maps the sorted column to sort_by and its direction to sort_order', () => {
    expect(toApiSort([{ id: 'name', desc: false }], BROADCAST_SORT_KEYS)).toEqual({ sortBy: 'name', sortOrder: 'asc' });
    expect(toApiSort([{ id: 'created_at', desc: true }], BROADCAST_SORT_KEYS)).toEqual({
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('drops a column the endpoint cannot sort by (e.g. a stale sort restored from the URL)', () => {
    expect(toApiSort([{ id: 'phone_number', desc: false }], WA_RECIPIENT_SORT_KEYS)).toEqual({});
    expect(toApiSort([{ id: 'total_target', desc: true }], BROADCAST_SORT_KEYS)).toEqual({});
  });

  it('uses the first sorted column only - the APIs take one', () => {
    expect(
      toApiSort(
        [
          { id: 'company', desc: true },
          { id: 'name', desc: false },
        ],
        WA_RECIPIENT_SORT_KEYS
      )
    ).toEqual({ sortBy: 'company', sortOrder: 'desc' });
  });
});

// What each endpoint accepts, per the API docs (1.144.2). When the backend adds
// a key, add it here and enable sorting on that column.
describe('sort keys per endpoint', () => {
  it('GET /broadcasts', () => {
    expect(BROADCAST_SORT_KEYS).toEqual(['name', 'status', 'created_at']);
  });

  it('GET /recipients', () => {
    expect(WA_RECIPIENT_SORT_KEYS).toEqual(['name', 'email', 'company', 'created_at', 'updated_at']);
  });

  it('GET /broadcasts/{id}/recipients', () => {
    expect(BROADCAST_RECIPIENT_SORT_KEYS).toEqual([
      'name',
      'email',
      'phone_number',
      'company',
      'position',
      'address',
      'status',
      'created_at',
      'updated_at',
    ]);
  });
});
