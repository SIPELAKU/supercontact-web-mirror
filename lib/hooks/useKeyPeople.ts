"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchKeyPeoplePage, fetchKeyPersonDetail } from "@/lib/api/company-profile";
import { KEY_PEOPLE_PAGE_SIZE } from "@/lib/utils/keyPeople";

/** One page of Key People, searched by the API. */
export function useKeyPeople(page: number, q: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["company-profile", "key-people", page, q],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKeyPeoplePage(token, { page, limit: KEY_PEOPLE_PAGE_SIZE, q });
    },
    enabled: !!token,
    // The old page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/** One person's profile, loaded when the Full Profile panel opens. */
export function useKeyPersonDetail(id: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["company-profile", "key-people", "detail", id],
    queryFn: () => {
      if (!token || !id) throw new Error("No authentication token");
      return fetchKeyPersonDetail(token, id);
    },
    enabled: !!token && !!id,
  });
}
