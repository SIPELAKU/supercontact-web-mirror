"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { ManageUserResponse, CreateManagedUserData, UpdateManagedUserData } from "../types/manage-users";
import { fetchManagedUsers, createManagedUser, updateManagedUser, deleteManagedUser } from "../api/manage-users";
    
export function useManagedUsers(
  page: number, 
  limit: number,
  search?: string,
  position?: string,
  status?: string
) {
  const {token} = useAuth();
  return useQuery<ManageUserResponse, Error>({
    queryKey: ["managed-users", page, limit, search, position, status],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchManagedUsers(token, page, limit, search, position, status);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}

export function useCreateManagedUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManagedUserData) => {
      if (!token) throw new Error("No authentication token");
      return createManagedUser(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateManagedUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManagedUserData }) => {
      if (!token) throw new Error("No authentication token");
      return updateManagedUser(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteManagedUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteManagedUser(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Also export as default for backward compatibility
export default useManagedUsers;