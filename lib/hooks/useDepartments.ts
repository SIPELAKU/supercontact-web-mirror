"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DepartmentsType } from "../types/Departments";
import { useAuth } from "../context/AuthContext";
import { 
  fetchDepartments, 
  fetchDepartmentById, 
  fetchDepartmentMembers, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  CreateDepartmentData,
  UpdateDepartmentData
} from "../api";
import { deleteMember } from "../api/departments";

const useDepartments = (
  page: number = 0,
  rowsPerPage: number = 5,
  searchQuery: string = "",
  filters: {
    department?: string;
    branch?: string;
  } = {}
) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  const {
    data: departmentsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["departments", page, rowsPerPage, searchQuery, filters?.department, filters?.branch],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchDepartments(token, page + 1, rowsPerPage, searchQuery, filters.department, filters.branch);
    },
    enabled: !!token,
  });

  const addDepartmentMutation = useMutation({
    mutationFn: (data: CreateDepartmentData) => {
      if (!token) throw new Error('No authentication token');
      return createDepartment(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) => {
      if (!token) throw new Error('No authentication token');
      return updateDepartment(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteDepartment(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  return {
    departments: departmentsData?.data?.departments ?? [],
    total: departmentsData?.data?.total ?? 0,
    totalPages: departmentsData?.data?.total_pages ?? 0,
    isLoading,
    isError,
    error: isError ? (error instanceof Error ? error.message : "An error occurred") : null,
    addDepartment: (data: CreateDepartmentData) => addDepartmentMutation.mutateAsync(data),
    updateDepartment: (id: string, data: UpdateDepartmentData) => 
      updateDepartmentMutation.mutateAsync({ id, data }),
    deleteDepartment: (id: string) => deleteDepartmentMutation.mutateAsync(id),
    isAdding: addDepartmentMutation.isPending,
    isEditing: updateDepartmentMutation.isPending,
    isDeleting: deleteDepartmentMutation.isPending,
  };
};

export function useDepartmentDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchDepartmentById(token, id);
    },
    enabled: !!token && !!id,
  });
}

export function useDepartmentMembers(
  id: string,
  page: number,
  limit: number,
  search?: string,
  filters?: {
    position?: string;
    status?: string;
  }
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["department-members", id, page, limit, search, filters?.position, filters?.status],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchDepartmentMembers(token, id, page + 1, limit, search, filters?.position, filters?.status);
    },
    enabled: !!token && !!id,
  });
}

export function useDeleteMember(departmentId: string, memberId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error('No authentication token');
      return deleteMember(token, departmentId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-members"] });
    },
  });
}

export default useDepartments;

