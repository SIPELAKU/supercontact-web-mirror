"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
    CreateDsrRequestPayload,
    CreateSuppressionEntryPayload,
    DsrRequestsResponse,
    DsrRequestStatus,
    SuppressionEntriesResponse,
} from "../types/compliance";
import {
    createDsrRequest,
    createSuppressionEntry,
    deleteSuppressionEntry,
    fetchDsrRequests,
    fetchSuppressionEntries,
    updateDsrRequestStatus,
} from "../api/compliance";

export function useSuppressionEntries(params?: { page?: number; limit?: number }) {
    const { token } = useAuth();
    return useQuery<SuppressionEntriesResponse, Error>({
        queryKey: ["suppression-entries", params?.page, params?.limit],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchSuppressionEntries(token, params);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useCreateSuppressionEntry() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSuppressionEntryPayload) => {
            if (!token) throw new Error("No authentication token");
            return createSuppressionEntry(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppression-entries"] });
        },
    });
}

export function useDeleteSuppressionEntry() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return deleteSuppressionEntry(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppression-entries"] });
        },
    });
}

export function useDsrRequests(params?: { page?: number; limit?: number; status?: DsrRequestStatus }) {
    const { token } = useAuth();
    return useQuery<DsrRequestsResponse, Error>({
        queryKey: ["dsr-requests", params?.page, params?.limit, params?.status],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchDsrRequests(token, params);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useCreateDsrRequest() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDsrRequestPayload) => {
            if (!token) throw new Error("No authentication token");
            return createDsrRequest(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dsr-requests"] });
        },
    });
}

export function useUpdateDsrRequestStatus() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: DsrRequestStatus }) => {
            if (!token) throw new Error("No authentication token");
            return updateDsrRequestStatus(token, id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dsr-requests"] });
            // A completed deletion request auto-creates a suppression entry
            // (see DsrService.update_status) - refresh that list too so the
            // Suppression tab reflects it without a manual reload.
            queryClient.invalidateQueries({ queryKey: ["suppression-entries"] });
        },
    });
}
