import { describe, expect, it } from 'vitest';

import { toApiSort } from './apiSort';
import {
  BROADCAST_GROUP_SORT_KEYS,
  BROADCAST_RECIPIENT_SORT_KEYS,
  BROADCAST_SORT_KEYS,
  BROADCAST_TEMPLATE_SORT_KEYS,
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
    expect(toApiSort([{ id: 'types', desc: false }], BROADCAST_TEMPLATE_SORT_KEYS)).toEqual({});
    expect(toApiSort([{ id: 'address', desc: true }], WA_RECIPIENT_SORT_KEYS)).toEqual({});
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

// What each endpoint accepts, per the API docs (1.154.1, the same on PROD
// 1.144.3). When the backend adds a key, add it here and enable sorting on
// that column.
describe('sort keys per endpoint', () => {
  it('GET /broadcasts', () => {
    expect(BROADCAST_SORT_KEYS).toEqual(['name', 'status', 'total_target', 'created_at']);
  });

  it('GET /recipients', () => {
    expect(WA_RECIPIENT_SORT_KEYS).toEqual([
      'name',
      'email',
      'phone_number',
      'company',
      'position',
      'created_at',
      'updated_at',
    ]);
  });

  it('GET /broadcast-templates', () => {
    expect(BROADCAST_TEMPLATE_SORT_KEYS).toEqual([
      'friendly_name',
      'language',
      'whatsapp_approval_status',
      'created_at',
      'updated_at',
    ]);
  });

  it('GET /broadcast-groups', () => {
    expect(BROADCAST_GROUP_SORT_KEYS).toEqual(['name', 'recipient_count', 'created_at']);
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
