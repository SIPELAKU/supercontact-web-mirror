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
