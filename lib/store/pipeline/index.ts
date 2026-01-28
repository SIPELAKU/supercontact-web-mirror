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

  updateStagePipeline: (deal: any, newStage: string) => Promise<void>;

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
      set({ loading: true, error: null });

      const params: Record<string, string> = {};

      if (param?.dateRange && param.dateRange !== "all") {
        const range = getDateRange(param.dateRange);
        if (range) {
          params.date_from = String(range.start);
          params.date_to = String(range.end);
        }
      }

      if (param?.assigned_to && param.assigned_to !== "all") {
        params.assigned_to = param.assigned_to;
      }

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

  updateStagePipeline: async (deal: any, newStage: string) => {
    try {
      set({ loading: true, error: null });

      // Convert date to ISO 8601 format for the API
      // The UI uses MM/DD/YYYY format from formatMDY which needs conversion
      let formattedDate = deal.expected_close_date;
      if (typeof formattedDate === 'string' && formattedDate.includes('/')) {
        const parts = formattedDate.split('/');
        if (parts.length === 3) {
          const [m, d, y] = parts;
          formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
        }
      } else if (formattedDate && typeof formattedDate === 'string' && !formattedDate.includes('T')) {
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString();
        }
      }

      // Construct the full request body as required by the API
      const requestBody = {
        deal_name: deal.deal_name || "Untitled Deal",
        client_account: deal.client_account,
        deal_stage: newStage,
        expected_close_date: formattedDate,
        amount: Number(deal.amount) || 0,
        probability_of_close: Number(deal.probability_of_close) || 0,
        notes: deal.notes || "",
      };

      console.log("Updating pipeline with PUT:", deal.id, requestBody);

      const res = await api.put(`/pipelines/${deal.id}`, requestBody);

      // Refetch pipeline data to ensure UI stays in sync with backend
      if (res.status === 200) {
        await get().fetchPipeline({
          assigned_to: get().salespersonFilter,
          dateRange: get().dateRangeFilter,
        });
      }
    } catch (error) {
      console.error("Failed to update pipeline:", error)
      set({ error: "Failed to update data" });
      throw error; // Re-throw so the caller can handle it
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
