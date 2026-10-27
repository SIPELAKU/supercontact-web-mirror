"use client";

import { create } from "zustand";
import { StageUI, mapBoardStages, mapPipelineDeal } from "@/lib/helper/transformPipeline";
import { formatRupiah } from "@/lib/helper/currency";
import { getDateRange } from "@/lib/helper/getDateRange";
import { DealStage } from "@/components/pipeline/SelectDealStage";
import * as pipelineAPI from "@/lib/api/pipelines";


export interface ValidationItem {
  type: string;
  loc: string[];
  msg: string;
  input?: unknown;
}

interface Users {
  id: string;
  active_pipeline_count: number;
  fullname: string;
}

export interface PipelineValidationResponse {
  error: string;
  details: ValidationItem[];
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface PipelineQuery {
  /** Reload without the board skeleton (a filter change, or after a move). */
  isSilent?: boolean;
}

export interface reqBody {
  client_account: string;
  product_id: string;
  deal_stage: string;
  expected_close_date: string;
  quantity: number;
  probability_of_close: number | string;
  notes: string;
  assigned_to: string;
  lead_id?: string;
}

export type DealForm = Omit<reqBody, "expected_close_date"> & {
  expected_close_date?: Date;
};

interface GetState {
  listPipeline: StageUI[];
  listActiveUser: DealStage[];
  stage: string;
  id: string;
  stats: Metric[];
  loading: boolean;
  /** A silent board reload is running (no skeleton). */
  refreshing: boolean;
  /** Columns whose "Load more" is running, by stage name. */
  loadingMoreStages: Record<string, boolean>;
  /**
   * Filters of the board on screen. "Load more" resends exactly these, not
   * the current ones, because each column cursor belongs to them.
   */
  boardFilters: pipelineAPI.PipelineBoardFilters | null;
  error: string | null;
  isModalOpen: boolean;
  /** The search box, sent to the API (after the board's debounce). */
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  salespersonFilter: string;
  /**
   * Set for roles that only see their own deals (not Admin/Manager/Super
   * Admin): every board fetch is then limited to this user, whatever the
   * Assigned To filter says. null = sees every deal.
   */
  scopeUserId: string | null;
  setScopeUserId: (val: string | null) => void;
  dateRangeFilter: string;
  /** "all", or one deal status the API filters by ("active" / "expired"). */
  dealStatusFilter: string;
  setSalespersonFilter: (val: string) => void;
  setDateRangeFilter: (val: string) => void;
  setDealStatusFilter: (val: string) => void;
  setEditId: (val: string) => void;
  setStage: (val: string) => void;
  setIsModalOpen: (val: boolean) => void;
  fetchActiveUser: (param?: { isSilent?: boolean }) => Promise<void>;

  /** Resolves true when this load's board is the one now in the store. */
  fetchPipeline: (param?: PipelineQuery) => Promise<boolean>;

  /** Appends the next deals of one column (its "Load more"). */
  loadMoreDeals: (stageName: string) => Promise<void>;

  postFormPipeline: (param?: reqBody) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  /**
   * Saves the stage, then reloads the board quietly. Resolves true when the
   * reloaded board (with the move) is in the store; throws when the save fails.
   */
  updateStagePipeline: (id: string, deal_stage: string) => Promise<boolean>;

  updateFormPipeline: (param?: reqBody, id?: string) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;
}

const toMetrics = (stats: pipelineAPI.PipelineStatsResponse): Metric[] => [
  {
    label: "Total Pipeline Value",
    value: formatRupiah(stats.total_pipeline.value),
    change: `${stats.total_pipeline.percent}%`,
    isPositive: Boolean(stats.total_pipeline.trend),
  },
  {
    label: "Average Deal Size",
    value: formatRupiah(stats.avg_pipeline.value),
    change: `${stats.avg_pipeline.percent}%`,
    isPositive: Boolean(stats.avg_pipeline.trend),
  },
  {
    label: "Win Rate",
    value: `${stats.winrate_pipeline.value}%`,
    change: `${stats.winrate_pipeline.percent}%`,
    isPositive: Boolean(stats.winrate_pipeline.trend),
  },
];

/**
 * Every board filter, in the shape the board endpoints take. A scoped user
 * only ever sees their own deals: that wins over the Assigned To filter, so
 * no call path can load someone else's (the BE enforces it too).
 */
function boardFiltersFrom(
  state: Pick<GetState, "dateRangeFilter" | "salespersonFilter" | "scopeUserId" | "searchFilter" | "dealStatusFilter">
): pipelineAPI.PipelineBoardFilters {
  const filters: pipelineAPI.PipelineBoardFilters = {};

  const range = state.dateRangeFilter !== "all" ? getDateRange(state.dateRangeFilter) : null;
  if (range) {
    filters.date_from = range.start;
    filters.date_to = range.end;
  }

  const assignedTo = state.scopeUserId || state.salespersonFilter;
  if (assignedTo && assignedTo !== "all") {
    filters.assigned_to = [assignedTo];
  }

  const search = state.searchFilter.trim();
  if (search) {
    filters.search = search;
  }

  if (state.dealStatusFilter !== "all") {
    filters.status = [state.dealStatusFilter as pipelineAPI.PipelineDealStatus];
  }

  return filters;
}

// Bumped by every board load. Only the latest load may update the board: an
// older response that arrives late (the user changed a filter meanwhile) is
// dropped, and so is a "Load more" started before it.
let boardRequestSeq = 0;

export const useGetPipelineStore = create<GetState>((set, get) => ({
  listPipeline: [],
  stats: [],
  listActiveUser: [],
  loading: false,
  refreshing: false,
  loadingMoreStages: {},
  boardFilters: null,
  stage: "",
  isModalOpen: false,
  id: "",
  error: null,
  searchFilter: "",
  salespersonFilter: "all",
  scopeUserId: null,
  dateRangeFilter: "all",
  dealStatusFilter: "all",

  setSearchFilter: (v) => set({ searchFilter: v }),

  setDealStatusFilter: (v) => set({ dealStatusFilter: v }),

  setSalespersonFilter: (v) => set({ salespersonFilter: v }),

  setScopeUserId: (v) => set({ scopeUserId: v }),

  setDateRangeFilter: (v) => set({ dateRangeFilter: v }),

  setEditId: (v) => set({ id: v }),

  setStage: (val: string) => set({ stage: val }),

  setIsModalOpen: (v) => set({ isModalOpen: v }),

  // `isSilent` refreshes the Assigned To filter after a write without turning
  // on the board's global loading (which would flash the skeleton).
  fetchActiveUser: async (param) => {
    // A scoped user has no Assigned To filter, so there is nothing to load.
    if (get().scopeUserId) return;
    try {
      if (!param?.isSilent) {
        set({ loading: true, error: null });
      }
      const res = await pipelineAPI.fetchActiveUsers();
      const data = res.data
      const temp: DealStage[] = [{ label: "All", value: 'all' }]
      data.users.map((arr: Users) => {
        const body = {
          label: arr.fullname.charAt(0).toUpperCase() + arr.fullname.slice(1),
          value: arr.id
        }
        temp.push(body)
      })

      set({ listActiveUser: temp })
    } catch (err) {
      set({ error: "Failed to fetch data" });
    } finally {
      if (!param?.isSilent) {
        set({ loading: false });
      }
    }
  },

  // One request per load: `GET /pipelines/board` brings every column with its
  // first deals, count and total, and the stats. Filters come from the store.
  fetchPipeline: async (param?: PipelineQuery) => {
    const requestId = ++boardRequestSeq;
    set({
      ...(param?.isSilent ? { refreshing: true } : { loading: true }),
      error: null,
      // A new board means new cursors: any "Load more" still running is dropped.
      loadingMoreStages: {},
    });

    try {
      const filters = boardFiltersFrom(get());
      const data = await pipelineAPI.fetchPipelineBoard(filters);
      if (requestId !== boardRequestSeq) return false;

      set({
        listPipeline: mapBoardStages(data.stages),
        stats: toMetrics(data.stats),
        boardFilters: filters,
      });
      return true;
    } catch (err) {
      if (requestId === boardRequestSeq) set({ error: "Failed to fetch data" });
      return false;
    } finally {
      if (requestId === boardRequestSeq) set({ loading: false, refreshing: false });
    }
  },

  loadMoreDeals: async (stageName: string) => {
    const { listPipeline, boardFilters, loadingMoreStages } = get();
    const column = listPipeline.find((s) => s.name === stageName);
    if (!column?.nextCursor || !boardFilters || loadingMoreStages[stageName]) return;

    const boardId = boardRequestSeq;
    set({ loadingMoreStages: { ...loadingMoreStages, [stageName]: true } });

    try {
      const page = await pipelineAPI.fetchPipelineBoardColumn(boardFilters, stageName, column.nextCursor);
      // The board was reloaded meanwhile: these deals belong to the old one.
      if (boardId !== boardRequestSeq) return;

      set((state) => ({
        listPipeline: state.listPipeline.map((stage) => {
          if (stage.name !== stageName) return stage;
          const loaded = new Set(stage.deals.map((d) => d.id));
          const more = page.deals.map((item) => mapPipelineDeal(item)).filter((d) => !loaded.has(d.id));
          // count and total already cover the whole column, so they stay.
          return { ...stage, deals: [...stage.deals, ...more], nextCursor: page.next_cursor ?? null };
        }),
      }));
    } catch (err) {
      if (boardId !== boardRequestSeq) return;
      // The cursor no longer matches the filters: start the board again.
      if (pipelineAPI.isStaleCursorError(err)) {
        await get().fetchPipeline({ isSilent: true });
        return;
      }
      throw err;
    } finally {
      if (boardId === boardRequestSeq) {
        set((state) => ({ loadingMoreStages: { ...state.loadingMoreStages, [stageName]: false } }));
      }
    }
  },

  postFormPipeline: async (body?: reqBody): Promise<{ success: boolean; error?: string; validation?: ValidationItem[]; }> => {
    try {
      set({ loading: true, error: null });

      const response = await pipelineAPI.createPipeline(body as pipelineAPI.CreatePipelineRequest);

      if (response.success) {
        // The deal's assignee may be new to the Assigned To filter.
        await Promise.all([get().fetchPipeline(), get().fetchActiveUser({ isSilent: true })]);
        return { success: true };
      }

      return {
        success: false,
        error: response.error || "Unexpected response",
        validation: response.validation
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create pipeline",
      };
    } finally {
      set({ loading: false });
    }
  },

  updateStagePipeline: async (id: string, stage: string) => {
    try {
      // Don't set global loading: true to avoid UI blocking
      set({ error: null });
      await pipelineAPI.updatePipelineStage(id, { deal_stage: stage });

      // A stage change can change who still has an active deal.
      const [reloaded] = await Promise.all([
        get().fetchPipeline({ isSilent: true }),
        get().fetchActiveUser({ isSilent: true }),
      ]);
      return reloaded;
    } catch (error) {
      console.error("Error patching pipeline stage:", error);
      set({ error: "Failed to update pipeline stage" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateFormPipeline: async (body?: reqBody, id?: string): Promise<{ success: boolean; error?: string; validation?: ValidationItem[]; }> => {
    try {
      set({ loading: true, error: null });

      const response = await pipelineAPI.updatePipeline(id!, body as pipelineAPI.UpdatePipelineRequest);

      if (response.success) {
        // The assignee may have changed, so the Assigned To filter too.
        await Promise.all([get().fetchPipeline(), get().fetchActiveUser({ isSilent: true })]);
        return { success: true };
      }

      return {
        success: false,
        error: response.error || "Unexpected response",
        validation: response.validation
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update pipeline",
      };
    } finally {
      set({ loading: false });
    }
  }
}));
