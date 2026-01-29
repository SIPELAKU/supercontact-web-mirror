import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoleResponse, RoleType } from "../types/Role";

const useRoles = (page: number, limit: number, search?: string,) => {
  const queryClient = useQueryClient();

  const {
    data: rolesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      const response = await fetch(`/api/proxy/role-permissions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({
      roleName,
      permissions,
    }: {
      roleName: string;
      permissions: string[];
    }) => {
      const response = await fetch("/api/proxy/role-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role_name: roleName,
          permission_names: permissions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const editRoleMutation = useMutation({
    mutationFn: async ({
      roleName,
      permissions,
      roleId,
    }: {
      roleName: string;
      permissions: string[];
      roleId: string;
    }) => {
      const response = await fetch(`/api/proxy/role-permissions/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role_name: roleName,
          permission_names: permissions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
    }: {
      roleId: string;
    }) => {
      const response = await fetch(`/api/proxy/role-permissions/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const roles: RoleResponse = rolesData || [];
  const addRole = (roleName: string, permissions: string[]) =>
    addRoleMutation.mutateAsync({ roleName, permissions });

  const editRole = (roleName: string, permissions: string[], roleId: string) =>
    editRoleMutation.mutateAsync({ roleName, permissions, roleId });

  const deleteRole = (roleId: string) =>
    deleteRoleMutation.mutateAsync({ roleId });

  return {
    roles,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    addRole,
    editRole,
    deleteRole,
    isAdding: addRoleMutation.isPending,
    isEditing: editRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
};

export default useRoles;
