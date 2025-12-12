'use client'
import { useEffect } from "react";
import PipelineHeader from "@/components/pipeline/PipelineHeader";
import PipelineStats from "@/components/pipeline/PipelineStats";
import PipelineBoardWrapper from "@/components/pipeline/pipeline-board/PipelineBoardWrapper";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function PipelinePage() {
  const { fetchPipeline } = useGetPipelineStore();

  useEffect(()=>{
    fetchPipeline();
  },[])

  return (
    <div className="p-6">
      <PipelineHeader />
      <PipelineStats />
      <PipelineBoardWrapper />
    </div>
  );
}
