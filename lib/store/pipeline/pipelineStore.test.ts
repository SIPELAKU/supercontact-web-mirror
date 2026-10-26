import { beforeEach, describe, expect, it, vi } from 'vitest';

// The kanban's "Assigned To" filter lists users with an active deal
// (`GET /pipelines/active-users`). It must refresh after every write that can
// change that list - not only when the page first loads.

const api = vi.hoisted(() => ({
  createPipeline: vi.fn(),
  updatePipeline: vi.fn(),
  updatePipelineStage: vi.fn(),
  fetchPipelines: vi.fn(),
  fetchActiveUsers: vi.fn(),
}));
vi.mock('@/lib/api/pipelines', () => api);

import { useGetPipelineStore } from './index';

const stat = { value: 0, percent: 0, trend: true };
const store = () => useGetPipelineStore.getState();
const filterNames = () => store().listActiveUser.map((u) => u.label);

describe('pipeline store: Assigned To filter refresh', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.fetchPipelines.mockResolvedValue({
      data: { pipelines: [], stats: { total_pipeline: stat, avg_pipeline: stat, winrate_pipeline: stat } },
    });
    api.fetchActiveUsers.mockResolvedValue({ data: { users: [{ id: 'u1', fullname: 'Tim SmartSales' }] } });
    useGetPipelineStore.setState({ listActiveUser: [], loading: false });
  });

  it('adds the new assignee to the filter right after Add Deal - no reload needed', async () => {
    await store().fetchActiveUser();
    expect(filterNames()).toEqual(['All', 'Tim SmartSales']);

    // The deal was assigned to afif, who had no deal before.
    api.createPipeline.mockResolvedValue({ success: true });
    api.fetchActiveUsers.mockResolvedValue({
      data: { users: [{ id: 'u1', fullname: 'Tim SmartSales' }, { id: 'u2', fullname: 'afif' }] },
    });

    const result = await store().postFormPipeline({} as never);

    expect(result.success).toBe(true);
    expect(filterNames()).toEqual(['All', 'Tim SmartSales', 'Afif']);
  });

  it('refreshes the filter after Update Deal and after a stage move', async () => {
    api.updatePipeline.mockResolvedValue({ success: true });
    await store().updateFormPipeline({} as never, 'deal-1');
    expect(api.fetchActiveUsers).toHaveBeenCalledTimes(1);

    api.updatePipelineStage.mockResolvedValue({});
    await store().updateStagePipeline('deal-1', 'Qualified');
    expect(api.fetchActiveUsers).toHaveBeenCalledTimes(2);
  });

  it('does not refresh the filter when the save fails', async () => {
    api.createPipeline.mockResolvedValue({ success: false, error: 'Bad request' });

    await store().postFormPipeline({} as never);

    expect(api.fetchActiveUsers).not.toHaveBeenCalled();
  });

  it('a silent refresh never turns on the board loading', async () => {
    const seen: boolean[] = [];
    const unsubscribe = useGetPipelineStore.subscribe((s) => seen.push(s.loading));

    await store().fetchActiveUser({ isSilent: true });
    unsubscribe();

    expect(seen).not.toContain(true);
    expect(filterNames()).toEqual(['All', 'Tim SmartSales']);
  });
});

describe('pipeline store: a sales user only sees their own deals', () => {
  const sentAssignedTo = () => api.fetchPipelines.mock.calls.at(-1)?.[0]?.assigned_to;

  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.fetchPipelines.mockResolvedValue({
      data: { pipelines: [], stats: { total_pipeline: stat, avg_pipeline: stat, winrate_pipeline: stat } },
    });
    api.fetchActiveUsers.mockResolvedValue({ data: { users: [] } });
    useGetPipelineStore.setState({ scopeUserId: null, salespersonFilter: 'all', listActiveUser: [] });
  });

  it('limits every fetch to the scoped user, whatever filter is asked for', async () => {
    useGetPipelineStore.setState({ scopeUserId: 'staff-1', salespersonFilter: 'someone-else' });

    await store().fetchPipeline({ assigned_to: 'all' });
    expect(sentAssignedTo()).toBe('staff-1');

    await store().fetchPipeline({ assigned_to: 'manager-1', isSilent: true });
    expect(sentAssignedTo()).toBe('staff-1');

    // After a save, the store refetches with no params at all.
    api.createPipeline.mockResolvedValue({ success: true });
    await store().postFormPipeline({} as never);
    expect(sentAssignedTo()).toBe('staff-1');
  });

  it('lets a manager see everyone, or filter by one user', async () => {
    await store().fetchPipeline({ assigned_to: 'all' });
    expect(sentAssignedTo()).toBeUndefined();

    await store().fetchPipeline({ assigned_to: 'staff-1' });
    expect(sentAssignedTo()).toBe('staff-1');
  });

  it('skips loading the Assigned To filter for a scoped user (it is hidden)', async () => {
    useGetPipelineStore.setState({ scopeUserId: 'staff-1' });

    await store().fetchActiveUser();

    expect(api.fetchActiveUsers).not.toHaveBeenCalled();
  });
});
