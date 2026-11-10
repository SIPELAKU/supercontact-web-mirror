import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Key People: the page and its search come from the API, and the detail
// carries the fields the list leaves out.

import { fetchKeyPeoplePage, fetchKeyPersonDetail } from './company-profile';

const fetchMock = vi.fn();
const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const lastUrl = () => (fetchMock.mock.calls.at(-1) as [string])[0];

const rina = {
  manage_user_id: 'mu-1',
  user_id: 'u-1',
  full_name: 'Rina Sari',
  email: 'rina@example.com',
  manage_user_level: 'Manager',
  manage_user_position: 'Sales Manager',
  manage_user_status: 'Active',
  employee_code: 'S-01',
  department_name: 'Sales',
  department_branch: 'HO',
};

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('NEXT_PUBLIC_API_URL', '/api/proxy');
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('fetchKeyPeoplePage', () => {
  it('asks for one page with the search, and reads the total', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [rina], page: 2, limit: 12, total: 25 }));
    const { people, total } = await fetchKeyPeoplePage('t', { page: 2, limit: 12, q: ' rina ' });
    expect(lastUrl()).toBe('/api/proxy/internal/company-profile/key-people?page=2&limit=12&q=rina');
    expect(total).toBe(25);
    expect(people[0]).toMatchObject({
      id: 'mu-1',
      name: 'Rina Sari',
      title: 'Sales Manager',
      level: 'Manager',
      department: 'Sales',
      branch: 'HO',
      employeeCode: 'S-01',
      email: 'rina@example.com',
    });
  });

  it('no search: no q in the URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [], page: 1, limit: 12, total: 0 }));
    await fetchKeyPeoplePage('t', { q: '  ' });
    expect(lastUrl()).toBe('/api/proxy/internal/company-profile/key-people?page=1&limit=12');
  });

  it('an API without a total counts the page', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [rina] }));
    expect((await fetchKeyPeoplePage('t')).total).toBe(1);
  });
});

describe('fetchKeyPersonDetail', () => {
  it('reads the detail, bio included, once the API sends it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        ...rina,
        bio: 'Leads the Jakarta team',
        phone: '0812',
        department_id: 'd-1',
        presence: 'away',
        avatar_url: 'https://cdn/r.webp',
        country: 'Indonesia',
        language: 'Bahasa Indonesia',
        timezone: 'Asia/Jakarta',
        joined_at: '2026-02-01T00:00:00Z',
      }),
    );
    const person = await fetchKeyPersonDetail('t', 'mu-1');
    expect(lastUrl()).toBe('/api/proxy/internal/company-profile/key-people/mu-1');
    expect(person).toMatchObject({
      name: 'Rina Sari',
      description: 'Leads the Jakarta team',
      phone: '0812',
      departmentId: 'd-1',
      presence: 'away',
      avatarUrl: 'https://cdn/r.webp',
      country: 'Indonesia',
      language: 'Bahasa Indonesia',
      timezone: 'Asia/Jakarta',
      joinedAt: '2026-02-01T00:00:00Z',
    });
  });

  it('a 404 is an error', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { detail: 'Key person not found' }));
    await expect(fetchKeyPersonDetail('t', 'nope')).rejects.toThrow();
  });
});
