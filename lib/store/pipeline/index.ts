"use client";

import { create } from "zustand";
import api from "@/lib/utils/axiosClient";
import { StageUI, transformPipelineResponse } from "@/lib/helper/transformPipeline";
import { formatRupiah } from "@/lib/helper/currency";
import { getDateRange } from "@/lib/helper/getDateRange";
import type { AxiosError } from "axios";
import { DealStage } from "@/components/pipeline/SelectDealStage";


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
  status?: string;
  salesperson?: string;
  dateRange?: string;
  search?: string;
  assigned_to?: string;
  isSilent?: boolean;
}

export interface reqBody {
  deal_name: string;
  client_account: string;
  deal_stage: string;
  expected_close_date: string;
  amount: number;
  probability_of_close: number | string;
  notes: string;
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
  error: string | null;
  isModalOpen: boolean;
  salespersonFilter: string;
  dateRangeFilter: string;
  setSalespersonFilter: (val: string) => void;
  setDateRangeFilter: (val: string) => void;
  setEditId: (val: string) => void;
  setStage: (val: string) => void;
  setIsModalOpen: (val: boolean) => void;
  fetchActiveUser: () => void;

  fetchPipeline: (param?: PipelineQuery) => Promise<void>;

  postFormPipeline: (param?: reqBody) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  updateStagePipeline: (id: string, deal_stage: string) => Promise<void>;

  updateFormPipeline: (param?: reqBody, id?: string) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;
}

export const useGetPipelineStore = create<GetState>((set, get) => ({
  listPipeline: [],
  stats: [],
  listActiveUser: [],
  loading: false,
  stage: "",
  isModalOpen: false,
  id: "",
  error: null,
  salespersonFilter: "all",
  dateRangeFilter: "all",

  setSalespersonFilter: (v) => set({ salespersonFilter: v }),

  setDateRangeFilter: (v) => set({ dateRangeFilter: v }),

  setEditId: (v) => set({ id: v }),

  setStage: (val: string) => set({ stage: val }),

  setIsModalOpen: (v) => set({ isModalOpen: v }),

  fetchActiveUser: async () => {
    try {
      set({ loading: true, error: null });
      const res = await api.get("/pipelines/active-users");
      const data = res.data.data
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
      set({ loading: false });
    }
  },

  fetchPipeline: async (param?: PipelineQuery) => {
    try {
      if (!param?.isSilent) {
        set({ loading: true, error: null });
      } else {
        set({ error: null });
      }

      const { dateRangeFilter, salespersonFilter } = get();

      const dateRange = param?.dateRange || dateRangeFilter;
      const assignedTo = param?.assigned_to || salespersonFilter;

      const params: Record<string, string> = {};

      if (dateRange && dateRange !== "all") {
        const range = getDateRange(dateRange);
        if (range) {
          params.date_from = String(range.start);
          params.date_to = String(range.end);
        }
      }

      if (assignedTo && assignedTo !== "all") {
        params.assigned_to = assignedTo;
      }

      console.log("[fetchPipeline] Requesting /pipelines with params:", params);
      const res = await api.get("/pipelines", { params });

      const data = res.data.data

      const metrics = [
        {
          label: "Total Pipeline Value",
          value: formatRupiah(data.stats.total_pipeline.value),
          change: `${data.stats.total_pipeline.percent}%`,
          isPositive: data.stats.total_pipeline.trend,
        },
        {
          label: "Average Deal Size",
          value: formatRupiah(data.stats.avg_pipeline.value),
          change: `${data.stats.avg_pipeline.percent}%`,
          isPositive: data.stats.avg_pipeline.trend,
        },
        {
          label: "Win Rate",
          value: `${data.stats.winrate_pipeline.value}%`,
          change: `${data.stats.winrate_pipeline.percent}%`,
          isPositive: data.stats.winrate_pipeline.trend,
        },
      ]

      const groupedStages = transformPipelineResponse(data);
      set({
        listPipeline: groupedStages,
        stats: metrics
      });
    } catch (err) {
      set({ error: "Failed to fetch data" });
    } finally {
      set({ loading: false });
    }
  },

  postFormPipeline: async (body?: reqBody): Promise<{ success: boolean; error?: string; validation?: ValidationItem[]; }> => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/pipelines", body);

      if (res.status === 200) {
        await get().fetchPipeline();
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };
    } catch (error) {
      const axiosErr = error as AxiosError<PipelineValidationResponse>;
      if (axiosErr.response?.status === 422 && axiosErr.response.data) {
        return {
          success: false,
          error: axiosErr.response.data.error,
          validation: axiosErr.response.data.details,
        };
      }
      return {
        success: false,
        error:
          axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to post pipeline",
      };
    } finally {
      set({ loading: false });
    }
  },

  updateStagePipeline: async (id: string, stage: string) => {
    try {
      // Don't set global loading: true to avoid UI blocking
      set({ error: null });
      const res = await api.patch(`/pipelines/${id}/stage`, {
        deal_stage: stage,
      });

      if (res.status === 200 || res.status === 204) {
        await get().fetchPipeline({ isSilent: true });
        return;
      }

      throw new Error("Failed to update pipeline stage");
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

      const res = await api.put(`/pipelines/${id}`, body);

      if (res.status === 200) {
        await get().fetchPipeline();
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };

    } catch (error) {

      const axiosErr = error as AxiosError<PipelineValidationResponse>;
      if (axiosErr.response?.status === 422 && axiosErr.response.data) {
        return {
          success: false,
          error: axiosErr.response.data.error,
          validation: axiosErr.response.data.details,
        };
      }
      return {
        success: false,
        error:
          axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to post pipeline",
      };
    } finally {
      set({ loading: false });
    }
  }
}));
