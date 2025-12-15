"use client";

import { create } from "zustand";
import axiosInternal from "@/lib/utils/axiosInternal";
import { StageUI, transformPipelineResponse } from "@/lib/helper/transformPipeline";
import { formatRupiah } from "@/lib/helper/currency";
import { getDateRange } from "@/lib/helper/getDateRange";

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
  listPipeline: any[];
  stats: any[];
  loading: boolean;
  error: string | null;

  salespersonFilter: string;
  dateRangeFilter: string;

  setSalespersonFilter: (val: string) => void;
  setDateRangeFilter: (val: string) => void;

  fetchPipeline: (param?: PipelineQuery) => Promise<void>;

  postFormPipeline: (param?: reqBody) => Promise<void>;

  updateStagePipeline: (id?: string) => Promise<void>;
}

export const useGetPipelineStore = create<GetState>((set) => ({
  listPipeline: [],
  stats: [],
  loading: false,
  error: null,
  salespersonFilter: "all",
  dateRangeFilter: "all",

  setSalespersonFilter: (v) => set({ salespersonFilter: v }),
  
  setDateRangeFilter: (v) => set({ dateRangeFilter: v }),

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
      set({ error: "Failed to fetch data" });
    } finally {
      set({ loading: false });
    }
  },

  postFormPipeline: async (body?: reqBody) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInternal.post("/sales/pipeline", { body });
      console.log('internal', JSON.stringify(res, null, 2));

    } catch (error) {
      console.info(error)
      set({ error: "Failed to post data" });
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
