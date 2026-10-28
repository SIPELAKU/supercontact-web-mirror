import { describe, expect, it } from 'vitest';

import { broadcastTemplatesQuery } from './useBroadcastTemplates';
import { groupBroadcastsQuery } from './useGroupBroadcasts';

const asObject = (query: URLSearchParams) => Object.fromEntries(query.entries());

describe('broadcastTemplatesQuery (GET /broadcast-templates)', () => {
  it('sends only the page, limit and sender until a filter or sort is chosen', () => {
    expect(asObject(broadcastTemplatesQuery({ page: 1, limit: 10, account_id: 'acc-1' }))).toEqual({
      page: '1',
      limit: '10',
      account_id: 'acc-1',
    });
  });

  it('sends the search, approval status and language filters', () => {
    expect(
      asObject(
        broadcastTemplatesQuery({ page: 2, limit: 25, search: 'promo', status: 'Not submitted', language: 'id' })
      )
    ).toEqual({ page: '2', limit: '25', search: 'promo', status: 'Not submitted', language: 'id' });
  });

  it('sends the sort with its direction, newest first when none is given', () => {
    expect(
      asObject(broadcastTemplatesQuery({ page: 1, limit: 10, sort_by: 'friendly_name', sort_order: 'asc' }))
    ).toMatchObject({ sort_by: 'friendly_name', sort_order: 'asc' });
    expect(asObject(broadcastTemplatesQuery({ page: 1, limit: 10, sort_by: 'updated_at' }))).toMatchObject({
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
  });

  it('never sends a direction without a column', () => {
    expect(broadcastTemplatesQuery({ page: 1, limit: 10, sort_order: 'asc' }).has('sort_order')).toBe(false);
  });
});

describe('groupBroadcastsQuery (GET /broadcast-groups)', () => {
  it('sends only the page and limit until a search or sort is chosen', () => {
    expect(asObject(groupBroadcastsQuery({ page: 1, limit: 25 }))).toEqual({ page: '1', limit: '25' });
  });

  it('sends the search and the sort', () => {
    expect(
      asObject(groupBroadcastsQuery({ page: 3, limit: 25, search: 'VIP', sort_by: 'recipient_count', sort_order: 'asc' }))
    ).toEqual({ page: '3', limit: '25', search: 'VIP', sort_by: 'recipient_count', sort_order: 'asc' });
  });

  it('sorts newest first when no direction is given, and never sends a direction alone', () => {
    expect(asObject(groupBroadcastsQuery({ sort_by: 'name' }))).toEqual({ sort_by: 'name', sort_order: 'desc' });
    expect(groupBroadcastsQuery({ sort_order: 'asc' }).has('sort_order')).toBe(false);
  });
});
