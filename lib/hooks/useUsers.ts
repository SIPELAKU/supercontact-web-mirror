// lib/hooks/useUsers.ts
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, UserResponse } from "../api";

export function useUsers() {
  const { getToken } = useAuth();
  
  return useQuery<UserResponse, Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const token = await getToken();
      return fetchUsers(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}

// Also export as default for backward compatibility
export default useUsers;