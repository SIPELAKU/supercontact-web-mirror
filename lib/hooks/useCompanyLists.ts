"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
    CompanyListItem,
    CompanyListMembersResponse,
    CompanyListsResponse,
    CreateCompanyListPayload,
    UpdateCompanyListPayload,
} from "../types/company-list";
import {
    fetchCompanyLists,
    fetchCompanyList,
    fetchCompanyListMembers,
    createCompanyList,
    updateCompanyList,
    deleteCompanyList,
    addCompanyListMembers,
    removeCompanyListMember,
} from "../api/company-lists";

export function useCompanyLists(params?: { page?: number; limit?: number }) {
    const { token } = useAuth();
    return useQuery<CompanyListsResponse, Error>({
        queryKey: ["company-lists", params?.page, params?.limit],
        queryFn: () => {
            if (!token) throw new Error("No authentication token");
            return fetchCompanyLists(token, params);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useCompanyList(id: string | null) {
    const { token } = useAuth();
    return useQuery<CompanyListItem, Error>({
        queryKey: ["company-list", id],
        queryFn: () => {
            if (!token || !id) throw new Error("No authentication token or list id");
            return fetchCompanyList(token, id);
        },
        enabled: !!token && !!id,
    });
}

export function useCompanyListMembers(id: string | null, params?: { page?: number; limit?: number }) {
    const { token } = useAuth();
    return useQuery<CompanyListMembersResponse, Error>({
        queryKey: ["company-list-members", id, params?.page, params?.limit],
        queryFn: () => {
            if (!token || !id) throw new Error("No authentication token or list id");
            return fetchCompanyListMembers(token, id, params);
        },
        enabled: !!token && !!id,
    });
}

export function useCreateCompanyList() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCompanyListPayload) => {
            if (!token) throw new Error("No authentication token");
            return createCompanyList(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-lists"] });
        },
    });
}

export function useUpdateCompanyList() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCompanyListPayload }) => {
            if (!token) throw new Error("No authentication token");
            return updateCompanyList(token, id, data);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["company-lists"] });
            queryClient.invalidateQueries({ queryKey: ["company-list", id] });
        },
    });
}

export function useDeleteCompanyList() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("No authentication token");
            return deleteCompanyList(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-lists"] });
        },
    });
}

export function useAddCompanyListMembers() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, crmCompanyIds }: { id: string; crmCompanyIds: string[] }) => {
            if (!token) throw new Error("No authentication token");
            return addCompanyListMembers(token, id, crmCompanyIds);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["company-list-members", id] });
            queryClient.invalidateQueries({ queryKey: ["company-lists"] });
        },
    });
}

export function useRemoveCompanyListMember() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, crmCompanyId }: { id: string; crmCompanyId: string }) => {
            if (!token) throw new Error("No authentication token");
            return removeCompanyListMember(token, id, crmCompanyId);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["company-list-members", id] });
            queryClient.invalidateQueries({ queryKey: ["company-lists"] });
        },
    });
}
