"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PipelineHeader from "@/components/pipeline/PipelineHeader";
import PipelineStats from "@/components/pipeline/PipelineStats";
import PipelineBoardWrapper from "@/components/pipeline/pipeline-board/PipelineBoardWrapper";
import { canSeeAllDeals } from "@/components/pipeline/dealAssignment";
import { useAuth } from "@/lib/context/AuthContext";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function PipelineClient() {
  const { fetchPipeline, fetchActiveUser, dateRangeFilter, salespersonFilter, searchFilter, dealStatusFilter, setScopeUserId, setEditId, setIsModalOpen } = useGetPipelineStore();
  const router = useRouter();
  // Deep link from a deal notification: /sales/pipeline?deal=<id>.
  const dealToOpen = useSearchParams().get("deal");
  const { userProfile, userRole, loading: authLoading } = useAuth();
  const seesAllDeals = canSeeAllDeals(userProfile?.role ?? userRole);
  // Everyone but Admin/Manager only sees the deals assigned to them.
  const scopeUserId = seesAllDeals ? null : userProfile?.id ?? null;
  // Nothing is fetched until the role is known (and, for a scoped user, their
  // id), so a sales user never sees the whole company's deals, not even once.
  const canFetch = !authLoading && (seesAllDeals || Boolean(scopeUserId));
  // A ref, not state: flipping it must not re-run the filter effect below.
  const readyRef = useRef(false);

  useEffect(() => {
    if (!canFetch) return;
    setScopeUserId(scopeUserId);
    // First load, with the filters on screen (the store keeps them across visits).
    fetchPipeline();
    fetchActiveUser();
    readyRef.current = true;
  }, [canFetch, scopeUserId, setScopeUserId, fetchPipeline, fetchActiveUser]);

  // Open the linked deal's Update Pipeline modal once the board can load (the
  // role is known), then drop ?deal from the URL so a refresh or closing the
  // modal does not open it again. A deal the user can't see is handled by the
  // modal itself (it closes with a message).
  useEffect(() => {
    if (!canFetch || !dealToOpen) return;
    setEditId(dealToOpen);
    setIsModalOpen(true);
    router.replace("/sales/pipeline", { scroll: false });
  }, [canFetch, dealToOpen, setEditId, setIsModalOpen, router]);

  // The API filters the board, so every filter change reloads it once,
  // silently (the board stays on screen until the new one arrives).
  const filterKey = JSON.stringify([searchFilter, salespersonFilter, dateRangeFilter, dealStatusFilter]);
  const loadedFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    // Only a real change: on mount (even when auth is already known and the
    // initial fetch runs in the same commit) there is nothing new to load.
    if (loadedFilterKeyRef.current === filterKey) return;
    loadedFilterKeyRef.current = filterKey;
    if (!readyRef.current) return;
    fetchPipeline({ isSilent: true });
  }, [filterKey, fetchPipeline]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PipelineHeader />
      <PipelineStats />
      <PipelineBoardWrapper />
    </div>
  );
}
