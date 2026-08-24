// lib/hooks/useQa.ts
//
// Phase 8D - React Query hooks for QA scorecards + reviews.
//
// Query keys:
//   ["qa-scorecards"]              - scorecard list (admin + review-form picker)
//   ["qa-reviews", params]         - paginated review list
//   ["qa-review", id]              - one review's detail (scores + criteria snapshot)
//   ["qa-summary", agentId?]       - per-agent aggregate
//
// Mutations invalidate the list AND the summary (a create/publish/edit shifts
// the aggregate), plus the touched detail on update.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    CreateQaReviewDTO,
    CreateQaScorecardDTO,
    QaReviewListParams,
    UpdateQaReviewDTO,
    UpdateQaScorecardDTO,
    createQaReview,
    createQaScorecard,
    deleteQaScorecard,
    fetchQaReview,
    fetchQaReviews,
    fetchQaScorecards,
    fetchQaSummary,
    updateQaReview,
    updateQaScorecard,
} from "@/lib/api/qa";

// ---------------------------------------------------------------------------
// Scorecards
// ---------------------------------------------------------------------------
export function useQaScorecards(enabled = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["qa-scorecards"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchQaScorecards(token);
        },
        enabled,
    });
}

export function useCreateQaScorecard() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateQaScorecardDTO) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createQaScorecard(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa-scorecards"] }),
    });
}

export function useUpdateQaScorecard() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateQaScorecardDTO }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return updateQaScorecard(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa-scorecards"] }),
    });
}

export function useDeleteQaScorecard() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteQaScorecard(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa-scorecards"] }),
    });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export function useQaReviews(params: QaReviewListParams = {}, enabled = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["qa-reviews", params],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchQaReviews(token, params);
        },
        placeholderData: keepPreviousData,
        enabled,
    });
}

export function useQaReview(id: string | null) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["qa-review", id],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchQaReview(token, id as string);
        },
        enabled: !!id,
    });
}

function invalidateReviewData(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
    queryClient.invalidateQueries({ queryKey: ["qa-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["qa-summary"] });
    if (id) queryClient.invalidateQueries({ queryKey: ["qa-review", id] });
}

export function useCreateQaReview() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateQaReviewDTO) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createQaReview(token, data);
        },
        onSuccess: () => invalidateReviewData(queryClient),
    });
}

export function useUpdateQaReview() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateQaReviewDTO }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return updateQaReview(token, id, data);
        },
        onSuccess: (_result, variables) => invalidateReviewData(queryClient, variables.id),
    });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
export function useQaSummary(agentId?: string, enabled = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["qa-summary", agentId || null],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchQaSummary(token, agentId);
        },
        enabled,
    });
}
