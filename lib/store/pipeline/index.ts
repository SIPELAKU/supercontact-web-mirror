"use client";

import { create } from "zustand";
import axiosInternal from "@/lib/utils/axiosInternal";
import { StageUI, transformPipelineResponse } from "@/lib/helper/transformPipeline";
import { formatRupiah } from "@/lib/helper/currency";

export interface Metric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}


interface GetState {
  listPipeline: StageUI[];
  stats: Metric[];
  loading: boolean;
  error: string | null;

  fetchPipeline: () => Promise<void>;
}

export const useGetPipelineStore = create<GetState>((set) => ({
  listPipeline: [],
  stats: [],
  loading: false,
  error: null,

  fetchPipeline: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInternal.get("/sales/pipeline");
      const data = res.data.data
      

      const metrics = [
          {
            label: "Total Pipeline Value",
            value: formatRupiah(res.data.data.stats.total_pipeline),
            change: "+5%",
            isPositive: true,
          },
          {
            label: "Average Deal Size",
            value: formatRupiah(res.data.data.stats.avg_pipeline),
            change: "+2%",
            isPositive: true,
          },
          {
            label: "Win Rate",
            value: `${res.data.data.stats.winrate_pipeline}%`,
            change: "-1%",
            isPositive: false,
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
}));
