"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { MailServerResponse, MailServer, MailServerConnectionLogResponse } from "../models/types";
import { setUsePlatformSender, fetchMailServers, createMailServer, updateMailServer, fetchMailServerConnectionLog, testMailServerConnection, deleteMailServer, updateMailServerStatus } from "../api/mail-servers";

export function useMailServers(
    page: number,
    limit: number,
    search?: string
) {
    const { token } = useAuth();
    return useQuery<MailServerResponse, Error>({
        queryKey: ["mail-servers", page, limit, search],
        queryFn: () => {
            if (!token) throw new Error('No authentication token');
            return fetchMailServers(token, page, limit, search);
        },
        staleTime: 1000 * 60, // 1 minute cache
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
}

export function useCreateMailServer() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<MailServer>) => {
            if (!token) throw new Error('No authentication token');
            return createMailServer(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-servers"] });
        },
    });
}

export function useUpdateMailServer() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MailServer> }) => {
            if (!token) throw new Error('No authentication token');
            return updateMailServer(token, id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-servers"] });
        },
    });
}

export function useUpdateMailServerStatus() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MailServer> }) => {
            if (!token) throw new Error('No authentication token');
            return updateMailServerStatus(token, id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-servers"] });
        },
    });
}

export function useDeleteMailServer() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error('No authentication token');
            return deleteMailServer(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-servers"] });
        },
    });
}

export function useMailServerConnectionLog(mailServerId: string | null, open: boolean) {
    const { token } = useAuth();

    return useQuery<MailServerConnectionLogResponse, Error>({
        queryKey: ["mail-server-connection-log", mailServerId],
        queryFn: () => {
            if (!token || !mailServerId) throw new Error('No authentication token or mail server ID');
            return fetchMailServerConnectionLog(token, mailServerId);
        },
        enabled: !!token && !!mailServerId && open,
        retry: false,
    });
}

export function useTestMailServerConnection() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (mailServerId: string) => {
            if (!token) throw new Error('No authentication token');
            return testMailServerConnection(token, mailServerId);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-servers"] });
        },
    });
}

export function useSetUsePlatformSender() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (enabled: boolean) => {
            if (!token) throw new Error('No authentication token');
            return setUsePlatformSender(token, enabled);
        },
        // The tenant's own rows lose their default when the platform sender is
        // picked, so the table is stale too - not just this card.
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mail-servers"] }),
    });
}
