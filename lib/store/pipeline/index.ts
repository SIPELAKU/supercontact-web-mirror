"use client";

import { create } from "zustand";
import axiosInternal from "@/lib/utils/axiosInternal";
import { StageUI, transformPipelineResponse } from "@/lib/helper/transformPipeline";
import { formatRupiah } from "@/lib/helper/currency";
import { getDateRange } from "@/lib/helper/getDateRange";
import type { AxiosError } from "axios";


export interface ValidationItem {
  type: string;
  loc: string[];
  msg: string;
  input?: unknown;
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
}

export interface reqBody {
  deal_name: string;
  client_account: string;
  deal_stage: string;
  expected_close_date: string;
  amount: number;
  probability_of_close: number;
  notes: string;
}

interface GetState {
  listPipeline: StageUI[];
  listActiveUser: [];
  stats: Metric[];
  loading: boolean;
  error: string | null;

  salespersonFilter: string;
  dateRangeFilter: string;

  setSalespersonFilter: (val: string) => void;
  setDateRangeFilter: (val: string) => void;

  fetchActiveUser: ()=> void;

  fetchPipeline: (param?: PipelineQuery) => Promise<void>;

  postFormPipeline: (
    param?: reqBody
  ) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  updateStagePipeline: (id?: string) => Promise<void>;
}

export const useGetPipelineStore = create<GetState>((set, get) => ({
  listPipeline: [],
  stats: [],
  listActiveUser: [],
  loading: false,
  error: null,
  salespersonFilter: "all",
  dateRangeFilter: "all",

  setSalespersonFilter: (v) => set({ salespersonFilter: v }),
  
  setDateRangeFilter: (v) => set({ dateRangeFilter: v }),

  fetchActiveUser: () => {

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

      const res = await axiosInternal.get("/sales/pipeline", { params });
      
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
      console.info(err)
      set({ error: "Failed to fetch data" });
    } finally {
      set({ loading: false });
    }
  },

  postFormPipeline: async (body?: reqBody): Promise<{success: boolean;error?: string;validation?: ValidationItem[];}> => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInternal.post("/sales/pipeline", body );

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

  updateStagePipeline: async (id?: string) => {
    try {
      set({ loading: true, error: null });
    } catch (error) {
      console.info(error)
      set({ error: "Failed to update data" });
    } finally {
      set({ loading: false });
    }
  }
}));
