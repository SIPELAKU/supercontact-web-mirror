import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/logger', () => ({
  logger: new Proxy({}, { get: () => () => {} }),
}));

import { fetchAllBroadcastRecipients, fetchBroadcastRecipients } from './whatsapp-marketing';

const requested: URL[] = [];

const respond = (status: number, body: unknown) =>
  vi.fn((url: string) => {
    requested.push(new URL(url));
    return Promise.resolve(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    );
  });

const page = (recipients: unknown[]) => ({
  success: true,
  data: { total: recipients.length, page: 1, limit: recipients.length, total_pages: 1, recipients },
});

beforeEach(() => {
  requested.length = 0;
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test/api/v1');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('broadcast recipients API', () => {
  it('export: asks for one status with is_limit=false, and no page or limit', async () => {
    vi.stubGlobal('fetch', respond(200, page([{ id: 'r1' }, { id: 'r2' }])));

    const rows = await fetchAllBroadcastRecipients('token', 'b1', 'delivered');

    expect(rows).toEqual([{ id: 'r1' }, { id: 'r2' }]);
    const url = requested[0];
    expect(url.pathname).toBe('/api/v1/broadcasts/b1/recipients');
    expect(url.searchParams.get('status')).toBe('delivered');
    expect(url.searchParams.get('is_limit')).toBe('false');
    expect(url.searchParams.has('page')).toBe(false);
    expect(url.searchParams.has('limit')).toBe(false);
  });

  it('export: an empty list comes back as no rows', async () => {
    vi.stubGlobal('fetch', respond(200, { success: true, data: null }));
    await expect(fetchAllBroadcastRecipients('token', 'b1', 'read')).resolves.toEqual([]);
  });

  it('export: a failed request throws the API message', async () => {
    vi.stubGlobal('fetch', respond(404, { success: false, error: { message: 'Broadcast not found' } }));
    await expect(fetchAllBroadcastRecipients('token', 'missing', 'sent')).rejects.toThrow('Broadcast not found');
  });

  it('table: still paginates with is_limit=true', async () => {
    vi.stubGlobal('fetch', respond(200, page([])));

    await fetchBroadcastRecipients('token', 'b1', 2, 5, 'budi', 'read');

    const params = requested[0].searchParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('5');
    expect(params.get('is_limit')).toBe('true');
    expect(params.get('search')).toBe('budi');
    expect(params.get('status')).toBe('read');
  });
});
