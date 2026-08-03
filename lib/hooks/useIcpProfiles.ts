"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
    CreateIcpProfilePayload,
    DeriveIcpPayload,
    IcpLookalikesResponse,
    IcpProfileItem,
    IcpProfilesResponse,
} from "../types/icp";
import {
    createIcpProfile,
    deleteIcpProfile,
    deriveIcpPreview,
    fetchIcpLookalikes,
    fetchIcpProfile,
    fetchIcpProfiles,
} from "../api/icp-profiles";

export function useIcpProfiles(params?: { page?: number; limit?: number }) {
    const { token } = useAuth();
    return useQuery<IcpProfilesResponse, Error>({
        queryKey: ["icp-profiles", params?.page, params?.limit],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchIcpProfiles(token, params);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useIcpProfile(id: string | null) {
    const { token } = useAuth();
    return useQuery<IcpProfileItem, Error>({
        queryKey: ["icp-profile", id],
        queryFn: () => {
            if (!token || !id) throw new Error("No authentication token or profile id");
            return fetchIcpProfile(token, id);
        },
        enabled: !!token && !!id,
    });
}

export function useIcpLookalikes(id: string | null, params?: { page?: number; limit?: number }) {
    const { token } = useAuth();
    return useQuery<IcpLookalikesResponse, Error>({
        queryKey: ["icp-lookalikes", id, params?.page, params?.limit],
        queryFn: () => {
            if (!token || !id) throw new Error("No authentication token or profile id");
            return fetchIcpLookalikes(token, id, params);
        },
        enabled: !!token && !!id,
    });
}

export function useDeriveIcpPreview() {
    const { token } = useAuth();

    return useMutation({
        mutationFn: (payload: DeriveIcpPayload) => {
            if (!token) throw new Error("No authentication token");
            return deriveIcpPreview(token, payload);
        },
    });
}

export function useCreateIcpProfile() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateIcpProfilePayload) => {
            if (!token) throw new Error("No authentication token");
            return createIcpProfile(token, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["icp-profiles"] });
        },
    });
}

export function useDeleteIcpProfile() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return deleteIcpProfile(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["icp-profiles"] });
        },
    });
}
