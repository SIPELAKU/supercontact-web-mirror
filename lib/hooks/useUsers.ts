// lib/hooks/useUsers.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers, UserResponse } from "../api";
import { useAuth } from "../context/AuthContext";

export function useUsers(
  page: number, 
  limit: number,
  search?: string,
  position?: string,
  status?: string
) {
  const {token} = useAuth();
  return useQuery<UserResponse, Error>({
    queryKey: ["users", page, limit, search, position, status],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchUsers(token, page, limit, search, position, status);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}

// Also export as default for backward compatibility
export default useUsers;