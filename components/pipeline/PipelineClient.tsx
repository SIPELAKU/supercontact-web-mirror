"use client";

import { useEffect, useRef } from "react";
import PipelineHeader from "@/components/pipeline/PipelineHeader";
import PipelineStats from "@/components/pipeline/PipelineStats";
import PipelineBoardWrapper from "@/components/pipeline/pipeline-board/PipelineBoardWrapper";
import { canSeeAllDeals } from "@/components/pipeline/dealAssignment";
import { useAuth } from "@/lib/context/AuthContext";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function PipelineClient() {
  const { fetchPipeline, fetchActiveUser, dateRangeFilter, salespersonFilter, setScopeUserId } = useGetPipelineStore();
  const { userProfile, userRole, loading: authLoading } = useAuth();
  const seesAllDeals = canSeeAllDeals(userProfile?.role ?? userRole);
  // Everyone but Admin/Manager/Super Admin only sees the deals assigned to them.
  const scopeUserId = seesAllDeals ? null : userProfile?.id ?? null;
  // Nothing is fetched until the role is known (and, for a scoped user, their
  // id), so a sales user never sees the whole company's deals, not even once.
  const canFetch = !authLoading && (seesAllDeals || Boolean(scopeUserId));
  // A ref, not state: flipping it must not re-run the filter effect below.
  const readyRef = useRef(false);

  useEffect(() => {
    if (!canFetch) return;
    setScopeUserId(scopeUserId);
    // Initial fetch of all data
    fetchPipeline({
      dateRange: "all",
      assigned_to: "all"
    });
    fetchActiveUser();
    readyRef.current = true;
  }, [canFetch, scopeUserId, setScopeUserId, fetchPipeline, fetchActiveUser]);

  // Silent fetch for salesperson filter change
  useEffect(() => {
    // The initial fetch above already covers the first render.
    if (!readyRef.current) return;
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
  }, [salespersonFilter, fetchPipeline]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PipelineHeader />
      <PipelineStats />
      <PipelineBoardWrapper />
    </div>
  );
}
