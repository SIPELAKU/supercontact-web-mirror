import { beforeEach, describe, expect, it, vi } from 'vitest';

// The deal form's Client/Account picker lists LEADS (`GET /leads`) - only the
// statuses the BO allows - so each option carries one contact and one assignee.

const get = vi.hoisted(() => vi.fn());
vi.mock('@/lib/utils/axiosClient', () => ({ default: { get } }));

import { fetchDealLeads } from './pipelines';

const sentQuery = () => (get.mock.calls[0][1].params as URLSearchParams).toString();

describe('fetchDealLeads', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { success: true, data: { leads: [{ id: 'l1' }] } } });
  });

  it('asks only for Contacted and Qualified leads, repeating the key as FastAPI expects', async () => {
    await fetchDealLeads();

    expect(get.mock.calls[0][0]).toBe('/leads');
    expect(sentQuery()).toBe('limit=100&lead_status=Contacted&lead_status=Qualified');
    expect(sentQuery()).not.toContain('lead_status%5B%5D'); // not axios' `lead_status[]=`
  });

  it('adds the typed search', async () => {
    const leads = await fetchDealLeads('Budi');

    expect(sentQuery()).toBe('limit=100&lead_status=Contacted&lead_status=Qualified&search=Budi');
    expect(leads).toEqual([{ id: 'l1' }]);
  });

  it('returns an empty list when the response has no leads', async () => {
    get.mockResolvedValue({ data: { success: true, data: {} } });
    expect(await fetchDealLeads()).toEqual([]);
  });
});
