"use client";

import { useEffect } from "react";
import PipelineHeader from "@/components/pipeline/PipelineHeader";
import PipelineStats from "@/components/pipeline/PipelineStats";
import PipelineBoardWrapper from "@/components/pipeline/pipeline-board/PipelineBoardWrapper";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function PipelineClient() {
  const { fetchPipeline, fetchActiveUser, dateRangeFilter, salespersonFilter } = useGetPipelineStore();

  useEffect(() => {
    fetchPipeline({
      dateRange: dateRangeFilter,
      assigned_to: salespersonFilter
    });
    fetchActiveUser();
  }, [dateRangeFilter, salespersonFilter]);

  return (
    <div className="p-6">
      <PipelineHeader />
      <PipelineStats />
      <PipelineBoardWrapper />
    </div>
  );
}
