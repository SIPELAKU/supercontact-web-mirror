"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Integration, IntegrationConnectionLogResponse, IntegrationListResponse } from "../models/types";
import {
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegrationConnection,
    fetchIntegrationConnectionLog,
} from "../api/integrations";

export function useIntegrations() {
    const { token } = useAuth();
    return useQuery<IntegrationListResponse, Error>({
        queryKey: ["integrations"],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchIntegrations(token);
        },
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useCreateIntegration() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Integration>) => {
            if (!token) throw new Error("No authentication token");
            return createIntegration(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
}

export function useUpdateIntegration() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Integration> }) => {
            if (!token) throw new Error("No authentication token");
            return updateIntegration(token, id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
}

export function useDeleteIntegration() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return deleteIntegration(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
}

export function useTestIntegrationConnection() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return testIntegrationConnection(token, id);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
}

export function useIntegrationConnectionLog(providerId: string | null, open: boolean) {
    const { token } = useAuth();

    return useQuery<IntegrationConnectionLogResponse, Error>({
        queryKey: ["integration-connection-log", providerId],
        queryFn: () => {
            if (!token || !providerId) throw new Error("No authentication token or integration ID");
            return fetchIntegrationConnectionLog(token, providerId);
        },
        enabled: !!token && !!providerId && open,
        retry: false,
    });
}
