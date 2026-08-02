"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { PersonListResponse, SeniorityGroupedResponse } from "../types/person";
import { fetchPeopleForOrganization, fetchPeopleGroupedBySeniority } from "../api/people";

export function usePeopleForOrganization(organizationId: string | null) {
    const { token } = useAuth();
    return useQuery<PersonListResponse, Error>({
        queryKey: ["people", organizationId],
        queryFn: () => {
            if (!token || !organizationId) throw new Error("No authentication token or organization id");
            return fetchPeopleForOrganization(token, organizationId);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token && !!organizationId,
    });
}

export function usePeopleGroupedBySeniority(organizationId: string | null) {
    const { token } = useAuth();
    return useQuery<SeniorityGroupedResponse, Error>({
        queryKey: ["people-seniority", organizationId],
        queryFn: () => {
            if (!token || !organizationId) throw new Error("No authentication token or organization id");
            return fetchPeopleGroupedBySeniority(token, organizationId);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!token && !!organizationId,
    });
}
