"use client";

import { useEffect } from "react";
import PipelineHeader from "@/components/pipeline/PipelineHeader";
import PipelineStats from "@/components/pipeline/PipelineStats";
import PipelineBoardWrapper from "@/components/pipeline/pipeline-board/PipelineBoardWrapper";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function PipelineClient() {
  const { fetchPipeline, fetchActiveUser, dateRangeFilter, salespersonFilter } = useGetPipelineStore();

  useEffect(() => {
    // Initial fetch of all data
    fetchPipeline({
      dateRange: "all",
      assigned_to: "all"
    });
    fetchActiveUser();
  }, []);

  // Silent fetch for salesperson filter change
  useEffect(() => {
    if (salespersonFilter !== "all") {
      fetchPipeline({
        dateRange: "all", // Always fetch all dates
        assigned_to: salespersonFilter,
        isSilent: true
      });
    } else {
      // If switching back to 'all', we might want to fetch everything again silently
      // checking if we already have all data would be optimization, but for now just fetch
      fetchPipeline({
        dateRange: "all",
        assigned_to: "all",
        isSilent: true
      });
    }
  }, [salespersonFilter]);

  return (
    <div className="p-6">
      <PipelineHeader />
      <PipelineStats />
      <PipelineBoardWrapper />
    </div>
  );
}
