// lib/hooks/useUsers.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers, UserResponse } from "../api";
import Cookies from 'js-cookie';

export function useUsers() {
  return useQuery<UserResponse, Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchUsers(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}

// Also export as default for backward compatibility
export default useUsers;