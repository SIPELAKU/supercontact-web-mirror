import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/logger', () => ({
  logger: new Proxy({}, { get: () => () => {} }),
}));

import { fetchAllCampaignSubscribers, fetchCampaignSubscribers } from './campaigns';

const requested: URL[] = [];

const respond = (status: number, body: unknown) =>
  vi.fn((url: string) => {
    requested.push(new URL(url));
    return Promise.resolve(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    );
  });

const page = (contacts: unknown[]) => ({
  success: true,
  data: { total: contacts.length, page: 1, limit: contacts.length, total_pages: 1, contacts },
});

beforeEach(() => {
  requested.length = 0;
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test/api/v1');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('campaign subscribers API', () => {
  it('export: asks for one status with is_limit=false, and no page or limit', async () => {
    vi.stubGlobal('fetch', respond(200, page([{ id: 's1' }, { id: 's2' }])));

    const rows = await fetchAllCampaignSubscribers('token', 'c1', 'opened');

    expect(rows).toEqual([{ id: 's1' }, { id: 's2' }]);
    const url = requested[0];
    expect(url.pathname).toBe('/api/v1/campaigns/c1/subscribers');
    expect(url.searchParams.get('status')).toBe('opened');
    expect(url.searchParams.get('is_limit')).toBe('false');
    expect(url.searchParams.has('page')).toBe(false);
    expect(url.searchParams.has('limit')).toBe(false);
  });

  it('export: an empty list comes back as no rows', async () => {
    vi.stubGlobal('fetch', respond(200, { success: true, data: null }));
    await expect(fetchAllCampaignSubscribers('token', 'c1', 'clicked')).resolves.toEqual([]);
  });

  it('export: a failed request throws the API message', async () => {
    vi.stubGlobal('fetch', respond(404, { success: false, error: { message: 'Campaign not found' } }));
    await expect(fetchAllCampaignSubscribers('token', 'missing', 'bounced')).rejects.toThrow('Campaign not found');
  });

  it('table: asks for one page, with the search', async () => {
    vi.stubGlobal('fetch', respond(200, page([])));

    await fetchCampaignSubscribers('token', 'c1', { page: 2, limit: 25, search: 'budi' });

    const params = requested[0].searchParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('25');
    expect(params.get('search')).toBe('budi');
    expect(params.has('is_limit')).toBe(false);
  });

  it('table: filters by status and sorts through the API', async () => {
    vi.stubGlobal('fetch', respond(200, page([])));

    await fetchCampaignSubscribers('token', 'c1', { status: 'opened', sortBy: 'status', sortOrder: 'asc' });

    const params = requested[0].searchParams;
    expect(params.get('status')).toBe('opened');
    expect(params.get('sort_by')).toBe('status');
    expect(params.get('sort_order')).toBe('asc');
  });

  it('table: sends no filter or sort until one is chosen, and descends by default', async () => {
    vi.stubGlobal('fetch', respond(200, page([])));

    await fetchCampaignSubscribers('token', 'c1');
    await fetchCampaignSubscribers('token', 'c1', { sortBy: 'name' });

    expect(requested[0].search).toBe('?page=1&limit=10');
    expect(requested[1].searchParams.get('sort_order')).toBe('desc');
  });
});
