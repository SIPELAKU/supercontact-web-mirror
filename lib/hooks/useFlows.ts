"use client";

// lib/hooks/useFlows.ts
// TanStack Query bindings for the Flow Studio API (lib/api/flows.ts).
// Mirrors the useConversationSla pattern: token from AuthContext, list/detail
// keys invalidated together after any mutation.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchFlows,
    fetchFlow,
    createFlow,
    updateFlow,
    validateFlow,
    publishFlow,
    unpublishFlow,
    deleteFlow,
    fetchFlowRuns,
    updateAutomationMode,
    FlowSummary,
    FlowDetail,
    FlowRun,
    CreateFlowRequest,
    UpdateFlowRequest,
    AutomationMode,
} from "@/lib/api/flows";

const FLOWS_KEY = ["support", "flows"];

export function useFlows() {
    const { token } = useAuth();
    return useQuery<FlowSummary[], Error>({
        queryKey: FLOWS_KEY,
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchFlows(token);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useFlow(id: string | null | undefined) {
    const { token } = useAuth();
    return useQuery<FlowDetail, Error>({
        queryKey: [...FLOWS_KEY, id],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchFlow(token, id as string);
        },
        // The studio hydrates its local canvas state from this once; never
        // refetch behind its back on focus.
        refetchOnWindowFocus: false,
        enabled: !!token && !!id,
    });
}

export function useCreateFlow() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFlowRequest) => {
            if (!token) throw new Error("No authentication token");
            return createFlow(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FLOWS_KEY, exact: true });
        },
    });
}

export function useUpdateFlow() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFlowRequest }) => {
            if (!token) throw new Error("No authentication token");
            return updateFlow(token, id, data);
        },
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: FLOWS_KEY, exact: true });
            queryClient.invalidateQueries({ queryKey: [...FLOWS_KEY, variables.id] });
        },
    });
}

export function useValidateFlow() {
    const { token } = useAuth();
    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return validateFlow(token, id);
        },
    });
}

export function usePublishFlow() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return publishFlow(token, id);
        },
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: FLOWS_KEY, exact: true });
            queryClient.invalidateQueries({ queryKey: [...FLOWS_KEY, id] });
        },
    });
}

export function useUnpublishFlow() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return unpublishFlow(token, id);
        },
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: FLOWS_KEY, exact: true });
            queryClient.invalidateQueries({ queryKey: [...FLOWS_KEY, id] });
        },
    });
}

export function useDeleteFlow() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return deleteFlow(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FLOWS_KEY, exact: true });
        },
    });
}

export function useFlowRuns(id: string | null | undefined, limit = 20) {
    const { token } = useAuth();
    return useQuery<FlowRun[], Error>({
        queryKey: [...FLOWS_KEY, id, "runs", limit],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchFlowRuns(token, id as string, limit);
        },
        refetchOnWindowFocus: false,
        enabled: !!token && !!id,
    });
}

/** Per-account legacy-bot vs flow-engine switch (F1 exposes the mutation;
 *  the account-settings UI lands with F3). */
export function useUpdateAutomationMode() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ accountId, mode }: { accountId: string; mode: AutomationMode }) => {
            if (!token) throw new Error("No authentication token");
            return updateAutomationMode(token, accountId, mode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["omnichannels"] });
        },
    });
}
